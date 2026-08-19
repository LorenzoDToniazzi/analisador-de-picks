export const BUILD_TAGS = [
  "physicalDamage", "magicDamage", "mixedDamage", "burst", "dps", "poke", "shortTrade", "longTrade",
  "allIn", "aoe", "antiTank", "engage", "followUp", "pick", "gankSetup", "flank", "dive", "backlineAccess", "gapClose", "stickiness",
  "mobility", "escape", "effectiveRange", "antiDive", "frontline", "hp", "defenses", "sustain", "selfPeel",
  "peel", "disengage", "zone", "cc", "waveclear", "priority", "weakside", "roam", "siege", "split",
  "teamfight", "scaling", "earlyPressure", "antiCc", "antiAuto",
];

export const RISK_TAGS = [
  "lowDurability", "vulnDive", "vulnPoke", "vulnEngage", "vulnKite", "vulnCc", "vulnBurst", "vulnDps", "vulnTank", "vulnRange",
  "vulnWave", "vulnGank", "vulnDisengage", "needsContact", "needsFlank", "needsSetup", "needsLongFight",
  "fragileEntry", "ultDependent", "resourceDependent", "goldDependent", "immobile", "conditionalMobility",
];

export const MECHANIC_STRENGTH_TAGS = [
  "cleanse", "repeatedDamage", "displacement", "projectileDenial", "grounding", "dashDenial",
  "attackEvasion", "pointClickCc", "attackSpeedControl", "summonScreen", "spellShield", "ccImmunity", "ultimateTheft",
];

export const TAG_LABELS = {
  physicalDamage: "Dano físico", magicDamage: "Dano mágico", mixedDamage: "Dano misto", burst: "Burst",
  dps: "DPS", poke: "Poke", shortTrade: "Troca curta", longTrade: "Troca longa", allIn: "All-in",
  aoe: "Área", antiTank: "Anti-tank", engage: "Engage", followUp: "Follow-up", pick: "Pick", gankSetup: "Setup de gank", flank: "Flanco", dive: "Dive",
  backlineAccess: "Acesso à backline", gapClose: "Acesso ao alvo", stickiness: "Permanência no alvo",
  mobility: "Mobilidade", escape: "Escape", effectiveRange: "Alcance efetivo", antiDive: "Anti-dive", frontline: "Frontline",
  hp: "HP", defenses: "Defesas", sustain: "Sustain", selfPeel: "Autoproteção", peel: "Peel", disengage: "Disengage", zone: "Zona",
  cc: "Controle", waveclear: "Waveclear", priority: "Prioridade", weakside: "Weakside", roam: "Roaming",
  siege: "Siege", split: "Split", teamfight: "Teamfight", scaling: "Scaling", earlyPressure: "Pressão early",
  antiCc: "Anti-CC", antiAuto: "Anti-auto", lowDurability: "Baixa durabilidade", vulnDive: "Sofre dive",
  vulnPoke: "Sofre contra poke", vulnEngage: "Sofre contra engage",
  vulnKite: "Sofre kite", vulnCc: "Sofre CC", vulnBurst: "Sofre burst", vulnDps: "Sofre DPS",
  vulnTank: "Sofre contra resistência", vulnRange: "Sofre alcance", vulnWave: "Sofre pressão de wave",
  vulnGank: "Exposto a gank", vulnDisengage: "Sofre disengage", needsContact: "Precisa de contato",
  needsFlank: "Precisa de flanco", needsSetup: "Precisa de setup", needsLongFight: "Precisa de luta longa",
  fragileEntry: "Entrada frágil", ultDependent: "Depende da ultimate", resourceDependent: "Depende de recurso",
  goldDependent: "Depende de ouro", immobile: "Imóvel", conditionalMobility: "Mobilidade condicional",
};

const scoreWeights = { laneMatchup: 3.25, jungleInteraction: 0.65, enemyComp: 1.5, allyComp: 1, populationStrength: 0.35 };
const poolAffinity = { principal: 6, secundaria: 5, laboratorio: 3 };
const comfortScore = { 1: -2, 2: -1, 3: 0, 4: 1, 5: 2 };
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const round = (value, digits = 2) => Number(value.toFixed(digits));
const clone = (value) => JSON.parse(JSON.stringify(value));

const keystoneSignals = {
  Electrocute: { burst: 2, shortTrade: 1 }, "Dark Harvest": { burst: 2, scaling: 1 }, "Hail of Blades": { burst: 1.5, shortTrade: 2, dps: 0.5 },
  "Press the Attack": { shortTrade: 1.5, dps: 1.5, antiTank: 0.5 }, "Lethal Tempo": { dps: 2.5, longTrade: 2 }, "Fleet Footwork": { sustain: 1.5, mobility: 1 }, Conqueror: { dps: 2, longTrade: 2, sustain: 0.5 },
  "Summon Aery": { poke: 1, peel: 1 }, "Arcane Comet": { poke: 2 }, "Phase Rush": { mobility: 2, disengage: 1 },
  "Grasp of the Undying": { hp: 1.5, sustain: 1, shortTrade: 1 }, Aftershock: { defenses: 2, engage: 1 }, Guardian: { peel: 2, defenses: 1 },
  "Glacial Augment": { cc: 1, peel: 1.5 }, "Unsealed Spellbook": { weakside: 1, scaling: 0.5 }, "First Strike": { burst: 1, poke: 1, goldDependent: 0.5 },
};

function scale10(profile) {
  const copy = clone(profile);
  const values = Object.values(copy.strengths ?? {});
  const legacy = copy.scale !== 10 && values.length && Math.max(...values) <= 3;
  if (legacy) {
    for (const side of ["strengths", "weaknesses"]) for (const tag of Object.keys(copy[side] ?? {})) copy[side][tag] = round(copy[side][tag] / 3 * 10);
    for (const side of ["strengths", "dependencies"]) for (const tag of Object.keys(copy.mechanics?.[side] ?? {})) copy.mechanics[side][tag] = round(copy.mechanics[side][tag] / 3 * 10);
  }
  copy.strengths = { ...Object.fromEntries(BUILD_TAGS.map((tag) => [tag, 0])), ...(copy.strengths ?? {}) };
  copy.weaknesses = { ...Object.fromEntries(RISK_TAGS.map((tag) => [tag, 0])), ...(copy.weaknesses ?? {}) };
  copy.mechanics ??= { strengths: {}, dependencies: {} };
  copy.mechanics.strengths ??= {};
  copy.mechanics.dependencies ??= {};
  copy.scale = 10;
  return copy;
}

export function resolveBuildProfile(baseProfile, modifiers = {}) {
  const profile = scale10(baseProfile);
  for (const tag of BUILD_TAGS) profile.strengths[tag] = round(clamp(profile.strengths[tag] + (modifiers.strengths?.[tag] ?? 0), 0, 10));
  for (const tag of RISK_TAGS) profile.weaknesses[tag] = round(clamp(profile.weaknesses[tag] + (modifiers.weaknesses?.[tag] ?? 0), 0, 10));
  for (const tag of MECHANIC_STRENGTH_TAGS) {
    profile.mechanics.strengths[tag] = round(clamp((profile.mechanics.strengths[tag] ?? 0) + (modifiers.mechanics?.strengths?.[tag] ?? 0), 0, 10));
    if (!profile.mechanics.strengths[tag]) delete profile.mechanics.strengths[tag];
  }
  profile.confidence = "USER_BUILD";
  return profile;
}

export function modifiersFromProfile(baseProfile, resolvedProfile) {
  const base = scale10(baseProfile);
  const resolved = scale10(resolvedProfile);
  return {
    strengths: Object.fromEntries(BUILD_TAGS.map((tag) => [tag, round(clamp(resolved.strengths[tag] - base.strengths[tag], -10, 10))])),
    weaknesses: Object.fromEntries(RISK_TAGS.map((tag) => [tag, round(clamp(resolved.weaknesses[tag] - base.weaknesses[tag], -10, 10))])),
    mechanics: { strengths: Object.fromEntries(MECHANIC_STRENGTH_TAGS.map((tag) => [tag, round(clamp((resolved.mechanics?.strengths?.[tag] ?? 0) - (base.mechanics?.strengths?.[tag] ?? 0), -10, 10))])) },
  };
}

