import assert from "node:assert/strict";
import fs from "node:fs";
import { BUILD_TAGS, DraftEngine, RISK_TAGS, inferBuildProfile, resolveBuildProfile } from "../app/engine.js";

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
for (const champion of championData.champions) {
  assert.equal(champion.profile.scale, 10, `${champion.name} deve usar escala 0-10`);
  for (const tag of BUILD_TAGS) assert.ok(champion.profile.strengths[tag] >= 0 && champion.profile.strengths[tag] <= 10, `${champion.name}/${tag} fora da escala`);
  for (const tag of RISK_TAGS) assert.ok(champion.profile.weaknesses[tag] >= 0 && champion.profile.weaknesses[tag] <= 10, `${champion.name}/${tag} fora da escala`);
}

const jaxProfile = byName.get("Jax").profile;
const jhinProfile = byName.get("Jhin").profile;
assert.ok(jaxProfile.strengths.defenses > jhinProfile.strengths.defenses, "Jax deve ser estruturalmente mais resistente que Jhin");
assert.ok(jhinProfile.weaknesses.vulnDive > jaxProfile.weaknesses.vulnDive, "Jhin deve sofrer mais contra acesso/dive");
assert.ok(championData.champions.filter((champion) => champion.profile.mechanics.dependencies.projectileReliant).length >= 60, "dependência de projéteis deve cobrir os principais casos do catálogo");
assert.equal(byName.get("Lissandra").profile.mechanics.strengths.pointClickCc, 10, "Lissandra deve registrar o R point-and-click");
assert.equal(byName.get("Warwick").profile.mechanics.strengths.pointClickCc, undefined, "ultimate skillshot do Warwick não é point-and-click");
const defensiveJax = resolveBuildProfile(jaxProfile, { strengths: { hp: -2, defenses: 2 }, weaknesses: { vulnBurst: -1 } });
assert.equal(defensiveJax.strengths.hp, jaxProfile.strengths.hp - 2, "build deve conseguir remover HP");
assert.equal(defensiveJax.strengths.defenses, jaxProfile.strengths.defenses + 2, "build deve conseguir adicionar defesas");

const jhinIrelia = engine.laneScore({ id: "jhin-default", champion: "Jhin", kind: "DEFAULT", profile: jhinProfile }, "Irelia", "MID", []);
assert.equal(jhinIrelia.veto, true, "Jhin Mid contra Irelia deve ser hardcounter estrutural");
const jhinLeblanc = engine.laneScore({ id: "jhin-custom", champion: "Jhin", kind: "CUSTOM", profile: resolveBuildProfile(jhinProfile, { strengths: { burst: 2, scaling: 2 } }) }, "LeBlanc", "MID", []);
assert.ok(["COUNTERED", "SEVERE_COUNTER"].includes(jhinLeblanc.tier), "burst/scaling não pode apagar o acesso da LeBlanc ao Jhin");
const lissandraAkali = engine.laneScore({ id: "lissandra-default", champion: "Lissandra", kind: "DEFAULT", profile: byName.get("Lissandra").profile }, "Akali", "MID", []);
assert.ok(lissandraAkali.advantages.some((row) => row.label.includes("point-and-click")), "CC confiável deve aparecer na explicação contra campeão vulnerável a controle");
const standardReliability = engine.statEvidence("Viktor", "Pantheon", "MID", false).reliability;
const customReliability = engine.statEvidence("Viktor", "Pantheon", "MID", true).reliability;
assert.ok(Math.abs(customReliability - standardReliability * 0.35) < 0.0001, "build custom deve herdar apenas 35% da confiança estatística padrão");
const viktorPantheon = engine.laneScore({ id: "viktor-default", champion: "Viktor", kind: "DEFAULT", profile: byName.get("Viktor").profile }, "Pantheon", "MID", []);
assert.ok(["ADVANTAGED", "STRONG_ADVANTAGE", "HARDCOUNTERS"].includes(viktorPantheon.tier), "estatística robusta favorável deve superar alerta estrutural genérico no veredito, preservando o risco na explicação");
const ireliaBlindMid = engine.blindLaneScore({ id: "irelia-blind", champion: "Irelia", kind: "DEFAULT", profile: byName.get("Irelia").profile }, "MID", []);
assert.ok(ireliaBlindMid.score <= -3, "hardcounters devem permanecer na cauda de risco do blind pick");
assert.ok(engine.enemyCompScore(byName.get("Nautilus").profile, ["Ezreal"]).score < 0, "um único bônus não pode reduzir artificialmente o principal risco de composição");

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
const glassItems = ["Rabadon's Deathcap", "Void Staff", "Shadowflame"].map((name) => itemsByName.get(name)).filter(Boolean);
const glassProfile = inferBuildProfile(tahm, glassItems, "Hail of Blades");
assert.ok(glassProfile.strengths.hp < tahm.profile.strengths.hp && glassProfile.strengths.defenses < tahm.profile.strengths.defenses, "build sem durabilidade deve perder HP e defesas em relação ao Tahm padrão");
const bansheeProfile = inferBuildProfile(byName.get("Xerath"), [itemsByName.get("Banshee's Veil")], "");
const qssProfile = inferBuildProfile(byName.get("Jax"), [itemsByName.get("Quicksilver Sash")], "");
assert.ok(bansheeProfile.mechanics.strengths.spellShield >= 8, "Banshee deve adicionar spell shield à variante");
assert.ok(qssProfile.mechanics.strengths.cleanse >= 8, "QSS deve adicionar cleanse à variante");
assert.equal(itemsByName.get("Death's Dance").signals.cleanse, undefined, "Death's Dance não pode ser interpretada como cleanse de CC");
assert.equal(itemsByName.get("Mikael's Blessing").signals.cleanse, undefined, "Mikael não é um cleanse próprio utilizável sob hard CC");

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

console.log("app-engine: perfis 0-10, builds negativas e regressões de matchup passaram");
