import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const catalogPath = path.join(root, "app", "data", "champions.json");
const officialPath = path.join(root, "data", "championFull-16.16.1.json");
const fallbackOfficialPath = path.join(root, "championFull-16.16.1.json");

export const STRENGTH_TAGS = [
  "physicalDamage", "magicDamage", "mixedDamage", "burst", "dps", "poke", "shortTrade", "longTrade",
  "allIn", "aoe", "antiTank", "engage", "followUp", "pick", "gankSetup", "flank", "dive", "backlineAccess", "gapClose", "stickiness",
  "mobility", "escape", "effectiveRange", "antiDive", "frontline", "hp", "defenses", "sustain", "selfPeel",
  "peel", "disengage", "zone", "cc", "waveclear", "priority", "weakside", "roam", "siege", "split",
  "teamfight", "scaling", "earlyPressure", "antiCc", "antiAuto",
];

export const WEAKNESS_TAGS = [
  "lowDurability", "vulnDive", "vulnPoke", "vulnEngage", "vulnKite", "vulnCc", "vulnBurst", "vulnDps",
  "vulnTank", "vulnRange", "vulnWave", "vulnGank", "vulnDisengage", "needsContact", "needsFlank",
  "needsSetup", "needsLongFight", "fragileEntry", "ultDependent", "resourceDependent", "goldDependent",
  "immobile", "conditionalMobility",
];

const clamp = (value, min = 0, max = 10) => Math.max(min, Math.min(max, value));
const round = (value) => Math.round(value * 2) / 2;
const zeroMap = (tags) => Object.fromEntries(tags.map((tag) => [tag, 0]));
const count = (text, pattern) => [...text.matchAll(pattern)].length;
const setMax = (target, key, value) => { target[key] = Math.max(target[key] ?? 0, value); };

function textFor(champion) {
  return [champion.passive?.description, ...(champion.spells ?? []).flatMap((spell) => [spell.description, spell.tooltip])]
    .filter(Boolean).join(" ").toLowerCase();
}

function percentileScale(value, values, low = 2, high = 7) {
  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[Math.floor(sorted.length * 0.08)];
  const max = sorted[Math.floor(sorted.length * 0.92)];
  return clamp(low + (clamp(value, min, max) - min) / Math.max(1, max - min) * (high - low));
}

const classDefaults = {
  Tank: { frontline: 9, hp: 8, defenses: 8, cc: 7, engage: 6, selfPeel: 6, peel: 5, teamfight: 7, weakside: 7 },
  Fighter: { dps: 6, longTrade: 7, allIn: 7, hp: 6, defenses: 5, sustain: 4, stickiness: 6, split: 6 },
  Assassin: { burst: 9, allIn: 8, pick: 8, flank: 7, dive: 7, backlineAccess: 8, gapClose: 7, mobility: 7, roam: 6, earlyPressure: 6 },
  Mage: { magicDamage: 8, burst: 6, poke: 5, aoe: 6, zone: 6, waveclear: 6, teamfight: 6 },
  Marksman: { physicalDamage: 9, dps: 9, effectiveRange: 6, siege: 7, scaling: 8, followUp: 5 },
  Support: { peel: 7, cc: 6, followUp: 6, selfPeel: 5, weakside: 6 },
};

