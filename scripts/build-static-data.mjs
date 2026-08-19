import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outputDir = path.join(root, "app", "data");
const version = "16.16.1";

fs.mkdirSync(outputDir, { recursive: true });

const catalog = spawnSync(process.execPath, [path.join(root, "prototype", "simulate-drafts.mjs"), "--export-catalog"], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});
if (catalog.status !== 0) throw new Error(catalog.stderr || "Falha ao exportar catálogo");
fs.writeFileSync(path.join(outputDir, "champions.json"), catalog.stdout);
const profiles = spawnSync(process.execPath, [path.join(root, "scripts", "build-champion-profiles.mjs")], {
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024,
});
if (profiles.status !== 0) throw new Error(profiles.stderr || "Falha ao gerar perfis 0-10");

async function fetchJson(name) {
  const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/${name}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ao buscar ${url}`);
  return { url, value: await response.json() };
}

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function clamp(value, min = 0, max = 3) {
  return Math.max(min, Math.min(max, value));
}

function itemSignals(item) {
  const stats = item.stats ?? {};
  const text = stripHtml(`${item.description ?? ""} ${item.plaintext ?? ""}`).toLowerCase();
  const tags = new Set(item.tags ?? []);
  const signal = {};
  const add = (key, value) => { signal[key] = clamp((signal[key] ?? 0) + value); };

  add("physicalDamage", (stats.FlatPhysicalDamageMod ?? 0) / 45);
  add("magicDamage", (stats.FlatMagicDamageMod ?? 0) / 75);
  add("hp", (stats.FlatHPPoolMod ?? 0) / 400);
  add("defenses", ((stats.FlatArmorMod ?? 0) + (stats.FlatSpellBlockMod ?? 0)) / 65);
  add("dps", (stats.PercentAttackSpeedMod ?? 0) / 0.35 + (stats.FlatCritChanceMod ?? 0) / 0.25);
  add("sustain", (stats.PercentLifeStealMod ?? 0) / 0.12);
  add("mobility", (stats.FlatMovementSpeedMod ?? 0) / 45 + (stats.PercentMovementSpeedMod ?? 0) / 0.06);

  if (tags.has("OnHit") || /on-hit|on hit|basic attacks? deal|attacking grants/.test(text)) add("dps", 0.9);
  if (tags.has("LifeSteal") || /omnivamp|life steal|heal for|healing from damage/.test(text)) add("sustain", 0.9);
  if (/lethality|magic penetration|armor penetration|shred|reduces? armor|reduces? magic resist/.test(text)) add("burst", 0.8);
  if (/maximum health|max health|current health|bonus health damage|percent health/.test(text)) add("antiTank", 1.1);
  if (/burn|damage over time|for each second|every second|repeatedly/.test(text)) add("dps", 0.7);
  if (/dash in|dash forward|blink|move speed|movement speed|ghosted/.test(text)) add("mobility", 0.8);
  if (/spell shield|blocks? the next.*ability/.test(text)) add("spellShield", 2);
  const selfCleanse = /removes? all crowd control|remove.*disable|quicksilver/.test(text);
  if (selfCleanse && item.name !== "Mikael's Blessing" && !/cleanse ignore pain/.test(text)) add("cleanse", 2);
  if (/slow|slowing|immobilize|stun|root|knock/.test(text)) add("cc", 0.7);
  if (/shield/.test(text)) add("defenses", 0.6);
  if (/nearby enemies|area around|splash|wave|minions/.test(text)) add("waveclear", 0.6);
  if (/next attack|next ability|active.*deal|unleashing missiles|detonate|execute/.test(text)) add("burst", 0.8);
  if (/poke|long range|from afar/.test(text)) add("poke", 0.7);

  return Object.fromEntries(Object.entries(signal).filter(([, value]) => value >= 0.25).map(([key, value]) => [key, Number(value.toFixed(2))]));
}

const [itemPayload, runePayload] = await Promise.all([
  fetchJson("item.json"),
  fetchJson("runesReforged.json"),
]);

const items = Object.entries(itemPayload.value.data)
  // IDs de seis dígitos e prefixos 22/66 são cópias de Arena/Swarm que o
  // Data Dragon também marca para alguns mapas. O draft usa apenas SR padrão.
  .filter(([id, item]) => Number(id) < 10_000 && item.maps?.["11"] && item.gold?.purchasable && item.gold.total > 0 && !item.hideFromAll)
  .map(([id, item]) => ({
    id,
    name: item.name,
    description: stripHtml(item.description),
    plaintext: item.plaintext,
    image: item.image?.full,
    gold: item.gold.total,
    depth: item.depth ?? 1,
    from: item.from ?? [],
    tags: item.tags ?? [],
    stats: item.stats ?? {},
    signals: itemSignals(item),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const runeStyles = runePayload.value.map((style) => ({
  id: style.id,
  key: style.key,
  name: style.name,
  icon: style.icon,
  keystones: (style.slots?.[0]?.runes ?? []).map((rune) => ({ id: rune.id, key: rune.key, name: rune.name, icon: rune.icon, description: stripHtml(rune.longDesc) })),
  runes: style.slots.flatMap((slot) => slot.runes).map((rune) => ({ id: rune.id, key: rune.key, name: rune.name, icon: rune.icon })),
}));

fs.writeFileSync(path.join(outputDir, "items.json"), JSON.stringify({
  metadata: { dataDragon: version, source: itemPayload.url, map: 11, count: items.length },
  items,
}, null, 2));
fs.writeFileSync(path.join(outputDir, "runes.json"), JSON.stringify({
  metadata: { dataDragon: version, source: runePayload.url },
  styles: runeStyles,
}, null, 2));

console.log(`Gerados ${catalog.stdout.length} bytes de campeões, ${items.length} itens e ${runeStyles.length} árvores de runas.`);
