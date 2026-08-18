import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const firstExisting = (...candidates) => candidates.find((candidate) => fs.existsSync(candidate));
const fixture = JSON.parse(fs.readFileSync(path.join(here, "pool-mid-fixture.json"), "utf8"));
const championSource = JSON.parse(fs.readFileSync(firstExisting(
  path.join(root, "data", "champions-core-16.16.1.json"),
  path.join(root, "champions-core-16.16.1.json"),
  path.join(root, "championFull-16.16.1.json"),
), "utf8"));
const championRecords = championSource.champions ?? Object.values(championSource.data);
const championFullPath = firstExisting(
  path.join(root, "data", "championFull-16.16.1.json"),
  path.join(root, "championFull-16.16.1.json"),
);
const championFullSource = championFullPath ? JSON.parse(fs.readFileSync(championFullPath, "utf8")) : null;
const officialChampionById = new Map(Object.entries(championFullSource?.data ?? {}));
const research = fs.readFileSync(firstExisting(
  path.join(root, "docs", "analise-pool-mid-26.16.md"),
  path.join(root, "analise-draft-pool-mid-26.16.md"),
), "utf8");
const topCurrentMatchupPath = firstExisting(
  path.join(root, "data", "toplane-matchups-diamond-26.16.json"),
  path.join(root, "toplane-matchups-diamond-26.16.json"),
);
const topStableMatchupPath = firstExisting(
  path.join(root, "data", "toplane-matchups-diamond-30d-26.16.json"),
  path.join(root, "toplane-matchups-diamond-30d-26.16.json"),
);
const topEmeraldMatchupPath = firstExisting(
  path.join(root, "data", "toplane-matchups-emerald-30d-26.16.json"),
  path.join(root, "toplane-matchups-emerald-30d-26.16.json"),
);
const midCurrentMatchupPath = firstExisting(
  path.join(root, "data", "midlane-matchups-diamond-26.16.json"),
  path.join(root, "midlane-matchups-diamond-26.16.json"),
);
const midStableMatchupPath = firstExisting(
  path.join(root, "data", "midlane-matchups-diamond-30d-26.16.json"),
  path.join(root, "midlane-matchups-diamond-30d-26.16.json"),
);
const midEmeraldMatchupPath = firstExisting(
  path.join(root, "data", "midlane-matchups-emerald-30d-26.16.json"),
  path.join(root, "midlane-matchups-emerald-30d-26.16.json"),
);
const readOptionalJson = (filePath) => filePath ? JSON.parse(fs.readFileSync(filePath, "utf8")) : null;
const matchupSnapshots = {
  TOP: {
    current: readOptionalJson(topCurrentMatchupPath),
    stable: readOptionalJson(topStableMatchupPath),
    fallback: readOptionalJson(topEmeraldMatchupPath),
  },
  MID: {
    current: readOptionalJson(midCurrentMatchupPath),
    stable: readOptionalJson(midStableMatchupPath),
    fallback: readOptionalJson(midEmeraldMatchupPath),
  },
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 2) => Number(value.toFixed(digits));
const normalize = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");

const foldText = (value) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function takeRandom(list, random, used) {
  const available = list.filter((item) => !used.has(item.name));
  const selected = available[Math.floor(random() * available.length)];
  used.add(selected.name);
  return selected;
}

function scoreMap(entries = []) {
  return Object.fromEntries(entries.map(([key, value]) => [key, value]));
}

function mergeMap(base, delta) {
  const merged = { ...base };
  for (const [key, value] of Object.entries(delta ?? {})) {
    merged[key] = clamp((merged[key] ?? 0) + value, 0, 3);
  }
  return merged;
}

function candidateProfile({ strengths, weaknesses, safeBlind, confidence = "MEDIUM" }) {
  return {
    strengths: scoreMap(strengths),
    weaknesses: scoreMap(weaknesses),
    safeBlind,
    confidence,
  };
}

const S = {
  physicalDamage: "dano físico",
  magicDamage: "dano mágico",
  mixedDamage: "dano misto",
  burst: "burst",
  dps: "DPS",
  poke: "poke",
  shortTrade: "troca curta",
  longTrade: "troca longa",
  allIn: "all-in",
  aoe: "dano em área",
  antiTank: "anti-tank",
  engage: "engage",
  followUp: "follow-up",
  pick: "pick",
  flank: "flanco",
  backlineAccess: "acesso à backline",
  mobility: "mobilidade",
  gankSetup: "setup de gank",
  antiDive: "anti-dive",
  frontline: "frontline",
  hp: "HP",
  defenses: "defesas",
  sustain: "sustain",
  peel: "peel",
  disengage: "disengage",
  zone: "controle de zona",
  cc: "controle de grupo",
  waveclear: "waveclear",
  priority: "prioridade",
  weakside: "weakside",
  roam: "roaming",
  siege: "siege",
  split: "split",
  teamfight: "teamfight",
  scaling: "scaling",
  earlyPressure: "pressão inicial",
  antiCc: "anti-CC",
  antiAuto: "anti-auto",
};

const W = {
  vulnPoke: "vulnerável a poke",
  vulnEngage: "vulnerável a engage",
  vulnKite: "vulnerável a kite",
  vulnCc: "vulnerável a CC",
  vulnBurst: "vulnerável a burst",
  vulnDps: "vulnerável a DPS",
  vulnTank: "dificuldade contra resistência",
  vulnRange: "vulnerável a alcance",
  vulnWave: "vulnerável a pressão de wave",
  vulnGank: "vulnerável a gank",
  vulnDisengage: "vulnerável a disengage",
  needsContact: "precisa de contato",
  needsFlank: "precisa de flanco",
  needsSetup: "precisa de setup",
  needsLongFight: "precisa de luta longa",
  fragileEntry: "entrada frágil",
  ultDependent: "dependente de ultimate",
  resourceDependent: "dependente de recursos",
  goldDependent: "dependente de ouro",
  immobile: "imóvel",
};

const baseProfiles = {
  Zed: candidateProfile({
    strengths: [["physicalDamage", 3], ["burst", 3], ["shortTrade", 3], ["pick", 3], ["flank", 2], ["backlineAccess", 3], ["mobility", 3], ["split", 2], ["earlyPressure", 2]],
    weaknesses: [["vulnCc", 2], ["vulnTank", 3], ["vulnWave", 1], ["vulnDisengage", 2], ["needsFlank", 2], ["ultDependent", 2]], safeBlind: 1.6,
  }),
  Irelia: candidateProfile({
    strengths: [["physicalDamage", 3], ["dps", 3], ["longTrade", 3], ["allIn", 3], ["backlineAccess", 2], ["mobility", 3], ["sustain", 2], ["split", 3], ["earlyPressure", 2]],
    weaknesses: [["vulnCc", 3], ["vulnBurst", 2], ["vulnRange", 2], ["vulnWave", 2], ["vulnDisengage", 2], ["fragileEntry", 2], ["needsContact", 3]], safeBlind: 0.8,
  }),
  Gragas: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 2], ["shortTrade", 3], ["engage", 2], ["followUp", 3], ["pick", 2], ["antiDive", 3], ["peel", 3], ["disengage", 3], ["zone", 2], ["cc", 3], ["waveclear", 2], ["weakside", 2], ["teamfight", 3]],
    weaknesses: [["vulnDps", 2], ["ultDependent", 2], ["resourceDependent", 1]], safeBlind: 2.8, confidence: "HIGH",
  }),
  Pantheon: candidateProfile({
    strengths: [["physicalDamage", 3], ["burst", 3], ["shortTrade", 3], ["allIn", 3], ["pick", 3], ["followUp", 2], ["cc", 3], ["gankSetup", 3], ["roam", 3], ["earlyPressure", 3]],
    weaknesses: [["vulnTank", 3], ["vulnDisengage", 2], ["needsContact", 2], ["goldDependent", 2], ["vulnRange", 1]], safeBlind: 1.7,
  }),
  "Tahm Kench": candidateProfile({
    strengths: [["magicDamage", 2], ["shortTrade", 2], ["pick", 2], ["antiDive", 3], ["frontline", 3], ["hp", 3], ["defenses", 2], ["sustain", 3], ["peel", 3], ["cc", 2], ["weakside", 3]],
    weaknesses: [["vulnKite", 3], ["vulnDps", 2], ["vulnRange", 3], ["vulnWave", 3], ["needsContact", 3], ["immobile", 2]], safeBlind: 2,
  }),
  Jax: candidateProfile({
    strengths: [["mixedDamage", 2], ["dps", 3], ["longTrade", 3], ["allIn", 2], ["mobility", 2], ["defenses", 2], ["split", 3], ["scaling", 3], ["antiAuto", 3]],
    weaknesses: [["vulnPoke", 2], ["vulnKite", 3], ["vulnRange", 3], ["vulnWave", 2], ["vulnDisengage", 3], ["needsContact", 3], ["goldDependent", 2]], safeBlind: 1.1,
  }),
  Olaf: candidateProfile({
    strengths: [["physicalDamage", 3], ["dps", 3], ["longTrade", 3], ["allIn", 3], ["sustain", 3], ["split", 2], ["earlyPressure", 3], ["antiCc", 3]],
    weaknesses: [["vulnPoke", 2], ["vulnKite", 3], ["vulnRange", 3], ["vulnDisengage", 3], ["needsContact", 3], ["needsLongFight", 2], ["ultDependent", 2]], safeBlind: 1.4,
  }),
  Vladimir: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 2], ["dps", 2], ["aoe", 3], ["flank", 2], ["sustain", 3], ["teamfight", 3], ["scaling", 3]],
    weaknesses: [["vulnPoke", 2], ["vulnRange", 2], ["vulnWave", 2], ["vulnDisengage", 2], ["needsContact", 2], ["goldDependent", 3]], safeBlind: 2,
  }),
  Diana: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 3], ["allIn", 3], ["aoe", 3], ["engage", 2], ["followUp", 3], ["backlineAccess", 3], ["teamfight", 2]],
    weaknesses: [["vulnCc", 3], ["vulnDisengage", 3], ["needsContact", 3], ["needsSetup", 2], ["fragileEntry", 3]], safeBlind: 1.1,
  }),
  Akali: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 3], ["allIn", 2], ["flank", 3], ["backlineAccess", 3], ["mobility", 3], ["split", 2]],
    weaknesses: [["vulnCc", 3], ["vulnTank", 3], ["vulnWave", 2], ["vulnDisengage", 2], ["needsFlank", 2], ["fragileEntry", 2], ["goldDependent", 2]], safeBlind: 1.3,
  }),
  Gangplank: candidateProfile({
    strengths: [["physicalDamage", 3], ["burst", 3], ["poke", 2], ["aoe", 3], ["zone", 3], ["waveclear", 3], ["split", 2], ["teamfight", 2], ["scaling", 3]],
    weaknesses: [["vulnEngage", 2], ["vulnRange", 2], ["vulnGank", 2], ["goldDependent", 3], ["fragileEntry", 1]], safeBlind: 2.2,
  }),
  Xerath: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 2], ["poke", 3], ["pick", 1], ["waveclear", 3], ["siege", 3]],
    weaknesses: [["vulnEngage", 3], ["vulnCc", 2], ["vulnBurst", 2], ["vulnGank", 3], ["immobile", 3], ["resourceDependent", 2]], safeBlind: 1.9,
  }),
  Cassiopeia: candidateProfile({
    strengths: [["magicDamage", 3], ["dps", 3], ["longTrade", 3], ["antiTank", 3], ["antiDive", 3], ["sustain", 2], ["zone", 3], ["cc", 2], ["scaling", 3]],
    weaknesses: [["vulnPoke", 3], ["vulnRange", 3], ["vulnBurst", 2], ["vulnGank", 2], ["immobile", 3], ["resourceDependent", 2]], safeBlind: 2,
  }),
  Anivia: candidateProfile({
    strengths: [["magicDamage", 3], ["dps", 2], ["aoe", 2], ["antiDive", 3], ["peel", 2], ["disengage", 2], ["zone", 3], ["cc", 3], ["waveclear", 3], ["teamfight", 2], ["scaling", 3]],
    weaknesses: [["vulnPoke", 2], ["vulnRange", 2], ["vulnGank", 2], ["resourceDependent", 3], ["immobile", 3], ["goldDependent", 2]], safeBlind: 2.5,
  }),
  LeBlanc: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 3], ["shortTrade", 3], ["pick", 3], ["flank", 2], ["backlineAccess", 2], ["mobility", 3], ["roam", 2], ["earlyPressure", 2]],
    weaknesses: [["vulnTank", 3], ["vulnWave", 3], ["vulnCc", 2], ["goldDependent", 2]], safeBlind: 1.8,
  }),
  Qiyana: candidateProfile({
    strengths: [["physicalDamage", 3], ["burst", 3], ["allIn", 3], ["aoe", 2], ["pick", 3], ["flank", 3], ["backlineAccess", 3], ["mobility", 3], ["roam", 2]],
    weaknesses: [["vulnCc", 3], ["vulnTank", 3], ["vulnRange", 2], ["vulnWave", 2], ["needsFlank", 3], ["fragileEntry", 3], ["ultDependent", 2]], safeBlind: 0.9,
  }),
  Aatrox: candidateProfile({
    strengths: [["physicalDamage", 3], ["dps", 2], ["longTrade", 3], ["aoe", 3], ["followUp", 3], ["frontline", 2], ["sustain", 3], ["zone", 2], ["teamfight", 2]],
    weaknesses: [["vulnPoke", 3], ["vulnKite", 3], ["vulnCc", 2], ["vulnBurst", 2], ["vulnRange", 3], ["needsContact", 2], ["needsLongFight", 3]], safeBlind: 1.5,
  }),
  Yasuo: candidateProfile({
    strengths: [["physicalDamage", 3], ["dps", 3], ["longTrade", 3], ["allIn", 3], ["backlineAccess", 2], ["mobility", 3], ["waveclear", 2], ["split", 2], ["scaling", 3], ["antiAuto", 1]],
    weaknesses: [["vulnCc", 3], ["vulnBurst", 2], ["vulnDisengage", 2], ["needsSetup", 2], ["fragileEntry", 2], ["goldDependent", 2]], safeBlind: 1,
  }),
  Elise: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 3], ["allIn", 2], ["pick", 3], ["cc", 2], ["gankSetup", 3], ["dive", 3], ["earlyPressure", 3]],
    weaknesses: [["vulnTank", 3], ["vulnWave", 3], ["vulnRange", 2], ["goldDependent", 3]], safeBlind: 0.7, confidence: "LOW",
  }),
  Nidalee: candidateProfile({
    strengths: [["magicDamage", 3], ["burst", 2], ["poke", 3], ["mobility", 3], ["sustain", 2], ["siege", 2], ["earlyPressure", 2]],
    weaknesses: [["vulnEngage", 3], ["vulnTank", 3], ["vulnWave", 2], ["vulnCc", 2], ["needsSetup", 2], ["goldDependent", 3]], safeBlind: 0.8, confidence: "LOW",
  }),
  Rumble: candidateProfile({
    strengths: [["magicDamage", 3], ["dps", 3], ["poke", 1], ["longTrade", 2], ["aoe", 3], ["zone", 3], ["teamfight", 3], ["earlyPressure", 3]],
    weaknesses: [["vulnPoke", 3], ["vulnRange", 3], ["vulnGank", 3], ["vulnDisengage", 2], ["immobile", 2], ["ultDependent", 2]], safeBlind: 1.5, confidence: "MEDIUM",
  }),
};