// Ajustes de alta confiança para kits em que tags genéricas confundem muito a função real.
const overrides = {
  Jax: {
    strengths: { physicalDamage: 6, magicDamage: 5, mixedDamage: 8, burst: 6, dps: 9, longTrade: 9, allIn: 8, gapClose: 7, stickiness: 7, mobility: 6, escape: 4, effectiveRange: 3, antiDive: 8, hp: 6, defenses: 7, sustain: 4, selfPeel: 8, cc: 6, split: 9, scaling: 9, antiAuto: 10 },
    weaknesses: { lowDurability: 3, vulnDive: 2, vulnPoke: 7, vulnEngage: 3, vulnKite: 8, vulnCc: 6, vulnBurst: 4, vulnRange: 8, vulnWave: 6, vulnGank: 5, vulnDisengage: 8, needsContact: 8, fragileEntry: 4, immobile: 3, conditionalMobility: 7 },
  },
  Jhin: {
    strengths: { physicalDamage: 9, magicDamage: 1, mixedDamage: 1, burst: 8, dps: 4, poke: 7, shortTrade: 7, aoe: 5, followUp: 8, pick: 7, gapClose: 0, stickiness: 1, mobility: 3, escape: 2, effectiveRange: 9, antiDive: 2, hp: 3, defenses: 2, sustain: 1, selfPeel: 3, peel: 3, zone: 5, cc: 5, waveclear: 6, priority: 5, roam: 4, siege: 8, teamfight: 6, scaling: 8 },
    weaknesses: { lowDurability: 9, vulnDive: 9, vulnPoke: 4, vulnEngage: 9, vulnKite: 2, vulnCc: 7, vulnBurst: 8, vulnDps: 7, vulnTank: 8, vulnRange: 3, vulnWave: 5, vulnGank: 8, vulnDisengage: 2, needsSetup: 5, goldDependent: 7, immobile: 8, conditionalMobility: 8 },
  },
  Irelia: {
    strengths: { physicalDamage: 8, magicDamage: 2, mixedDamage: 3, burst: 7, dps: 9, shortTrade: 7, longTrade: 9, allIn: 9, backlineAccess: 9, gapClose: 10, stickiness: 9, mobility: 9, escape: 6, effectiveRange: 4, hp: 6, defenses: 5, sustain: 8, selfPeel: 5, cc: 5, waveclear: 8, priority: 8, split: 8, scaling: 7, earlyPressure: 7 },
    weaknesses: { lowDurability: 4, vulnDive: 3, vulnPoke: 6, vulnEngage: 4, vulnKite: 5, vulnCc: 8, vulnBurst: 5, vulnRange: 7, vulnWave: 3, vulnGank: 6, vulnDisengage: 7, needsContact: 8, fragileEntry: 5, immobile: 1, conditionalMobility: 9 },
  },
  LeBlanc: {
    strengths: { magicDamage: 9, burst: 10, poke: 7, shortTrade: 9, allIn: 8, pick: 9, backlineAccess: 9, gapClose: 9, stickiness: 6, mobility: 10, escape: 10, effectiveRange: 7, selfPeel: 7, cc: 5, roam: 8, earlyPressure: 8 },
    weaknesses: { lowDurability: 8, vulnDive: 3, vulnPoke: 4, vulnEngage: 4, vulnCc: 7, vulnBurst: 7, vulnDps: 8, vulnTank: 9, vulnWave: 8, vulnGank: 3, needsSetup: 4, goldDependent: 7, immobile: 0, conditionalMobility: 2 },
  },
  Zed: {
    strengths: { physicalDamage: 10, magicDamage: 1, burst: 10, poke: 6, shortTrade: 8, allIn: 9, pick: 9, flank: 9, dive: 8, backlineAccess: 10, gapClose: 10, stickiness: 6, mobility: 10, escape: 10, effectiveRange: 6, selfPeel: 6, roam: 8, split: 7, earlyPressure: 7 },
    weaknesses: { lowDurability: 7, vulnDive: 4, vulnCc: 8, vulnBurst: 7, vulnTank: 10, vulnWave: 4, vulnGank: 3, vulnDisengage: 8, needsFlank: 7, goldDependent: 8, immobile: 0, conditionalMobility: 4 },
  },
  Gragas: {
    strengths: { magicDamage: 9, burst: 8, shortTrade: 9, engage: 7, followUp: 9, pick: 7, gapClose: 6, mobility: 6, escape: 5, effectiveRange: 6, antiDive: 10, hp: 7, defenses: 6, sustain: 8, selfPeel: 10, peel: 9, disengage: 10, zone: 7, cc: 10, waveclear: 7, teamfight: 9 },
    weaknesses: { lowDurability: 3, vulnDive: 2, vulnPoke: 4, vulnCc: 4, vulnDps: 7, vulnRange: 5, ultDependent: 5, resourceDependent: 4, immobile: 2, conditionalMobility: 4 },
  },
  Pantheon: {
    strengths: { physicalDamage: 10, burst: 9, shortTrade: 9, allIn: 9, pick: 10, gankSetup: 10, dive: 9, gapClose: 9, stickiness: 8, mobility: 6, escape: 2, effectiveRange: 5, antiDive: 7, hp: 6, defenses: 6, selfPeel: 7, cc: 9, waveclear: 6, priority: 8, roam: 10, earlyPressure: 10 },
    weaknesses: { lowDurability: 4, vulnDive: 3, vulnPoke: 5, vulnKite: 7, vulnCc: 6, vulnTank: 10, vulnRange: 6, vulnDisengage: 8, needsContact: 7, goldDependent: 8, immobile: 3, conditionalMobility: 7 },
  },
  "Tahm Kench": {
    strengths: { magicDamage: 6, burst: 5, shortTrade: 7, allIn: 7, engage: 5, followUp: 8, pick: 7, gapClose: 6, stickiness: 8, mobility: 3, escape: 4, effectiveRange: 5, antiDive: 10, frontline: 10, hp: 10, defenses: 9, sustain: 10, selfPeel: 10, peel: 10, cc: 9, weakside: 9 },
    weaknesses: { lowDurability: 1, vulnDive: 1, vulnPoke: 7, vulnKite: 10, vulnDps: 8, vulnRange: 8, vulnWave: 9, vulnDisengage: 10, needsContact: 9, immobile: 7, conditionalMobility: 8 },
  },
  Olaf: {
    strengths: { physicalDamage: 10, burst: 6, dps: 10, longTrade: 10, allIn: 10, stickiness: 9, mobility: 7, escape: 1, effectiveRange: 3, hp: 7, defenses: 5, sustain: 10, split: 7, earlyPressure: 10, antiCc: 10 },
    weaknesses: { lowDurability: 3, vulnDive: 2, vulnPoke: 8, vulnKite: 10, vulnBurst: 5, vulnRange: 9, vulnDisengage: 10, needsContact: 10, needsLongFight: 7, ultDependent: 8, immobile: 4 },
  },
  Vladimir: {
    strengths: { magicDamage: 10, burst: 8, dps: 7, aoe: 9, mobility: 4, escape: 6, effectiveRange: 6, hp: 7, defenses: 4, sustain: 10, selfPeel: 8, teamfight: 10, scaling: 10 },
    weaknesses: { lowDurability: 4, vulnDive: 4, vulnPoke: 6, vulnRange: 6, vulnWave: 7, vulnDisengage: 6, goldDependent: 10, immobile: 5, conditionalMobility: 5 },
  },
  Diana: {
    strengths: { magicDamage: 10, burst: 9, dps: 7, allIn: 10, aoe: 10, engage: 8, followUp: 9, backlineAccess: 9, gapClose: 10, stickiness: 8, mobility: 8, escape: 2, effectiveRange: 5, hp: 6, defenses: 6, selfPeel: 7, teamfight: 8 },
    weaknesses: { lowDurability: 4, vulnDive: 2, vulnCc: 8, vulnBurst: 5, vulnDisengage: 9, needsContact: 9, fragileEntry: 8, immobile: 2, conditionalMobility: 7 },
  },
  Akali: {
    strengths: { magicDamage: 10, burst: 9, allIn: 9, flank: 9, dive: 9, backlineAccess: 10, gapClose: 10, stickiness: 8, mobility: 10, escape: 9, effectiveRange: 5, selfPeel: 9, split: 6 },
    weaknesses: { lowDurability: 6, vulnDive: 3, vulnCc: 9, vulnBurst: 6, vulnTank: 10, vulnWave: 7, vulnDisengage: 8, needsFlank: 7, goldDependent: 8, immobile: 0, conditionalMobility: 4 },
  },
  Gangplank: {
    strengths: { physicalDamage: 10, magicDamage: 2, burst: 9, poke: 8, aoe: 10, effectiveRange: 9, hp: 5, defenses: 4, sustain: 6, selfPeel: 7, zone: 9, waveclear: 10, split: 8, teamfight: 9, scaling: 10, antiCc: 9 },
    weaknesses: { lowDurability: 6, vulnDive: 6, vulnEngage: 6, vulnBurst: 6, vulnRange: 3, vulnGank: 6, goldDependent: 10, immobile: 7 },
  },
  Xerath: {
    strengths: { magicDamage: 10, burst: 7, poke: 10, effectiveRange: 10, selfPeel: 3, zone: 8, cc: 5, waveclear: 9, siege: 10, teamfight: 7 },
    weaknesses: { lowDurability: 9, vulnDive: 10, vulnEngage: 10, vulnCc: 7, vulnBurst: 9, vulnGank: 10, immobile: 10, conditionalMobility: 0 },
  },
  Cassiopeia: {
    strengths: { magicDamage: 10, dps: 10, poke: 6, longTrade: 10, antiTank: 9, effectiveRange: 7, antiDive: 9, sustain: 7, selfPeel: 8, zone: 10, cc: 7, waveclear: 8, teamfight: 9, scaling: 10 },
    weaknesses: { lowDurability: 6, vulnDive: 5, vulnPoke: 8, vulnBurst: 7, vulnRange: 7, vulnGank: 7, immobile: 7 },
  },
  Anivia: {
    strengths: { magicDamage: 10, dps: 7, aoe: 9, effectiveRange: 8, antiDive: 10, selfPeel: 10, peel: 8, disengage: 9, zone: 10, cc: 10, waveclear: 10, teamfight: 9, scaling: 9 },
    weaknesses: { lowDurability: 7, vulnDive: 6, vulnPoke: 6, vulnBurst: 7, vulnGank: 7, resourceDependent: 9, immobile: 10 },
  },
  Qiyana: {
    strengths: { physicalDamage: 10, burst: 10, allIn: 9, aoe: 8, pick: 9, flank: 10, dive: 8, backlineAccess: 10, gapClose: 10, stickiness: 7, mobility: 10, escape: 8, effectiveRange: 5, selfPeel: 7, cc: 7, roam: 9, teamfight: 8, earlyPressure: 8 },
    weaknesses: { lowDurability: 8, vulnDive: 4, vulnCc: 9, vulnTank: 10, vulnWave: 7, needsFlank: 9, fragileEntry: 8, goldDependent: 8, immobile: 0, conditionalMobility: 5 },
  },
  Aatrox: {
    strengths: { physicalDamage: 10, dps: 7, longTrade: 9, allIn: 8, aoe: 8, gapClose: 6, stickiness: 7, mobility: 6, escape: 5, effectiveRange: 5, hp: 8, defenses: 5, sustain: 10, selfPeel: 6, cc: 7, teamfight: 8 },
    weaknesses: { lowDurability: 3, vulnDive: 2, vulnPoke: 7, vulnKite: 8, vulnCc: 7, vulnBurst: 5, vulnRange: 7, needsContact: 8, needsLongFight: 8, immobile: 3 },
  },
  Yasuo: {
    strengths: { physicalDamage: 10, dps: 10, longTrade: 9, allIn: 9, aoe: 7, followUp: 9, backlineAccess: 8, gapClose: 10, stickiness: 8, mobility: 10, escape: 5, effectiveRange: 4, antiDive: 8, defenses: 5, sustain: 6, selfPeel: 9, cc: 6, waveclear: 9, scaling: 9, antiAuto: 3 },
    weaknesses: { lowDurability: 5, vulnDive: 3, vulnCc: 9, vulnBurst: 6, vulnDisengage: 8, needsSetup: 7, fragileEntry: 7, goldDependent: 8, immobile: 0, conditionalMobility: 10 },
  },
  Elise: {
    strengths: { magicDamage: 9, burst: 9, allIn: 8, pick: 10, gankSetup: 10, dive: 10, gapClose: 8, mobility: 8, escape: 7, effectiveRange: 6, antiDive: 7, selfPeel: 8, cc: 9, roam: 9, earlyPressure: 10 },
    weaknesses: { lowDurability: 7, vulnDive: 4, vulnTank: 9, vulnWave: 8, goldDependent: 9, conditionalMobility: 6 },
  },
  Nidalee: {
    strengths: { magicDamage: 9, physicalDamage: 4, burst: 8, poke: 10, gapClose: 7, mobility: 9, escape: 9, effectiveRange: 10, sustain: 7, selfPeel: 4, siege: 8, roam: 9, earlyPressure: 8 },
    weaknesses: { lowDurability: 9, vulnDive: 7, vulnEngage: 8, vulnCc: 8, vulnBurst: 8, vulnTank: 9, vulnWave: 8, needsSetup: 8, goldDependent: 8, conditionalMobility: 5 },
  },
  Rumble: {
    strengths: { magicDamage: 10, dps: 9, poke: 7, longTrade: 8, aoe: 10, effectiveRange: 7, hp: 6, defenses: 5, selfPeel: 5, zone: 10, waveclear: 9, priority: 9, teamfight: 10, earlyPressure: 9 },
    weaknesses: { lowDurability: 5, vulnDive: 6, vulnPoke: 6, vulnCc: 8, vulnBurst: 6, vulnGank: 8, resourceDependent: 7, immobile: 8 },
  },
  Malphite: {
    strengths: { magicDamage: 7, burst: 7, engage: 10, followUp: 10, pick: 8, dive: 9, backlineAccess: 9, gapClose: 10, mobility: 7, escape: 3, antiDive: 9, frontline: 10, hp: 8, defenses: 10, selfPeel: 8, peel: 7, cc: 10, teamfight: 10, antiAuto: 10 },
    weaknesses: { lowDurability: 1, vulnDive: 1, vulnDps: 7, vulnRange: 7, ultDependent: 10, resourceDependent: 6, immobile: 4 },
  },
};