export function inferBuildModifiers(champion, items, keystoneName) {
  const base = scale10(champion.profile);
  const modifiers = { strengths: {}, weaknesses: {}, mechanics: { strengths: {} } };
  const aggregate = {};
  for (const item of items) {
    for (const [tag, value] of Object.entries(item.signals ?? {})) aggregate[tag] = (aggregate[tag] ?? 0) + value;
  }
  for (const [tag, value] of Object.entries(keystoneSignals[keystoneName] ?? {})) aggregate[tag] = (aggregate[tag] ?? 0) + value;

  for (const tag of BUILD_TAGS) modifiers.strengths[tag] = 0;
  for (const tag of RISK_TAGS) modifiers.weaknesses[tag] = 0;
  for (const tag of MECHANIC_STRENGTH_TAGS) modifiers.mechanics.strengths[tag] = 0;
  for (const [tag, total] of Object.entries(aggregate)) {
    if (MECHANIC_STRENGTH_TAGS.includes(tag)) {
      modifiers.mechanics.strengths[tag] = round(clamp(total * 4, 0, 10));
    } else if (BUILD_TAGS.includes(tag) && !["hp", "defenses", "sustain", "mobility"].includes(tag)) {
      modifiers.strengths[tag] = round(clamp(total / 1.35, 0, 5));
    }
  }
  for (const tag of ["hp", "defenses", "sustain", "mobility"]) {
    if (items.length) {
      const total = aggregate[tag] ?? 0;
      const chassis = base.chassis?.strengths?.[tag] ?? Math.max(0, base.strengths[tag] - 2);
      const desired = clamp(chassis + total * 1.8, 0, 10);
      modifiers.strengths[tag] = round(clamp(desired - base.strengths[tag], -5, 5));
    }
  }
  const durability = (aggregate.hp ?? 0) + (aggregate.defenses ?? 0) + (aggregate.sustain ?? 0);
  if (items.length && ((base.weaknesses.needsContact ?? 0) >= 5 || (base.strengths.allIn ?? 0) >= 5) && durability < 1.5) {
    modifiers.weaknesses.fragileEntry = 2;
    modifiers.weaknesses.lowDurability = 1;
  }
  if (durability >= 5) modifiers.weaknesses.vulnBurst = -2;
  return modifiers;
}

export function inferBuildProfile(champion, items, keystoneName) {
  return resolveBuildProfile(champion.profile, inferBuildModifiers(champion, items, keystoneName));
}

const matchupRules = [
  { candidate: "Irelia", opponent: "Malphite", severity: "HARDCOUNTERED", reason: "Armadura, redução de velocidade de ataque e execução muito mais simples." },
  { candidate: "Malphite", opponent: "Sylas", severity: "HARDCOUNTERED", reason: "Sylas usa a ultimate de Malphite melhor, sustenta as trocas e converte a principal condição do pick." },
  { candidate: "Mel", opponent: "Cassiopeia", severity: "VERY_BAD", reason: "A defesa de janela única não encerra as rotações repetidas da Cassiopeia." },
  { candidate: "Zed", opponent: "Malphite", severity: "VERY_BAD", reason: "Armadura eficiente e alvo sem janela confiável de execução." },
  { candidate: "Qiyana", opponent: "Malphite", severity: "VERY_BAD", reason: "Armadura e stat-check negam o padrão de burst físico." },
  { candidate: "Diana", opponent: "Galio", severity: "VERY_BAD", reason: "Resistência mágica, peel e punição direta da entrada." },
  { candidate: "Akali", opponent: "Galio", severity: "VERY_BAD", reason: "MR, controle confiável e proteção aos alvos de dive." },
  { candidate: "Akali", opponent: "Lissandra", severity: "VERY_BAD", reason: "Controle confiável e ultimate defensiva contra dive." },
  { candidate: "Yasuo", opponent: "Taliyah", severity: "VERY_BAD", reason: "Zoneamento de dash, wave e punição das rotas de entrada." },
  { candidate: "Elise", opponent: "Malzahar", severity: "VERY_BAD", reason: "Voidlings bloqueiam Cocoon e o spell shield reduz a ameaça de pick." },
  { candidate: "Olaf", opponent: "Galio", severity: "HARDCOUNTERS", reason: "A ultimate remove a principal ferramenta de contenção do Galio." },
];
const severityScore = { VERY_BAD: -8, BAD: -5, SLIGHTLY_BAD: -2, NEUTRAL: 0, SLIGHTLY_GOOD: 2, GOOD: 5, VERY_GOOD: 8, HARDCOUNTERS: 10 };

const mechanicRules = [
  { strength: "repeatedDamage", dependency: "singleWindowDefense", factor: 1.6, group: "window", label: "dano repetido atravessa defesa de janela única" },
  { strength: "grounding", dependency: "dashReliant", factor: 1.5, group: "dash", label: "grounding desliga a mobilidade necessária" },
  { strength: "dashDenial", dependency: "dashReliant", factor: 1.4, group: "dash", label: "anti-dash pune o padrão de entrada" },
  { strength: "projectileDenial", dependency: "projectileReliant", factor: 1.4, group: "projectile", label: "negação de projétil remove parte central do kit" },
  { strength: "ccImmunity", dependency: "ccDependent", factor: 1.5, group: "cc", label: "imunidade atravessa a contenção principal" },
  { strength: "cleanse", dependency: "ccDependent", factor: 1.2, group: "cc", label: "cleanse remove a condição principal" },
  { strength: "spellShield", dependency: "singleSpellSetup", factor: 1.3, group: "setup", label: "spell shield nega a skill de setup" },
  { strength: "summonScreen", dependency: "blockableSkillshot", factor: 1.3, group: "setup", label: "invocações bloqueiam a skillshot" },
  { strength: "attackSpeedControl", dependency: "autoAttackDependent", factor: 1.35, group: "auto", label: "redução de velocidade de ataque quebra o DPS" },
  { strength: "attackEvasion", dependency: "autoAttackDependent", factor: 1.35, group: "auto", label: "evasão nega a janela de ataques" },
  { strength: "displacement", dependency: "channelDependent", factor: 1.25, group: "channel", label: "deslocamento interrompe canalização" },
  { strength: "ultimateTheft", dependency: "highValueUltimate", factor: 1.7, group: "ultimate", label: "roubo converte a ultimate contra o próprio time" },
  { strength: "pointClickCc", dependency: "dashReliant", factor: 0.8, group: "pointClick", label: "controle confiável limita a mobilidade" },
];

const SIGNATURE_DECAY = [1, 0.6, 0.35, 0.2, 0.1];
const LEGACY_SIGNATURE_EQUIVALENTS = {
  grounding: ["GROUNDING"], dashDenial: ["DASH_DENIAL"], projectileDenial: ["PROJECTILE_DENIAL", "PROJECTILE_REFLECTION"],
  ccImmunity: ["CC_IMMUNITY"], cleanse: ["CC_CLEANSE"], spellShield: ["SPELL_SHIELD"], summonScreen: ["SUMMON"],
  attackSpeedControl: ["ATTACK_SPEED_REDUCTION"], attackEvasion: ["ATTACK_EVASION", "BLIND"], displacement: ["DISPLACEMENT"],
  ultimateTheft: ["ULTIMATE_THEFT"], pointClickCc: ["RELIABLE_CC", "SUPPRESSION", "POLYMORPH", "TARGET_ISOLATION", "REALM_ISOLATION"],
};
const signatureTypes = (mechanics, types) => mechanics.filter((mechanic) => types.includes(mechanic.type));
const highest = (...values) => Math.max(0, ...values.filter(Number.isFinite));
const profileDependency = (profile, tag) => profile.mechanics?.dependencies?.[tag] ?? 0;
const profileStrength = (profile, tag) => profile.strengths?.[tag] ?? 0;
const profileWeakness = (profile, tag) => profile.weaknesses?.[tag] ?? 0;