const buildDefinitions = {
  Gragas: [
    { id: "ap-burst", name: "AP burst padrão", capabilityDelta: { burst: 1 }, vulnerabilityDelta: { fragileEntry: 1 } },
    { id: "control-bruiser", name: "Controle/bruiser", capabilityDelta: { burst: -1, frontline: 1, defenses: 1, sustain: 1, antiDive: 1 }, vulnerabilityDelta: { fragileEntry: -1, vulnDps: 1 } },
  ],
  Pantheon: [
    { id: "burst", name: "Burst padrão", capabilityDelta: { burst: 0 }, vulnerabilityDelta: {} },
    { id: "bruiser", name: "Bruiser de luta", capabilityDelta: { burst: -1, dps: 1, longTrade: 1, defenses: 1 }, vulnerabilityDelta: { goldDependent: 1 } },
  ],
  "Tahm Kench": [
    { id: "tank-default", name: "Tank padrão", capabilityDelta: {}, vulnerabilityDelta: {} },
    { id: "ap-bruiser-tech", name: "AP/bruiser tech", capabilityDelta: { burst: 2, magicDamage: 1, waveclear: 1, mobility: 1, defenses: -1, hp: -1, frontline: -1 }, vulnerabilityDelta: { vulnDps: 1, vulnRange: -1, needsContact: -1 } },
  ],
  Jax: [
    { id: "ad-default", name: "AD/DPS padrão", capabilityDelta: { physicalDamage: 1 }, vulnerabilityDelta: {} },
    { id: "hybrid-hob", name: "Híbrido HoB", capabilityDelta: { mixedDamage: 1, burst: 2, shortTrade: 2, dps: -1 }, vulnerabilityDelta: { fragileEntry: 1, needsLongFight: -1 } },
  ],
  Olaf: [
    { id: "bruiser-dps", name: "Bruiser/DPS padrão", capabilityDelta: {}, vulnerabilityDelta: {} },
    { id: "burst", name: "Burst", capabilityDelta: { burst: 2, dps: -1, shortTrade: 1 }, vulnerabilityDelta: { fragileEntry: 1, needsLongFight: -1 } },
  ],
};

function buildsFor(champion, { universalBenchmark = false } = {}) {
  if (universalBenchmark) {
    const universalProfile = championByName.get(champion)?.profile;
    if (!universalProfile) return [];
    return [{
      id: "system-default",
      name: "Padrão do campeão",
      capabilityDelta: {},
      vulnerabilityDelta: {},
      profile: universalProfile,
    }];
  }
  const baseProfile = baseProfiles[champion] ?? championByName.get(champion)?.profile;
  if (!baseProfile) return [];
  const definitions = buildDefinitions[champion] ?? [{ id: "default", name: "Padrão", capabilityDelta: {}, vulnerabilityDelta: {} }];
  return definitions.map((build) => ({
    ...build,
    profile: {
      ...baseProfile,
      strengths: mergeMap(baseProfile.strengths, build.capabilityDelta),
      weaknesses: mergeMap(baseProfile.weaknesses, build.vulnerabilityDelta),
      mechanics: championByName.get(champion)?.profile.mechanics ?? { strengths: {}, dependencies: {} },
    },
  }));
}

const matchupRules = [
  { candidate: "Irelia", opponent: "Malphite", severity: "HARDCOUNTERED_LANE", confidence: "HIGH", reason: "Armadura, redução de velocidade de ataque e execução muito mais simples." },
  { candidate: "Malphite", opponent: "Sylas", severity: "HARDCOUNTERED_LANE", confidence: "HIGH", reason: "Sylas usa a ultimate de Malphite melhor que ele, sustenta as trocas e transforma a principal condição de teamfight do pick em recurso inimigo." },
  { candidate: "Mel", opponent: "Cassiopeia", severity: "VERY_BAD_LANE", confidence: "HIGH", reason: "A defesa de janela única da Mel não encerra as rotações repetidas da Cassiopeia; Diamond+ e Emerald+ confirmam grande desvantagem normalizada." },
  { candidate: "Tahm Kench", opponent: "Cassiopeia", buildIds: ["tank-default"], severity: "HARDCOUNTERED_LANE", confidence: "USER", reason: "Regra de fixture para validar veto por build: o perfil tank não alcança nem executa antes do DPS." },
  { candidate: "Zed", opponent: "Malphite", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "Armadura eficiente e alvo sem janela confiável de execução." },
  { candidate: "Qiyana", opponent: "Malphite", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "Armadura e stat-check negam o padrão de burst físico." },
  { candidate: "Diana", opponent: "Galio", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "Resistência mágica, peel e punição direta da entrada." },
  { candidate: "Akali", opponent: "Galio", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "MR, controle confiável e proteção aos alvos de dive." },
  { candidate: "Akali", opponent: "Lissandra", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "Controle confiável e ultimate defensiva contra dive." },
  { candidate: "Yasuo", opponent: "Taliyah", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "Zoneamento de dash, wave e punição das rotas de entrada." },
  { candidate: "Elise", opponent: "Malzahar", severity: "VERY_BAD_LANE", confidence: "MEDIUM", reason: "Voidlings bloqueiam Cocoon e o spell shield reduz a ameaça de pick." },
  { candidate: "Olaf", opponent: "Galio", severity: "HARDCOUNTERS_LANE", confidence: "MEDIUM", reason: "A ultimate remove a principal ferramenta de contenção e permite atravessar o engage baseado em CC." },
];

const severityScore = {
  VERY_BAD_LANE: -8,
  BAD_LANE: -5,
  SLIGHTLY_BAD_LANE: -2,
  NEUTRAL: 0,
  SLIGHTLY_GOOD_LANE: 2,
  GOOD_LANE: 5,
  VERY_GOOD_LANE: 8,
  HARDCOUNTERS_LANE: 10,
};

const scoreWeights = {
  laneMatchup: 3.25,
  jungleInteraction: 0.65,
  enemyComp: 1.5,
  allyComp: 1,
  populationStrength: 0.35,
};

const poolAffinityScore = { principal: 6, secundaria: 5, laboratorio: 3 };

function parseCatalog() {
  const result = new Map();
  for (const line of research.split("\n")) {
    if (!line.startsWith("| ") || line.startsWith("| Campeão") || line.startsWith("|---")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 5) continue;
    const [name, identity, delivery, seeks, risks] = cells;
    if (!championRecords.some((champion) => normalize(champion.name) === normalize(name))) continue;
    result.set(normalize(name), { name, identity, delivery, seeks, risks });
  }
  return result;
}

const catalog = parseCatalog();

const strengthPatterns = {
  physicalDamage: /fisic|ad\b/,
  magicDamage: /magic|\bap\b/,
  mixedDamage: /mist|hibrid/,
  burst: /burst|explos|execu|combo/,
  dps: /\bdps\b|sustentad|luta longa|dano crescente/,
  poke: /poke|desgaste/,
  shortTrade: /troca curta/,
  longTrade: /troca longa|lutas longas/,
  allIn: /all-in|all in|stat-check/,
  aoe: /em area|agrupad|cadeia/,
  antiTank: /anti-hp|anti-tank|percentual|tank shred|% de vida/,
  engage: /\bengage\b|iniciacao|iniciação/,
  followUp: /follow-up|follow up/,
  pick: /\bpick\b|catcher|captura/,
  flank: /flanco|ameaca lateral|ameaça lateral/,
  backlineAccess: /backline|\bdiver\b|mergulho/,
  mobility: /mobil|dash|velocidade|portal/,
  gankSetup: /setup de gank/,
  antiDive: /anti-dive|anti dive/,
  frontline: /frontline|tank /,
  sustain: /sustain|cura|regeneracao|regeneração/,
  peel: /\bpeel\b|protecao|proteção/,
  disengage: /disengage/,
  zone: /zona|zoneamento|controle de espaco|controle de espaço|terreno/,
  cc: /\bcc\b|controle|lockdown|stun|slow|silencio|silêncio/,
  waveclear: /waveclear|controle de wave/,
  priority: /prioridade|pressao de lane|pressão de lane/,
  weakside: /weakside/,
  roam: /roam|global/,
  siege: /siege|torre/,
  split: /split|side lane|pressao em side|pressão em side/,
  teamfight: /teamfight/,
  scaling: /scaling|tardi|late game/,
  earlyPressure: /early|ritmo|snowball|pressao inicial|pressão inicial/,
  antiCc: /imunidade a cc|limpeza|anti-cc/,
  antiAuto: /anti-auto|blind|evasao|evasão/,
};

const weaknessPatterns = {
  vulnPoke: /poke|desgaste/,
  vulnEngage: /engage|dive/,
  vulnKite: /kite/,
  vulnCc: /\bcc\b|controle|point-and-click|lockdown|stun|silencio|silêncio/,
  vulnBurst: /burst|explos|antes de/,
  vulnDps: /\bdps\b|luta longa|dano sustentado/,
  vulnTank: /tank|frontline|armadura|\bmr\b|resist/,
  vulnRange: /range|alcance/,
  vulnWave: /wave|prioridade/,
  vulnGank: /gank|invasao|invasão|roaming/,
  vulnDisengage: /disengage|peel/,
  needsContact: /contato|corpo a corpo|melee/,
  needsFlank: /flanco/,
  needsSetup: /setup/,
  needsLongFight: /tempo|luta longa|segunda rotacao|segunda rotação/,
  fragileEntry: /entrada|antes de|ao entrar/,
  ultDependent: /ultimate|\bult\b/,
  resourceDependent: /mana|energia|recurso/,
  goldDependent: /ouro|item|scaling|escalar/,
  immobile: /imovel|imóvel|imobilidade|sem mobilidade/,
};