// Mecânicas discretas não podem ser inferidas com segurança apenas por palavras
// do tooltip. Esta camada pequena e explícita corrige as interações que mais
// alteram matchups, sem transformar o perfil inteiro em uma lista manual.
const pointClickCc = {
  Alistar: 8, Annie: 7, Camille: 9, Fiddlesticks: 10, Karma: 7, Leona: 6, Lissandra: 10, Lulu: 9,
  Malzahar: 10, Maokai: 10, Mordekaiser: 10, Nasus: 7, Nautilus: 10, Nocturne: 7, Pantheon: 10,
  Poppy: 7, Rammus: 9, Renekton: 8, Ryze: 7, Sett: 9, "Tahm Kench": 5, "Twisted Fate": 8,
  Udyr: 8, Vi: 10, Volibear: 8, "Xin Zhao": 5,
};

const projectileReliance = {
  Ahri: 8, Akali: 7, Akshan: 8, Anivia: 8, Annie: 5, Aphelios: 8, Ashe: 9, Aurora: 7,
  Blitzcrank: 10, Brand: 7, Caitlyn: 8, Corki: 8, Draven: 8, Elise: 10, Ezreal: 10, Fizz: 9,
  Gangplank: 4, Gnar: 7, Gragas: 6, Graves: 8, Hwei: 8, Illaoi: 9, Jayce: 8, Jhin: 9, Jinx: 8,
  "Kai'Sa": 7, Kalista: 9, Karma: 7, Kayle: 7, Kennen: 5, Kindred: 7, "Kog'Maw": 8, LeBlanc: 6,
  Leona: 8, Lucian: 8, Lux: 10, Mel: 8, "Miss Fortune": 8, Morgana: 10, "Dr. Mundo": 8, Nautilus: 8,
  Nidalee: 10, Olaf: 8, Orianna: 8, Pantheon: 5, Pyke: 9, Qiyana: 6, Quinn: 7, "Renata Glasc": 9,
  Rumble: 5, Ryze: 8, Samira: 8, Seraphine: 9, Sivir: 9, Smolder: 8, Sona: 5, Soraka: 5,
  Syndra: 6, "Tahm Kench": 8, Taliyah: 7, Teemo: 7, Thresh: 10, Tristana: 8, Twitch: 8,
  Urgot: 6, Varus: 10, Vayne: 7, Veigar: 5, "Vel'Koz": 9, Vex: 8, Xayah: 9, Xerath: 8,
  Yunara: 8, Yuumi: 8, Zed: 8, Zeri: 10, Ziggs: 9, Zilean: 8, Zoe: 10,
};

