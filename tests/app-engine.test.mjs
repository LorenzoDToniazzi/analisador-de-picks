import assert from "node:assert/strict";
import fs from "node:fs";
import { DraftEngine, inferBuildProfile } from "../app/engine.js";

const json = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), "utf8"));
const championData = json("../app/data/champions.json");
const itemData = json("../app/data/items.json");
const snapshots = {
  MID: {
    current: json("../data/midlane-matchups-diamond-26.16.json"),
    stable: json("../data/midlane-matchups-diamond-30d-26.16.json"),
    fallback: json("../data/midlane-matchups-emerald-30d-26.16.json"),
  },
  TOP: {
    current: json("../data/toplane-matchups-diamond-26.16.json"),
    stable: json("../data/toplane-matchups-diamond-30d-26.16.json"),
    fallback: json("../data/toplane-matchups-emerald-30d-26.16.json"),
  },
};

const engine = new DraftEngine(championData.champions, snapshots);
const byName = new Map(championData.champions.map((champion) => [champion.name, champion]));
const itemsByName = new Map(itemData.items.map((item) => [item.name, item]));
const baseDraft = {
  lane: "MID",
  ally: { TOP: "Yone", JUNGLE: "Warwick", MID: "", BOTTOM: "Zeri", SUPPORT: "Leona" },
  enemy: { TOP: "Tahm Kench", JUNGLE: "Vi", MID: "Cassiopeia", BOTTOM: "Jinx", SUPPORT: "Nautilus" },
};

assert.equal(championData.champions.length, 173, "catálogo deve conter 173 campeões");
assert.ok(itemData.items.length >= 180, "catálogo deve conter os itens de Summoner's Rift");

const melState = {
  pools: [{ id: "pool-mel", champion: "Mel", lane: "MID", pool: "principal", comfort: 5, includeDefault: true }],
  builds: [], overrides: [], settings: { enabledPools: { principal: true, secundaria: true, laboratorio: true } },
};
const melResult = engine.rank(baseDraft, melState)[0];
assert.equal(melResult.status, "HARDCOUNTERED", "Mel padrão deve ficar sem nota contra Cassiopeia");

const malphiteState = {
  pools: [{ id: "pool-malphite", champion: "Malphite", lane: "MID", pool: "laboratorio", comfort: 3, includeDefault: true }],
  builds: [], overrides: [], settings: { enabledPools: { principal: true, secundaria: true, laboratorio: true } },
};
const sylasDraft = structuredClone(baseDraft);
sylasDraft.enemy.MID = "Sylas";
assert.equal(engine.rank(sylasDraft, malphiteState)[0].status, "HARDCOUNTERED", "Malphite deve ficar sem nota contra Sylas");

const tahm = byName.get("Tahm Kench");
const apItems = ["Hextech Rocketbelt", "Riftmaker", "Rabadon's Deathcap"].map((name) => itemsByName.get(name)).filter(Boolean);
const tankItems = ["Heartsteel", "Spirit Visage", "Thornmail"].map((name) => itemsByName.get(name)).filter(Boolean);
const apProfile = inferBuildProfile(tahm, apItems, "Hail of Blades");
const tankProfile = inferBuildProfile(tahm, tankItems, "Grasp of the Undying");
assert.notDeepEqual(apProfile, tankProfile, "duas builds devem produzir perfis completos independentes");

const tahmState = {
  pools: [{ id: "pool-tahm", champion: "Tahm Kench", lane: "MID", pool: "laboratorio", comfort: 4, includeDefault: false }],
  builds: [
    { id: "tahm-ap", champion: "Tahm Kench", lane: "MID", name: "AP/Bruiser", profile: apProfile, kind: "CUSTOM", enabled: true },
    { id: "tahm-tank", champion: "Tahm Kench", lane: "MID", name: "Tank", profile: tankProfile, kind: "CUSTOM", enabled: true },
  ],
  overrides: [{ id: "rule", variantId: "tahm-tank", champion: "Tahm Kench", lane: "MID", opponent: "Cassiopeia", relation: "HARDCOUNTERED", reason: "Tank não alcança nem executa." }],
  settings: { enabledPools: { principal: true, secundaria: true, laboratorio: true } },
};
const tahmDraft = structuredClone(baseDraft);
tahmDraft.enemy.TOP = "Ornn";
const tahmResults = engine.rank(tahmDraft, tahmState);
assert.equal(tahmResults.length, 2, "cada build deve ocupar uma linha própria");
assert.equal(tahmResults.find((row) => row.id === "tahm-tank").status, "HARDCOUNTERED", "hardcounter pode ser específico da build");
assert.equal(tahmResults.find((row) => row.id === "tahm-ap").status, "SCORED", "outra build do mesmo campeão continua avaliável");

const offMetaState = {
  pools: [{ id: "pool-nidalee", champion: "Nidalee", lane: "MID", pool: "laboratorio", comfort: 3, includeDefault: true }],
  builds: [], overrides: [], settings: { enabledPools: { principal: true, secundaria: true, laboratorio: true } },
};
const nidaleeResult = engine.rank(baseDraft, offMetaState)[0];
assert.ok(["SCORED", "HARDCOUNTERED"].includes(nidaleeResult.status), "off-meta cadastrado deve ser considerado sem filtro de função");
assert.ok(!nidaleeResult.reason?.includes("não possui baseline"), "cadastro explícito não recebe penalidade genérica de rota");

console.log("app-engine: 9 checks passaram");