// Tags de função dizem "o que o campeão entrega". Mecânicas dizem "como uma
// skill específica permite ou impede essa entrega". Elas ficam separadas para
// que engage, por exemplo, nunca seja confundido com grounding ou Wind Wall.
const mechanicStrengthPatterns = {
  grounding: /grounding|grounded/,
  dashDenial: /anti-dash|punicao de dash|punição de dash|zoneamento de dash/,
  projectileDenial: /anti-projetil|anti-projétil|wind wall|reflect de projeteis|reflect de projéteis/,
  ccImmunity: /imunidade a cc/,
  cleanse: /cleanse|limpeza de controle|remove controle/,
  spellShield: /spell shield|escudo de feitico|escudo de feitiço/,
  pointClickCc: /point-and-click|supressao|supressão/,
  repeatedDamage: /\bdps\b|dano sustentado|luta longa|lutas prolongadas/,
  displacement: /deslocamento|empurrao|empurrão|knockback|knock-up|knockup/,
  ultimateTheft: /apropriacao de ultimates|apropriação de ultimates|roubo de ultimate/,
};
const mechanicDependencyPatterns = {
  dashReliant: /anti-dash|grounding|cc no retorno|rotas de dash/,
  projectileReliant: /wind wall|anti-projetil|anti-projétil|reflect de projeteis|reflect de projéteis/,
  ccDependent: /cleanse|qss|imunidade a cc|anti-cc/,
  singleSpellSetup: /spell shield|escudo antes|bloqueia.*skillshot|bloqueiam.*cocoon/,
  channelDependent: /canaliz|interromp/,
  autoAttackDependent: /blind|evasao|evasão|velocidade de ataque|anti-auto/,
};
const mechanicOverrides = {
  Cassiopeia: { strengths: { grounding: 3, dashDenial: 3, repeatedDamage: 3 } },
  Mel: { strengths: { projectileDenial: 3 }, dependencies: { singleWindowDefense: 3 } },
  Yasuo: { strengths: { projectileDenial: 3 }, dependencies: { dashReliant: 3, autoAttackDependent: 2 } },
  Samira: { strengths: { projectileDenial: 2 }, dependencies: { dashReliant: 2, channelDependent: 3, autoAttackDependent: 2 } },
  Braum: { strengths: { projectileDenial: 2 } },
  Taliyah: { strengths: { dashDenial: 3 } },
  Poppy: { strengths: { dashDenial: 3 } },
  Vex: { strengths: { dashDenial: 3 } },
  Singed: { strengths: { grounding: 3 } },
  Olaf: { strengths: { ccImmunity: 3 }, dependencies: { ccDependent: 1 } },
  Gangplank: { strengths: { cleanse: 3 } },
  Alistar: { strengths: { cleanse: 3 } },
  Malzahar: { strengths: { spellShield: 3, summonScreen: 3, pointClickCc: 3 } },
  Elise: { dependencies: { singleSpellSetup: 3, blockableSkillshot: 3 } },
  Nidalee: { dependencies: { blockableSkillshot: 3, projectileReliant: 2 } },
  Sylas: { strengths: { ultimateTheft: 3 }, dependencies: { dashReliant: 2 } },
  Malphite: { strengths: { attackSpeedControl: 3 }, dependencies: { highValueUltimate: 3 } },
  Jax: { strengths: { attackEvasion: 3 }, dependencies: { autoAttackDependent: 3 } },
  Teemo: { strengths: { attackEvasion: 3 } },
  Vayne: { dependencies: { autoAttackDependent: 3 } },
  Trundle: { dependencies: { autoAttackDependent: 3 } },
  Mordekaiser: { dependencies: { ccDependent: 3 } },
  Irelia: { dependencies: { dashReliant: 3, autoAttackDependent: 3 } },
  Yone: { dependencies: { dashReliant: 3, autoAttackDependent: 2 } },
  Katarina: { dependencies: { dashReliant: 3, channelDependent: 3 } },
  Fiddlesticks: { dependencies: { channelDependent: 3 } },
  "Nunu & Willump": { dependencies: { channelDependent: 3 } },
  Galio: { dependencies: { ccDependent: 3, highValueUltimate: 2 } },
  Pantheon: { strengths: { pointClickCc: 3 }, dependencies: { singleSpellSetup: 2 } },
  Lux: { dependencies: { projectileReliant: 3, singleSpellSetup: 2 } },
  Ahri: { dependencies: { projectileReliant: 2, singleSpellSetup: 2, dashReliant: 2 } },
  LeBlanc: { dependencies: { dashReliant: 3, singleWindowBurst: 3 } },
};

