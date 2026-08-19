#!/usr/bin/env python3
"""Build a lane matchup snapshot from public LoLalytics counter pages.

The output intentionally stores only the aggregate matchup rows used by the
prototype. Raw HTML is not persisted.
"""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import html
import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path


MATCHUP_PATTERN = re.compile(
    r"([A-Z][A-Za-z' .&-]+?)\s+"
    r"([0-9.]+)\s*% VS Δ 1\s*([+-]?[0-9.]+)\s*"
    r"• Δ 2\s*([+-]?[0-9.]+)\s*"
    r"([0-9.]+)\s*% VS\s*([0-9,]+)\s*Games vs"
)

LANE_QUERY = {"TOP": "top", "MID": "middle"}
SLUG_OVERRIDES = {"MonkeyKing": "wukong"}


def extract_rows(raw: str) -> list[dict]:
    raw = re.sub(r"<script[^>]*>.*?</script>", " ", raw, flags=re.S | re.I)
    raw = re.sub(r"<style[^>]*>.*?</style>", " ", raw, flags=re.S | re.I)
    raw = re.sub(r"<[^>]*>", " ", raw)
    text = re.sub(r"\s+", " ", html.unescape(raw)).strip()
    rows: list[dict] = []
    seen: set[str] = set()
    for name, win_rate, delta1, delta2, opponent_wr, games in MATCHUP_PATTERN.findall(text):
        name = re.sub(r"^Games\s+", "", name).strip()
        if name in seen:
            continue
        seen.add(name)
        rows.append(
            {
                "opponent": name,
                "winRate": float(win_rate),
                "delta1": float(delta1),
                "delta2": float(delta2),
                "opponentWinRate": float(opponent_wr),
                "games": int(games.replace(",", "")),
            }
        )
    return rows


def fetch_one(
    champion: dict,
    lane: str,
    tier: str = "emerald_plus",
    window: str = "30_days",
    attempts: int = 3,
) -> tuple[str, list[dict]]:
    slug = SLUG_OVERRIDES.get(champion["id"], champion["id"].lower())
    patch_query = "&patch=30" if window == "30_days" else ""
    url = f"https://lolalytics.com/lol/{slug}/counters/?lane={LANE_QUERY[lane]}&tier={tier}{patch_query}"
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; PickAnalyzerResearch/0.8)",
            "Accept-Language": "en-US,en;q=0.9",
        },
    )
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=35) as response:
                raw = response.read().decode("utf-8", errors="replace")
            return champion["name"], extract_rows(raw)
        except (TimeoutError, urllib.error.URLError, urllib.error.HTTPError) as error:
            last_error = error
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Falha ao coletar {champion['name']}: {last_error}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("champions", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--lane", choices=sorted(LANE_QUERY), required=True)
    parser.add_argument("--patch", default="26.16")
    parser.add_argument("--data-dragon", default="16.16.1")
    parser.add_argument("--tier", choices=["emerald_plus", "diamond_plus"], default="emerald_plus")
    parser.add_argument("--window", choices=["current", "30_days"], default="30_days")
    parser.add_argument("--workers", type=int, default=10)
    args = parser.parse_args()

    source = json.loads(args.champions.read_text(encoding="utf-8"))
    champions = source.get("champions") or list(source["data"].values())
    collected: dict[str, list[dict]] = {}
    failures: list[str] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {
            executor.submit(fetch_one, champion, args.lane, args.tier, args.window): champion["name"]
            for champion in champions
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                champion_name, rows = future.result()
                collected[champion_name] = rows
            except RuntimeError as error:
                failures.append(str(error))
                collected[name] = []

    ordered = {champion["name"]: collected.get(champion["name"], []) for champion in champions}
    result = {
        "metadata": {
            "gamePatch": args.patch,
            "dataDragonVersion": args.data_dragon,
            "lane": args.lane,
            "tier": args.tier.upper(),
            "window": args.window.upper(),
            "source": "LoLalytics",
            "generatedAt": dt.date.today().isoformat(),
            "signal": "delta2_normalized",
            "note": "Statistical evidence only; combine with mechanical inference and sample reliability.",
            "failures": failures,
        },
        "champions": ordered,
    }
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                "champions": len(ordered),
                "relations": sum(len(rows) for rows in ordered.values()),
                "failures": failures,
                "output": str(args.output),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