const ccDependence = {
  Ahri: 8, Annie: 8, Cassiopeia: 7, Elise: 9, Fiddlesticks: 8, Galio: 9, Gragas: 7, Karma: 7,
  Leona: 9, Lissandra: 10, Lux: 9, Malzahar: 10, Maokai: 9, Morgana: 9, Nasus: 7, Nautilus: 9,
  Neeko: 8, Pantheon: 9, Poppy: 7, Rammus: 9, Renekton: 7, Ryze: 7, Skarner: 8,
  "Twisted Fate": 9, Veigar: 8, Vex: 8, Vi: 8, Warwick: 6, Zoe: 9,
};

const singleSpellSetup = {
  Ahri: 8, Blitzcrank: 10, Elise: 10, Fizz: 9, Karma: 7, Leona: 8, Lissandra: 8, Lux: 10,
  Morgana: 10, Nautilus: 8, Neeko: 8, Nidalee: 8, Pantheon: 10, Poppy: 7, Syndra: 6,
  Thresh: 10, "Twisted Fate": 10, Veigar: 7, Zoe: 9,
};

const mechanicOverrides = Object.fromEntries([...new Set([
  ...Object.keys(pointClickCc), ...Object.keys(projectileReliance), ...Object.keys(ccDependence), ...Object.keys(singleSpellSetup),
  "Aatrox", "Kassadin", "Malzahar", "Master Yi", "Milio", "Nidalee", "Ornn", "Skarner", "Soraka", "Viktor", "Warwick",
])].map((name) => [name, { strengths: {}, dependencies: {} }]));
for (const [name, value] of Object.entries(pointClickCc)) mechanicOverrides[name].strengths.pointClickCc = value;
for (const [name, value] of Object.entries(projectileReliance)) mechanicOverrides[name].dependencies.projectileReliant = value;
for (const [name, value] of Object.entries(ccDependence)) mechanicOverrides[name].dependencies.ccDependent = value;
for (const [name, value] of Object.entries(singleSpellSetup)) mechanicOverrides[name].dependencies.singleSpellSetup = value;