function officialMechanics(champion) {
  const official = officialChampionById.get(champion.id);
  if (!official) return { strengths: {}, dependencies: {} };
  const descriptions = [official.passive?.description, ...official.spells.map((spell) => spell.description)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const strengths = {};
  const dependencies = {};
  const count = (pattern) => descriptions.match(pattern)?.length ?? 0;

  // “Hits the ground” e “throws an axe into the ground” não são Grounded.
  // Exigimos o nome do estado ou um verbo cujo objeto seja o alvo.
  if (/\b(?:is|are|become|becomes|remain|remains) grounded\b|\bground(?:s|ing) (?:the target|targets|an enemy|enemies|them)\b/.test(descriptions)) strengths.grounding = 3;
  if (/block(?:s|ing)?[^.]{0,60}projectile|destroy(?:s|ing)?[^.]{0,60}projectile|reflect(?:s|ing)?[^.]{0,60}projectile/.test(descriptions)) strengths.projectileDenial = 3;
  if (/immune to crowd control|immune to disables|cannot be disabled/.test(descriptions)) strengths.ccImmunity = 3;
  if (/remove(?:s)? all (?:crowd control|disables)|cleanse/.test(descriptions)) strengths.cleanse = 3;
  if (/spell shield/.test(descriptions)) strengths.spellShield = 3;
  if (/reduces?[^.]{0,60}attack speed/.test(descriptions)) strengths.attackSpeedControl = 3;
  if (/blind(?:s|ed|ing)?|dodge(?:s)? all incoming attacks/.test(descriptions)) strengths.attackEvasion = 3;
  if (/knock(?:s|ing)? (?:back|up|aside)|pull(?:s|ing)? (?:them|enemies|the target)/.test(descriptions)) strengths.displacement = 2;
  if (/summons? (?:a |several |multiple )?(?:voidling|minion|soldier|plant)/.test(descriptions)) strengths.summonScreen = 2;

  const mobilityMentions = count(/\b(?:dash(?:es)?|blink(?:s)?|leap(?:s)?|lunge(?:s)?)\s+(?:to|towards?|forward|backward|through|in a direction|a short distance)\b/g);
  if (mobilityMentions >= 2) dependencies.dashReliant = 3;
  else if (mobilityMentions === 1) dependencies.dashReliant = 1;
  const projectileMentions = count(/\b(?:fires?|launches?|throws?|sends?)\b[^.]{0,50}\b(?:projectile|missile)\b/g);
  if (projectileMentions >= 2) dependencies.projectileReliant = 2;
  if (/\bchannel(?:s|ing|led)?\b/.test(descriptions)) dependencies.channelDependent = 2;
  if (champion.tags.includes("Marksman")) dependencies.autoAttackDependent = 3;
  return { strengths, dependencies };
}

function inferMechanics(entry, champion) {
  const strengthsText = foldText(`${entry?.identity ?? ""} ${entry?.delivery ?? ""}`);
  const dependenciesText = foldText(`${entry?.risks ?? ""} ${entry?.seeks ?? ""}`);
  const official = officialMechanics(champion);
  const strengths = { ...official.strengths };
  const dependencies = { ...official.dependencies };
  for (const [tag, pattern] of Object.entries(mechanicStrengthPatterns)) {
    if (pattern.test(strengthsText)) strengths[tag] = 2;
  }
  for (const [tag, pattern] of Object.entries(mechanicDependencyPatterns)) {
    if (pattern.test(dependenciesText)) dependencies[tag] = 2;
  }
  return {
    strengths: mergeMap(strengths, mechanicOverrides[champion.name]?.strengths),
    dependencies: mergeMap(dependencies, mechanicOverrides[champion.name]?.dependencies),
  };
}

function inferProfile(champion) {
  if (!champion) return candidateProfile({ strengths: [], weaknesses: [], safeBlind: 1.5, confidence: "LOW" });
  const entry = catalog.get(normalize(champion.name));
  // "Busca" descreve o cenário/oponente desejado, não uma capacidade própria.
  // Misturar essa coluna aqui transformava, por exemplo, "busca engage
  // previsível" em uma falsa tag de engage.
  const strengthsText = foldText(`${entry?.identity ?? ""} ${entry?.delivery ?? ""}`);
  // Negar uma mecânica não significa possuí-la. Sem esta limpeza, “anti-dash”
  // virava mobilidade e “controle de wave/espaço” virava hard CC.
  const capabilityText = strengthsText
    .replace(/anti[- ]dash|punicao de dash|punição de dash|negacao de dash|negação de dash/g, "")
    .replace(/controle de (?:wave|onda|espaco|espaço|zona|visao|visão|objetivo|mapa)/g, "");
  const weaknessesText = foldText(entry?.risks ?? "");
  const strengths = {};
  const weaknesses = {};

  for (const [tag, pattern] of Object.entries(strengthPatterns)) {
    if (pattern.test(capabilityText)) strengths[tag] = 2;
  }
  for (const [tag, pattern] of Object.entries(weaknessPatterns)) {
    if (pattern.test(weaknessesText)) weaknesses[tag] = 2;
  }

  for (const tag of champion.tags) {
    if (tag === "Assassin") Object.assign(strengths, { burst: Math.max(strengths.burst ?? 0, 2), pick: Math.max(strengths.pick ?? 0, 1), mobility: Math.max(strengths.mobility ?? 0, 1), backlineAccess: Math.max(strengths.backlineAccess ?? 0, 1) });
    if (tag === "Fighter") Object.assign(strengths, { dps: Math.max(strengths.dps ?? 0, 1), longTrade: Math.max(strengths.longTrade ?? 0, 1), allIn: Math.max(strengths.allIn ?? 0, 1) });
    if (tag === "Mage") Object.assign(strengths, { magicDamage: Math.max(strengths.magicDamage ?? 0, 2), waveclear: Math.max(strengths.waveclear ?? 0, 1) });
    if (tag === "Tank") Object.assign(strengths, { frontline: Math.max(strengths.frontline ?? 0, 2), defenses: Math.max(strengths.defenses ?? 0, 2), cc: Math.max(strengths.cc ?? 0, 1) });
    if (tag === "Marksman") Object.assign(strengths, { physicalDamage: Math.max(strengths.physicalDamage ?? 0, 2), dps: Math.max(strengths.dps ?? 0, 2), siege: Math.max(strengths.siege ?? 0, 1) });
    if (tag === "Support") Object.assign(strengths, { peel: Math.max(strengths.peel ?? 0, 1), cc: Math.max(strengths.cc ?? 0, 1) });
  }

  return {
    strengths,
    weaknesses,
    mechanics: inferMechanics(entry, champion),
    safeBlind: strengths.waveclear || strengths.weakside || strengths.mobility ? 2 : 1.3,
    confidence: "MEDIUM",
  };
}

const champions = championRecords.map((champion) => ({
  id: champion.id,
  name: champion.name,
  tags: champion.tags,
  profile: inferProfile(champion),
}));

const championByName = new Map(champions.map((champion) => [champion.name, champion]));
const namesForRole = {
  TOP: ["Aatrox", "Ambessa", "Aurora", "Camille", "Cho'Gath", "Darius", "Dr. Mundo", "Fiora", "Gangplank", "Garen", "Gnar", "Gragas", "Gwen", "Illaoi", "Irelia", "Jax", "Jayce", "K'Sante", "Kayle", "Kennen", "Kled", "Malphite", "Mordekaiser", "Nasus", "Olaf", "Ornn", "Pantheon", "Poppy", "Quinn", "Renekton", "Riven", "Rumble", "Sett", "Shen", "Singed", "Sion", "Tahm Kench", "Teemo", "Trundle", "Tryndamere", "Udyr", "Urgot", "Vayne", "Vladimir", "Volibear", "Warwick", "Yone", "Yorick", "Zaahen"],
  JUNGLE: ["Amumu", "Bel'Veth", "Briar", "Diana", "Ekko", "Elise", "Evelynn", "Fiddlesticks", "Graves", "Hecarim", "Ivern", "Jarvan IV", "Karthus", "Kayn", "Kha'Zix", "Kindred", "Lee Sin", "Lillia", "Master Yi", "Naafiri", "Nidalee", "Nocturne", "Nunu & Willump", "Olaf", "Poppy", "Rammus", "Rek'Sai", "Rengar", "Sejuani", "Shaco", "Shyvana", "Skarner", "Taliyah", "Talon", "Trundle", "Udyr", "Vi", "Viego", "Volibear", "Warwick", "Wukong", "Xin Zhao", "Zac", "Zaahen"],
  MID: ["Ahri", "Akali", "Akshan", "Anivia", "Annie", "Aurelion Sol", "Aurora", "Azir", "Brand", "Cassiopeia", "Corki", "Diana", "Ekko", "Fizz", "Galio", "Hwei", "Irelia", "Jayce", "Kassadin", "Katarina", "LeBlanc", "Lissandra", "Locke", "Lux", "Malzahar", "Mel", "Naafiri", "Neeko", "Orianna", "Pantheon", "Qiyana", "Rumble", "Ryze", "Swain", "Sylas", "Syndra", "Taliyah", "Talon", "Tristana", "Twisted Fate", "Veigar", "Vel'Koz", "Vex", "Viktor", "Vladimir", "Xerath", "Yasuo", "Yone", "Zed", "Ziggs", "Zoe"],
  BOTTOM: ["Aphelios", "Ashe", "Caitlyn", "Corki", "Draven", "Ezreal", "Jhin", "Jinx", "Kai'Sa", "Kalista", "Kog'Maw", "Lucian", "Miss Fortune", "Nilah", "Samira", "Senna", "Seraphine", "Sivir", "Smolder", "Tristana", "Twitch", "Varus", "Vayne", "Xayah", "Yunara", "Zeri", "Ziggs"],
  SUPPORT: ["Alistar", "Ashe", "Bard", "Blitzcrank", "Brand", "Braum", "Janna", "Karma", "Leona", "Lulu", "Lux", "Maokai", "Milio", "Morgana", "Nami", "Nautilus", "Neeko", "Poppy", "Pyke", "Rakan", "Rell", "Renata Glasc", "Senna", "Seraphine", "Sona", "Soraka", "Swain", "Tahm Kench", "Taric", "Thresh", "Vel'Koz", "Xerath", "Yuumi", "Zilean", "Zyra"],
};
const rolePools = Object.fromEntries(Object.entries(namesForRole).map(([role, names]) => [role, names.map((name) => championByName.get(name)).filter(Boolean)]));
const roleNameSets = Object.fromEntries(Object.entries(namesForRole).map(([role, names]) => [role, new Set(names)]));

function weightedAverage(rows, valueKey) {
  const games = rows.reduce((sum, row) => sum + row.games, 0);
  if (!games) return null;
  return rows.reduce((sum, row) => sum + row[valueKey] * row.games, 0) / games;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function evidenceMap(snapshot) {
  const result = new Map();
  if (!snapshot) return result;
  for (const [champion, rows] of Object.entries(snapshot.champions)) {
    const totalGames = rows.reduce((sum, row) => sum + row.games, 0);
    result.set(champion, {
      rows,
      totalGames,
      relations: rows.length,
      observedWinRate: weightedAverage(rows, "winRate"),
    });
  }
  return result;
}

const evidenceByLane = Object.fromEntries(Object.entries(matchupSnapshots).map(([lane, snapshots]) => [lane, {
  current: evidenceMap(snapshots.current),
  stable: evidenceMap(snapshots.stable),
  fallback: evidenceMap(snapshots.fallback),
}]));
const populationBaselineByLane = Object.fromEntries(Object.entries(evidenceByLane).map(([lane, tiers]) => [lane,
  median([...tiers.stable.values()]
    .filter((evidence) => evidence.totalGames >= 5_000 && evidence.observedWinRate != null)
    .map((evidence) => evidence.observedWinRate)) ?? 50,
]));

function directionalEvidence(evidence, championName, opponentName) {
  const championEvidence = evidence.get(championName);
  const opponentEvidence = evidence.get(opponentName);
  const forward = championEvidence?.rows.find((item) => item.opponent === opponentName);
  const reverse = opponentEvidence?.rows.find((item) => item.opponent === championName);
  if (!forward && !reverse) return null;
  const signals = [
    ...(forward ? [{ delta2: forward.delta2, games: forward.games }] : []),
    ...(reverse ? [{ delta2: -reverse.delta2, games: reverse.games }] : []),
  ];
  const directionalGames = signals.reduce((sum, item) => sum + item.games, 0);
  return {
    delta2: signals.reduce((sum, item) => sum + item.delta2 * item.games, 0) / directionalGames,
    games: forward && reverse ? directionalGames / 2 : directionalGames,
    directions: signals.length,
  };
}

function statisticalLaneEvidence(championName, opponentName, lane, buildId) {
  const laneEvidence = evidenceByLane[lane];
  if (!laneEvidence) return null;
  const current = directionalEvidence(laneEvidence.current, championName, opponentName);
  const stable = directionalEvidence(laneEvidence.stable, championName, opponentName);
  const fallback = directionalEvidence(laneEvidence.fallback, championName, opponentName);
  if (!current && !stable && !fallback) return null;

  // Patch atual Diamond+ domina. A janela Diamond+ de 30 dias estabiliza a
  // relação e Emerald+ só preenche o restante como prior fraco. As janelas se
  // sobrepõem, então as contagens nunca são somadas como dados independentes.
  const currentReliability = current ? current.games / (current.games + 350) : 0;
  const stableReliability = stable ? stable.games / (stable.games + 500) : 0;
  const fallbackReliability = fallback ? fallback.games / (fallback.games + 1_200) * 0.25 : 0;
  const weightedSignals = [
    ...(current ? [{ ...current, weight: currentReliability }] : []),
    ...(stable ? [{ ...stable, weight: (1 - currentReliability) * stableReliability }] : []),
    ...(fallback ? [{ ...fallback, weight: (1 - currentReliability) * (1 - stableReliability) * fallbackReliability }] : []),
  ];
  const signalWeight = weightedSignals.reduce((sum, item) => sum + item.weight, 0);
  const delta2 = weightedSignals.reduce((sum, item) => sum + item.delta2 * item.weight, 0) / signalWeight;
  const combinedReliability = 1 - (1 - currentReliability) * (1 - stableReliability) * (1 - fallbackReliability);

  // Uma build customizada pode mudar a relação por completo. Até existir dado
  // por build, ela herda só uma fração da estatística da build padrão.
  const buildFit = buildId === "system-default" || buildId === "default" || buildId.includes("default") ? 1 : 0.35;
  const reliability = combinedReliability * buildFit;
  return {
    score: clamp(delta2 * 1.8, -9, 9),
    reliability,
    games: Math.round(current?.games ?? stable?.games ?? fallback.games),
    delta2,
    directions: current?.directions ?? stable?.directions ?? fallback.directions,
    currentGames: Math.round(current?.games ?? 0),
    currentDirections: current?.directions ?? 0,
    stableGames: Math.round(stable?.games ?? 0),
    stableDirections: stable?.directions ?? 0,
    fallbackGames: Math.round(fallback?.games ?? 0),
    source: "LOLALYTICS_DELTA2_CURRENT_DIAMOND_WITH_STABLE_PRIORS",
  };
}

function populationStrength(championName, lane) {
  const laneEvidence = evidenceByLane[lane];
  if (!laneEvidence) return { score: 0, confidence: "LOW", source: "NO_ROLE_SNAPSHOT" };
  const primary = laneEvidence.stable.get(championName);
  const fallback = laneEvidence.fallback.get(championName);
  const evidence = primary?.totalGames ? primary : fallback;
  if (!evidence?.totalGames || evidence.observedWinRate == null) {
    return { score: 0, confidence: "LOW", source: "NO_SAMPLE", games: 0 };
  }
  const tierFit = primary?.totalGames ? 1 : 0.4;
  const reliability = evidence.totalGames / (evidence.totalGames + 10_000) * tierFit;
  const score = clamp((evidence.observedWinRate - populationBaselineByLane[lane]) * reliability, -3, 3);
  return {
    score,
    confidence: reliability >= 0.7 ? "HIGH" : reliability >= 0.25 ? "MEDIUM" : "LOW",
    source: primary?.totalGames ? "DIAMOND_ROLE_BASELINE" : "EMERALD_ROLE_FALLBACK",
    games: evidence.totalGames,
    observedWinRate: evidence.observedWinRate,
    reliability,
  };
}

function laneViability(championName, lane, profile) {
  const laneEvidence = evidenceByLane[lane];
  if (laneEvidence) {
    const primary = laneEvidence.stable.get(championName);
    const fallback = laneEvidence.fallback.get(championName);
    const evidence = primary?.totalGames ? primary : fallback;
    if (evidence?.totalGames >= 25_000 && evidence.relations >= 40) {
      return {
        score: 0,
        reason: `${championName} possui amostra consistente em ${lane} (${evidence.totalGames} jogos de relações).`,
        source: "STANDARD_ROLE_DATA",
        games: evidence.totalGames,
      };
    }
    if (evidence?.totalGames >= 2_500 && evidence.relations >= 10) {
      return {
        score: -1,
        reason: `${championName} possui presença off-meta observada em ${lane}; confiança reduzida, sem exclusão.`,
        source: "OFFMETA_OBSERVED",
        games: evidence.totalGames,
      };
    }
    if (evidence?.totalGames > 0) {
      return {
        score: -2.5,
        reason: `${championName} possui apenas amostra esparsa em ${lane}; a lógica do kit predomina.`,
        source: "SPARSE_OBSERVED",
        games: evidence.totalGames,
      };
    }
  }
  if (roleNameSets[lane]?.has(championName)) {
    return { score: 0, reason: `${championName} possui baseline padrão para ${lane}.`, source: "STANDARD_ROLE" };
  }

  const otherSoloLane = lane === "MID" ? "TOP" : "MID";
  let baseRisk;
  let source;
  if (roleNameSets[otherSoloLane]?.has(championName)) {
    baseRisk = 3;
    source = "OTHER_SOLO_LANE";
  } else if (roleNameSets.BOTTOM?.has(championName)) {
    baseRisk = 5;
    source = "BOTTOM_ONLY";
  } else if (roleNameSets.JUNGLE?.has(championName)) {
    baseRisk = 6;
    source = "JUNGLE_ONLY";
  } else if (roleNameSets.SUPPORT?.has(championName)) {
    baseRisk = 8;
    source = "SUPPORT_ONLY";
  } else {
    baseRisk = 7;
    source = "UNMAPPED_ROLE";
  }

  // Ferramentas só reduzem o risco porque são diretamente aplicáveis a jogar
  // a lane: tocar a wave, sobreviver à exposição e alcançar o oponente.
  const waveTool = Math.max(profile.strengths.waveclear ?? 0, profile.strengths.priority ?? 0);
  const survivalTool = Math.max(
    profile.strengths.sustain ?? 0,
    profile.strengths.mobility ?? 0,
    profile.strengths.defenses ?? 0,
    profile.strengths.antiDive ?? 0,
    profile.strengths.weakside ?? 0,
  );
  const laneToolReduction = Math.min(2, waveTool * 0.35 + survivalTool * 0.25);
  const exposure = Math.max(
    profile.weaknesses.vulnWave ?? 0,
    profile.weaknesses.vulnGank ?? 0,
    profile.weaknesses.immobile ?? 0,
  ) * 0.35;
  const risk = clamp(baseRisk - laneToolReduction + exposure, 1, 10);
  return {
    score: -risk,
    reason: `${championName} não possui baseline padrão para ${lane}; risco de lane ${round(risk)}.`,
    source,
  };
}

// Relações exclusivamente de lane. Capacidades de composição (engage, peel,
// frontline, teamfight etc.) não entram aqui apenas por existirem no kit.
const laneOffensePairs = [
  ["burst", "vulnBurst"], ["dps", "vulnDps"], ["antiTank", "vulnTank"],
  ["poke", "vulnPoke"], ["poke", "vulnRange"],
  ["shortTrade", "needsLongFight"], ["cc", "vulnCc"],
  ["waveclear", "vulnWave"], ["earlyPressure", "goldDependent"],
  ["sustain", "vulnPoke"],
];

const mechanicLaneRules = [
  { strength: "repeatedDamage", dependency: "singleWindowDefense", factor: 1.6, group: "window", label: "dano repetido atravessa defesa de janela única" },
  { strength: "grounding", dependency: "dashReliant", factor: 1.5, group: "dashControl", label: "grounding desliga a mobilidade necessária" },
  { strength: "dashDenial", dependency: "dashReliant", factor: 1.4, group: "dashControl", label: "anti-dash pune o padrão de entrada" },
  { strength: "projectileDenial", dependency: "projectileReliant", factor: 1.4, group: "projectile", label: "negação de projétil remove parte central do kit" },
  { strength: "ccImmunity", dependency: "ccDependent", factor: 1.5, group: "ccBypass", label: "imunidade a CC atravessa a contenção principal" },
  { strength: "cleanse", dependency: "ccDependent", factor: 1.2, group: "ccBypass", label: "cleanse remove a condição principal de controle" },
  { strength: "spellShield", dependency: "singleSpellSetup", factor: 1.3, group: "setupDenial", label: "spell shield nega o setup de uma skill" },
  { strength: "summonScreen", dependency: "blockableSkillshot", factor: 1.3, group: "setupDenial", label: "unidades invocadas bloqueiam a skillshot de setup" },
  { strength: "attackSpeedControl", dependency: "autoAttackDependent", factor: 1.35, group: "antiAuto", label: "redução de velocidade de ataque quebra o DPS" },
  { strength: "attackEvasion", dependency: "autoAttackDependent", factor: 1.35, group: "antiAuto", label: "evasão nega a janela de ataques" },
  { strength: "displacement", dependency: "channelDependent", factor: 1.25, label: "deslocamento interrompe canalização" },
  { strength: "ultimateTheft", dependency: "highValueUltimate", factor: 1.7, label: "roubo converte a ultimate decisiva contra o próprio time" },
  { strength: "pointClickCc", dependency: "dashReliant", factor: 0.8, label: "controle confiável limita a mobilidade" },
];

function mechanicLanePressure(attacker, defender) {
  const attackerMechanics = attacker.mechanics?.strengths ?? {};
  const defenderDependencies = defender.mechanics?.dependencies ?? {};
  const interactions = mechanicLaneRules.map((rule) => {
    const value = (attackerMechanics[rule.strength] ?? 0) * (defenderDependencies[rule.dependency] ?? 0) / 3 * rule.factor;
    return { label: `Mecânica: ${rule.label}`, value, source: "SPECIFIC_MECHANIC", group: rule.group ?? rule.label };
  }).filter((item) => item.value > 0);
  return [...interactions.reduce((bestByGroup, item) => {
    if (!bestByGroup.has(item.group) || bestByGroup.get(item.group).value < item.value) bestByGroup.set(item.group, item);
    return bestByGroup;
  }, new Map()).values()];
}

function lanePressure(attacker, defender) {
  const contributions = mechanicLanePressure(attacker, defender);
  for (const [strength, weakness] of laneOffensePairs) {
    const value = (attacker.strengths[strength] ?? 0) * (defender.weaknesses[weakness] ?? 0) / 3;
    if (value > 0) {
      contributions.push({ label: `${S[strength]} explora ${W[weakness]}`, value });
    }
  }
  if ((attacker.strengths.antiCc ?? 0) && (defender.strengths.cc ?? 0)) {
    const value = attacker.strengths.antiCc * defender.strengths.cc / 2.5;
    contributions.push({ label: `${S.antiCc} reduz ${S.cc}`, value });
  }
  if ((attacker.strengths.antiAuto ?? 0) && ((defender.strengths.dps ?? 0) + (defender.strengths.physicalDamage ?? 0) >= 4)) {
    const value = attacker.strengths.antiAuto * 1.2;
    contributions.push({ label: `${S.antiAuto} reduz DPS por ataques`, value });
  }
  if ((attacker.strengths.antiDive ?? 0) && ((defender.strengths.allIn ?? 0) + (defender.strengths.backlineAccess ?? 0) >= 4)) {
    const value = attacker.strengths.antiDive * Math.max(defender.strengths.allIn ?? 0, defender.strengths.backlineAccess ?? 0) / 3;
    contributions.push({ label: `${S.antiDive} responde ao all-in`, value });
  }
  if ((attacker.strengths.disengage ?? 0) && ((defender.strengths.allIn ?? 0) + (defender.weaknesses.needsContact ?? 0) >= 4)) {
    const value = attacker.strengths.disengage * Math.max(defender.strengths.allIn ?? 0, defender.weaknesses.needsContact ?? 0) / 3;
    contributions.push({ label: `${S.disengage} nega contato`, value });
  }
  contributions.sort((a, b) => b.value - a.value);
  // Uma resposta principal e, no máximo, uma confirmação menor. Isso impede
  // que um kit versátil vença por acumular tags para a mesma lane.
  const weights = [1, 0.3];
  const total = contributions.slice(0, 2).reduce((sum, item, index) => sum + item.value * weights[index], 0);
  return { total, contributions };
}

function explicitRule(candidate, buildId, opponent) {
  return matchupRules.find((rule) => rule.candidate === candidate && rule.opponent === opponent && (!rule.buildIds || rule.buildIds.includes(buildId)));
}

function laneTier(score, statistical, rule) {
  if (rule?.severity === "VERY_BAD_LANE" || score <= -5 || (statistical?.reliability >= 0.35 && statistical.delta2 <= -3.5)) return "SEVERE_COUNTER";
  if (rule?.severity === "BAD_LANE" || score <= -2.25 || (statistical?.reliability >= 0.25 && statistical.delta2 <= -1.5)) return "COUNTERED";
  if (score <= -0.75) return "SLIGHTLY_COUNTERED";
  if (rule?.severity === "HARDCOUNTERS_LANE" || score >= 6.5) return "HARDCOUNTERS";
  if (score >= 3.5 || (statistical?.reliability >= 0.35 && statistical.delta2 >= 2.5)) return "STRONG_ADVANTAGE";
  if (score >= 1.25) return "ADVANTAGED";
  return "EVEN";
}

function automaticHardcounter(statistical, specificMechanicalScore, buildId) {
  const standardBuild = buildId === "system-default" || buildId === "default" || buildId.includes("default");
  const robustBidirectionalSample =
    (statistical?.currentDirections === 2 && statistical.currentGames >= 150) ||
    (statistical?.stableDirections === 2 && statistical.stableGames >= 250);
  return standardBuild &&
    statistical?.reliability >= 0.4 &&
    robustBidirectionalSample &&
    statistical.delta2 <= -4 &&
    specificMechanicalScore <= -3;
}

function laneScore(candidate, build, enemyLaner, evaluatedLane = "MID") {
  if (!enemyLaner) return { score: 0, confidence: "LOW", reasons: ["Laner inimigo ainda desconhecido."] };
  const rule = explicitRule(candidate, build.id, enemyLaner.name);
  if (rule?.severity === "HARDCOUNTERED_LANE") return { veto: true, rule };

  const candidatePressure = lanePressure(build.profile, enemyLaner.profile);
  const enemyPressure = lanePressure(enemyLaner.profile, build.profile);
  const mechanicalScore = clamp((candidatePressure.total - enemyPressure.total) * 1.8, -7, 7);
  const candidateSpecific = candidatePressure.contributions
    .filter((item) => item.source === "SPECIFIC_MECHANIC")
    .reduce((sum, item) => sum + item.value, 0);
  const enemySpecific = enemyPressure.contributions
    .filter((item) => item.source === "SPECIFIC_MECHANIC")
    .reduce((sum, item) => sum + item.value, 0);
  const specificMechanicalScore = clamp((candidateSpecific - enemySpecific) * 1.8, -7, 7);
  const statistical = statisticalLaneEvidence(candidate, enemyLaner.name, evaluatedLane, build.id);
  let score = statistical
    ? statistical.reliability * statistical.score + (1 - statistical.reliability) * mechanicalScore * 0.65
    : mechanicalScore;
  const reasons = [];

  if (statistical) {
    reasons.push(`Evidência ${evaluatedLane}: Δ2 ${statistical.delta2 >= 0 ? "+" : ""}${round(statistical.delta2)}; ${statistical.currentGames} jogos no patch, ${statistical.stableGames} na janela Diamond+ e ${statistical.fallbackGames} no prior Emerald+; peso ${round(statistical.reliability * 100)}%.`);
  } else {
    reasons.push(`Sem amostra direcional suficiente em ${evaluatedLane}; matchup inferida pelo kit e pelas skills.`);
  }

  if (rule) {
    const ruleValue = severityScore[rule.severity];
    score = clamp(score * 0.35 + ruleValue * 0.65, -10, 10);
    reasons.push(rule.reason);
  }

  if (automaticHardcounter(statistical, specificMechanicalScore, build.id)) {
    return {
      veto: true,
      rule: {
        severity: "HARDCOUNTERED_LANE",
        confidence: "HIGH",
        reason: `Hardcounter confirmado por Diamond+, duas direções estatísticas e interação mecânica desfavorável: Δ2 ${round(statistical.delta2)}.`,
      },
      statistical,
      mechanicalScore,
      specificMechanicalScore,
      reasons,
    };
  }

  const bestPositive = candidatePressure.contributions.sort((a, b) => b.value - a.value)[0];
  const bestNegative = enemyPressure.contributions.sort((a, b) => b.value - a.value)[0];
  if (bestPositive) reasons.push(`Favorável: ${bestPositive.label}.`);
  if (bestNegative) reasons.push(`Risco: ${bestNegative.label}.`);

  const evidenceConfidence = statistical?.reliability >= 0.65 ? "HIGH" : statistical?.reliability >= 0.25 ? "MEDIUM" : "LOW";
  return {
    score,
    mechanicalScore,
    specificMechanicalScore,
    statistical,
    tier: laneTier(score, statistical, rule),
    confidence: rule?.confidence ?? evidenceConfidence,
    reasons,
  };
}

function jungleInteraction(candidateProfileValue, allyJungle, enemyJungle) {
  let score = 0;
  const reasons = [];
  if (allyJungle) {
    const setup = (candidateProfileValue.strengths.gankSetup ?? 0) * ((allyJungle.profile.strengths.burst ?? 0) + (allyJungle.profile.strengths.cc ?? 0)) / 9;
    const prio = (candidateProfileValue.strengths.priority ?? 0) * (allyJungle.profile.strengths.earlyPressure ?? 0) / 4.5;
    score += setup + prio;
    if (setup + prio > 1.2) reasons.push(`Boa conversão com ${allyJungle.name}.`);
  }
  if (enemyJungle) {
    const jungleThreat = (enemyJungle.profile.strengths.cc ?? 0) + (enemyJungle.profile.strengths.engage ?? 0) + (enemyJungle.profile.strengths.burst ?? 0);
    const catchRisk = jungleThreat *
      ((candidateProfileValue.weaknesses.vulnGank ?? 0) + (candidateProfileValue.weaknesses.immobile ?? 0) + (candidateProfileValue.weaknesses.fragileEntry ?? 0)) / 18;
    const defense = jungleThreat *
      ((candidateProfileValue.strengths.mobility ?? 0) + (candidateProfileValue.strengths.antiDive ?? 0) + (candidateProfileValue.strengths.defenses ?? 0)) / 36;
    score -= catchRisk;
    score += Math.min(catchRisk, defense);
    if (catchRisk > defense + 1) reasons.push(`Exposição relevante ao gank de ${enemyJungle.name}.`);
  }
  return { score: clamp(score, -10, 10), reasons };
}

function aggregateProfiles(picks) {
  const strengths = {};
  const weaknesses = {};
  for (const pick of picks.filter(Boolean)) {
    for (const [tag, value] of Object.entries(pick.profile.strengths)) strengths[tag] = (strengths[tag] ?? 0) + value;
    for (const [tag, value] of Object.entries(pick.profile.weaknesses)) weaknesses[tag] = (weaknesses[tag] ?? 0) + value;
  }
  return { strengths, weaknesses, size: picks.filter(Boolean).length };
}

const compResponseRules = [
  { threat: (p) => p.strengths.cc ?? 0, answers: ["antiCc"], label: "anti-CC contra o controle" },
  { threat: (p) => Math.max(p.strengths.engage ?? 0, p.strengths.backlineAccess ?? 0, p.strengths.allIn ?? 0), answers: ["antiDive", "peel", "disengage", "defenses"], label: "resposta à entrada" },
  { threat: (p) => Math.max(p.strengths.frontline ?? 0, p.strengths.hp ?? 0, p.strengths.defenses ?? 0), answers: ["dps", "antiTank"], label: "DPS/anti-tank contra a frontline" },
  { threat: (p) => Math.max(p.strengths.poke ?? 0, p.strengths.siege ?? 0), answers: ["engage", "mobility", "sustain", "waveclear"], label: "resposta ao poke/siege" },
  { threat: (p) => Math.max(p.strengths.mobility ?? 0, p.strengths.backlineAccess ?? 0), answers: ["cc", "pick", "zone", "antiDive"], label: "contenção da mobilidade" },
  { threat: (p) => Math.min(3, ((p.strengths.dps ?? 0) + (p.strengths.physicalDamage ?? 0)) / 2), answers: ["antiAuto", "defenses"], label: "resposta ao DPS físico" },
  { threat: (p) => p.weaknesses.vulnBurst ?? 0, answers: ["burst"], label: "burst contra alvo vulnerável" },
  { threat: (p) => Math.max(p.weaknesses.vulnRange ?? 0, p.weaknesses.immobile ?? 0), answers: ["poke", "pick"], label: "alcance contra alvo exposto" },
  { threat: (p) => p.weaknesses.needsContact ?? 0, answers: ["zone", "disengage"], label: "negação de contato" },
];

const compExposureRules = [
  { pressure: (p) => Math.max(p.strengths.poke ?? 0, p.strengths.siege ?? 0), risks: ["vulnPoke", "vulnRange", "immobile"], label: "poke/range dificulta a execução" },
  { pressure: (p) => Math.max(p.strengths.engage ?? 0, p.strengths.backlineAccess ?? 0), risks: ["vulnEngage", "fragileEntry"], label: "engage/dive pune o perfil" },
  { pressure: (p) => p.strengths.cc ?? 0, risks: ["vulnCc", "fragileEntry"], label: "controle interrompe a entrada" },
  { pressure: (p) => Math.max(p.strengths.disengage ?? 0, p.strengths.peel ?? 0, p.strengths.mobility ?? 0), risks: ["vulnKite", "vulnDisengage", "needsContact"], label: "kite/disengage nega contato" },
  { pressure: (p) => Math.max(p.strengths.frontline ?? 0, p.strengths.defenses ?? 0), risks: ["vulnTank"], amplifiers: ["burst"], label: "frontline nega o padrão de dano" },
];

function bestSpecificInteraction(candidate, enemy, rules, answerKey) {
  const interactions = rules.map((rule) => {
    const pressure = (rule.threat ?? rule.pressure)(enemy.profile);
    const answerTags = rule[answerKey] ?? [];
    const answer = Math.max(0, ...answerTags.map((tag) => candidate[answerKey === "answers" ? "strengths" : "weaknesses"][tag] ?? 0));
    const amplifier = rule.amplifiers ? Math.max(1, ...rule.amplifiers.map((tag) => candidate.strengths[tag] ?? 0)) : 1;
    return { label: rule.label, value: pressure * answer * amplifier / (rule.amplifiers ? 6 : 3) };
  }).filter((item) => item.value > 0);
  return interactions.sort((a, b) => b.value - a.value)[0] ?? { label: "sem interação aplicável", value: 0 };
}

function enemyCompScore(candidate, enemies) {
  const knownEnemies = enemies.filter(Boolean);
  if (!knownEnemies.length) return { score: 0, reasons: ["Composição inimiga ainda desconhecida."] };

  const interactions = knownEnemies.map((enemy) => ({
    enemy: enemy.name,
    response: bestSpecificInteraction(candidate, enemy, compResponseRules, "answers"),
    exposure: bestSpecificInteraction(candidate, enemy, compExposureRules, "risks"),
  }));
  // No máximo duas ameaças realmente respondidas e dois riscos concretos.
  // Tags extras que não casam com o draft não alteram o resultado.
  const responses = interactions.filter((item) => item.response.value > 0).sort((a, b) => b.response.value - a.response.value).slice(0, 2);
  const exposures = interactions.filter((item) => item.exposure.value > 0).sort((a, b) => b.exposure.value - a.exposure.value).slice(0, 2);
  const responseValue = responses.reduce((sum, item, index) => sum + item.response.value * [1, 0.35][index], 0);
  const exposureValue = exposures.reduce((sum, item, index) => sum + item.exposure.value * [1, 0.35][index], 0);
  const reasons = [
    ...responses.map((item) => `Favorável contra ${item.enemy}: ${item.response.label}.`),
    ...exposures.map((item) => `Risco contra ${item.enemy}: ${item.exposure.label}.`),
  ];
  return { score: clamp((responseValue - exposureValue) * 2, -10, 10), reasons };
}

function alliedCompScore(candidate, allies, enemies = []) {
  const aggregate = aggregateProfiles(allies);
  if (!aggregate.size) return { score: 0, archetype: "desconhecido", reasons: ["Composição aliada ainda desconhecida."] };
  const st = aggregate.strengths;
  const enemyAggregate = aggregateProfiles(enemies);
  const enemy = enemyAggregate.strengths;
  const archetypeScores = {
    poke: (st.poke ?? 0) + (st.siege ?? 0) + (st.waveclear ?? 0) * 0.5,
    dive: (st.engage ?? 0) + (st.backlineAccess ?? 0) + (st.followUp ?? 0),
    frontToBack: (st.frontline ?? 0) + (st.dps ?? 0) + (st.peel ?? 0),
    pick: (st.pick ?? 0) + (st.burst ?? 0) + (st.cc ?? 0) * 0.5,
    split: (st.split ?? 0) + (st.roam ?? 0) * 0.5,
    scalingControl: (st.scaling ?? 0) + (st.zone ?? 0) + (st.waveclear ?? 0),
  };
  const archetype = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1])[0][0];
  const needsByKey = new Map();
  const addNeed = (key, answers, label, severity, priority) => {
    const normalizedSeverity = clamp(severity, 0, 4);
    if (normalizedSeverity <= 0) return;
    const previous = needsByKey.get(key);
    if (!previous || normalizedSeverity > previous.severity) {
      needsByKey.set(key, { key, answers, label, severity: normalizedSeverity, priority });
    }
  };

  const enemyDive = (enemy.engage ?? 0) + (enemy.backlineAccess ?? 0) + (enemy.allIn ?? 0);
  const enemyPoke = (enemy.poke ?? 0) + (enemy.siege ?? 0);
  const enemyFrontline = (enemy.frontline ?? 0) + (enemy.hp ?? 0) + (enemy.defenses ?? 0);
  const enemyMobility = (enemy.mobility ?? 0) + (enemy.backlineAccess ?? 0);
  const enemyDps = (enemy.dps ?? 0) + (enemy.physicalDamage ?? 0);
  const alliedDive = (st.engage ?? 0) + (st.backlineAccess ?? 0);
  const alliedPoke = (st.poke ?? 0) + (st.siege ?? 0);
  const alliedPick = (st.pick ?? 0) + (st.cc ?? 0) * 0.5;

  if (enemyDive >= 3) {
    const coverage = (st.antiDive ?? 0) + (st.peel ?? 0) + (st.disengage ?? 0);
    addNeed("antiDive", ["antiDive", "peel", "disengage"], "resposta ao dive inimigo", enemyDive / 2 - coverage / 2, 0);
    const frontlineCoverage = (st.frontline ?? 0) + (st.defenses ?? 0);
    addNeed("frontline", ["frontline", "defenses"], "corpo frontal contra a entrada inimiga", (enemyDive + enemyDps) / 4 - frontlineCoverage / 2, 2);
  }
  if (enemyPoke >= 3) {
    const engageCoverage = (st.engage ?? 0) + (st.backlineAccess ?? 0);
    addNeed("engageVsPoke", ["engage", "backlineAccess"], "alcance para iniciar sobre o poke inimigo", enemyPoke / 2 - engageCoverage / 2, 0);
    addNeed("waveclearVsSiege", ["waveclear"], "waveclear contra o siege inimigo", enemyPoke / 2 - (st.waveclear ?? 0), 1);
  }
  if (enemyFrontline >= 3) {
    const tankDamageCoverage = (st.antiTank ?? 0) + (st.dps ?? 0) * 0.5;
    addNeed("antiTank", ["antiTank", "dps"], "dano aplicável na frontline inimiga", enemyFrontline / 2 - tankDamageCoverage / 2, 0);
  }
  if (enemyMobility >= 3) {
    const controlCoverage = (st.cc ?? 0) + (st.zone ?? 0);
    addNeed("mobilityControl", ["cc", "zone", "antiDive"], "contenção da mobilidade inimiga", enemyMobility / 2 - controlCoverage / 2, 1);
  }
  if (alliedDive >= 3) {
    const followUpCoverage = (st.followUp ?? 0) + (st.burst ?? 0) * 0.5;
    addNeed("diveFollowUp", ["followUp", "backlineAccess", "burst"], "follow-up para a entrada aliada", alliedDive / 2 - followUpCoverage / 2, 1);
  }
  if (alliedPoke >= 3 && enemyDive >= 2) {
    const resetCoverage = (st.disengage ?? 0) + (st.peel ?? 0);
    addNeed("protectPoke", ["disengage", "peel", "antiDive"], "proteção do plano de poke", Math.min(alliedPoke, enemyDive) / 2 - resetCoverage / 2, 0);
  }
  if (alliedPick >= 3) {
    const conversionCoverage = (st.burst ?? 0) + (st.followUp ?? 0);
    addNeed("pickConversion", ["burst", "followUp"], "conversão do pick aliado", alliedPick / 2 - conversionCoverage / 2, 2);
  }

  const alliedPhysical = st.physicalDamage ?? 0;
  const alliedMagic = st.magicDamage ?? 0;
  if (alliedPhysical >= alliedMagic + 4) addNeed("magicDamage", ["magicDamage"], "dano mágico para corrigir excesso físico", (alliedPhysical - alliedMagic) / 2, -1);
  if (alliedMagic >= alliedPhysical + 4) addNeed("physicalDamage", ["physicalDamage"], "dano físico para corrigir excesso mágico", (alliedMagic - alliedPhysical) / 2, -1);

  // As necessidades críticas são escolhidas sem olhar o candidato. Assim um
  // campeão não cria para si mesmo várias oportunidades de pontuar.
  const criticalNeeds = [...needsByKey.values()]
    .filter((need) => need.severity >= 0.75)
    .sort((a, b) => b.severity - a.severity || a.priority - b.priority)
    .slice(0, 2);
  const contributions = criticalNeeds.map((need, index) => ({
    ...need,
    value: need.severity * Math.max(0, ...need.answers.map((tag) => candidate.strengths[tag] ?? 0)) / 3 * [1, 0.3][index],
  }));
  const weightedContribution = contributions.reduce((sum, item) => sum + item.value, 0);
  const score = clamp(weightedContribution * 2, 0, 10);
  const reasons = contributions.filter((item) => item.value > 0).map((item) => `Supre necessidade crítica: ${item.label}.`);
  return { score, archetype, criticalNeeds: criticalNeeds.map((need) => need.label), reasons };
}