function signatureAffinity(mechanic, attackerProfile, defenderProfile, defenderMechanics) {
  const d = (tag) => profileDependency(defenderProfile, tag);
  const s = (tag) => profileStrength(defenderProfile, tag);
  const w = (tag) => profileWeakness(defenderProfile, tag);
  const enemyMechanic = (types) => highest(...signatureTypes(defenderMechanics, types).map((row) => Math.max(row.laneImpact, row.draftImpact)));
  const values = {
    SELF_REVIVE: highest(d("singleWindowBurst"), s("burst") * .7, s("allIn") * .5),
    ALLY_REVIVE: highest(s("burst") * .6, s("pick") * .6),
    DEATH_PASSIVE: highest(w("needsContact"), s("allIn") * .5),
    DEATH_PREVENTION: highest(d("singleWindowBurst"), enemyMechanic(["EXECUTE"]), s("burst") * .7),
    UNTARGETABLE: highest(d("singleSpellSetup"), d("singleWindowBurst"), enemyMechanic(["RELIABLE_CC", "SUPPRESSION", "EXECUTE"])),
    INVULNERABLE: highest(d("singleWindowBurst"), enemyMechanic(["EXECUTE"]), s("burst") * .8, s("allIn") * .6),
    STASIS: highest(d("singleWindowBurst"), enemyMechanic(["EXECUTE", "RESET_CHAIN"]), s("burst") * .8),
    DAMAGE_REDUCTION: highest(d("singleWindowBurst"), s("burst") * .8, s("allIn") * .5),
    CC_CLEANSE: highest(d("ccDependent"), d("singleSpellSetup"), s("cc") * .7),
    CC_IMMUNITY: highest(d("ccDependent"), s("cc"), enemyMechanic(["RELIABLE_CC", "SUPPRESSION", "LONG_RANGE_CC"])),
    SLOW_IMMUNITY: highest(s("disengage") * .8, s("peel") * .5, s("cc") * .35),
    UNSTOPPABLE: highest(d("singleSpellSetup"), s("cc") * .55, enemyMechanic(["DISPLACEMENT", "RELIABLE_CC"])),
    SPELL_SHIELD: highest(d("singleSpellSetup"), d("blockableSkillshot"), enemyMechanic(["RELIABLE_CC", "SUPPRESSION", "SLEEP_SETUP"])),
    PROJECTILE_DENIAL: highest(d("projectileReliant"), d("blockableSkillshot"), enemyMechanic(["LONG_RANGE_CC", "SLEEP_SETUP"])),
    PROJECTILE_REFLECTION: highest(d("projectileReliant"), d("blockableSkillshot"), enemyMechanic(["LONG_RANGE_CC", "GLOBAL_DAMAGE", "SLEEP_SETUP"])),
    OUTSIDE_ZONE_IMMUNITY: highest(s("effectiveRange"), s("poke"), s("siege"), d("projectileReliant") * .7),
    ATTACK_EVASION: highest(d("autoAttackDependent"), s("dps") * .5),
    BLIND: highest(d("autoAttackDependent"), s("dps") * .5),
    ATTACK_SPEED_REDUCTION: highest(d("autoAttackDependent"), s("dps") * .6),
    DAMAGE_REFLECTION: highest(d("autoAttackDependent"), s("dps") * .55),
    REACTIVE_PARRY: highest(d("singleSpellSetup"), d("singleWindowBurst"), enemyMechanic(["RELIABLE_CC", "SUPPRESSION"])),
    REALM_ISOLATION: highest(
      enemyMechanic(["EXTERNAL_OBJECT_DEPENDENCY", "SUMMON", "ALLY_LINK", "ALLY_SAVE", "GLOBAL_SAVE"]),
      w("needsSetup"), w("ultDependent") * .75, s("peel") * .7, s("teamfight") * .5,
    ),
    TARGET_ISOLATION: highest(w("vulnDive"), w("lowDurability"), s("peel") * .5, s("effectiveRange") * .45),
    STAT_STEAL: highest(s("defenses"), s("frontline"), s("hp") * .7),
    ULTIMATE_THEFT: highest(d("highValueUltimate"), enemyMechanic(["GLOBAL_SAVE", "INVULNERABLE", "REALM_ISOLATION", "FORCED_BERSERK"])),
    TERRAIN_CREATION: highest(w("needsContact"), w("immobile") * .8, w("conditionalMobility") * .65, enemyMechanic(["PATH_DENIAL", "CHANNEL"])),
    PATH_DENIAL: highest(w("needsContact"), w("immobile") * .7, enemyMechanic(["PATH_DENIAL", "CHANNEL"])),
    DASH_DENIAL: highest(d("dashReliant"), w("conditionalMobility"), s("mobility") * .45),
    GROUNDING: highest(d("dashReliant"), w("conditionalMobility"), s("mobility") * .45),
    DISPLACEMENT: highest(d("channelDependent"), w("needsContact") * .7, enemyMechanic(["CHANNEL", "POSITIONAL_SWEETSPOT"])),
    SUPPRESSION: highest(w("vulnCc"), w("fragileEntry"), w("conditionalMobility") * .75, s("mobility") * .5),
    RELIABLE_CC: highest(w("vulnCc"), w("fragileEntry"), w("conditionalMobility") * .8, w("needsContact") * .45),
    LONG_RANGE_CC: highest(w("immobile"), w("vulnCc"), w("vulnRange") * .6),
    SILENCE: highest(d("channelDependent"), enemyMechanic(["CHANNEL"]), s("burst") * .35),
    POLYMORPH: highest(w("fragileEntry"), w("needsContact"), s("dive") * .6, s("backlineAccess") * .6),
    SLEEP_SETUP: highest(w("immobile"), w("vulnCc"), d("singleWindowDefense") * .5),
    FORCED_BERSERK: highest(d("autoAttackDependent"), s("dps"), s("physicalDamage") * .35),
    PERSISTENT_ZONE: highest(w("needsContact"), w("immobile") * .65, enemyMechanic(["CHANNEL", "FORCED_RETURN"])),
    TRAP_CONTROL: highest(w("needsContact") * .7, w("immobile") * .5, s("engage") * .45),
    ALLY_SAVE: highest(s("dive"), s("backlineAccess"), s("burst") * .7, s("pick") * .7),
    RANGE_AMPLIFICATION: highest(w("needsContact"), w("vulnRange"), s("effectiveRange") < 5 ? 7 : 0),
    BLINK: highest(enemyMechanic(["DASH_DENIAL", "TERRAIN_CREATION", "PATH_DENIAL"]), s("zone") * .45),
    EXECUTE: highest(s("sustain") * .5, s("hp") * .35, w("lowDurability") * .4),
    SHIELD_BREAK: highest(enemyMechanic(["ALLY_SAVE", "GLOBAL_SAVE", "ALLY_LINK"]), s("peel") * .55),
    TRUE_DAMAGE: highest(s("defenses"), s("frontline") * .7),
    PERCENT_HEALTH_DAMAGE: highest(s("hp"), s("frontline") * .7),
    SINGLE_TARGET_AMPLIFICATION: highest(w("lowDurability"), w("vulnBurst"), s("frontline") < 4 ? 6 : 0),
    DIRECTIONAL_DEFENSE: highest(d("singleWindowBurst"), s("burst") * .7, s("allIn") * .5),
    ANTI_MAGIC: highest(s("magicDamage"), s("burst") * (s("magicDamage") / 10)),
    TETHER: highest(w("needsContact"), w("immobile") * .6, s("effectiveRange") < 5 ? 5 : 0),
    FORCED_RETURN: highest(enemyMechanic(["PERSISTENT_ZONE", "TRAP_CONTROL"]), s("zone") * .7, s("cc") * .45),
  };
  let value = values[mechanic.type] ?? 0;
  if (mechanic.type === "DASH_DENIAL" && enemyMechanic(["BLINK"]) >= 8) value *= .15;
  if (mechanic.requires === "DASH_DENIAL" && enemyMechanic(["BLINK"]) >= 8) value *= .15;
  if (["TERRAIN_CREATION", "PATH_DENIAL"].includes(mechanic.type) && enemyMechanic(["BLINK"]) >= 8) value *= .35;
  if (mechanic.type === "BLINK" && enemyMechanic(["GROUNDING"]) >= 8) value *= .2;
  if (mechanic.type === "UNTARGETABLE") {
    const exitPunish = enemyMechanic(["RELIABLE_CC", "STASIS", "PERSISTENT_ZONE", "TRAP_CONTROL", "FORCED_RETURN"]);
    if (exitPunish >= 8) value *= .38;
  }
  return clamp(value, 0, 10);
}