// Falsos positivos conhecidos do parser antigo e correções de intensidade.
for (const name of ["Aatrox", "Kassadin", "Nidalee", "Ornn", "Viktor"]) mechanicOverrides[name].dependencies.channelDependent = 0;
for (const name of ["Skarner", "Warwick"]) mechanicOverrides[name].strengths.pointClickCc = 0;
mechanicOverrides.Malzahar.strengths.cleanse = 0;
mechanicOverrides["Master Yi"].strengths.attackEvasion = 5;
mechanicOverrides.Soraka.strengths.grounding = 0;
mechanicOverrides.Soraka.strengths.dashDenial = 5;

function buildProfile(record, official, hpValues, resistValues) {
  const strengths = zeroMap(STRENGTH_TAGS);
  const weaknesses = zeroMap(WEAKNESS_TAGS);
  const legacy = record.profile ?? {};
  for (const [key, value] of Object.entries(legacy.strengths ?? {})) if (key in strengths) strengths[key] = round(value / 3 * 10);
  for (const [key, value] of Object.entries(legacy.weaknesses ?? {})) if (key in weaknesses) weaknesses[key] = round(value / 3 * 10);

  const tags = official.tags ?? record.tags ?? [];
  for (const [key, value] of Object.entries(classDefaults[tags[0]] ?? {})) setMax(strengths, key, value);
  for (const tag of tags.slice(1)) for (const [key, value] of Object.entries(classDefaults[tag] ?? {})) setMax(strengths, key, round(value * .65));
  const primary = tags[0];
  const text = textFor(official);
  const abilityTexts = [official.passive?.description, ...(official.spells ?? []).map((spell) => `${spell.description ?? ""} ${spell.tooltip ?? ""}`)]
    .filter(Boolean).map((value) => value.toLowerCase());
  const abilityCount = (pattern) => abilityTexts.filter((value) => pattern.test(value)).length;
  const physicalMentions = count(text, /<physicaldamage>/g) + (["Marksman", "Fighter", "Assassin"].includes(primary) ? 2 : 0);
  const magicMentions = count(text, /<magicdamage>/g) + (primary === "Mage" ? 2 : 0);
  const trueMentions = count(text, /<truedamage>/g);
  if (physicalMentions + magicMentions + trueMentions) {
    const total = physicalMentions + magicMentions + trueMentions;
    strengths.physicalDamage = round(clamp(physicalMentions / total * 12));
    strengths.magicDamage = round(clamp(magicMentions / total * 12));
    strengths.mixedDamage = round(clamp(Math.min(physicalMentions, magicMentions) / total * 24));
  }

  const hpAt11 = official.stats.hp + official.stats.hpperlevel * 10;
  const resistAt11 = official.stats.armor + official.stats.armorperlevel * 10 + official.stats.spellblock + official.stats.spellblockperlevel * 10;
  const bodyHp = percentileScale(hpAt11, hpValues, 2, 6);
  const bodyDefense = percentileScale(resistAt11, resistValues, 2, 6);
  const riotDefense = official.info?.defense ?? 4;
  const shieldCount = abilityCount(/\bshield(?:s|ed|ing)?\b/);
  const healCount = abilityCount(/\bheal(?:s|ed|ing)?\b|restores?[^.]{0,35}health|health regeneration/);
  const damageReduction = abilityCount(/damage reduction|reduces?[^.]{0,45}damage|immune|invulnerable|untargetable|dodge(?:s)? all/);
  const dashCount = abilityCount(/\bdash(?:es|ed|ing)?\b|\bblink(?:s|ed|ing)?\b|\bleap(?:s|ed|ing)?\b|\blunge(?:s|ed|ing)?\b|\bcharges?\b/);
  const speedCount = abilityCount(/movement speed|move speed|speed bonus/);
  const gapCount = abilityCount(/dash(?:es)? (?:to|toward)|leap(?:s)? (?:to|toward)|blink(?:s)? (?:to|behind)|charges? (?:to|toward|at)|pulls? (?:the target|an enemy)/);
  const escapeCount = abilityCount(/dash(?:es)? (?:in|away|back)|blink(?:s)? (?:in|back)|return to|recast.*return|untargetable|camouflage|stealth/);
  const hardCc = abilityCount(/\bstun(?:s|ned|ning)?\b|\broot(?:s|ed|ing)?\b|knock(?:s|ed|ing)? (?:up|back|aside)|\bcharm(?:s|ed|ing)?\b|\bfear(?:s|ed|ing)?\b|\btaunt(?:s|ed|ing)?\b|\bsuppress(?:es|ed|ing)?\b|\bairborne\b/);
  const slows = abilityCount(/\bslow(?:s|ed|ing)?\b/);
  const percentHealth = abilityCount(/maximum health|max health|missing health|current health/);
  const area = abilityCount(/nearby enemies|all enemies|area|cone|explosion|enemies around|each enemy/);
  const wave = abilityCount(/minions|all enemies|passes through|bounces? to|area/);

  const classHp = primary === "Tank" ? 3 : primary === "Fighter" ? 1.5 : primary === "Support" ? 1 : 0;
  const classDefense = primary === "Tank" ? 3 : primary === "Fighter" ? 1.5 : 0;
  strengths.hp = round(clamp(Math.max(strengths.hp, bodyHp + classHp)));
  strengths.defenses = round(clamp(Math.max(strengths.defenses, bodyDefense * .45 + riotDefense * .45 + classDefense + damageReduction * 1.2 + shieldCount * .45)));
  strengths.sustain = round(clamp(Math.max(strengths.sustain, healCount * 2.2 + (primary === "Fighter" ? 2 : 0))));
  strengths.mobility = round(clamp(Math.max(strengths.mobility, dashCount * 2.2 + speedCount * 1.1 + (official.stats.movespeed - 325) / 8)));
  strengths.gapClose = round(clamp(Math.max(strengths.gapClose, gapCount * 3 + dashCount * .8)));
  strengths.escape = round(clamp(Math.max(strengths.escape, escapeCount * 3 + Math.max(0, dashCount - gapCount) * 1.5 + speedCount * .7)));
  strengths.stickiness = round(clamp(Math.max(strengths.stickiness, gapCount * 1.7 + slows * .9 + hardCc * .8)));
  const attackRange = official.stats.attackrange ?? 125;
  const spellRanges = (official.spells ?? []).flatMap((spell) => spell.range ?? []).filter((value) => Number.isFinite(value) && value > 0 && value < 4000);
  const maxSpellRange = Math.max(0, ...spellRanges);
  strengths.effectiveRange = round(clamp(Math.max(strengths.effectiveRange, (attackRange - 125) / 65 + Math.min(maxSpellRange, 1600) / 500)));
  strengths.cc = round(clamp(Math.max(strengths.cc, hardCc * 2.5 + slows * .55)));
  strengths.selfPeel = round(clamp(Math.max(strengths.selfPeel, hardCc * 1.3 + slows * .5 + shieldCount * .7 + strengths.escape * .45 + damageReduction)));
  strengths.antiDive = round(clamp(Math.max(strengths.antiDive, strengths.selfPeel * .75 + strengths.defenses * .25)));
  strengths.antiTank = round(clamp(Math.max(strengths.antiTank, percentHealth * 2.5)));
  strengths.aoe = round(clamp(Math.max(strengths.aoe, area * 1.3)));
  strengths.waveclear = round(clamp(Math.max(strengths.waveclear, wave * .75 + strengths.aoe * .35)));
  strengths.frontline = round(clamp(Math.max(strengths.frontline, (strengths.hp + strengths.defenses + strengths.sustain) / 3 - (primary === "Marksman" || primary === "Mage" ? 2 : 0))));

  weaknesses.lowDurability = round(clamp(10 - (strengths.hp * .35 + strengths.defenses * .5 + strengths.sustain * .15)));
  weaknesses.immobile = round(clamp(10 - Math.max(strengths.mobility, strengths.escape * .9)));
  weaknesses.vulnDive = round(clamp((weaknesses.lowDurability + weaknesses.immobile + (10 - strengths.selfPeel)) / 3));
  weaknesses.vulnEngage = round(clamp(Math.max(weaknesses.vulnEngage, weaknesses.vulnDive * .9)));
  weaknesses.vulnBurst = round(clamp(Math.max(weaknesses.vulnBurst, weaknesses.lowDurability * .85)));
  weaknesses.vulnGank = round(clamp(Math.max(weaknesses.vulnGank, (weaknesses.immobile + weaknesses.lowDurability) / 2)));
  if (attackRange <= 250) {
    weaknesses.vulnRange = round(clamp(Math.max(weaknesses.vulnRange, 8 - strengths.gapClose * .25)));
    weaknesses.vulnKite = round(clamp(Math.max(weaknesses.vulnKite, 9 - strengths.stickiness * .35)));
    weaknesses.needsContact = round(clamp(Math.max(weaknesses.needsContact, 8)));
  }
  if (dashCount && strengths.escape < 5) weaknesses.conditionalMobility = round(clamp(Math.max(weaknesses.conditionalMobility, 6 + gapCount)));
  if (primary === "Marksman") {
    weaknesses.lowDurability = Math.max(weaknesses.lowDurability, 7);
    weaknesses.vulnDive = Math.max(weaknesses.vulnDive, 7);
    weaknesses.goldDependent = Math.max(weaknesses.goldDependent, 7);
  }

  const patch = overrides[record.name];
  Object.assign(strengths, patch?.strengths ?? {});
  Object.assign(weaknesses, patch?.weaknesses ?? {});
  for (const tag of STRENGTH_TAGS) strengths[tag] = round(clamp(strengths[tag]));
  for (const tag of WEAKNESS_TAGS) weaknesses[tag] = round(clamp(weaknesses[tag]));

  const mechanics = {
    strengths: Object.fromEntries(Object.entries(legacy.mechanics?.strengths ?? {}).map(([key, value]) => [key, round(clamp(value / 3 * 10))])),
    dependencies: Object.fromEntries(Object.entries(legacy.mechanics?.dependencies ?? {}).map(([key, value]) => [key, round(clamp(value / 3 * 10))])),
  };
  const mechanicPatch = mechanicOverrides[record.name];
  for (const side of ["strengths", "dependencies"]) {
    for (const [key, value] of Object.entries(mechanicPatch?.[side] ?? {})) {
      if (value <= 0) delete mechanics[side][key];
      else mechanics[side][key] = round(clamp(value));
    }
  }
  return {
    strengths,
    weaknesses,
    chassis: {
      strengths: { hp: round(Math.min(strengths.hp, bodyHp)), defenses: round(Math.min(strengths.defenses, clamp(bodyDefense * .45 + riotDefense * .45 + damageReduction * 1.2))), sustain: strengths.sustain, mobility: strengths.mobility, gapClose: strengths.gapClose, escape: strengths.escape, effectiveRange: strengths.effectiveRange, selfPeel: strengths.selfPeel },
    },
    mechanics,
    mechanicConfidence: mechanicPatch ? "CURATED" : "SYSTEMATIC",
    safeBlind: round(clamp((legacy.safeBlind ?? 1.5) / 3 * 10)),
    confidence: patch ? "CURATED" : "SYSTEMATIC",
    scale: 10,
  };
}