function lowerTailAverage(values, share = 0.2) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const count = Math.max(1, Math.ceil(sorted.length * share));
  return sorted.slice(0, count).reduce((sum, value) => sum + value, 0) / count;
}

// Incerteza não é tratada como uma qualidade abstrata de "blind pick".
// Para cada slot inimigo oculto, o risco vem da cauda inferior das interações
// plausíveis naquela função. A lane própria domina; outras funções só aplicam
// uma correção pequena até serem reveladas.
function partialDraftRisk(candidateName, build, evaluatedLane, visibleDraft) {
  const pickedNames = new Set([...visibleDraft.allies, ...visibleDraft.enemies].filter(Boolean).map((pick) => pick.name));
  pickedNames.add(candidateName);
  let ownLane = 0;
  let otherRoles = 0;
  const reasons = [];

  if (!visibleDraft.enemyByRole[evaluatedLane]) {
    const viability = laneViability(candidateName, evaluatedLane, build.profile).score;
    const outcomes = rolePools[evaluatedLane]
      .filter((opponent) => !pickedNames.has(opponent.name))
      .map((opponent) => {
        const result = laneScore(candidateName, build, opponent, evaluatedLane);
        return result.veto ? -10 : clamp(result.score + viability, -10, 10);
      });
    const tail = lowerTailAverage(outcomes);
    ownLane = clamp(Math.max(0, -tail) * 0.8, 0, 8);
    if (ownLane > 0) reasons.push(`Lane oculta: cauda desfavorável dos matchups plausíveis gera risco ${round(ownLane)}.`);
  }

  for (const [role, visibleEnemy] of Object.entries(visibleDraft.enemyByRole)) {
    if (role === evaluatedLane || visibleEnemy) continue;
    const outcomes = rolePools[role]
      .filter((opponent) => !pickedNames.has(opponent.name))
      .map((opponent) => role === "JUNGLE"
        ? jungleInteraction(build.profile, null, opponent).score
        : enemyCompScore(build.profile, [opponent]).score);
    const tail = lowerTailAverage(outcomes);
    otherRoles += clamp(Math.max(0, -tail) * 0.18, 0, 1.5);
  }
  otherRoles = clamp(otherRoles, 0, 4);
  if (otherRoles > 0) reasons.push(`Slots inimigos ocultos fora da lane geram risco condicional ${round(otherRoles)}.`);

  return { score: clamp(ownLane + otherRoles, 0, 12), ownLane, otherRoles, reasons };
}