function signatureDelivery(mechanic, attackerProfile, defenderProfile, context = {}) {
  let delivery = clamp(mechanic.reliability / 10, .25, 1);
  if (mechanic.accessRequired) {
    const kitAccess = highest(profileStrength(attackerProfile, "gapClose"), profileStrength(attackerProfile, "backlineAccess"), profileStrength(attackerProfile, "mobility") * .65);
    const practicalReach = Math.max(mechanic.reach, mechanic.reach + kitAccess * .25);
    const targetRange = profileStrength(defenderProfile, "effectiveRange");
    const targetProtection = highest(profileStrength(defenderProfile, "escape"), profileStrength(defenderProfile, "selfPeel"), profileStrength(defenderProfile, "antiDive"));
    const rangePenalty = clamp((targetRange - practicalReach) / 8, 0, .6);
    delivery *= (1 - rangePenalty) * (1 - targetProtection / 40);
    const teamPeel = context.teamPeel ?? 0;
    delivery *= 1 - clamp(teamPeel / 45, 0, .25);
    if (mechanic.type === "RELIABLE_CC" && targetRange >= 8 && practicalReach <= 6.5) delivery = Math.min(delivery, .52);
  }
  if (["PROJECTILE_DENIAL", "PROJECTILE_REFLECTION", "OUTSIDE_ZONE_IMMUNITY", "ATTACK_EVASION", "BLIND", "REACTIVE_PARRY", "DIRECTIONAL_DEFENSE", "SPELL_SHIELD"].includes(mechanic.type)) {
    delivery *= .75 + profileStrength(attackerProfile, "selfPeel") / 40;
  }
  if (mechanic.type === "REALM_ISOLATION") {
    const ownDuel = highest(profileStrength(attackerProfile, "dps"), profileStrength(attackerProfile, "allIn"), profileStrength(attackerProfile, "longTrade"))
      + (profileStrength(attackerProfile, "sustain") + profileStrength(attackerProfile, "defenses")) * .35;
    const enemyDuel = highest(profileStrength(defenderProfile, "dps"), profileStrength(defenderProfile, "allIn"), profileStrength(defenderProfile, "longTrade"))
      + (profileStrength(defenderProfile, "sustain") + profileStrength(defenderProfile, "defenses")) * .3;
    delivery *= clamp(.82 + (ownDuel - enemyDuel) / 28, .45, 1.08);
  }
  return clamp(delivery, .12, 1);
}

function signaturePressure(attackerName, attackerProfile, defenderName, defenderProfile, signaturesByName, context = {}) {
  const attackerMechanics = signaturesByName.get(attackerName) ?? [];
  const defenderMechanics = signaturesByName.get(defenderName) ?? [];
  const impactKey = context.kind === "draft" ? "draftImpact" : "laneImpact";
  const contributions = [];
  for (const mechanic of attackerMechanics) {
    const affinity = signatureAffinity(mechanic, attackerProfile, defenderProfile, defenderMechanics);
    if (affinity < 3.5) continue;
    const delivery = signatureDelivery(mechanic, attackerProfile, defenderProfile, context);
    const exceptional = ["REALM_ISOLATION", "PROJECTILE_REFLECTION", "OUTSIDE_ZONE_IMMUNITY", "DASH_DENIAL", "TERRAIN_CREATION"].includes(mechanic.type);
    const scale = context.kind === "draft" ? 3.2 : 4.2;
    const value = mechanic.power / 10 * mechanic[impactKey] / 10 * affinity / 10 * delivery * scale * (exceptional ? 1.12 : 1);
    if (value < .18) continue;
    contributions.push({
      value: clamp(value, 0, 4.8), specific: true, signature: true, type: mechanic.type,
      ability: `${attackerName} ${mechanic.slot} · ${mechanic.ability}`,
      label: `${mechanic.label}: ${mechanic.note}`,
      delivery: round(delivery * 100), affinity: round(affinity), target: defenderName,
    });
  }
  return contributions.sort((a, b) => b.value - a.value);
}