const legacyExport = spawnSync(process.execPath, [path.join(root, "prototype", "simulate-drafts.mjs"), "--export-catalog"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
if (legacyExport.status !== 0) throw new Error(legacyExport.stderr || "Falha ao obter catálogo-base");
const payload = JSON.parse(legacyExport.stdout);
const officialPayload = JSON.parse(fs.readFileSync(fs.existsSync(officialPath) ? officialPath : fallbackOfficialPath, "utf8"));
const officialByName = new Map(Object.values(officialPayload.data).map((champion) => [champion.name, champion]));
const officials = [...officialByName.values()];
const hpValues = officials.map((champion) => champion.stats.hp + champion.stats.hpperlevel * 10);
const resistValues = officials.map((champion) => champion.stats.armor + champion.stats.armorperlevel * 10 + champion.stats.spellblock + champion.stats.spellblockperlevel * 10);

payload.champions = payload.champions.map((record) => ({
  ...record,
  profile: buildProfile(record, officialByName.get(record.name), hpValues, resistValues),
}));
payload.metadata = { ...payload.metadata, profileModel: "1.0-qualitative-0-10", profileScale: 10, profileCount: payload.champions.length };
fs.writeFileSync(catalogPath, JSON.stringify(payload, null, 2));
console.log(`Perfis 0-10 gerados para ${payload.champions.length} campeões.`);