// Composição não pode "comprar de volta" uma lane comprovadamente ruim. Riscos
// da composição continuam inteiros; apenas bônus positivos são retidos. Picks
// úteis com pouca economia guardam uma fração pequena, nunca o bastante para
// transformar um counter severo em recomendação forte.
function executionRetention(profile, matchupScore, matchupTier = "EVEN") {
  if (matchupScore >= 0 && !["COUNTERED", "SEVERE_COUNTER"].includes(matchupTier)) return 1;
  const behindRisk = clamp(Math.max(0, -matchupScore) / 6, 0, 1);
  const dependency = Math.max(
    profile.weaknesses.goldDependent ?? 0,
    profile.weaknesses.resourceDependent ?? 0,
    profile.weaknesses.needsSetup ?? 0,
  ) / 3;
  const entryRisk = Math.max(
    profile.weaknesses.fragileEntry ?? 0,
    profile.weaknesses.needsContact ?? 0,
    profile.weaknesses.vulnCc ?? 0,
  ) / 3;
  const lowEconomyValue = Math.max(
    profile.strengths.cc ?? 0,
    profile.strengths.peel ?? 0,
    profile.strengths.disengage ?? 0,
    profile.strengths.waveclear ?? 0,
    profile.strengths.weakside ?? 0,
    profile.strengths.frontline ?? 0,
  ) / 3;
  const laneGate = clamp(1 - behindRisk * (0.95 + 0.1 * dependency + 0.1 * entryRisk), 0.05, 1);
  const utilityFloor = 0.05 + 0.2 * lowEconomyValue;
  const tierCap = {
    SEVERE_COUNTER: 0.1 + 0.1 * lowEconomyValue,
    COUNTERED: 0.35 + 0.1 * lowEconomyValue,
    SLIGHTLY_COUNTERED: 0.7,
  }[matchupTier] ?? 1;
  return clamp(Math.min(Math.max(laneGate, utilityFloor), tierCap), 0.05, 1);
}

