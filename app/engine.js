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
  copy.scale = 10;
  return copy;
}

export function resolveBuildProfile(baseProfile, modifiers = {}) {
  const profile = scale10(baseProfile);
  for (const tag of BUILD_TAGS) profile.strengths[tag] = round(clamp(profile.strengths[tag] + (modifiers.strengths?.[tag] ?? 0), 0, 10));
  for (const tag of RISK_TAGS) profile.weaknesses[tag] = round(clamp(profile.weaknesses[tag] + (modifiers.weaknesses?.[tag] ?? 0), 0, 10));
  profile.confidence = "USER_BUILD";
  return profile;
}

export function modifiersFromProfile(baseProfile, resolvedProfile) {
  const base = scale10(baseProfile);
  const resolved = scale10(resolvedProfile);
  return {
    strengths: Object.fromEntries(BUILD_TAGS.map((tag) => [tag, round(clamp(resolved.strengths[tag] - base.strengths[tag], -10, 10))])),
    weaknesses: Object.fromEntries(RISK_TAGS.map((tag) => [tag, round(clamp(resolved.weaknesses[tag] - base.weaknesses[tag], -10, 10))])),
  };
}

export function inferBuildModifiers(champion, items, keystoneName) {
  const base = scale10(champion.profile);
  const modifiers = { strengths: {}, weaknesses: {} };
  const aggregate = {};
  for (const item of items) {
    for (const [tag, value] of Object.entries(item.signals ?? {})) aggregate[tag] = (aggregate[tag] ?? 0) + value;
  }
  for (const [tag, value] of Object.entries(keystoneSignals[keystoneName] ?? {})) aggregate[tag] = (aggregate[tag] ?? 0) + value;

  for (const tag of BUILD_TAGS) modifiers.strengths[tag] = 0;
  for (const tag of RISK_TAGS) modifiers.weaknesses[tag] = 0;
  for (const [tag, total] of Object.entries(aggregate)) {
    if (!BUILD_TAGS.includes(tag)) continue;
    if (["hp", "defenses", "sustain", "mobility"].includes(tag) && items.length) {
      const chassis = base.chassis?.strengths?.[tag] ?? Math.max(0, base.strengths[tag] - 2);
      const desired = clamp(chassis + total * 1.8, 0, 10);
      modifiers.strengths[tag] = round(clamp(desired - base.strengths[tag], -5, 5));
    } else {
      modifiers.strengths[tag] = round(clamp(total / 1.35, 0, 5));
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

const lanePairs = [
  ["burst", "vulnBurst"], ["dps", "vulnDps"], ["antiTank", "vulnTank"], ["poke", "vulnPoke"],
  ["effectiveRange", "vulnRange"], ["shortTrade", "needsLongFight"], ["cc", "vulnCc"], ["waveclear", "vulnWave"],
  ["earlyPressure", "goldDependent"], ["sustain", "vulnPoke"], ["gapClose", "vulnEngage"],
  ["backlineAccess", "vulnDive"], ["allIn", "lowDurability"], ["stickiness", "immobile"],
];

function lanePressure(attacker, defender) {
  const contributions = [];
  const groups = new Map();
  for (const rule of mechanicRules) {
    const value = (attacker.mechanics?.strengths?.[rule.strength] ?? 0) * (defender.mechanics?.dependencies?.[rule.dependency] ?? 0) / 30 * rule.factor;
    if (value > 0 && (!groups.has(rule.group) || groups.get(rule.group).value < value)) groups.set(rule.group, { value, label: rule.label, specific: true });
  }
  contributions.push(...groups.values());
  for (const [strength, weakness] of lanePairs) {
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
  constructor(champions, matchupSnapshots) {
    this.champions = champions;
    this.byName = new Map(champions.map((champion) => [champion.name, champion]));
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
      delta2, score: clamp(delta2 * 1.8, -9, 9), reliability: combined * (isCustom ? 0.8 : 1),
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

    const own = lanePressure(variant.profile, opponentChampion.profile);
    const enemy = lanePressure(opponentChampion.profile, variant.profile);
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
    if ((stat?.reliability >= 0.4 && robust && stat.delta2 <= -4 && Math.min(specific, structural) <= -3) || rareButExtreme) {
      return { veto: true, reason: `Hardcounter confirmado por estatística bidirecional e execução estrutural: Δ2 ${round(stat.delta2)}.`, evidence: stat };
    }
    const tier = score <= -5 || structural <= -6 || (stat?.reliability >= 0.35 && stat.delta2 <= -3.5) ? "SEVERE_COUNTER"
      : score <= -2.25 || structural <= -3.5 || (stat?.reliability >= 0.25 && stat.delta2 <= -1.5) ? "COUNTERED"
        : score <= -0.75 ? "SLIGHTLY_COUNTERED" : score >= 6.5 ? "HARDCOUNTERS" : score >= 3.5 ? "STRONG_ADVANTAGE" : score >= 1.25 ? "ADVANTAGED" : "EVEN";
    const bestOwn = own.contributions[0];
    const bestEnemy = enemy.contributions[0];
    if (bestOwn) reasons.push(`Favorável: ${bestOwn.label}.`);
    if (bestEnemy) reasons.push(`Risco: ${bestEnemy.label}.`);
    return { score, tier, confidence: stat?.reliability >= 0.55 ? "HIGH" : stat?.reliability >= 0.2 ? "MEDIUM" : "LOW", reasons, stat, mechanical, specific, structural };
  }

  blindLaneScore(variant, lane, overrides) {
    const plausible = [...this.evidence[lane].stable.entries()].filter(([, rows]) => rows.length >= 15).map(([name]) => name).filter((name) => name !== variant.champion);
    const values = plausible.map((opponent) => this.laneScore(variant, opponent, lane, overrides)).filter((row) => !row.veto).map((row) => row.score).sort((a, b) => a - b);
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

  enemyCompScore(profile, enemyNames) {
    const enemies = enemyNames.map((name) => this.byName.get(name)).filter(Boolean);
    const interactions = [];
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
        [Math.max(enemy.profile.strengths.poke ?? 0, enemy.profile.strengths.siege ?? 0), ["vulnPoke", "vulnRange", "immobile"], "poke/range dificulta a execução"],
        [Math.max(enemy.profile.strengths.engage ?? 0, enemy.profile.strengths.backlineAccess ?? 0), ["vulnEngage", "fragileEntry"], "engage pune a entrada"],
        [enemy.profile.strengths.cc ?? 0, ["vulnCc", "fragileEntry"], "controle interrompe a execução"],
        [Math.max(enemy.profile.strengths.disengage ?? 0, enemy.profile.strengths.peel ?? 0, enemy.profile.strengths.mobility ?? 0), ["vulnKite", "vulnDisengage", "needsContact"], "kite nega contato"],
      ];
      for (const [threat, risks, label] of exposures) {
        const risk = Math.max(0, ...risks.map((tag) => profile.weaknesses[tag] ?? 0));
        if (threat * risk > 0) interactions.push({ value: -threat * risk / 30, reason: `Contra ${enemy.name}: ${label}.` });
      }
    }
    const positives = interactions.filter((row) => row.value > 0).sort((a, b) => b.value - a.value).slice(0, 2);
    const negatives = interactions.filter((row) => row.value < 0).sort((a, b) => a.value - b.value).slice(0, 2);
    const score = [...positives, ...negatives].reduce((sum, row, index) => sum + row.value * (index % 2 ? 0.35 : 1), 0) * 2;
    return { score: clamp(score, -10, 10), reasons: [...positives, ...negatives].map((row) => row.reason) };
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
    if (lane.veto) return { ...variant, status: "HARDCOUNTERED", reason: lane.reason, evidence: lane.evidence };
    const jungle = this.jungleScore(variant.profile, draft.ally.JUNGLE, draft.enemy.JUNGLE);
    const enemyComp = this.enemyCompScore(variant.profile, Object.values(draft.enemy).filter(Boolean));
    const allyComp = this.allyCompScore(variant.profile, Object.values(draft.ally).filter(Boolean), Object.values(draft.enemy).filter(Boolean));
    const retention = this.executionRetention(variant.profile, lane.score, lane.tier);
    const adjustedEnemy = enemyComp.score > 0 ? enemyComp.score * retention : enemyComp.score;
    const adjustedAlly = allyComp.score > 0 ? allyComp.score * retention : allyComp.score;
    const population = this.populationStrength(variant.champion, draft.lane);
    const rawScore = scoreWeights.laneMatchup * lane.score + scoreWeights.jungleInteraction * jungle.score + scoreWeights.enemyComp * adjustedEnemy + scoreWeights.allyComp * adjustedAlly + scoreWeights.populationStrength * population.score + poolAffinity[poolEntry.pool] + comfortScore[poolEntry.comfort];
    const score = clamp(Math.round(50 + rawScore), 0, 100);
    const label = score >= 85 ? "Excelente" : score >= 70 ? "Muito bom" : score >= 55 ? "Bom" : score >= 45 ? "Arriscado" : score >= 30 ? "Evitar" : "Não pickar";
    return {
      ...variant, status: "SCORED", score, rawScore: round(rawScore), label, matchupTier: lane.tier,
      confidence: lane.confidence === "LOW" || population.confidence === "LOW" ? "LOW" : "MEDIUM",
      components: {
        lane: round(scoreWeights.laneMatchup * lane.score), jungle: round(scoreWeights.jungleInteraction * jungle.score),
        enemyComp: round(scoreWeights.enemyComp * adjustedEnemy), allyComp: round(scoreWeights.allyComp * adjustedAlly),
        population: round(scoreWeights.populationStrength * population.score), pool: poolAffinity[poolEntry.pool], comfort: comfortScore[poolEntry.comfort], retention: round(retention),
      },
      reasons: [...lane.reasons, ...(retention < 0.9 ? [`A matchup limita bônus positivos de composição a ${round(retention * 100)}%.`] : []), ...jungle.reasons, ...enemyComp.reasons, ...allyComp.reasons].slice(0, 9),
    };
  }

  rank(draft, state) {
    const entries = state.pools.filter((entry) => entry.lane === draft.lane && state.settings.enabledPools[entry.pool]);
    const variants = [];
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