function signatureTeamContributions(candidateName, candidateProfile, enemies, signaturesByName) {
  if (!candidateName || !signaturesByName.size) return { positives: [], negatives: [] };
  const positivePairs = [];
  const negativePairs = [];
  const candidateTypes = new Set((signaturesByName.get(candidateName) ?? []).map((row) => row.type));
  for (const target of enemies) {
    const otherPeel = enemies.filter((enemy) => enemy.name !== target.name).reduce((sum, enemy) => sum
      + highest(profileStrength(enemy.profile, "peel"), profileStrength(enemy.profile, "disengage"), profileStrength(enemy.profile, "antiDive")) * .7
      + profileStrength(enemy.profile, "frontline") * .2, 0);
    positivePairs.push(...signaturePressure(candidateName, candidateProfile, target.name, target.profile, signaturesByName, { kind: "draft", teamPeel: otherPeel }));
    const threats = signaturePressure(target.name, target.profile, candidateName, candidateProfile, signaturesByName, { kind: "draft" });
    for (const threat of threats) {
      if (candidateTypes.has("REALM_ISOLATION") && ["PERSISTENT_ZONE", "SUMMON", "EXTERNAL_OBJECT_DEPENDENCY", "ALLY_LINK", "ALLY_SAVE"].includes(threat.type)) {
        threat.value *= .45;
        threat.label += " O Realm remove parte do setup externo antes do duelo.";
      }
      negativePairs.push(threat);
    }
  }

  const grouped = new Map();
  for (const row of positivePairs) {
    const key = `${row.ability}:${row.type}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }
  const positives = [...grouped.values()].map((rows) => {
    rows.sort((a, b) => b.value - a.value);
    const targets = [...new Set(rows.map((row) => row.target))];
    const value = rows.reduce((sum, row, index) => sum + row.value * (SIGNATURE_DECAY[index] ?? 0), 0);
    const lead = rows[0];
    return {
      value: clamp(value, 0, 4.5), signature: true, type: lead.type, targetCount: targets.length,
      reason: `${lead.ability}: ${lead.label} Afeta ${targets.join(", ")} (${targets.length} alvo${targets.length === 1 ? "" : "s"}).`,
      details: rows,
    };
  }).sort((a, b) => b.value - a.value);

  const threatFamily = (row) => ["RELIABLE_CC", "SUPPRESSION", "POLYMORPH", "LONG_RANGE_CC", "SLEEP_SETUP"].includes(row.type) ? "RELIABLE_CONTROL" : row.type;
  const groupedThreats = new Map();
  for (const row of negativePairs) {
    const key = threatFamily(row);
    if (!groupedThreats.has(key)) groupedThreats.set(key, []);
    groupedThreats.get(key).push(row);
  }
  const negatives = [...groupedThreats.values()].map((rows) => {
    rows.sort((a, b) => b.value - a.value);
    const family = threatFamily(rows[0]);
    const baseValue = rows.reduce((sum, row, index) => sum + row.value * (SIGNATURE_DECAY[index] ?? 0), 0);
    const chainMultiplier = family === "RELIABLE_CONTROL" && !candidateTypes.has("REALM_ISOLATION") ? 1 + Math.min(1.1, (rows.length - 1) * .55) : 1;
    const value = baseValue * chainMultiplier;
    const casters = [...new Set(rows.map((row) => row.ability.split(" · ")[0]))];
    return {
      value: -clamp(value, 0, 4.5), signature: true,
      reason: `${rows[0].label} Ameaça combinada de ${casters.join(", ")} contra ${candidateName}.`,
      details: rows,
    };
  }).sort((a, b) => a.value - b.value);
  return { positives, negatives };
}

const lanePairs = [
  ["burst", "vulnBurst"], ["dps", "vulnDps"], ["antiTank", "vulnTank"], ["poke", "vulnPoke"],
  ["effectiveRange", "vulnRange"], ["shortTrade", "needsLongFight"], ["cc", "vulnCc"], ["waveclear", "vulnWave"],
  ["earlyPressure", "goldDependent"], ["sustain", "vulnPoke"], ["gapClose", "vulnEngage"],
  ["backlineAccess", "vulnDive"], ["allIn", "lowDurability"], ["stickiness", "immobile"],
];

function mechanicContributions(attacker, defender, options = {}) {
  const groups = new Map();
  for (const rule of mechanicRules) {
    const equivalents = LEGACY_SIGNATURE_EQUIVALENTS[rule.strength] ?? [];
    if (equivalents.some((type) => options.signatureTypes?.has(type))) continue;
    const value = (attacker.mechanics?.strengths?.[rule.strength] ?? 0) * (defender.mechanics?.dependencies?.[rule.dependency] ?? 0) / 30 * rule.factor;
    if (value > 0 && (!groups.has(rule.group) || groups.get(rule.group).value < value)) groups.set(rule.group, { value, label: rule.label, specific: true });
  }
  const pointClickMapped = LEGACY_SIGNATURE_EQUIVALENTS.pointClickCc.some((type) => options.signatureTypes?.has(type));
  const reliableCc = pointClickMapped ? 0 : (attacker.mechanics?.strengths?.pointClickCc ?? 0);
  if (reliableCc) {
    const ccExposure = Math.max(defender.weaknesses?.vulnCc ?? 0, defender.weaknesses?.fragileEntry ?? 0, (defender.weaknesses?.conditionalMobility ?? 0) * .8, (defender.weaknesses?.needsContact ?? 0) * .7);
    const value = reliableCc * ccExposure / 30 * 1.25;
    if (value > 0 && (!groups.has("pointClick") || groups.get("pointClick").value < value)) groups.set("pointClick", { value, label: "CC point-and-click pune um campeão que se quebra quando controlado", specific: true });
  }
  return [...groups.values()];
}

function lanePressure(attacker, defender, signatureRows = [], options = {}) {
  const contributions = [...mechanicContributions(attacker, defender, options), ...signatureRows];
  const reliableCc = attacker.mechanics?.strengths?.pointClickCc ?? 0;
  for (const [strength, weakness] of lanePairs) {
    if (strength === "cc" && reliableCc) continue;
    const value = (attacker.strengths?.[strength] ?? 0) * (defender.weaknesses?.[weakness] ?? 0) / 30;
    if (value > 0) contributions.push({ value, label: `${TAG_LABELS[strength]} explora ${TAG_LABELS[weakness]}` });
  }
  const access = Math.max(attacker.strengths?.gapClose ?? 0, attacker.strengths?.backlineAccess ?? 0, attacker.strengths?.engage ?? 0, (attacker.strengths?.mobility ?? 0) * .65);
  const exposed = Math.max(defender.weaknesses?.vulnDive ?? 0, defender.weaknesses?.vulnEngage ?? 0, (defender.weaknesses?.immobile ?? 0) * .9, (defender.weaknesses?.lowDurability ?? 0) * .8);
  const protection = Math.max(defender.strengths?.escape ?? 0, defender.strengths?.selfPeel ?? 0, defender.strengths?.antiDive ?? 0);
  const accessValue = access * exposed / 24 * clamp(1 - protection / 15, .25, 1);
  if (accessValue > .25) contributions.push({ value: accessValue, label: "acesso ao alvo explora pouca fuga/autoproteção", structural: true });
  if ((attacker.strengths?.antiCc ?? 0) && (defender.strengths?.cc ?? 0)) contributions.push({ value: attacker.strengths.antiCc * defender.strengths.cc / 25, label: "anti-CC reduz o controle" });
  if ((attacker.strengths?.antiAuto ?? 0) && ((defender.strengths?.dps ?? 0) + (defender.strengths?.physicalDamage ?? 0) >= 13)) contributions.push({ value: attacker.strengths.antiAuto * .36, label: "anti-auto reduz o DPS" });
  contributions.sort((a, b) => b.value - a.value);
  return {
    total: contributions.slice(0, 2).reduce((sum, item, index) => sum + item.value * [1, 0.3][index], 0),
    specific: contributions.filter((item) => item.specific).reduce((sum, item) => sum + item.value, 0),
    structural: contributions.filter((item) => item.structural).reduce((sum, item) => sum + item.value, 0),
    contributions,
  };
}

function genericAccessDelivery(attacker, defender) {
  const access = highest(profileStrength(attacker, "gapClose"), profileStrength(attacker, "backlineAccess"), profileStrength(attacker, "engage"), profileStrength(attacker, "mobility") * .65);
  const castRange = profileStrength(attacker, "effectiveRange") * .45;
  const spacing = profileStrength(defender, "effectiveRange") * .65;
  const protection = highest(profileStrength(defender, "escape"), profileStrength(defender, "selfPeel"), profileStrength(defender, "antiDive")) * .35;
  return clamp(.48 + (access + castRange - spacing - protection) / 15, .18, 1);
}

function evidenceMap(snapshot) {
  const map = new Map();
  for (const [champion, rows] of Object.entries(snapshot?.champions ?? {})) map.set(champion, rows);
  return map;
}

function directionalEvidence(map, championName, opponentName) {
  const forward = map.get(championName)?.find((row) => row.opponent === opponentName);
  const reverse = map.get(opponentName)?.find((row) => row.opponent === championName);
  if (!forward && !reverse) return null;
  const signals = [...(forward ? [{ delta2: forward.delta2, games: forward.games }] : []), ...(reverse ? [{ delta2: -reverse.delta2, games: reverse.games }] : [])];
  const total = signals.reduce((sum, row) => sum + row.games, 0);
  return { delta2: signals.reduce((sum, row) => sum + row.delta2 * row.games, 0) / total, games: forward && reverse ? total / 2 : total, directions: signals.length };
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export class DraftEngine {
  constructor(champions, matchupSnapshots, signatureCatalog = null) {
    this.champions = champions;
    this.byName = new Map(champions.map((champion) => [champion.name, champion]));
    this.signaturesByName = new Map((signatureCatalog?.champions ?? []).map((champion) => [champion.champion, champion.mechanics]));
    this.evidence = {};
    this.populationBaseline = {};
    for (const lane of ["MID", "TOP"]) {
      this.evidence[lane] = {
        current: evidenceMap(matchupSnapshots[lane]?.current), stable: evidenceMap(matchupSnapshots[lane]?.stable), fallback: evidenceMap(matchupSnapshots[lane]?.fallback),
      };
      const winRates = Object.values(matchupSnapshots[lane]?.stable?.champions ?? {}).filter((rows) => rows.length >= 20).map((rows) => {
        const games = rows.reduce((sum, row) => sum + row.games, 0);
        return rows.reduce((sum, row) => sum + row.winRate * row.games, 0) / games;
      });
      this.populationBaseline[lane] = winRates.length ? median(winRates) : 50;
    }
  }

  laneRoster(lane) {
    for (const tierName of ["stable", "fallback"]) {
      const qualifying = [];
      for (const [champion, rows] of this.evidence[lane][tierName]) {
        const games = rows.reduce((sum, row) => sum + (row.games ?? 0), 0);
        if (rows.length >= 30 && games >= 5000 && this.byName.has(champion)) qualifying.push(champion);
      }
      if (qualifying.length) return qualifying.sort((a, b) => a.localeCompare(b));
    }
    return [];
  }

  statEvidence(candidate, opponent, lane, isCustom) {
    const tier = this.evidence[lane];
    const current = directionalEvidence(tier.current, candidate, opponent);
    const stable = directionalEvidence(tier.stable, candidate, opponent);
    const fallback = directionalEvidence(tier.fallback, candidate, opponent);
    if (!current && !stable && !fallback) return null;
    const currentRel = current ? current.games / (current.games + 350) : 0;
    const stableRel = stable ? stable.games / (stable.games + 500) : 0;
    const fallbackRel = fallback ? fallback.games / (fallback.games + 1200) * 0.25 : 0;
    const rows = [
      ...(current ? [{ ...current, weight: currentRel }] : []),
      ...(stable ? [{ ...stable, weight: (1 - currentRel) * stableRel }] : []),
      ...(fallback ? [{ ...fallback, weight: (1 - currentRel) * (1 - stableRel) * fallbackRel }] : []),
    ];
    const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
    const delta2 = rows.reduce((sum, row) => sum + row.delta2 * row.weight, 0) / totalWeight;
    const combined = 1 - (1 - currentRel) * (1 - stableRel) * (1 - fallbackRel);
    return {
      delta2, score: clamp(delta2 * 1.8, -9, 9), reliability: combined * (isCustom ? 0.35 : 1),
      currentGames: Math.round(current?.games ?? 0), currentDirections: current?.directions ?? 0,
      stableGames: Math.round(stable?.games ?? 0), stableDirections: stable?.directions ?? 0,
      fallbackGames: Math.round(fallback?.games ?? 0), fallbackDirections: fallback?.directions ?? 0,
    };
  }

  populationStrength(champion, lane) {
    const rows = this.evidence[lane].stable.get(champion) ?? this.evidence[lane].fallback.get(champion);
    if (!rows?.length) return { score: 0, confidence: "LOW", games: 0 };
    const games = rows.reduce((sum, row) => sum + row.games, 0);
    const winRate = rows.reduce((sum, row) => sum + row.winRate * row.games, 0) / games;
    const reliability = games / (games + 10000);
    return { score: clamp((winRate - this.populationBaseline[lane]) * reliability, -3, 3), confidence: reliability >= 0.4 ? "MEDIUM" : "LOW", games };
  }

  personalRule(variant, opponent, lane, overrides) {
    return overrides.find((rule) => rule.lane === lane && rule.opponent === opponent && (rule.variantId === variant.id || (!rule.variantId && rule.champion === variant.champion)));
  }

  laneScore(variant, opponent, lane, overrides = []) {
    if (!opponent) return this.blindLaneScore(variant, lane, overrides);
    const opponentChampion = this.byName.get(opponent);
    if (!opponentChampion) return { score: 0, tier: "EVEN", confidence: "LOW", reasons: ["Laner não encontrado na base."] };
    const personal = this.personalRule(variant, opponent, lane, overrides);
    if (personal?.relation === "HARDCOUNTERED") return { veto: true, reason: personal.reason || "Hardcounter pessoal confirmado para esta variante." };
    const system = matchupRules.find((rule) => rule.candidate === variant.champion && rule.opponent === opponent);
    if (system?.severity === "HARDCOUNTERED") return { veto: true, reason: system.reason };

    const ownSignatures = signaturePressure(variant.champion, variant.profile, opponent, opponentChampion.profile, this.signaturesByName, { kind: "lane" });
    const enemySignatures = signaturePressure(opponent, opponentChampion.profile, variant.champion, variant.profile, this.signaturesByName, { kind: "lane" });
    if (ownSignatures.some((row) => row.type === "REALM_ISOLATION" && row.affinity >= 8)) {
      for (const threat of enemySignatures) {
        if (!["PERSISTENT_ZONE", "SUMMON", "EXTERNAL_OBJECT_DEPENDENCY", "ALLY_LINK", "ALLY_SAVE"].includes(threat.type)) continue;
        threat.value *= .45;
        threat.label += " O Realm remove parte do setup externo antes do duelo.";
      }
      enemySignatures.sort((a, b) => b.value - a.value);
    }
    const ownOptions = { signatureTypes: new Set((this.signaturesByName.get(variant.champion) ?? []).map((row) => row.type)) };
    const enemyOptions = { signatureTypes: new Set((this.signaturesByName.get(opponent) ?? []).map((row) => row.type)) };
    const own = lanePressure(variant.profile, opponentChampion.profile, ownSignatures, ownOptions);
    const enemy = lanePressure(opponentChampion.profile, variant.profile, enemySignatures, enemyOptions);
    const specific = clamp((own.specific - enemy.specific) * 1.8, -7, 7);
    const structural = clamp((own.structural - enemy.structural) * 1.8, -7, 7);
    const mechanical = clamp((own.total - enemy.total) * 1.8 + structural * .25, -7, 7);
    const stat = this.statEvidence(variant.champion, opponent, lane, variant.kind === "CUSTOM");
    let score = stat ? stat.reliability * stat.score + (1 - stat.reliability) * mechanical : mechanical;
    const reasons = [stat
      ? `Estatística: Δ2 ${stat.delta2 >= 0 ? "+" : ""}${round(stat.delta2)}, confiança ${round(stat.reliability * 100)}% (${stat.currentGames} patch / ${stat.stableGames} Diamond+ 30d).`
      : "Sem amostra direcional: avaliação por kit e skills, com confiança baixa."];

    const overrideValues = { VERY_BAD: -8, BAD: -5, SLIGHTLY_BAD: -2, NEUTRAL: 0, GOOD: 5, VERY_GOOD: 8 };
    if (personal && personal.relation in overrideValues) {
      score = score * 0.25 + overrideValues[personal.relation] * 0.75;
      reasons.push(personal.reason || "Relação pessoal aplicada.");
    } else if (system) {
      score = score * 0.35 + severityScore[system.severity] * 0.65;
      reasons.push(system.reason);
    }

    const robust = (stat?.currentDirections === 2 && stat.currentGames >= 150) || (stat?.stableDirections === 2 && stat.stableGames >= 250);
    const rareButExtreme = stat?.fallbackDirections === 2 && stat.fallbackGames >= 80 && stat.delta2 <= -7 && structural <= -2.5;
    if (variant.kind !== "CUSTOM" && ((stat?.reliability >= 0.4 && robust && stat.delta2 <= -4 && Math.min(specific, structural) <= -3) || rareButExtreme)) {
      return { veto: true, reason: `Hardcounter confirmado por estatística bidirecional e execução estrutural: Δ2 ${round(stat.delta2)}.`, evidence: stat };
    }
    const logicDominant = !stat || stat.reliability < 0.55;
    const tier = score <= -5 || (logicDominant && structural <= -6) || (stat?.reliability >= 0.35 && stat.delta2 <= -3.5) ? "SEVERE_COUNTER"
      : score <= -2.25 || (logicDominant && structural <= -3.5) || (stat?.reliability >= 0.25 && stat.delta2 <= -1.5) ? "COUNTERED"
        : score <= -0.75 ? "SLIGHTLY_COUNTERED" : score >= 6.5 ? "HARDCOUNTERS" : score >= 3.5 ? "STRONG_ADVANTAGE" : score >= 1.25 ? "ADVANTAGED" : "EVEN";
    const bestOwn = own.contributions[0];
    const bestEnemy = enemy.contributions[0];
    if (bestOwn) reasons.push(`Favorável: ${bestOwn.label}.`);
    if (bestEnemy) reasons.push(`Risco: ${bestEnemy.label}.`);
    return {
      score, tier, confidence: stat?.reliability >= 0.55 ? "HIGH" : stat?.reliability >= 0.2 ? "MEDIUM" : "LOW", reasons, stat, mechanical, specific, structural,
      advantages: own.contributions.slice(0, 4).map((item) => ({ label: item.label, value: round(item.value) })),
      risks: enemy.contributions.slice(0, 4).map((item) => ({ label: item.label, value: round(item.value) })),
      signatureAdvantages: ownSignatures.slice(0, 4), signatureRisks: enemySignatures.slice(0, 4),
    };
  }

  blindLaneScore(variant, lane, overrides) {
    const plausible = [...this.evidence[lane].stable.entries()].filter(([, rows]) => rows.length >= 15).map(([name]) => name).filter((name) => name !== variant.champion);
    const values = plausible.map((opponent) => this.laneScore(variant, opponent, lane, overrides)).map((row) => row.veto ? -10 : row.score).sort((a, b) => a - b);
    const count = Math.max(1, Math.ceil(values.length * 0.2));
    const lowerTail = values.slice(0, count).reduce((sum, value) => sum + value, 0) / count;
    return { score: clamp(lowerTail * 0.7, -8, 0), tier: lowerTail <= -5 ? "COUNTERED" : "BLIND", confidence: "LOW", reasons: [`Laner oculto: risco calculado pela cauda inferior de ${plausible.length} adversários plausíveis.`], blind: true };
  }

  jungleScore(profile, allyJungle, enemyJungle) {
    let score = 0;
    const reasons = [];
    const ally = this.byName.get(allyJungle);
    const enemy = this.byName.get(enemyJungle);
    if (ally) {
      const setup = (profile.strengths.gankSetup ?? 0) * ((ally.profile.strengths.burst ?? 0) + (ally.profile.strengths.cc ?? 0)) / 100;
      const prio = (profile.strengths.priority ?? 0) * (ally.profile.strengths.earlyPressure ?? 0) / 50;
      score += setup + prio;
      if (setup + prio > 1) reasons.push(`Boa conversão com ${ally.name}.`);
    }
    if (enemy) {
      const threat = (enemy.profile.strengths.cc ?? 0) + (enemy.profile.strengths.engage ?? 0) + (enemy.profile.strengths.burst ?? 0);
      const risk = threat * ((profile.weaknesses.vulnGank ?? 0) + (profile.weaknesses.immobile ?? 0) + (profile.weaknesses.fragileEntry ?? 0)) / 200;
      const defense = threat * ((profile.strengths.mobility ?? 0) + (profile.strengths.antiDive ?? 0) + (profile.strengths.defenses ?? 0)) / 400;
      score += Math.min(risk, defense) - risk;
      if (risk > defense + 0.8) reasons.push(`Exposição ao gank de ${enemy.name}.`);
    }
    return { score: clamp(score, -10, 10), reasons };
  }

  enemyCompScore(profile, enemyNames, candidateName = "") {
    const enemies = enemyNames.map((name) => this.byName.get(name)).filter(Boolean);
    const interactions = [];
    const candidateMechanicOptions = { signatureTypes: new Set((this.signaturesByName.get(candidateName) ?? []).map((row) => row.type)) };
    const rules = [
      { threat: "cc", answers: ["antiCc"], label: "anti-CC contra controle" },
      { threat: "engage", alternate: ["backlineAccess", "allIn"], answers: ["antiDive", "peel", "disengage", "defenses"], label: "resposta à entrada" },
      { threat: "frontline", alternate: ["hp", "defenses"], answers: ["dps", "antiTank"], label: "dano aplicável na frontline" },
      { threat: "poke", alternate: ["siege"], answers: ["engage", "mobility", "sustain", "waveclear"], label: "resposta ao poke" },
      { threat: "mobility", alternate: ["backlineAccess"], answers: ["cc", "pick", "zone", "antiDive"], label: "contenção da mobilidade" },
    ];
    for (const enemy of enemies) {
      for (const rule of rules) {
        const threat = Math.max(enemy.profile.strengths[rule.threat] ?? 0, ...(rule.alternate ?? []).map((tag) => enemy.profile.strengths[tag] ?? 0));
        const answer = Math.max(0, ...rule.answers.map((tag) => profile.strengths[tag] ?? 0));
        const value = threat * answer / 30;
        if (value > 0) interactions.push({ value, reason: `Contra ${enemy.name}: ${rule.label}.` });
      }
      const exposures = [
        [Math.max(enemy.profile.strengths.poke ?? 0, enemy.profile.strengths.siege ?? 0) * clamp(.45 + ((enemy.profile.strengths.effectiveRange ?? 0) - (profile.strengths.effectiveRange ?? 0)) / 8, .15, 1), ["vulnPoke", "vulnRange", "immobile"], "poke/range dificulta a execução"],
        [Math.max(enemy.profile.strengths.engage ?? 0, enemy.profile.strengths.backlineAccess ?? 0) * genericAccessDelivery(enemy.profile, profile), ["vulnEngage", "fragileEntry"], "engage pune a entrada"],
        [(enemy.profile.strengths.cc ?? 0) * (this.signaturesByName.size ? .4 + genericAccessDelivery(enemy.profile, profile) * .35 : 1), ["vulnCc", "fragileEntry", "needsContact"], "controle interrompe a execução"],
        [Math.max(enemy.profile.strengths.disengage ?? 0, enemy.profile.strengths.peel ?? 0, enemy.profile.strengths.mobility ?? 0), ["vulnKite", "vulnDisengage", "needsContact"], "kite nega contato"],
      ];
      for (const [threat, risks, label] of exposures) {
        const risk = Math.max(0, ...risks.map((tag) => profile.weaknesses[tag] ?? 0));
        if (threat * risk > 0) interactions.push({ value: -threat * risk / 30, reason: `Contra ${enemy.name}: ${label}.` });
      }
      for (const interaction of mechanicContributions(profile, enemy.profile, candidateMechanicOptions)) {
        interactions.push({ value: interaction.value, reason: `Contra ${enemy.name}: ${interaction.label}.` });
      }
      const enemyMechanicOptions = { signatureTypes: new Set((this.signaturesByName.get(enemy.name) ?? []).map((row) => row.type)) };
      for (const interaction of mechanicContributions(enemy.profile, profile, enemyMechanicOptions)) {
        interactions.push({ value: -interaction.value, reason: `Contra ${enemy.name}: ${interaction.label}.` });
      }
    }
    const signatures = signatureTeamContributions(candidateName, profile, enemies, this.signaturesByName);
    interactions.push(...signatures.positives, ...signatures.negatives);
    const flexibleRealm = signatures.positives.find((row) => row.type === "REALM_ISOLATION" && row.targetCount >= 3);
    if (flexibleRealm) {
      for (const interaction of interactions) {
        if (interaction.value < 0 && !interaction.signature) interaction.value *= .78;
      }
    }
    const positives = interactions.filter((row) => row.value > 0).sort((a, b) => b.value - a.value).slice(0, 2);
    const negatives = interactions.filter((row) => row.value < 0).sort((a, b) => a.value - b.value).slice(0, 2);
    const weighted = (rows) => rows.reduce((sum, row, index) => sum + row.value * [1, 0.35][index], 0);
    const score = (weighted(positives) + weighted(negatives)) * 2;
    return {
      score: clamp(score, -10, 10), reasons: [...positives, ...negatives].map((row) => row.reason),
      signatureAdvantages: positives.filter((row) => row.signature).flatMap((row) => row.details ?? []).slice(0, 6),
      signatureRisks: negatives.filter((row) => row.signature).flatMap((row) => row.details ?? []).slice(0, 6),
    };
  }

  allyCompScore(profile, allyNames, enemyNames) {
    const allies = allyNames.map((name) => this.byName.get(name)).filter(Boolean);
    const enemies = enemyNames.map((name) => this.byName.get(name)).filter(Boolean);
    if (!allies.length) return { score: 0, reasons: [] };
    const sum = (list, side, tag) => list.reduce((total, champion) => total + (champion.profile[side]?.[tag] ?? 0) * .3, 0);
    const needs = [];
    const enemyDive = sum(enemies, "strengths", "engage") + sum(enemies, "strengths", "backlineAccess");
    const enemyPoke = sum(enemies, "strengths", "poke") + sum(enemies, "strengths", "siege");
    const enemyFront = sum(enemies, "strengths", "frontline") + sum(enemies, "strengths", "defenses");
    const allyDefense = sum(allies, "strengths", "peel") + sum(allies, "strengths", "disengage") + sum(allies, "strengths", "antiDive");
    const allyEngage = sum(allies, "strengths", "engage") + sum(allies, "strengths", "backlineAccess");
    const allyTankDamage = sum(allies, "strengths", "antiTank") + sum(allies, "strengths", "dps") * 0.5;
    if (enemyDive >= 3) needs.push({ severity: enemyDive / 2 - allyDefense / 2, tags: ["antiDive", "peel", "disengage", "defenses"], label: "resposta ao dive inimigo" });
    if (enemyPoke >= 3) needs.push({ severity: enemyPoke / 2 - allyEngage / 2, tags: ["engage", "backlineAccess", "waveclear", "sustain"], label: "alcance para responder ao poke" });
    if (enemyFront >= 3) needs.push({ severity: enemyFront / 2 - allyTankDamage / 2, tags: ["antiTank", "dps"], label: "dano contra frontline" });
    const physical = sum(allies, "strengths", "physicalDamage");
    const magic = sum(allies, "strengths", "magicDamage");
    if (physical >= magic + 4) needs.push({ severity: (physical - magic) / 2, tags: ["magicDamage"], label: "corrigir excesso físico" });
    if (magic >= physical + 4) needs.push({ severity: (magic - physical) / 2, tags: ["physicalDamage"], label: "corrigir excesso mágico" });
    const critical = needs.filter((need) => need.severity >= 0.75).sort((a, b) => b.severity - a.severity).slice(0, 2);
    const values = critical.map((need, index) => ({ ...need, value: need.severity * Math.max(0, ...need.tags.map((tag) => profile.strengths[tag] ?? 0)) / 10 * [1, 0.3][index] }));
    return { score: clamp(values.reduce((sum, row) => sum + row.value, 0) * 2, 0, 10), reasons: values.filter((row) => row.value > 0).map((row) => `Supre necessidade: ${row.label}.`) };
  }

  executionRetention(profile, laneScore, tier) {
    const behind = clamp(Math.max(0, -laneScore) / 10, 0, 1);
    const dependency = Math.max(profile.weaknesses.goldDependent ?? 0, profile.weaknesses.resourceDependent ?? 0, profile.weaknesses.needsSetup ?? 0) / 10;
    const entry = Math.max(profile.weaknesses.fragileEntry ?? 0, profile.weaknesses.needsContact ?? 0, profile.weaknesses.vulnCc ?? 0) / 10;
    const utility = Math.max(profile.strengths.cc ?? 0, profile.strengths.peel ?? 0, profile.strengths.disengage ?? 0, profile.strengths.waveclear ?? 0, profile.strengths.frontline ?? 0) / 10;
    const gate = clamp(1 - behind * (0.95 + 0.1 * dependency + 0.1 * entry), 0.05, 1);
    const cap = tier === "SEVERE_COUNTER" ? 0.1 + 0.1 * utility : tier === "COUNTERED" ? 0.35 + 0.1 * utility : tier === "SLIGHTLY_COUNTERED" ? 0.7 : 1;
    return clamp(Math.min(Math.max(gate, 0.05 + 0.2 * utility), cap), 0.05, 1);
  }

  evaluate(variant, draft, poolEntry, overrides) {
    const picked = [...Object.values(draft.ally), ...Object.values(draft.enemy)].filter(Boolean);
    if (picked.includes(variant.champion)) return { ...variant, status: "UNAVAILABLE", reason: "Campeão já escolhido no draft." };
    const lane = this.laneScore(variant, draft.enemy[draft.lane], draft.lane, overrides);
    if (lane.veto) return {
      ...variant, status: "HARDCOUNTERED", reason: lane.reason, evidence: lane.evidence,
      matchupDetails: { opponent: draft.enemy[draft.lane], tier: "HARDCOUNTERED", hard: true, reason: lane.reason, evidence: lane.evidence ? {
        delta2: round(lane.evidence.delta2), reliability: round((lane.evidence.reliability ?? 0) * 100), currentGames: lane.evidence.currentGames, stableGames: lane.evidence.stableGames,
      } : null },
    };
    const jungle = this.jungleScore(variant.profile, draft.ally.JUNGLE, draft.enemy.JUNGLE);
    const enemyComp = this.enemyCompScore(variant.profile, Object.values(draft.enemy).filter(Boolean), variant.champion);
    const allyComp = this.allyCompScore(variant.profile, Object.values(draft.ally).filter(Boolean), Object.values(draft.enemy).filter(Boolean));
    const retention = this.executionRetention(variant.profile, lane.score, lane.tier);
    const adjustedEnemy = enemyComp.score > 0 ? enemyComp.score * retention : enemyComp.score;
    const adjustedAlly = allyComp.score > 0 ? allyComp.score * retention : allyComp.score;
    const population = this.populationStrength(variant.champion, draft.lane);
    const affinity = poolEntry ? (poolAffinity[poolEntry.pool] ?? 0) : 0;
    const comfort = poolEntry ? (comfortScore[poolEntry.comfort] ?? 0) : 0;
    const rawScore = scoreWeights.laneMatchup * lane.score + scoreWeights.jungleInteraction * jungle.score + scoreWeights.enemyComp * adjustedEnemy + scoreWeights.allyComp * adjustedAlly + scoreWeights.populationStrength * population.score + affinity + comfort;
    const score = clamp(Math.round(50 + rawScore), 0, 100);
    const label = score >= 85 ? "Excelente" : score >= 70 ? "Muito bom" : score >= 55 ? "Bom" : score >= 45 ? "Arriscado" : score >= 30 ? "Evitar" : "Não pickar";
    return {
      ...variant, status: "SCORED", score, rawScore: round(rawScore), label, matchupTier: lane.tier,
      confidence: lane.confidence === "LOW" || population.confidence === "LOW" ? "LOW" : "MEDIUM",
      components: {
        lane: round(scoreWeights.laneMatchup * lane.score), jungle: round(scoreWeights.jungleInteraction * jungle.score),
        enemyComp: round(scoreWeights.enemyComp * adjustedEnemy), allyComp: round(scoreWeights.allyComp * adjustedAlly),
        population: round(scoreWeights.populationStrength * population.score), pool: affinity, comfort, retention: round(retention),
      },
      matchupDetails: {
        opponent: draft.enemy[draft.lane] || "Laner oculto", score: round(lane.score), impact: round(scoreWeights.laneMatchup * lane.score), tier: lane.tier,
        confidence: lane.confidence, blind: Boolean(lane.blind), advantages: lane.advantages ?? [], risks: lane.risks ?? [],
        signatureAdvantages: lane.signatureAdvantages ?? [], signatureRisks: lane.signatureRisks ?? [], evidence: lane.stat ? {
          delta2: round(lane.stat.delta2), reliability: round(lane.stat.reliability * 100), currentGames: lane.stat.currentGames, stableGames: lane.stat.stableGames,
        } : null,
      },
      mechanicDetails: {
        advantages: [...(lane.signatureAdvantages ?? []), ...(enemyComp.signatureAdvantages ?? [])].slice(0, 8),
        risks: [...(lane.signatureRisks ?? []), ...(enemyComp.signatureRisks ?? [])].slice(0, 8),
      },
      reasons: [...lane.reasons, ...(retention < 0.9 ? [`A matchup limita bônus positivos de composição a ${round(retention * 100)}%.`] : []), ...jungle.reasons, ...enemyComp.reasons, ...allyComp.reasons].slice(0, 9),
    };
  }

  rank(draft, state) {
    const enabledPools = Object.values(state.settings.enabledPools);
    const discoveryMode = enabledPools.length > 0 && enabledPools.every((enabled) => !enabled);
    const entries = state.pools.filter((entry) => entry.lane === draft.lane && state.settings.enabledPools[entry.pool]);
    const variants = [];
    if (discoveryMode) {
      for (const championName of this.laneRoster(draft.lane)) {
        const champion = this.byName.get(championName);
        variants.push({
          id: `discovery:${draft.lane}:${championName}`, champion: championName, lane: draft.lane,
          name: "Build padrão", kind: "DEFAULT", profile: clone(champion.profile), items: [], keystone: "",
          poolEntry: null, discoveryMode: true,
        });
      }
    }
    for (const entry of entries) {
      const champion = this.byName.get(entry.champion);
      if (!champion) continue;
      if (entry.includeDefault !== false) variants.push({ id: `default:${entry.lane}:${entry.champion}`, champion: entry.champion, lane: entry.lane, name: "Build padrão", kind: "DEFAULT", profile: clone(champion.profile), items: [], keystone: "" , poolEntry: entry });
      for (const build of state.builds.filter((build) => build.enabled !== false && build.champion === entry.champion && build.lane === entry.lane)) variants.push({ ...build, kind: "CUSTOM", poolEntry: entry });
    }
    return variants.map((variant) => this.evaluate(variant, draft, variant.poolEntry, state.overrides)).sort((a, b) => {
      const order = { SCORED: 0, HARDCOUNTERED: 1, UNAVAILABLE: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return (b.score ?? -1) - (a.score ?? -1);
    });
  }
}

export { scoreWeights };