function confidenceLabel(values) {
  if (values.includes("LOW")) return "LOW";
  if (values.includes("MEDIUM")) return "MEDIUM";
  return "HIGH";
}

function evaluateCandidate(entry, visibleDraft, options = {}) {
  const { universalBenchmark = false, lane: evaluatedLane = fixture.lane } = options;
  const picked = [...visibleDraft.allies, ...visibleDraft.enemies].filter(Boolean).some((pick) => pick.name === entry.champion);
  if (picked) return { champion: entry.champion, status: "UNAVAILABLE", reason: "Campeão já visível no draft." };
  const enemyLaner = visibleDraft.enemyByRole[evaluatedLane];
  const allyJungle = visibleDraft.allyByRole.JUNGLE;
  const enemyJungle = visibleDraft.enemyByRole.JUNGLE;
  const builds = buildsFor(entry.champion, { universalBenchmark });
  const results = [];

  for (const build of builds) {
    const lane = laneScore(entry.champion, build, enemyLaner, evaluatedLane);
    if (lane.veto) {
      results.push({
        build: build.name,
        buildId: build.id,
        status: "HARDCOUNTERED",
        reason: lane.rule.reason,
        evidence: lane.statistical ? {
          delta2: round(lane.statistical.delta2),
          statisticalWeight: round(lane.statistical.reliability),
          currentGames: lane.statistical.currentGames,
          stableGames: lane.statistical.stableGames,
          mechanicalLane: round(lane.mechanicalScore ?? 0),
          specificMechanicalLane: round(lane.specificMechanicalScore ?? 0),
        } : null,
      });
      continue;
    }
    const jungle = jungleInteraction(build.profile, allyJungle, enemyJungle);
    const viability = laneViability(entry.champion, evaluatedLane, build.profile);
    // Matchup da lane e interação com junglers são componentes independentes.
    // O jungler nunca dilui nem infla a leitura do confronto direto.
    const laneMatchup = clamp(lane.score + viability.score, -10, 10);
    const enemyComp = enemyCompScore(build.profile, visibleDraft.enemies);
    const allyComp = alliedCompScore(build.profile, visibleDraft.allies, visibleDraft.enemies);
    const retention = executionRetention(build.profile, laneMatchup, lane.tier);
    const adjustedEnemyComp = enemyComp.score > 0 ? enemyComp.score * retention : enemyComp.score;
    const adjustedAllyComp = allyComp.score > 0 ? allyComp.score * retention : allyComp.score;
    const draftRisk = partialDraftRisk(entry.champion, build, evaluatedLane, visibleDraft);
    const population = populationStrength(entry.champion, evaluatedLane);
    const affinity = universalBenchmark ? 0 : poolAffinityScore[entry.pool];
    const comfort = universalBenchmark ? 0 : { 5: 2, 4: 1, 3: 0, 2: -1, 1: -2 }[entry.comfort];
    const score = affinity + comfort +
      scoreWeights.laneMatchup * laneMatchup +
      scoreWeights.jungleInteraction * jungle.score +
      scoreWeights.enemyComp * adjustedEnemyComp +
      scoreWeights.allyComp * adjustedAllyComp +
      scoreWeights.populationStrength * population.score -
      draftRisk.score;
    results.push({
      build: build.name,
      buildId: build.id,
      status: "SCORED",
      score: round(score),
      confidence: confidenceLabel([build.profile.confidence, lane.confidence, population.confidence]),
      matchupTier: lane.tier,
      components: {
        affinity,
        comfort,
        populationStrength: round(population.score),
        laneViability: round(viability.score),
        mechanicalLane: round(lane.mechanicalScore ?? lane.score),
        specificMechanicalLane: round(lane.specificMechanicalScore ?? 0),
        statisticalLane: lane.statistical ? round(lane.statistical.score) : null,
        statisticalWeight: lane.statistical ? round(lane.statistical.reliability) : 0,
        laneMatchup: round(laneMatchup),
        jungleInteraction: round(jungle.score),
        enemyComp: round(adjustedEnemyComp),
        allyComp: round(adjustedAllyComp),
        executionRetention: round(retention),
        partialDraftRisk: round(draftRisk.score),
      },
      archetype: allyComp.archetype,
      reasons: [
        viability.reason,
        ...lane.reasons,
        ...jungle.reasons,
        ...(lane.tier && lane.tier !== "EVEN" ? [`Classificação da matchup: ${lane.tier}.`] : []),
        ...(retention < 0.9 ? [`A lane limita os bônus positivos de composição a ${round(retention * 100)}%.`] : []),
        ...draftRisk.reasons,
        ...enemyComp.reasons,
        ...allyComp.reasons,
      ].slice(0, 11),
    });
  }

  const viable = results.filter((result) => result.status === "SCORED").sort((a, b) => b.score - a.score);
  if (!viable.length) {
    const hardcounter = results.find((result) => result.status === "HARDCOUNTERED");
    return {
      champion: entry.champion,
      pool: entry.pool,
      comfort: entry.comfort,
      status: "HARDCOUNTERED",
      reason: hardcounter?.reason ?? "Hardcountered na lane.",
      evidence: hardcounter?.evidence ?? null,
      builds: universalBenchmark ? undefined : results,
    };
  }
  return {
    champion: entry.champion,
    pool: entry.pool,
    comfort: entry.comfort,
    status: "SCORED",
    ...viable[0],
    builds: universalBenchmark ? undefined : results,
  };
}

function generateDraft(random, index, evaluatedLane, { partial = false } = {}) {
  const used = new Set();
  const allyByRole = {
    TOP: evaluatedLane === "TOP" ? null : takeRandom(rolePools.TOP, random, used),
    JUNGLE: takeRandom(rolePools.JUNGLE, random, used),
    MID: evaluatedLane === "MID" ? null : takeRandom(rolePools.MID, random, used),
    BOTTOM: takeRandom(rolePools.BOTTOM, random, used),
    SUPPORT: takeRandom(rolePools.SUPPORT, random, used),
  };
  const enemyByRole = {
    TOP: takeRandom(rolePools.TOP, random, used),
    JUNGLE: takeRandom(rolePools.JUNGLE, random, used),
    MID: takeRandom(rolePools.MID, random, used),
    BOTTOM: takeRandom(rolePools.BOTTOM, random, used),
    SUPPORT: takeRandom(rolePools.SUPPORT, random, used),
  };

  const full = { allyByRole, enemyByRole };
  const visibleAlly = {};
  const visibleEnemy = {};
  const complete = !partial || index % 3 === 0;
  for (const [role, champion] of Object.entries(allyByRole)) visibleAlly[role] = role === evaluatedLane ? null : (complete || random() > 0.2 ? champion : null);
  for (const [role, champion] of Object.entries(enemyByRole)) visibleEnemy[role] = complete || random() > (role === evaluatedLane ? 0.25 : 0.35) ? champion : null;

  const visible = {
    allyByRole: visibleAlly,
    enemyByRole: visibleEnemy,
    allies: Object.values(visibleAlly).filter(Boolean),
    enemies: Object.values(visibleEnemy).filter(Boolean),
  };
  return {
    candidateSlot: evaluatedLane,
    teamModel: "4_FIXED_ALLIES_PLUS_CANDIDATE_VS_5_ENEMIES",
    full,
    visible,
  };
}

const cliArgs = process.argv.slice(2);
const universalBenchmark = cliArgs.includes("--universal");
const partialDraftSimulation = cliArgs.includes("--partial");
const fullRankingOutput = cliArgs.includes("--full-ranking");
const laneArgIndex = cliArgs.indexOf("--lane");
const evaluatedLane = laneArgIndex >= 0 ? String(cliArgs[laneArgIndex + 1] ?? "").toUpperCase() : fixture.lane;
if (!["MID", "TOP"].includes(evaluatedLane)) throw new Error("--lane aceita apenas MID ou TOP");
const seed = Number(cliArgs.find((arg) => /^\d+$/.test(arg)) ?? 20260817);
const random = seededRandom(seed);
const simulations = [];
const evaluationEntries = universalBenchmark
  ? champions.map((champion) => ({ champion: champion.name, lane: evaluatedLane, pool: null, comfort: null }))
  : fixture.entries.filter((entry) => fixture.enabledPools.includes(entry.pool));

for (let index = 0; index < 10; index += 1) {
  const draft = generateDraft(random, index, evaluatedLane, { partial: partialDraftSimulation });
  const ranking = evaluationEntries
    .map((entry) => evaluateCandidate(entry, draft.visible, { universalBenchmark, lane: evaluatedLane }))
    .sort((a, b) => {
      if (a.status === "SCORED" && b.status !== "SCORED") return -1;
      if (a.status !== "SCORED" && b.status === "SCORED") return 1;
      return (b.score ?? -999) - (a.score ?? -999);
    });
  simulations.push({ id: index + 1, draft, ranking });
}

const malphite = championByName.get("Malphite");
const cassiopeia = championByName.get("Cassiopeia");
const sylas = championByName.get("Sylas");
const ireliaDefault = buildsFor("Irelia")[0];
const malphiteDefault = buildsFor("Malphite")[0];
const melDefault = buildsFor("Mel")[0];
const melVsCassiopeia = laneScore("Mel", melDefault, cassiopeia, "MID");
const tahmBuilds = buildsFor("Tahm Kench");
const riskCandidate = evaluatedLane === "TOP" ? "Aatrox" : "Irelia";
const riskBuild = buildsFor(riskCandidate)[0];
const fullEnemyDraft = simulations[0].draft.visible;
const laneUnknownByRole = { ...fullEnemyDraft.enemyByRole, [evaluatedLane]: null };
const laneUnknownDraft = {
  ...fullEnemyDraft,
  enemyByRole: laneUnknownByRole,
  enemies: Object.values(laneUnknownByRole).filter(Boolean),
};
const nonLaneUnknownByRole = Object.fromEntries(Object.entries(fullEnemyDraft.enemyByRole)
  .map(([role, champion]) => [role, role === evaluatedLane ? champion : null]));
