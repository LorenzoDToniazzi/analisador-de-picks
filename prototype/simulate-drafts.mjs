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
const research = fs.readFileSync(firstExisting(
  path.join(root, "docs", "analise-pool-mid-26.16.md"),
  path.join(root, "analise-draft-pool-mid-26.16.md"),
), "utf8");

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

function buildsFor(champion) {
  const definitions = buildDefinitions[champion] ?? [{ id: "default", name: "Padrão", capabilityDelta: {}, vulnerabilityDelta: {} }];
  return definitions.map((build) => ({
    ...build,
    profile: {
      ...baseProfiles[champion],
      strengths: mergeMap(baseProfiles[champion].strengths, build.capabilityDelta),
      weaknesses: mergeMap(baseProfiles[champion].weaknesses, build.vulnerabilityDelta),
    },
  }));
}

const matchupRules = [
  { candidate: "Irelia", opponent: "Malphite", severity: "HARDCOUNTERED_LANE", confidence: "HIGH", reason: "Armadura, redução de velocidade de ataque e execução muito mais simples." },
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
  engage: /engage|iniciacao|iniciação/,
  followUp: /follow-up|follow up/,
  pick: /\bpick\b|catcher|captura/,
  flank: /flanco|ameaca lateral|ameaça lateral/,
  backlineAccess: /backline|\bdive\b/,
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

function inferProfile(champion) {
  if (!champion) return candidateProfile({ strengths: [], weaknesses: [], safeBlind: 1.5, confidence: "LOW" });
  const entry = catalog.get(normalize(champion.name));
  const strengthsText = foldText(`${entry?.identity ?? ""} ${entry?.delivery ?? ""} ${entry?.seeks ?? ""}`);
  const weaknessesText = foldText(entry?.risks ?? "");
  const strengths = {};
  const weaknesses = {};

  for (const [tag, pattern] of Object.entries(strengthPatterns)) {
    if (pattern.test(strengthsText)) strengths[tag] = 2;
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

  return { strengths, weaknesses, safeBlind: strengths.waveclear || strengths.weakside || strengths.mobility ? 2 : 1.3, confidence: "MEDIUM" };
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

const offensePairs = [
  ["burst", "vulnBurst"], ["dps", "vulnDps"], ["antiTank", "vulnTank"],
  ["poke", "vulnPoke"], ["poke", "vulnRange"], ["engage", "vulnEngage"],
  ["pick", "vulnCc"], ["cc", "vulnCc"], ["zone", "needsContact"],
  ["disengage", "needsContact"], ["disengage", "vulnDisengage"],
  ["peel", "fragileEntry"], ["antiDive", "fragileEntry"],
  ["mobility", "vulnKite"], ["frontline", "vulnTank"],
  ["waveclear", "vulnWave"], ["earlyPressure", "goldDependent"],
  ["sustain", "vulnPoke"],
];

function directionalPressure(attacker, defender) {
  const contributions = [];
  for (const [strength, weakness] of offensePairs) {
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
  contributions.sort((a, b) => b.value - a.value);
  const weights = [1, 0.55, 0.3, 0.15, 0.08];
  const total = contributions.reduce((sum, item, index) => sum + item.value * (weights[index] ?? 0.04), 0);
  return { total, contributions };
}

function explicitRule(candidate, buildId, opponent) {
  return matchupRules.find((rule) => rule.candidate === candidate && rule.opponent === opponent && (!rule.buildIds || rule.buildIds.includes(buildId)));
}

function laneScore(candidate, build, enemyMid) {
  if (!enemyMid) return { score: 0, confidence: "LOW", reasons: ["Laner inimigo ainda desconhecido."] };
  const rule = explicitRule(candidate, build.id, enemyMid.name);
  if (rule?.severity === "HARDCOUNTERED_LANE") return { veto: true, rule };

  const candidatePressure = directionalPressure(build.profile, enemyMid.profile);
  const enemyPressure = directionalPressure(enemyMid.profile, build.profile);
  // A lane direta é o bloco mais importante do produto. Sem esta expansão,
  // perfis versáteis vencem por composição mesmo quando outro candidato possui
  // uma vantagem mecânica clara no 1x1.
  let score = clamp((candidatePressure.total - enemyPressure.total) * 2.2, -8, 8);
  const reasons = [];

  if (rule) {
    const ruleValue = severityScore[rule.severity];
    score = clamp(score * 0.35 + ruleValue * 0.65, -10, 10);
    reasons.push(rule.reason);
  }

  const bestPositive = candidatePressure.contributions.sort((a, b) => b.value - a.value)[0];
  const bestNegative = enemyPressure.contributions.sort((a, b) => b.value - a.value)[0];
  if (bestPositive) reasons.push(`Favorável: ${bestPositive.label}.`);
  if (bestNegative) reasons.push(`Risco: ${bestNegative.label}.`);

  return { score, confidence: rule?.confidence ?? "LOW", reasons };
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
    const catchRisk = ((enemyJungle.profile.strengths.cc ?? 0) + (enemyJungle.profile.strengths.engage ?? 0) + (enemyJungle.profile.strengths.burst ?? 0)) *
      ((candidateProfileValue.weaknesses.vulnGank ?? 0) + (candidateProfileValue.weaknesses.immobile ?? 0) + (candidateProfileValue.weaknesses.fragileEntry ?? 0)) / 18;
    const defense = ((candidateProfileValue.strengths.mobility ?? 0) + (candidateProfileValue.strengths.antiDive ?? 0) + (candidateProfileValue.strengths.defenses ?? 0)) / 6;
    score -= catchRisk;
    score += defense;
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

function enemyCompScore(candidate, enemies) {
  const aggregate = aggregateProfiles(enemies);
  if (!aggregate.size) return { score: 0, reasons: ["Composição inimiga ainda desconhecida."] };
  const st = aggregate.strengths;
  const wk = aggregate.weaknesses;
  const cs = candidate.strengths;
  const cw = candidate.weaknesses;
  const positives = [];
  const negatives = [];
  const add = (list, label, value) => { if (value > 0.35) list.push({ label, value }); };

  add(positives, "anti-CC contra controle inimigo", (cs.antiCc ?? 0) * (st.cc ?? 0) / 6);
  add(positives, "anti-dive/peel contra entradas", ((cs.antiDive ?? 0) + (cs.peel ?? 0) + (cs.disengage ?? 0)) * ((st.engage ?? 0) + (st.backlineAccess ?? 0)) / 18);
  add(positives, "DPS/anti-tank contra frontline", ((cs.dps ?? 0) + (cs.antiTank ?? 0)) * (st.frontline ?? 0) / 9);
  add(positives, "poke/pick contra alvos expostos", ((cs.poke ?? 0) + (cs.pick ?? 0)) * ((wk.vulnRange ?? 0) + (wk.immobile ?? 0) + (wk.vulnCc ?? 0)) / 22);
  add(positives, "zona e área contra contato/agrupamento", ((cs.zone ?? 0) + (cs.aoe ?? 0)) * ((wk.needsContact ?? 0) + (st.frontline ?? 0)) / 18);
  add(positives, "anti-auto contra DPS físico", (cs.antiAuto ?? 0) * ((st.dps ?? 0) + (st.physicalDamage ?? 0)) / 12);

  add(negatives, "poke/range inimigo dificulta execução", ((st.poke ?? 0) + (st.siege ?? 0)) * ((cw.vulnPoke ?? 0) + (cw.vulnRange ?? 0) + (cw.immobile ?? 0)) / 20);
  add(negatives, "engage/dive pune o perfil", ((st.engage ?? 0) + (st.backlineAccess ?? 0)) * ((cw.vulnEngage ?? 0) + (cw.fragileEntry ?? 0)) / 14);
  add(negatives, "controle inimigo interrompe a entrada", (st.cc ?? 0) * ((cw.vulnCc ?? 0) + (cw.fragileEntry ?? 0)) / 12);
  add(negatives, "kite/disengage nega contato", ((st.disengage ?? 0) + (st.peel ?? 0) + (st.mobility ?? 0)) * ((cw.vulnKite ?? 0) + (cw.vulnDisengage ?? 0) + (cw.needsContact ?? 0)) / 24);
  add(negatives, "frontline nega burst", (st.frontline ?? 0) * ((cw.vulnTank ?? 0) + (cs.burst ?? 0)) / 14);

  const positive = positives.reduce((sum, item) => sum + item.value, 0);
  const negative = negatives.reduce((sum, item) => sum + item.value, 0);
  const reasons = [
    ...positives.sort((a, b) => b.value - a.value).slice(0, 2).map((item) => `Favorável: ${item.label}.`),
    ...negatives.sort((a, b) => b.value - a.value).slice(0, 2).map((item) => `Risco: ${item.label}.`),
  ];
  return { score: clamp((positive - negative) * 1.6, -10, 10), reasons };
}

function alliedCompScore(candidate, allies) {
  const aggregate = aggregateProfiles(allies);
  if (!aggregate.size) return { score: 0, archetype: "desconhecido", reasons: ["Composição aliada ainda desconhecida."] };
  const st = aggregate.strengths;
  const archetypeScores = {
    poke: (st.poke ?? 0) + (st.siege ?? 0) + (st.waveclear ?? 0) * 0.5,
    dive: (st.engage ?? 0) + (st.backlineAccess ?? 0) + (st.followUp ?? 0),
    frontToBack: (st.frontline ?? 0) + (st.dps ?? 0) + (st.peel ?? 0),
    pick: (st.pick ?? 0) + (st.burst ?? 0) + (st.cc ?? 0) * 0.5,
    split: (st.split ?? 0) + (st.roam ?? 0) * 0.5,
    scalingControl: (st.scaling ?? 0) + (st.zone ?? 0) + (st.waveclear ?? 0),
  };
  const archetype = Object.entries(archetypeScores).sort((a, b) => b[1] - a[1])[0][0];
  const desired = {
    poke: ["disengage", "peel", "waveclear", "siege"],
    dive: ["engage", "followUp", "backlineAccess", "burst"],
    frontToBack: ["frontline", "dps", "peel", "antiDive"],
    pick: ["pick", "burst", "cc", "roam"],
    split: ["split", "waveclear", "disengage", "roam"],
    scalingControl: ["waveclear", "zone", "frontline", "scaling"],
  }[archetype];
  const contributions = desired.map((tag) => {
    const coverage = st[tag] ?? 0;
    const need = clamp(4 - coverage, 0, 4);
    return { label: S[tag], value: need * (candidate.strengths[tag] ?? 0) / 3 };
  });

  const alliedPhysical = st.physicalDamage ?? 0;
  const alliedMagic = st.magicDamage ?? 0;
  if (alliedPhysical >= alliedMagic + 4) contributions.push({ label: "corrige excesso de dano físico", value: (candidate.strengths.magicDamage ?? 0) * 1.2 });
  if (alliedMagic >= alliedPhysical + 4) contributions.push({ label: "corrige excesso de dano mágico", value: (candidate.strengths.physicalDamage ?? 0) * 1.2 });

  const ordered = contributions.sort((a, b) => b.value - a.value);
  const diminishingWeights = [1, 0.6, 0.25, 0.15, 0.1];
  const weightedContribution = ordered.reduce((sum, item, index) => sum + item.value * (diminishingWeights[index] ?? 0.05), 0);
  const score = clamp(weightedContribution * 1.25 - 1.5, -10, 10);
  const reasons = ordered.filter((item) => item.value > 0.5).slice(0, 3).map((item) => `Contribui com ${item.label}.`);
  return { score, archetype, reasons };
}

function blindPenalty(profile, enemyMidKnown, unknownEnemySlots) {
  const laneBlind = enemyMidKnown ? 0 : (3 - profile.safeBlind) * 8 / 3;
  const rest = unknownEnemySlots * (3 - profile.safeBlind) * 0.5;
  return clamp(laneBlind + rest, 0, 12);
}

function confidenceLabel(values) {
  if (values.includes("LOW")) return "LOW";
  if (values.includes("MEDIUM")) return "MEDIUM";
  return "HIGH";
}

function evaluateCandidate(entry, visibleDraft) {
  const picked = [...visibleDraft.allies, ...visibleDraft.enemies].filter(Boolean).some((pick) => pick.name === entry.champion);
  if (picked) return { champion: entry.champion, status: "UNAVAILABLE", reason: "Campeão já visível no draft." };
  const enemyMid = visibleDraft.enemyByRole.MID;
  const allyJungle = visibleDraft.allyByRole.JUNGLE;
  const enemyJungle = visibleDraft.enemyByRole.JUNGLE;
  const builds = buildsFor(entry.champion);
  const results = [];

  for (const build of builds) {
    const lane = laneScore(entry.champion, build, enemyMid);
    if (lane.veto) {
      results.push({ build: build.name, buildId: build.id, status: "HARDCOUNTERED", reason: lane.rule.reason });
      continue;
    }
    const jungle = jungleInteraction(build.profile, allyJungle, enemyJungle);
    const matchup = clamp(lane.score * 0.7 + jungle.score * 0.3, -10, 10);
    const enemyComp = enemyCompScore(build.profile, visibleDraft.enemies);
    const allyComp = alliedCompScore(build.profile, visibleDraft.allies);
    const unknownEnemySlots = Object.values(visibleDraft.enemyByRole).filter((value) => !value).length;
    const blind = blindPenalty(build.profile, Boolean(enemyMid), unknownEnemySlots);
    const affinity = { principal: 30, secundaria: 25, laboratorio: 15 }[entry.pool];
    const comfort = { 5: 2, 4: 1, 3: 0, 2: -1, 1: -2 }[entry.comfort];
    const score = affinity + comfort + 2 * matchup + 1.5 * enemyComp.score + allyComp.score - blind;
    results.push({
      build: build.name,
      buildId: build.id,
      status: "SCORED",
      score: round(score),
      confidence: confidenceLabel([build.profile.confidence, lane.confidence]),
      components: { affinity, comfort, matchup: round(matchup), enemyComp: round(enemyComp.score), allyComp: round(allyComp.score), blind: round(blind) },
      archetype: allyComp.archetype,
      reasons: [...lane.reasons, ...jungle.reasons, ...enemyComp.reasons, ...allyComp.reasons].slice(0, 8),
    });
  }

  const viable = results.filter((result) => result.status === "SCORED").sort((a, b) => b.score - a.score);
  if (!viable.length) {
    return { champion: entry.champion, pool: entry.pool, comfort: entry.comfort, status: "HARDCOUNTERED", builds: results };
  }
  return { champion: entry.champion, pool: entry.pool, comfort: entry.comfort, status: "SCORED", ...viable[0], builds: results };
}

function generateDraft(random, index) {
  const used = new Set();
  const allyByRole = {
    TOP: takeRandom(rolePools.TOP, random, used),
    JUNGLE: takeRandom(rolePools.JUNGLE, random, used),
    MID: null,
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
  const complete = index % 3 === 0;
  for (const [role, champion] of Object.entries(allyByRole)) visibleAlly[role] = role === "MID" ? null : (complete || random() > 0.2 ? champion : null);
  for (const [role, champion] of Object.entries(enemyByRole)) visibleEnemy[role] = complete || random() > (role === "MID" ? 0.25 : 0.35) ? champion : null;

  const visible = {
    allyByRole: visibleAlly,
    enemyByRole: visibleEnemy,
    allies: Object.values(visibleAlly).filter(Boolean),
    enemies: Object.values(visibleEnemy).filter(Boolean),
  };
  return { full, visible };
}

const seed = Number(process.argv[2] ?? 20260817);
const random = seededRandom(seed);
const simulations = [];

for (let index = 0; index < 10; index += 1) {
  const draft = generateDraft(random, index);
  const ranking = fixture.entries
    .filter((entry) => fixture.enabledPools.includes(entry.pool))
    .map((entry) => evaluateCandidate(entry, draft.visible))
    .sort((a, b) => {
      if (a.status === "SCORED" && b.status !== "SCORED") return -1;
      if (a.status !== "SCORED" && b.status === "SCORED") return 1;
      return (b.score ?? -999) - (a.score ?? -999);
    });
  simulations.push({ id: index + 1, draft, ranking });
}

const malphite = championByName.get("Malphite");
const cassiopeia = championByName.get("Cassiopeia");
const ireliaDefault = buildsFor("Irelia")[0];
const tahmBuilds = buildsFor("Tahm Kench");
const ownLaneBlind = blindPenalty(baseProfiles.Irelia, false, 0);
const fourOtherUnknowns = blindPenalty(baseProfiles.Irelia, true, 4);
const selfChecks = [
  {
    rule: "Hardcounter confirmado na lane não recebe nota",
    passed: laneScore("Irelia", ireliaDefault, malphite).veto === true,
  },
  {
    rule: "Veto pode ser específico da build",
    passed: laneScore("Tahm Kench", tahmBuilds.find((build) => build.id === "tank-default"), cassiopeia).veto === true &&
      laneScore("Tahm Kench", tahmBuilds.find((build) => build.id === "ap-bruiser-tech"), cassiopeia).veto !== true,
  },
  {
    rule: "Blind da própria lane pesa mais que quatro slots desconhecidos fora dela",
    passed: ownLaneBlind > fourOtherUnknowns,
    values: { ownLaneBlind: round(ownLaneBlind), fourOtherUnknowns: round(fourOtherUnknowns) },
  },
  {
    rule: "Todas as entradas habilitadas permanecem na lista",
    passed: simulations.every((simulation) => simulation.ranking.length === fixture.entries.length),
    values: { expected: fixture.entries.length },
  },
  {
    rule: "Desabilitar uma categoria a remove da avaliação",
    passed: fixture.entries.filter((entry) => ["principal", "secundaria"].includes(entry.pool)).every((entry) => entry.pool !== "laboratorio"),
  },
];

const output = {
  metadata: {
    seed,
    patch: "26.16",
    tier: "Diamond+",
    lane: fixture.lane,
    poolFixtureOnly: true,
    warning: "Protótipo heurístico v0.3. Não representa o motor final calibrado nem win rate.",
  },
  selfChecks,
  simulations,
};

console.log(JSON.stringify(output, null, 2));