const nonLaneUnknownDraft = {
  ...fullEnemyDraft,
  enemyByRole: nonLaneUnknownByRole,
  enemies: Object.values(nonLaneUnknownByRole).filter(Boolean),
};
const ownLaneRisk = partialDraftRisk(riskCandidate, riskBuild, evaluatedLane, laneUnknownDraft);
const fourOtherUnknownRisk = partialDraftRisk(riskCandidate, riskBuild, evaluatedLane, nonLaneUnknownDraft);
const alteredSafeBlindBuild = { ...riskBuild, profile: { ...riskBuild.profile, safeBlind: riskBuild.profile.safeBlind === 3 ? 0 : 3 } };
const alteredSafeBlindRisk = partialDraftRisk(riskCandidate, alteredSafeBlindBuild, evaluatedLane, laneUnknownDraft);
const noApplicabilityProfile = candidateProfile({ strengths: [["teamfight", 3], ["split", 3]], weaknesses: [], safeBlind: 3 });
const irrelevantExtraProfile = candidateProfile({ strengths: [["teamfight", 3], ["split", 3], ["roam", 3]], weaknesses: [], safeBlind: 3 });
const knownEnemyFixture = [championByName.get("Lux")];
const alliedFixture = [championByName.get("Jinx"), championByName.get("Ornn")];
const criticalNeedsBaseline = alliedCompScore(noApplicabilityProfile, alliedFixture, knownEnemyFixture);
const criticalNeedsWithIrrelevantTag = alliedCompScore(irrelevantExtraProfile, alliedFixture, knownEnemyFixture);
const cassiopeiaRegressionAllyByRole = {
  TOP: championByName.get("Yone"), JUNGLE: championByName.get("Warwick"), MID: null,
  BOTTOM: championByName.get("Zeri"), SUPPORT: championByName.get("Leona"),
};
const cassiopeiaRegressionEnemyByRole = {
  TOP: championByName.get("Tahm Kench"), JUNGLE: championByName.get("Vi"), MID: cassiopeia,
  BOTTOM: championByName.get("Jinx"), SUPPORT: championByName.get("Nautilus"),
};
const cassiopeiaRegressionDraft = {
  allyByRole: cassiopeiaRegressionAllyByRole,
  enemyByRole: cassiopeiaRegressionEnemyByRole,
  allies: Object.values(cassiopeiaRegressionAllyByRole).filter(Boolean),
  enemies: Object.values(cassiopeiaRegressionEnemyByRole).filter(Boolean),
};
const melFullDraftRegression = evaluateCandidate(
  { champion: "Mel", pool: null, comfort: null },
  cassiopeiaRegressionDraft,
  { universalBenchmark: true, lane: "MID" },
);
const selfChecks = [
  {
    rule: "Benchmark principal avalia quatro aliados fixos + candidato contra cinco inimigos visíveis",
    passed: partialDraftSimulation || simulations.every((simulation) =>
      Object.values(simulation.draft.visible.allyByRole).filter(Boolean).length === 4 &&
      Object.values(simulation.draft.visible.enemyByRole).filter(Boolean).length === 5 &&
      simulation.draft.candidateSlot === evaluatedLane),
  },
  {
    rule: "Matchup da lane possui peso próprio e sempre superior ao jungler",
    passed: scoreWeights.laneMatchup > scoreWeights.jungleInteraction,
    values: { laneMatchup: scoreWeights.laneMatchup, jungleInteraction: scoreWeights.jungleInteraction },
  },
  {
    rule: "Hardcounter confirmado na lane não recebe nota",
    passed: laneScore("Irelia", ireliaDefault, malphite).veto === true,
  },
  {
    rule: "Interação específica de ultimate pode vetar apesar das tags genéricas",
    passed: laneScore("Malphite", malphiteDefault, sylas, "MID").veto === true,
  },
  {
    rule: "Texto 'anti-dash' não cria uma falsa tag de mobilidade",
    passed: ["Cassiopeia", "Poppy", "Taliyah", "Vex"].every((name) =>
      (championByName.get(name).profile.strengths.mobility ?? 0) === 0),
  },
  {
    rule: "Grounding exige o estado real da skill, não a palavra 'ground'",
    passed: ["Cassiopeia", "Singed"].every((name) =>
      (championByName.get(name).profile.mechanics.strengths.grounding ?? 0) > 0) &&
      ["Aatrox", "Olaf", "Taliyah"].every((name) =>
        (championByName.get(name).profile.mechanics.strengths.grounding ?? 0) === 0),
  },
  {
    rule: "Cassiopeia contra Mel nunca vira recomendação favorável por composição",
    passed: melVsCassiopeia.veto === true && melFullDraftRegression.status === "HARDCOUNTERED",
    values: {
      veto: melVsCassiopeia.veto ?? false,
      fullDraftStatus: melFullDraftRegression.status,
      tier: melVsCassiopeia.tier ?? "HARDCOUNTERED",
      score: round(melVsCassiopeia.score ?? -10),
      delta2: round(melVsCassiopeia.statistical?.delta2 ?? 0),
    },
  },
  {
    rule: "Veto pode ser específico da build",
    passed: laneScore("Tahm Kench", tahmBuilds.find((build) => build.id === "tank-default"), cassiopeia).veto === true &&
      laneScore("Tahm Kench", tahmBuilds.find((build) => build.id === "ap-bruiser-tech"), cassiopeia).veto !== true,
  },
  {
    rule: "Lane oculta pesa mais que quatro slots desconhecidos fora dela",
    passed: ownLaneRisk.score > fourOtherUnknownRisk.score,
    values: { ownLaneRisk: round(ownLaneRisk.score), fourOtherUnknownRisk: round(fourOtherUnknownRisk.score) },
  },
  {
    rule: "Draft inimigo completo não gera bônus nem risco de picks ocultos",
    passed: partialDraftRisk(riskCandidate, riskBuild, evaluatedLane, fullEnemyDraft).score === 0,
  },
  {
    rule: "Tag abstrata de blind não altera o risco condicional",
    passed: round(ownLaneRisk.score) === round(alteredSafeBlindRisk.score),
    values: { original: round(ownLaneRisk.score), alteredSafeBlind: round(alteredSafeBlindRisk.score) },
  },
  {
    rule: "Desvantagem de lane reduz a execução sem criar bônus independente",
    passed: executionRetention(baseProfiles.Irelia, -8, "SEVERE_COUNTER") <= 0.2 && executionRetention(baseProfiles.Irelia, 0) === 1,
    values: { behind: round(executionRetention(baseProfiles.Irelia, -8, "SEVERE_COUNTER")), neutral: executionRetention(baseProfiles.Irelia, 0) },
  },
  {
    rule: "Perfil versátil sem resposta aplicável não ganha nota de composição",
    passed: enemyCompScore(noApplicabilityProfile, knownEnemyFixture).score === 0,
    values: { score: enemyCompScore(noApplicabilityProfile, knownEnemyFixture).score },
  },
  {
    rule: "Adicionar capacidade irrelevante não altera a nota",
    passed: enemyCompScore(noApplicabilityProfile, knownEnemyFixture).score === enemyCompScore(irrelevantExtraProfile, knownEnemyFixture).score &&
      criticalNeedsBaseline.score === criticalNeedsWithIrrelevantTag.score,
    values: { enemyComp: enemyCompScore(noApplicabilityProfile, knownEnemyFixture).score, allyComp: criticalNeedsBaseline.score },
  },
  {
    rule: "Somente as duas necessidades aliadas críticas entram no cálculo",
    passed: criticalNeedsBaseline.criticalNeeds.length <= 2 && criticalNeedsWithIrrelevantTag.criticalNeeds.length <= 2,
    values: { criticalNeeds: criticalNeedsBaseline.criticalNeeds },
  },
  {
    rule: "Todas as entradas habilitadas permanecem na lista",
    passed: simulations.every((simulation) => simulation.ranking.length === evaluationEntries.length),
    values: { expected: evaluationEntries.length },
  },
  {
    rule: "Desabilitar uma categoria a remove da avaliação",
    passed: universalBenchmark || fixture.entries.filter((entry) => ["principal", "secundaria"].includes(entry.pool)).every((entry) => entry.pool !== "laboratorio"),
  },
];

if (universalBenchmark) {
  selfChecks.push(
    {
      rule: "Benchmark avalia os 173 campeões",
      passed: evaluationEntries.length === championRecords.length && simulations.every((simulation) => simulation.ranking.length === championRecords.length),
      values: { candidates: evaluationEntries.length },
    },
    {
      rule: "Benchmark não aplica afinidade nem conforto",
      passed: simulations.every((simulation) => simulation.ranking
        .filter((result) => result.status === "SCORED")
        .every((result) => result.components.affinity === 0 && result.components.comfort === 0)),
    },
    {
      rule: "Benchmark usa somente o perfil/build padrão universal",
      passed: simulations.every((simulation) => simulation.ranking
        .filter((result) => result.status === "SCORED")
        .every((result) => result.buildId === "system-default")),
    },
    {
      rule: "Viabilidade de lane pune suporte sem baseline mais que pick padrão da lane",
      passed: laneViability("Yuumi", evaluatedLane, championByName.get("Yuumi").profile).score <
        laneViability(evaluatedLane === "MID" ? "Ahri" : "Aatrox", evaluatedLane, championByName.get(evaluatedLane === "MID" ? "Ahri" : "Aatrox").profile).score,
      values: {
        yuumi: round(laneViability("Yuumi", evaluatedLane, championByName.get("Yuumi").profile).score),
        baseline: round(laneViability(evaluatedLane === "MID" ? "Ahri" : "Aatrox", evaluatedLane, championByName.get(evaluatedLane === "MID" ? "Ahri" : "Aatrox").profile).score),
      },
    },
  );

  if (evaluatedLane === "TOP") {
    const aatroxVsMalphite = statisticalLaneEvidence("Aatrox", "Malphite", "TOP", "system-default");
    const ziggsProfile = championByName.get("Ziggs").profile;
    selfChecks.push(
      {
        rule: "Matchup TOP com amostra mistura Delta2 e inferência mecânica",
        passed: Boolean(aatroxVsMalphite) && aatroxVsMalphite.directions === 2 &&
          aatroxVsMalphite.reliability > 0 && aatroxVsMalphite.reliability < 1,
        values: aatroxVsMalphite ? {
          games: aatroxVsMalphite.games,
          delta2: aatroxVsMalphite.delta2,
          directions: aatroxVsMalphite.directions,
          statisticalWeight: round(aatroxVsMalphite.reliability),
        } : null,
      },
      {
        rule: "Off-meta TOP sem amostra continua avaliável por lógica",
        passed: laneViability("Ziggs", "TOP", ziggsProfile).score < 0 &&
          statisticalLaneEvidence("Ziggs", "Malphite", "TOP", "system-default") === null &&
          simulations.every((simulation) => simulation.ranking.some((result) => result.champion === "Ziggs")),
        values: { laneViability: round(laneViability("Ziggs", "TOP", ziggsProfile).score) },
      },
    );
  }
  if (evaluatedLane === "MID") {
    const melEvidence = statisticalLaneEvidence("Mel", "Cassiopeia", "MID", "system-default");
    selfChecks.push(
      {
        rule: "Matchup MID usa Diamond+ com prior Emerald+ e duas direções",
        passed: Boolean(melEvidence) && melEvidence.stableDirections === 2 &&
          melEvidence.stableGames >= 250 && melEvidence.reliability > 0.4,
        values: melEvidence ? {
          currentPatchGames: melEvidence.currentGames,
          diamond30dGames: melEvidence.stableGames,
          emeraldPriorGames: melEvidence.fallbackGames,
          delta2: round(melEvidence.delta2),
          statisticalWeight: round(melEvidence.reliability),
        } : null,
      },
      {
        rule: "Sinal estatístico MID distingue matchups em vez de criar empates por tags",
        passed: statisticalLaneEvidence("Mel", "Cassiopeia", "MID", "system-default")?.score !==
          statisticalLaneEvidence("Hwei", "Cassiopeia", "MID", "system-default")?.score,
      },
    );
  }
}

const activeMatchupSnapshots = matchupSnapshots[evaluatedLane];
// O cálculo e os testes sempre usam todos os candidatos. O artefato de
// validação salva só o top 10 por padrão para permanecer revisável no GitHub;
// --full-ranking preserva a lista completa quando ela for necessária.
const serializedSimulations = simulations.map((simulation) => ({
  ...simulation,
  ranking: fullRankingOutput ? simulation.ranking : simulation.ranking.slice(0, 10),
}));
const output = {
  metadata: {
    seed,
    patch: "26.16",
    tier: "Diamond+",
    lane: evaluatedLane,
    mode: universalBenchmark ? "UNIVERSAL_BENCHMARK" : "POOL_FIXTURE",
    candidates: evaluationEntries.length,
    personalAffinityEnabled: !universalBenchmark,
    customBuildsEnabled: !universalBenchmark,
    profileSource: universalBenchmark ? "UNIFORM_HEURISTIC_CATALOG" : "POOL_MANUAL_PLUS_HEURISTIC_OPPONENTS",
    draftVisibility: partialDraftSimulation ? "PARTIAL_STRESS_TEST" : "FULL_5V5",
    teamModel: "4_FIXED_ALLIES_PLUS_CANDIDATE_VS_5_ENEMIES",
    rankingOutput: fullRankingOutput ? "FULL" : "TOP_10_FROM_FULL_EVALUATION",
    scoreWeights,
    statisticalLayer: activeMatchupSnapshots?.current || activeMatchupSnapshots?.stable ? {
      source: "LoLalytics",
      patch: activeMatchupSnapshots.current?.metadata.gamePatch ?? activeMatchupSnapshots.stable.metadata.gamePatch,
      primaryTier: activeMatchupSnapshots.current?.metadata.tier ?? activeMatchupSnapshots.stable.metadata.tier,
      currentWindow: activeMatchupSnapshots.current?.metadata.window ?? null,
      stableWindow: activeMatchupSnapshots.stable?.metadata.window ?? null,
      fallbackTier: activeMatchupSnapshots.fallback?.metadata.tier ?? null,
      signal: activeMatchupSnapshots.current?.metadata.signal ?? activeMatchupSnapshots.stable.metadata.signal,
      currentDiamondShrinkageGames: 350,
      stableDiamondShrinkageGames: 500,
      emeraldPriorShrinkageGames: 1_200,
    } : null,
    partialDraftRisk: "ROLE_CONDITIONAL_LOWER_TAIL",
    warning: "Protótipo híbrido v0.8. Matchup da lane domina a nota, usa Diamond+ com prior Emerald+ e bloqueia composição de resgatar counters severos. A nota é comparativa, não win rate.",
  },
  selfChecks,
  simulations: serializedSimulations,
};

console.log(JSON.stringify(output, null, 2));
