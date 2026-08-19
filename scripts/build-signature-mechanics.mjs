import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const championFull = JSON.parse(fs.readFileSync(path.join(root, "data/championFull-16.16.1.json"), "utf8"));
const champions = Object.values(championFull.data).sort((a, b) => a.name.localeCompare(b.name));

const t = (label, category, defaults, exploits = [], checkedBy = []) => ({ label, category, defaults, exploits, checkedBy });

export const TAXONOMY = {
  SELF_REVIVE: t("Revive próprio", "survival", { power: 9, laneImpact: 7, draftImpact: 7, reliability: 8, reach: 0, coverage: 1 }, ["commitment", "limitedReset"], ["corpseControl", "secondKill", "antiHeal"]),
  ALLY_REVIVE: t("Revive de aliados", "save", { power: 10, laneImpact: 3, draftImpact: 10, reliability: 6, reach: 7, coverage: 3 }, ["tradeKills", "resetFight"], ["denyTrigger", "focusCaster"]),
  DEATH_PASSIVE: t("Atuação após a morte", "survival", { power: 7, laneImpact: 6, draftImpact: 6, reliability: 9, reach: 4, coverage: 2 }, ["lowRangeCommitment"], ["disengageAfterKill"]),
  DEATH_PREVENTION: t("Impede morte", "save", { power: 10, laneImpact: 7, draftImpact: 10, reliability: 8, reach: 6, coverage: 3 }, ["burst", "execute"], ["disengage", "delayedDamage"]),
  UNTARGETABLE: t("Intargetabilidade", "defense", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 8, reach: 0, coverage: 1 }, ["telegraphedBurst", "targetedSpell"], ["persistentZone", "delayedTiming"]),
  INVULNERABLE: t("Invulnerabilidade", "defense", { power: 10, laneImpact: 7, draftImpact: 10, reliability: 8, reach: 5, coverage: 3 }, ["burst", "execute", "wombo"], ["disengage", "cooldownTracking"]),
  DAMAGE_REDUCTION: t("Redução extrema de dano", "defense", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 9, reach: 0, coverage: 1 }, ["burst", "focusFire"], ["trueDamage", "extendedFight"]),
  CC_CLEANSE: t("Limpeza de controle", "defense", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 9, reach: 0, coverage: 1 }, ["singleCcSetup", "pick"], ["suppressionException", "repeatedCc"]),
  CC_IMMUNITY: t("Imunidade a controle", "defense", { power: 10, laneImpact: 9, draftImpact: 9, reliability: 9, reach: 0, coverage: 1 }, ["ccDependent", "antiEngage"], ["kiteWithoutCc", "damageCheck"]),
  UNSTOPPABLE: t("Imparável durante ação", "defense", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 9, reach: 4, coverage: 1 }, ["displacement", "interrupt"], ["postCastCc", "terrain"]),
  SPELL_SHIELD: t("Escudo de habilidade", "defense", { power: 8, laneImpact: 9, draftImpact: 7, reliability: 7, reach: 0, coverage: 1 }, ["singleSpellSetup", "hook", "pick"], ["pokeRemoval", "multiSpell"]),
  PROJECTILE_DENIAL: t("Negação de projéteis", "denial", { power: 10, laneImpact: 9, draftImpact: 9, reliability: 8, reach: 4, coverage: 4 }, ["projectileReliant", "rangedCarry"], ["nonProjectile", "meleeAccess"]),
  PROJECTILE_REFLECTION: t("Reflexão de projéteis", "denial", { power: 10, laneImpact: 10, draftImpact: 9, reliability: 7, reach: 2, coverage: 2 }, ["projectileReliant", "highValueProjectile"], ["nonProjectile", "baitWindow"]),
  OUTSIDE_ZONE_IMMUNITY: t("Imunidade a ameaças externas", "denial", { power: 10, laneImpact: 9, draftImpact: 10, reliability: 9, reach: 0, coverage: 1 }, ["longRange", "backlineDamage"], ["enterZone", "meleeThreat"]),
  ATTACK_EVASION: t("Evasão de ataques", "denial", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 9, reach: 2, coverage: 3 }, ["autoAttackDependent", "onHit"], ["spellDamage", "waitWindow"]),
  BLIND: t("Blind", "denial", { power: 9, laneImpact: 9, draftImpact: 7, reliability: 8, reach: 6, coverage: 1 }, ["autoAttackDependent", "empoweredAttack"], ["spellDamage", "cleanse"]),
  REACTIVE_PARRY: t("Parry reativo", "denial", { power: 10, laneImpact: 10, draftImpact: 8, reliability: 6, reach: 3, coverage: 1 }, ["telegraphedCc", "singleBurstWindow"], ["unpredictableCc", "repeatedDamage", "bait"]),
  STASIS: t("Stasis", "denial", { power: 10, laneImpact: 7, draftImpact: 10, reliability: 7, reach: 8, coverage: 5 }, ["engageWindow", "objectiveTiming", "towerDive"], ["misuse", "reengage"]),
  REALM_ISOLATION: t("Isolamento em outra dimensão", "isolation", { power: 10, laneImpact: 10, draftImpact: 10, reliability: 8, reach: 5, coverage: 1 }, ["externalSetup", "singleProtector", "teamReliant"], ["duelLoss", "rangeDenial", "castImmunity"]),
  TARGET_ISOLATION: t("Isolamento de alvo", "isolation", { power: 9, laneImpact: 9, draftImpact: 9, reliability: 8, reach: 5, coverage: 1 }, ["backline", "protector"], ["peel", "unstoppable"]),
  STAT_STEAL: t("Roubo de atributos", "isolation", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 9, reach: 5, coverage: 1 }, ["statCheck", "singleCarry"], ["kite", "duelLoss"]),
  POSSESSION: t("Possessão e uso do kit inimigo", "identity", { power: 10, laneImpact: 3, draftImpact: 10, reliability: 6, reach: 4, coverage: 1 }, ["valuableBasicKit", "resetFight"], ["denyTakedown", "badTarget"]),
  ULTIMATE_THEFT: t("Roubo de ultimate", "identity", { power: 10, laneImpact: 5, draftImpact: 10, reliability: 8, reach: 7, coverage: 1 }, ["highValueUltimate"], ["lowValueUltimate", "poorScaling"]),
  TERRAIN_CREATION: t("Criação de terreno", "space", { power: 10, laneImpact: 9, draftImpact: 10, reliability: 8, reach: 8, coverage: 4 }, ["needsContact", "chargePath", "immobile", "formation"], ["blink", "terrainCross", "dashOverWall"]),
  PATH_DENIAL: t("Bloqueio de trajetória", "space", { power: 9, laneImpact: 8, draftImpact: 9, reliability: 8, reach: 7, coverage: 4 }, ["chargePath", "corridor", "needsContact"], ["blink", "alternatePath"]),
  DASH_DENIAL: t("Interrupção de dash", "space", { power: 10, laneImpact: 10, draftImpact: 9, reliability: 9, reach: 3, coverage: 4 }, ["dashReliant", "conditionalMobility"], ["blink", "walkIn", "range"]),
  GROUNDING: t("Grounding", "space", { power: 10, laneImpact: 10, draftImpact: 9, reliability: 8, reach: 5, coverage: 3 }, ["dashReliant", "escapeCast"], ["range", "zoneExit"]),
  DISPLACEMENT: t("Deslocamento", "control", { power: 8, laneImpact: 8, draftImpact: 8, reliability: 7, reach: 4, coverage: 3 }, ["channel", "formation", "positionReliant"], ["unstoppable", "spellShield"]),
  SUPPRESSION: t("Supressão", "control", { power: 10, laneImpact: 10, draftImpact: 9, reliability: 8, reach: 5, coverage: 1 }, ["mobileCarry", "singleThreat"], ["range", "interruptCaster", "immunity"]),
  RELIABLE_CC: t("Controle confiável", "control", { power: 8, laneImpact: 9, draftImpact: 8, reliability: 9, reach: 5, coverage: 1 }, ["mobileCarry", "fragileEntry"], ["range", "spellShield", "cleanse", "peel"]),
  LONG_RANGE_CC: t("Controle de longo alcance", "control", { power: 8, laneImpact: 7, draftImpact: 9, reliability: 5, reach: 10, coverage: 2 }, ["immobile", "siege"], ["dodge", "projectileDenial"]),
  SILENCE: t("Silêncio", "control", { power: 8, laneImpact: 9, draftImpact: 7, reliability: 8, reach: 5, coverage: 2 }, ["spellCombo", "channel"], ["range", "tenacity"]),
  POLYMORPH: t("Polimorfia", "control", { power: 10, laneImpact: 9, draftImpact: 9, reliability: 10, reach: 6, coverage: 1 }, ["diver", "resetCarry"], ["range", "cleanse"]),
  SLEEP_SETUP: t("Sono e amplificação do próximo dano", "control", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 5, reach: 8, coverage: 1 }, ["immobile", "singleTargetBurst"], ["bodyBlock", "cleanse", "projectileDenial"]),
  FORCED_BERSERK: t("Berserk entre inimigos", "control", { power: 10, laneImpact: 5, draftImpact: 10, reliability: 6, reach: 9, coverage: 5 }, ["autoAttackCarry", "clusteredComp"], ["dodge", "projectileDenial", "spread"]),
  PERSISTENT_ZONE: t("Zona persistente", "space", { power: 8, laneImpact: 8, draftImpact: 9, reliability: 8, reach: 7, coverage: 4 }, ["needsContact", "corridor", "objectiveFight"], ["range", "disengage", "zoneExit"]),
  TRAP_CONTROL: t("Armadilhas e preparação de terreno", "space", { power: 8, laneImpact: 8, draftImpact: 9, reliability: 6, reach: 8, coverage: 4 }, ["objectiveSetup", "predictablePath"], ["sweeper", "rangeClear", "fastEngage"]),
  GLOBAL_JOIN: t("Entrada global ou semiglobal", "map", { power: 9, laneImpact: 5, draftImpact: 9, reliability: 7, reach: 10, coverage: 2 }, ["sideLane", "numbersAdvantage"], ["interrupt", "vision", "disengage"]),
  GLOBAL_DAMAGE: t("Dano global ou semiglobal", "map", { power: 8, laneImpact: 5, draftImpact: 8, reliability: 8, reach: 10, coverage: 5 }, ["lowHealth", "crossMapFight"], ["healing", "shield"]),
  GLOBAL_SAVE: t("Proteção global", "map", { power: 10, laneImpact: 5, draftImpact: 10, reliability: 8, reach: 10, coverage: 2 }, ["dive", "crossMapPick"], ["interrupt", "antiShield", "bait"]),
  GLOBAL_VISION: t("Visão global", "map", { power: 7, laneImpact: 4, draftImpact: 8, reliability: 10, reach: 10, coverage: 5 }, ["fog", "objectiveSetup", "stealth"], ["none"]),
  STEALTH: t("Invisibilidade", "access", { power: 8, laneImpact: 8, draftImpact: 8, reliability: 8, reach: 2, coverage: 1 }, ["targeting", "backlineAccess"], ["reveal", "areaDamage", "trueSight"]),
  CAMOUFLAGE: t("Camuflagem", "access", { power: 8, laneImpact: 5, draftImpact: 9, reliability: 7, reach: 8, coverage: 1 }, ["vision", "flank", "pick"], ["controlWard", "proximity", "reveal"]),
  REVEAL: t("Revelação e visão verdadeira", "vision", { power: 7, laneImpact: 7, draftImpact: 8, reliability: 8, reach: 8, coverage: 2 }, ["stealth", "fog"], ["range", "disengage"]),
  VISION_DENIAL: t("Negação de visão", "vision", { power: 8, laneImpact: 5, draftImpact: 9, reliability: 8, reach: 6, coverage: 4 }, ["wardSetup", "pick"], ["sweeper", "formation"]),
  SUMMON: t("Unidade invocada", "object", { power: 7, laneImpact: 8, draftImpact: 7, reliability: 8, reach: 5, coverage: 2 }, ["skillshotBlock", "zone", "siege"], ["aoe", "smite", "realmIsolation"]),
  ALLY_SAVE: t("Retirada ou proteção direta de aliado", "save", { power: 10, laneImpact: 7, draftImpact: 10, reliability: 8, reach: 5, coverage: 1 }, ["dive", "singleTargetBurst"], ["interrupt", "antiShield", "separation"]),
  ALLY_ATTACH: t("Anexação a aliado", "save", { power: 9, laneImpact: 6, draftImpact: 9, reliability: 10, reach: 5, coverage: 1 }, ["singleCarry", "targeting"], ["hostDeath", "separation"]),
  PORTAL: t("Portal de terreno", "map", { power: 9, laneImpact: 7, draftImpact: 9, reliability: 7, reach: 7, coverage: 5 }, ["terrain", "escape", "engagePath"], ["enemyUse", "interceptExit"]),
  WALL_CROSS: t("Travessia de terreno", "access", { power: 7, laneImpact: 7, draftImpact: 8, reliability: 8, reach: 6, coverage: 1 }, ["terrain", "pathDenial"], ["grounding", "dashDenial"]),
  EXECUTE: t("Execução", "damage", { power: 9, laneImpact: 8, draftImpact: 8, reliability: 8, reach: 5, coverage: 1 }, ["lowHealth", "shieldTiming"], ["invulnerability", "untargetable", "healBeforeThreshold"]),
  OBJECTIVE_EXECUTE: t("Execução ou segurança de objetivo", "objective", { power: 10, laneImpact: 3, draftImpact: 9, reliability: 9, reach: 2, coverage: 1 }, ["epicMonster", "smiteFight"], ["denyAccess", "burstSteal"]),
  SHIELD_BREAK: t("Quebra de escudo", "denial", { power: 9, laneImpact: 8, draftImpact: 9, reliability: 9, reach: 5, coverage: 2 }, ["shieldDependent", "enchanter"], ["range", "timing"]),
  ANTI_HEAL: t("Redução de cura incorporada", "denial", { power: 8, laneImpact: 8, draftImpact: 8, reliability: 8, reach: 6, coverage: 3 }, ["healingDependent", "drainTank"], ["range", "cleanseWindow"]),
  INFINITE_SCALING: t("Escalonamento infinito", "scaling", { power: 8, laneImpact: 4, draftImpact: 8, reliability: 8, reach: 0, coverage: 1 }, ["slowGame"], ["earlyPressure", "denyStacks"]),
  FORM_SHIFT: t("Mudança de forma ou arsenal", "identity", { power: 8, laneImpact: 7, draftImpact: 8, reliability: 7, reach: 0, coverage: 1 }, ["adaptation"], ["wrongForm", "timingWindow"]),
  RESET_CHAIN: t("Reset de abate", "snowball", { power: 9, laneImpact: 5, draftImpact: 9, reliability: 6, reach: 5, coverage: 5 }, ["lowHealthTeam", "chaoticFight"], ["focus", "disengage", "denyTakedown"]),
  TOWER_DISABLE: t("Desabilita torre", "objective", { power: 9, laneImpact: 8, draftImpact: 7, reliability: 9, reach: 5, coverage: 2 }, ["towerDive"], ["disengage", "counterDive"]),
  STRUCTURE_EXECUTE: t("Execução de estrutura", "objective", { power: 9, laneImpact: 7, draftImpact: 8, reliability: 10, reach: 2, coverage: 1 }, ["siege", "sideLane"], ["waveclear", "engage"]),
  TRUE_DAMAGE: t("Dano verdadeiro estrutural", "damage", { power: 8, laneImpact: 8, draftImpact: 8, reliability: 8, reach: 3, coverage: 1 }, ["highResists", "tank"], ["hp", "range", "denyAccess"]),
  PERCENT_HEALTH_DAMAGE: t("Dano percentual de vida", "damage", { power: 8, laneImpact: 7, draftImpact: 8, reliability: 8, reach: 3, coverage: 1 }, ["highHp", "frontline"], ["range", "denyAccess"]),
  SINGLE_TARGET_AMPLIFICATION: t("Amplificação contra alvo isolado ou marcado", "damage", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 7, reach: 5, coverage: 1 }, ["isolatedTarget", "pick"], ["bodyBlock", "formation"]),
  CLONE_DECEPTION: t("Clone e engano", "access", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 6, reach: 3, coverage: 2 }, ["targetedSpell", "fog"], ["reveal", "aoe", "discipline"]),
  DAMAGE_REDIRECT: t("Redirecionamento de dano", "save", { power: 8, laneImpact: 7, draftImpact: 9, reliability: 8, reach: 5, coverage: 1 }, ["focusFire", "singleCarry"], ["aoe", "separation"]),
  AUTO_MODIFIER: t("Ataques com regra própria", "identity", { power: 7, laneImpact: 8, draftImpact: 6, reliability: 10, reach: 5, coverage: 1 }, ["itemSynergy", "attackPattern"], ["blind", "attackEvasion", "attackSpeedControl"]),
  MARKED_FOLLOW: t("Perseguição ou recast em alvo marcado", "access", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 7, reach: 7, coverage: 1 }, ["mobileTarget", "escape"], ["spellShield", "untargetable", "dangerousFollow"]),
  CHANNEL: t("Canalização central", "dependency", { power: 7, laneImpact: 6, draftImpact: 8, reliability: 6, reach: 7, coverage: 4 }, ["protectedCast"], ["interrupt", "displacement", "silence"]),
  EXTERNAL_OBJECT_DEPENDENCY: t("Dependência de objetos externos", "dependency", { power: 8, laneImpact: 8, draftImpact: 7, reliability: 7, reach: 4, coverage: 2 }, ["preparedGround"], ["realmIsolation", "objectClear", "reposition"]),
  POSITIONAL_SWEETSPOT: t("Zona de acerto ou posição específica", "dependency", { power: 8, laneImpact: 9, draftImpact: 7, reliability: 6, reach: 5, coverage: 2 }, ["predictableMovement"], ["mobility", "range", "displacement"]),
  ANTI_MAGIC: t("Defesa especialmente eficiente contra magia", "defense", { power: 8, laneImpact: 9, draftImpact: 8, reliability: 9, reach: 0, coverage: 1 }, ["magicHeavy", "apBurst"], ["physicalDamage", "trueDamage", "mixedDamage"]),
  ATTACK_SPEED_REDUCTION: t("Redução de velocidade de ataque", "denial", { power: 8, laneImpact: 8, draftImpact: 8, reliability: 8, reach: 4, coverage: 3 }, ["autoAttackDependent", "onHit"], ["spellDamage", "ccImmunity", "range"]),
  DIRECTIONAL_DEFENSE: t("Defesa direcional", "defense", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 7, reach: 0, coverage: 2 }, ["frontalBurst", "telegraphedDamage"], ["flank", "backlineAccess", "waitWindow"]),
  ALLY_LINK: t("Habilidade vinculada a aliado", "save", { power: 8, laneImpact: 7, draftImpact: 9, reliability: 8, reach: 6, coverage: 2 }, ["singleCarry", "coordinatedFight"], ["separation", "range", "focusCaster"]),
  DAMAGE_AMPLIFICATION: t("Amplificação de dano recebido", "damage", { power: 8, laneImpact: 8, draftImpact: 8, reliability: 7, reach: 6, coverage: 3 }, ["focusFire", "burstWindow"], ["cleanse", "untargetable", "disengage"]),
  FORCED_RETURN: t("Retorno forçado a uma posição", "dependency", { power: 8, laneImpact: 9, draftImpact: 8, reliability: 10, reach: 5, coverage: 1 }, ["safeAnchor", "shortTrade"], ["anchorPunish", "delayedCc", "persistentZone"]),
  RANGE_AMPLIFICATION: t("Aumento excepcional de alcance", "access", { power: 8, laneImpact: 7, draftImpact: 9, reliability: 9, reach: 9, coverage: 3 }, ["shortRangeEnemy", "siege"], ["hardEngage", "separation"]),
  SLOW_IMMUNITY: t("Imunidade a slows", "defense", { power: 8, laneImpact: 9, draftImpact: 8, reliability: 10, reach: 0, coverage: 1 }, ["slowDependent", "kite"], ["hardCc", "terrain", "rawSpeed"]),
  TETHER: t("Vínculo que pune afastamento tardio", "control", { power: 8, laneImpact: 9, draftImpact: 8, reliability: 6, reach: 6, coverage: 2 }, ["needsContact", "shortRange"], ["breakRange", "cleanse", "untargetable"]),
  ABILITY_ARSENAL: t("Arsenal de habilidades selecionável", "identity", { power: 9, laneImpact: 8, draftImpact: 9, reliability: 7, reach: 7, coverage: 4 }, ["adaptation", "setup"], ["wrongSequence", "cooldownWindow"]),
  HEAL_AMPLIFICATION: t("Amplificação de cura e escudo", "save", { power: 8, laneImpact: 7, draftImpact: 9, reliability: 10, reach: 5, coverage: 4 }, ["sustainComp", "enchanter"], ["antiHeal", "burst", "separation"]),
  DAMAGE_REFLECTION: t("Reflexão ou devolução de dano", "denial", { power: 8, laneImpact: 9, draftImpact: 8, reliability: 9, reach: 1, coverage: 2 }, ["autoAttackDependent", "rapidHits"], ["spellDamage", "waitWindow", "range"]),
  TEAM_MOBILITY: t("Mobilidade coletiva", "map", { power: 8, laneImpact: 5, draftImpact: 9, reliability: 8, reach: 8, coverage: 5 }, ["engage", "disengage", "rotation"], ["terrain", "hardCc", "splitFormation"]),
};

const s = (slot, type, note, overrides = {}) => ({ slot, type, note, confidence: "CURATED", ...overrides });

const CURATED = {
  // Entries are added alphabetically below. Each champion receives only mechanics
  // that can materially change a matchup or a draft, not every line of the kit.
  Aatrox: [
    s("Q", "POSITIONAL_SWEETSPOT", "Três zonas diferentes; mobilidade e interrupção reduzem drasticamente dano e knockups.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 5, coverage: 3 }),
    s("W", "PATH_DENIAL", "O alvo precisa abandonar a zona ou será puxado de volta; forte após setup, fraco contra mobilidade livre.", { power: 7, reach: 6, coverage: 1 }),
    s("R", "RESET_CHAIN", "Abates prolongam a janela de velocidade, dano e cura, mudando lutas em sequência.", { power: 8 }),
  ],
  Ahri: [
    s("E", "LONG_RANGE_CC", "Charm interrompe movimentos e é a condição central do pick; projéteis, minions e spell shields reduzem a entrega.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 8, coverage: 1 }),
    s("R", "RESET_CHAIN", "Múltiplos dashes com recargas adicionais após takedown permitem novo acesso ou saída.", { power: 8, laneImpact: 8, draftImpact: 8, reach: 6, coverage: 2 }),
  ],
  Akali: [
    s("W", "STEALTH", "Shroud nega seleção e cria janela de espera; revelação verdadeira e dano em área preservam resposta.", { power: 9, laneImpact: 10, draftImpact: 8, reliability: 8, coverage: 2 }),
    s("E", "MARKED_FOLLOW", "O recast acompanha deslocamentos extremos do alvo, mas pode levar Akali para uma posição suicida.", { power: 9, reach: 9 }),
    s("R", "EXECUTE", "Segundo dash escala com vida perdida e atravessa a luta; controle confiável pune a trajetória.", { power: 8, laneImpact: 9, draftImpact: 8, reach: 6, coverage: 2 }),
  ],
  Akshan: [
    s("W", "ALLY_REVIVE", "Matar o Scoundrel revive aliados abatidos por ele; valor cresce em lutas com trocas de abates.", { power: 10, laneImpact: 4, reliability: 6, coverage: 4 }),
    s("E", "WALL_CROSS", "Swing depende de terreno e é encerrado por colisão; zonas fechadas podem ampliar ou destruir a rota.", { power: 8, laneImpact: 9, draftImpact: 7, reach: 7 }),
    s("R", "SINGLE_TARGET_AMPLIFICATION", "Execução canalizada pode ser bloqueada por campeão, minion ou estrutura; formação importa mais que alcance nominal.", { power: 7, reach: 10, reliability: 5 }),
  ],
  Alistar: [
    s("W", "RELIABLE_CC", "Headbutt é point-and-click, mas exige alcance curto e pode salvar o alvo se a direção for ruim.", { power: 8, reach: 3, coverage: 1 }),
    s("Q", "DISPLACEMENT", "Knockup em área converte W, Flash ou engage aliado e interrompe canais.", { power: 9, reach: 2, coverage: 4 }),
    s("R", "CC_CLEANSE", "Remove CC e abre uma janela de redução extrema de dano para absorver foco e torre.", { power: 10, laneImpact: 8, draftImpact: 9 }),
    s("R", "DAMAGE_REDUCTION", "Permite comprometer a posição sem explodir; dano verdadeiro e luta prolongada continuam válidos.", { power: 10, laneImpact: 7, draftImpact: 9 }),
  ],
  Ambessa: [
    s("P", "MARKED_FOLLOW", "Cada habilidade pode virar um dash curto; grounding e anti-dash afetam praticamente todo o padrão de troca.", { power: 9, laneImpact: 10, draftImpact: 9, reach: 4, coverage: 1 }),
    s("R", "SUPPRESSION", "Blink em linha alcança o campeão mais distante atingido e suprime; depende de alinhamento, não de atravessar a frontline.", { power: 10, reach: 8, coverage: 1 }),
  ],
  Amumu: [
    s("Q", "LONG_RANGE_CC", "Duas Bandage Toss oferecem engage repetido, mas continuam sendo projéteis bloqueáveis.", { power: 8, reach: 8, reliability: 6, coverage: 1 }),
    s("W", "PERCENT_HEALTH_DAMAGE", "Dano contínuo de vida máxima pune frontlines quando Amumu consegue permanecer próximo.", { power: 8, reach: 1, coverage: 4 }),
    s("R", "RELIABLE_CC", "Stun em área ao redor do corpo; excelente follow-up, condicionado ao acesso.", { power: 10, reach: 2, coverage: 5, accessRequired: true }),
  ],
  Anivia: [
    s("P", "SELF_REVIVE", "Ovo exige um segundo abate localizado e pode ser protegido por aliados, parede e ultimate.", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 8 }),
    s("W", "TERRAIN_CREATION", "Parede impassável corta cargas, separa formações e multiplica valor contra composições curtas.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 8, coverage: 5 }),
    s("R", "PERSISTENT_ZONE", "Zona contínua de dano e slow domina corredores, mas pode ser interrompida ao controlar Anivia.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 8, coverage: 5 }),
  ],
  Annie: [
    s("P", "RELIABLE_CC", "Stun preparado transforma Q em controle point-and-click ou W/R em controle de área; o estado da passiva é visível.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 5, coverage: 4 }),
    s("R", "SUMMON", "Tibbers cria unidade persistente, bloqueia skillshots e mantém pressão após o burst.", { power: 8, laneImpact: 8, draftImpact: 7, coverage: 2 }),
  ],
  Aphelios: [
    s("P", "FORM_SHIFT", "Cinco armas e ordem de munição mudam alcance, sustain, área, controle e DPS; a janela atual deve ser conhecida.", { power: 10, laneImpact: 9, draftImpact: 10, reliability: 5 }),
    s("Q", "RELIABLE_CC", "Gravitum converte slows aplicados em root à distância, mas só existe quando a arma está disponível.", { power: 8, laneImpact: 8, draftImpact: 8, reach: 8, reliability: 7 }),
    s("Q", "SUMMON", "A sentry de Crescendum cria objeto de zona e aplicação da arma secundária.", { power: 7, laneImpact: 7, draftImpact: 7 }),
  ],
  Ashe: [
    s("P", "AUTO_MODIFIER", "Autos aplicam slow permanente; reduz valor de campeões sem gap close repetido e sofre contra imunidade/cleanse.", { power: 8, laneImpact: 9, draftImpact: 8, reach: 8 }),
    s("E", "GLOBAL_VISION", "Hawkshot verifica rota, objetivo e flanco no mapa inteiro sem exigir combate.", { power: 8 }),
    s("R", "LONG_RANGE_CC", "Stun global cresce com distância; alto impacto, mas projétil lento permite dodge e negação.", { power: 10, laneImpact: 7, draftImpact: 10, reach: 10, reliability: 5, coverage: 2 }),
  ],
  "Aurelion Sol": [
    s("P", "INFINITE_SCALING", "Stardust aumenta área, execução e alcance de múltiplas habilidades; tempo de jogo muda a identidade do kit.", { power: 10, draftImpact: 10 }),
    s("Q", "CHANNEL", "Dano sustentado exige manter linha no mesmo alvo e pode ser interrompido ou quebrado por range.", { power: 9, laneImpact: 8, draftImpact: 8, reach: 7, coverage: 2 }),
    s("E", "EXECUTE", "Black hole puxa e executa por limiar, ficando mais largo com stacks.", { power: 9, reach: 8, coverage: 4 }),
    s("R", "DISPLACEMENT", "Versão evoluída cria knockup enorme e onda global; depende de Stardust acumulado.", { power: 10, laneImpact: 6, draftImpact: 10, reach: 9, coverage: 5 }),
  ],
  Aurora: [
    s("W", "STEALTH", "Salto seguido de invisibilidade oferece reposicionamento, mas área e revelação ainda conectam.", { power: 8, reach: 4 }),
    s("R", "PERSISTENT_ZONE", "Cria área que desacelera inimigos e permite teleporte entre bordas, redefinindo espaço de luta.", { power: 9, laneImpact: 8, draftImpact: 9, reach: 6, coverage: 5 }),
  ],
  Azir: [
    s("W", "SUMMON", "Soldados substituem autos e definem alcance/DPS; deslocar ou sair da zona remove aplicação.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 8, coverage: 3 }),
    s("E", "EXTERNAL_OBJECT_DEPENDENCY", "Dash exige soldado existente; destruir a formação ou negar posição muda escape e engage.", { power: 8, laneImpact: 9, draftImpact: 7 }),
    s("R", "TERRAIN_CREATION", "Parede móvel desloca e depois bloqueia passagem, separando engage e backline.", { power: 10, reach: 5, coverage: 5 }),
  ],
  Bard: [
    s("E", "PORTAL", "Túnel atravessa terreno para ambos os times; oferece rota única de engage/escape que pode ser armadilha.", { power: 9, laneImpact: 7, draftImpact: 10 }),
    s("R", "STASIS", "Coloca campeões, monstros, minions e torres em stasis; pode iniciar, salvar, negar objetivo ou arruinar a própria luta.", { power: 10, reliability: 5, reach: 10, coverage: 5 }),
  ],
  "Bel'Veth": [
    s("Q", "FORM_SHIFT", "Quatro direções têm cooldown separado; paredes e grounding restringem rotas disponíveis.", { power: 8, laneImpact: 9, draftImpact: 7, reach: 4 }),
    s("E", "DAMAGE_REDUCTION", "Canal enraizado reduz dano e executa o alvo de menor vida; hard CC interrompe a janela.", { power: 9, laneImpact: 9, draftImpact: 8 }),
    s("R", "SUMMON", "Coral de monstro épico habilita enxame de Remora e pressão estrutural excepcional.", { power: 9, laneImpact: 3, draftImpact: 9, coverage: 5 }),
  ],
  Blitzcrank: [
    s("Q", "LONG_RANGE_CC", "Hook reposiciona completamente o primeiro alvo atingido; minions, summons e negação de projétil são counters centrais.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 9, reliability: 5 }),
    s("R", "SHIELD_BREAK", "Remove escudos próximos antes do dano e silêncio, mudando matchups contra enchanters e shield stacks.", { power: 10, laneImpact: 8, draftImpact: 9, reach: 2, coverage: 5 }),
    s("R", "SILENCE", "Silêncio em área interrompe canais e impede resposta imediata após o hook.", { power: 8, reach: 2, coverage: 4 }),
  ],
  Brand: [
    s("P", "PERSISTENT_ZONE", "Três aplicações detonam em área e espalham pressão; composições agrupadas aumentam muito o dano.", { power: 9, laneImpact: 8, draftImpact: 9, coverage: 5 }),
    s("Q", "LONG_RANGE_CC", "Stun só existe no alvo já em chamas, tornando aplicação anterior e bloqueio do projétil decisivos.", { power: 8, laneImpact: 9, draftImpact: 7, reach: 8, reliability: 6 }),
  ],
  Braum: [
    s("P", "RELIABLE_CC", "Após a primeira aplicação, autos aliados acumulam o stun; composições de ataque rápido convertem melhor.", { power: 9, laneImpact: 9, draftImpact: 9, reach: 5, reliability: 8 }),
    s("E", "PROJECTILE_DENIAL", "Intercepta todos os projéteis na direção e anula o primeiro dano; posicionamento lateral contorna.", { power: 10, reach: 2, coverage: 5 }),
  ],
  Briar: [
    s("W", "FORM_SHIFT", "Frenzy entrega controle parcial ao jogo e persegue o alvo; pode ser explorada com isca, invisibilidade e reposicionamento.", { power: 9, laneImpact: 9, draftImpact: 8, reliability: 6 }),
    s("R", "LONG_RANGE_CC", "Projétil semiglobal leva Briar ao alvo e inicia Frenzy; acertar o alvo errado pode perder a luta.", { power: 9, reach: 10, reliability: 4, coverage: 1 }),
  ],
  Caitlyn: [
    s("W", "TRAP_CONTROL", "Armadilhas controlam corredores e convertem CC aliado em headshot; exigem preparação ou setup.", { power: 9, laneImpact: 10, draftImpact: 9, reach: 7, coverage: 4 }),
    s("E", "DISPLACEMENT", "Recuo próprio cria distância e atravessa paredes finas, mas é um projétil e tem trajetória previsível.", { power: 7, laneImpact: 8, draftImpact: 6, reach: 5, coverage: 1 }),
    s("R", "SINGLE_TARGET_AMPLIFICATION", "Execução de longo alcance pode ser bloqueada por outro campeão, premiando formação e frontline.", { power: 8, reach: 10, reliability: 7 }),
  ],
  Camille: [
    s("E", "WALL_CROSS", "Hookshot exige terreno para estender engage e stun; zonas abertas reduzem alcance prático.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 8 }),
    s("R", "TARGET_ISOLATION", "Ult point-and-click prende um alvo e expulsa os demais, anulando escapes mas não dano externo posterior.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 5 }),
    s("Q", "TRUE_DAMAGE", "Segundo Q converte dano em verdadeiro após espera; kite e negar recast reduzem o anti-tank.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 2 }),
  ],
  Cassiopeia: [
    s("W", "GROUNDING", "Miasma bloqueia habilidades de movimento dentro da área; enorme contra dashes, irrelevante se o alvo luta fora dela.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 6, coverage: 4 }),
    s("R", "POSITIONAL_SWEETSPOT", "Stun depende de o inimigo estar olhando para Cassiopeia; de costas recebe apenas slow.", { power: 9, laneImpact: 9, draftImpact: 9, reach: 5, coverage: 5 }),
  ],
  "Cho'Gath": [
    s("W", "SILENCE", "Silêncio em cone impede combo e canais antes do knockup ou execute.", { power: 8, laneImpact: 9, draftImpact: 8, reach: 5, coverage: 3 }),
    s("R", "OBJECTIVE_EXECUTE", "Dano verdadeiro de alto valor garante monstros e acumula vida; acesso corpo a corpo continua obrigatório.", { power: 10, laneImpact: 8, draftImpact: 9, reach: 1 }),
    s("R", "TRUE_DAMAGE", "Execute point-and-click ignora resistências e pune alvos sem ferramenta de negar o limiar.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 1 }),
  ],
  Corki: [
    s("P", "AUTO_MODIFIER", "Parte dos autos vira dano verdadeiro, reduzindo eficiência de resistências tradicionais.", { power: 8, laneImpact: 8, draftImpact: 7, reach: 7 }),
    s("E", "PERSISTENT_ZONE", "Cone contínuo reduz Armor e MR, valorizando aliados que batem no mesmo alvo.", { power: 7, laneImpact: 7, draftImpact: 8, reach: 5, coverage: 3 }),
    s("R", "POSITIONAL_SWEETSPOT", "Mísseis acumulam e cada terceiro é ampliado; engage durante baixa munição reduz poke.", { power: 8, laneImpact: 8, draftImpact: 8, reach: 9, reliability: 6 }),
  ],
  Darius: [
    s("Q", "POSITIONAL_SWEETSPOT", "Lâmina externa cura e causa dano maior; entrar no cabo ou deslocar durante o cast quebra trocas.", { power: 10, laneImpact: 10, draftImpact: 7, reach: 3, coverage: 4 }),
    s("R", "RESET_CHAIN", "Execução em dano verdadeiro reseta após abate e espalha Noxian Might, permitindo limpar a luta.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 2, coverage: 5 }),
    s("R", "TRUE_DAMAGE", "Ignora resistências, mas exige stacks e contato; kite continua sendo o counter principal.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 1 }),
  ],
  Diana: [
    s("E", "MARKED_FOLLOW", "Dash point-and-click reseta em alvo marcado pelo Q, deixando o segundo acesso dependente do acerto inicial.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 6 }),
    s("R", "DISPLACEMENT", "Puxa inimigos próximos e escala com múltiplos alvos; enorme com follow-up, exige entrada corporal.", { power: 10, laneImpact: 8, draftImpact: 10, reach: 2, coverage: 5 }),
  ],
  "Dr. Mundo": [
    s("P", "SPELL_SHIELD", "Resiste ao primeiro efeito imobilizante e pode recuperar a lata; poke ou CC descartável remove a proteção.", { power: 9, laneImpact: 10, draftImpact: 8, reliability: 9 }),
    s("R", "DAMAGE_REDUCTION", "Regeneração massiva funciona como janela anti-burst prolongada; anti-heal e dano sustentado continuam centrais.", { power: 9, laneImpact: 9, draftImpact: 8 }),
  ],
  Draven: [
    s("Q", "POSITIONAL_SWEETSPOT", "Catching axes revela trajetórias e mantém dano; zoneamento do ponto de queda derruba seu DPS.", { power: 10, laneImpact: 10, draftImpact: 8, reliability: 7, reach: 7 }),
    s("P", "RESET_CHAIN", "Cash-in converte uma kill em pico econômico, enquanto morrer remove stacks e muda a lane.", { power: 8, laneImpact: 10, draftImpact: 6, reliability: 5 }),
  ],
  Ekko: [
    s("W", "POSITIONAL_SWEETSPOT", "Stun e shield exigem prever onde Ekko entrará segundos depois; setup aliado aumenta confiabilidade.", { power: 9, laneImpact: 8, draftImpact: 9, reach: 7, coverage: 4 }),
    s("R", "UNTARGETABLE", "Fica inalvejável e retorna à posição do clone, curando e causando dano; rastrear o clone limita a fuga.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 7, coverage: 3 }),
  ],
  Elise: [
    s("E", "LONG_RANGE_CC", "Cocoon é a condição de pick e pode ser bloqueado por minions, summons e negação de projétil.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 8, reliability: 5 }),
    s("R", "FORM_SHIFT", "Forma humana oferece range/setup; aranha oferece execute, sustain e acesso, mudando resistências e padrão.", { power: 9, laneImpact: 9, draftImpact: 8 }),
    s("E", "UNTARGETABLE", "Rappel remove Elise do mapa brevemente e permite descer em alvo; sem unidade próxima perde reposicionamento.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 6 }),
  ],
  Evelynn: [
    s("P", "CAMOUFLAGE", "Camuflagem permanente após nível 6 muda visão e posicionamento; control wards e proximidade revelam.", { power: 10, laneImpact: 6, draftImpact: 10, reach: 9 }),
    s("W", "SINGLE_TARGET_AMPLIFICATION", "Charm carregado revela a direção de Evelynn e reduz resistências; ativação precoce troca controle por surpresa.", { power: 9, laneImpact: 7, draftImpact: 9, reach: 7 }),
    s("R", "UNTARGETABLE", "Execute em área torna Evelynn inalvejável e a reposiciona para trás, negando resposta imediata.", { power: 10, laneImpact: 8, draftImpact: 9, reach: 4, coverage: 3 }),
  ],
  Ezreal: [
    s("Q", "POSITIONAL_SWEETSPOT", "DPS e redução de cooldown dependem de acertar skillshots bloqueáveis; frontline e minions alteram alvo.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 9, reliability: 6 }),
    s("E", "WALL_CROSS", "Blink curto prioriza alvo marcado, oferecendo escape contra trajetórias mas sofrendo com grounding.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 5 }),
    s("R", "GLOBAL_DAMAGE", "Projétil global atravessa unidades e afeta waves/lutas, mas é telegráfico e perde dano por alvo.", { power: 8, reliability: 6 }),
  ],
  Fiddlesticks: [
    s("P", "VISION_DENIAL", "Effigies combinam ward e sweeper após nível, habilitando medo fora de visão.", { power: 8, laneImpact: 5, draftImpact: 9, reach: 6, coverage: 4 }),
    s("W", "CHANNEL", "Drain em área cura e executa no final; interrupção antes do último tick remove grande parte do valor.", { power: 9, laneImpact: 9, draftImpact: 9, reach: 3, coverage: 5 }),
    s("R", "CHANNEL", "Canal fora de visão seguido de blink cria engage em área; visão e interrupção antes da chegada são counters.", { power: 10, laneImpact: 7, draftImpact: 10, reach: 8, coverage: 5 }),
  ],
  Fiora: [
    s("W", "REACTIVE_PARRY", "Nega todo dano/CC da janela e devolve stun se bloquear imobilização; previsibilidade e leitura mecânica decidem a matchup.", { power: 10, laneImpact: 10, draftImpact: 8, reliability: 6, reach: 4 }),
    s("P", "TRUE_DAMAGE", "Vitals causam dano verdadeiro percentual e exigem acesso direcional; parede e posicionamento escondem pontos.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 2 }),
    s("R", "DEATH_PREVENTION", "Completar Vitals ou matar o alvo cria cura em área, virando duelo em sustain coletivo.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 3, coverage: 3 }),
  ],
  Fizz: [
    s("E", "UNTARGETABLE", "Playful/Trickster nega habilidades e reposiciona; cooldown usado para dano abre janela de punição.", { power: 10, laneImpact: 10, draftImpact: 8, reach: 4, coverage: 2 }),
    s("R", "SINGLE_TARGET_AMPLIFICATION", "Peixe cresce com distância e entrega slow/knockup para o all-in; projétil e spell shield respondem.", { power: 9, laneImpact: 9, draftImpact: 8, reach: 9, reliability: 5, coverage: 3 }),
  ],
  Galio: [
    s("W", "ANTI_MAGIC", "Shield mágico e redução de dano durante a carga tornam Galio especialmente eficiente contra burst AP; dano físico e poke repetido contornam.", { power: 9, laneImpact: 10, coverage: 1 }),
    s("W", "RELIABLE_CC", "Taunt em área exige Galio próximo e reduz mobilidade enquanto carrega; alcance e interrupção antes da entrada limitam a entrega.", { power: 9, reach: 2, coverage: 5, accessRequired: true }),
    s("R", "GLOBAL_SAVE", "Salta em aliado e concede defesa mágica antes do knockup; depende de aliado-âncora e pode ser interrompido durante o canal.", { power: 10, reach: 10, coverage: 5 }),
  ],
  Gangplank: [
    s("W", "CC_CLEANSE", "Remove controle e cura; reduz muito o valor de uma única iniciação, mas não impede reaplicação, knockups posteriores ou burst durante cooldown.", { power: 10, laneImpact: 10 }),
    s("E", "EXTERNAL_OBJECT_DEPENDENCY", "Barril armazena dano, ignora parte da armadura e cria cadeia; inimigos à distância podem desarmar o objeto e quebrar a geometria.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 9, coverage: 5 }),
    s("R", "GLOBAL_DAMAGE", "Zona global de slow e dano influencia qualquer luta e corta retirada, sem exigir que Gangplank abandone a side.", { power: 9, reach: 10, coverage: 5 }),
  ],
  Garen: [
    s("W", "DAMAGE_REDUCTION", "Janela inicial reduz muito dano e concede tenacidade; premiar o timing errado ou prolongar a troca reduz sua eficiência.", { power: 9, laneImpact: 10 }),
    s("Q", "SILENCE", "Ataque fortalecido remove slows e silencia, mas exige contato corpo a corpo e pode ser negado por kite, blind ou evasão.", { power: 8, laneImpact: 9, reach: 1 }),
    s("R", "EXECUTE", "Dano verdadeiro cresce com vida perdida; cura/escudo antes do impacto e negar alcance mudam o limiar.", { power: 10, laneImpact: 10, reach: 2 }),
  ],
  Gnar: [
    s("P", "FORM_SHIFT", "Rage força janelas separadas de ranged poke e Mega Gnar; engage inimigo pode esperar a forma errada.", { power: 10, laneImpact: 10, draftImpact: 10, reliability: 6 }),
    s("R", "POSITIONAL_SWEETSPOT", "Deslocamento em área só atordoa e amplifica junto a terreno; parede criada por aliados aumenta confiabilidade.", { power: 10, reach: 3, coverage: 5, reliability: 6 }),
  ],
  Gragas: [
    s("E", "RELIABLE_CC", "Body Slam intercepta entradas e combina com Flash, mas para no primeiro alvo e requer alcance corporal.", { power: 9, laneImpact: 10, reach: 3, coverage: 2 }),
    s("R", "DISPLACEMENT", "Explosive Cask separa carry, desfaz engage ou entrega alvo; direção errada também salva o inimigo.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 8, coverage: 5, reliability: 6 }),
    s("W", "DAMAGE_REDUCTION", "Redução durante a animação absorve janela curta de burst, mas não resolve DPS prolongado.", { power: 7, laneImpact: 8 }),
  ],
  Graves: [
    s("P", "AUTO_MODIFIER", "Pellets colidem com a primeira unidade e recarregam em duas munições; minions e frontline reduzem acesso ao alvo.", { power: 9, laneImpact: 10, draftImpact: 8, reach: 4 }),
    s("W", "VISION_DENIAL", "Smoke Screen remove visão dentro da área, quebrando ataques e habilidades direcionadas mesmo sem hard CC.", { power: 9, laneImpact: 9, draftImpact: 9, reach: 7, coverage: 4 }),
  ],
  Gwen: [
    s("W", "OUTSIDE_ZONE_IMMUNITY", "Ameaças fora da névoa não podem atingi-la; composições de longo alcance precisam entrar no espaço dela ou esperar a janela.", { power: 10, laneImpact: 10, draftImpact: 10, coverage: 1 }),
    s("Q", "TRUE_DAMAGE", "Centro do corte converte dano em verdadeiro e aplica a passiva; deslocar Gwen ou sair do centro reduz drasticamente o resultado.", { power: 9, laneImpact: 10, reach: 2, coverage: 2 }),
    s("P", "PERCENT_HEALTH_DAMAGE", "Dano percentual e cura dão resposta natural a muita vida, condicionados a contato contínuo.", { power: 9, laneImpact: 9 }),
  ],
  Hecarim: [
    s("E", "DISPLACEMENT", "Carga point-and-click empurra conforme a direção de contato; terreno e peel podem fazê-lo entregar o alvo para o lado errado.", { power: 8, reach: 6, coverage: 1 }),
    s("R", "UNSTOPPABLE", "A carga é imparável e atravessa a frontline; o fear ocorre na onda final, então posicionamento ainda determina quem é controlado.", { power: 9, reach: 8, coverage: 5 }),
  ],
  Heimerdinger: [
    s("Q", "SUMMON", "Torres criam território e DPS automático; deslocar a luta, limpar objetos ou isolar Heimer remove a base do kit.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 7, coverage: 5 }),
    s("Q", "EXTERNAL_OBJECT_DEPENDENCY", "Grande parte do dano e do beam depende de torres preparadas e habilidades acertadas na área.", { power: 10, laneImpact: 10, draftImpact: 9 }),
    s("R", "ABILITY_ARSENAL", "Ultimate escolhe uma versão ampliada de Q/W/E: zona, burst de alcance ou controle repetido conforme a necessidade.", { power: 9, laneImpact: 9, draftImpact: 10, coverage: 5 }),
  ],
  Hwei: [
    s("Q", "ABILITY_ARSENAL", "Três opções de dano cobrem poke, vida máxima e zona; usar uma bloqueia as demais até o cooldown.", { power: 9, laneImpact: 9, draftImpact: 9, reach: 9, coverage: 4 }),
    s("E", "ABILITY_ARSENAL", "Escolhe fear de linha, zona anti-avanço ou pull; ferramenta correta depende da trajetória inimiga.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 8, coverage: 5 }),
  ],
  Illaoi: [
    s("P", "SUMMON", "Tentáculos são objetos persistentes que definem dano e cura; lutar fora deles reduz muito o stat-check.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 5, coverage: 4 }),
    s("E", "EXTERNAL_OBJECT_DEPENDENCY", "Spirit permite causar dano ao campeão por um proxy estacionário; minions bloqueiam e range quebra o tether.", { power: 10, laneImpact: 10, draftImpact: 8, reach: 7, reliability: 5 }),
    s("R", "PERSISTENT_ZONE", "Quanto mais campeões e espíritos próximos, mais tentáculos; isolamento, disengage e Mordekaiser R retiram seu ecossistema.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 2, coverage: 5 }),
  ],
  Irelia: [
    s("Q", "RESET_CHAIN", "Dash reseta em alvo marcado ou abatido; wave e marcas funcionam como rede de acesso, enquanto anti-dash quebra a sequência.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 6, coverage: 3 }),
    s("W", "DAMAGE_REDUCTION", "Canal reduz dano físico muito mais que mágico e fixa Irelia no lugar; CC não interrompe, mas zona e magia punem.", { power: 9, laneImpact: 10, draftImpact: 7 }),
  ],
  Ivern: [
    s("Q", "ALLY_LINK", "Root cria uma rota de dash para Ivern e aliados até o alcance de ataque; pode facilitar entrada de melees ou expô-los.", { power: 8, reach: 8, coverage: 2 }),
    s("W", "TERRAIN_CREATION", "Cria arbusto e altera visão/auto range; também pode ocultar inimigos e deve ser avaliado pela geometria.", { power: 7, laneImpact: 6, draftImpact: 8, reach: 7, coverage: 3 }),
    s("R", "SUMMON", "Daisy é frontline controlável e aplica knockup após ataques; Smite, burst e isolamento reduzem seu valor.", { power: 9, draftImpact: 9, coverage: 3 }),
  ],
  Janna: [
    s("Q", "PATH_DENIAL", "Tornado carregado cobre uma linha e interrompe dashes; é forte em trajetórias previsíveis, mas lento sem preparação.", { power: 9, laneImpact: 9, draftImpact: 9, reach: 9, coverage: 3 }),
    s("R", "DISPLACEMENT", "Knockback imediato reseta engage e depois canaliza cura; interrupção posterior remove sustain, não o afastamento inicial.", { power: 10, laneImpact: 8, draftImpact: 10, reach: 2, coverage: 5 }),
  ],
  "Jarvan IV": [
    s("R", "TERRAIN_CREATION", "Arena prende alvos sem dash sobre parede, mas pode aprisionar aliados e é removível pelo próprio Jarvan.", { power: 10, laneImpact: 8, draftImpact: 10, reach: 5, coverage: 4 }),
    s("Q", "EXTERNAL_OBJECT_DEPENDENCY", "Knockup e dash surgem apenas ao conectar Q à bandeira; negar a linha ou separar cooldowns remove engage.", { power: 9, reach: 7, coverage: 3 }),
  ],
  Jax: [
    s("E", "ATTACK_EVASION", "Ignora ataques e reduz dano de habilidades em área antes do stun; excelente contra on-hit, bem menos contra spell DPS.", { power: 10, laneImpact: 10, draftImpact: 9, coverage: 4 }),
    s("Q", "ALLY_LINK", "Salta em unidades aliadas, inimigas ou wards; disponibilidade de âncoras muda acesso e fuga.", { power: 8, laneImpact: 9, reach: 6, coverage: 1 }),
  ],
  Jayce: [
    s("R", "FORM_SHIFT", "Alterna range/poke e forma melee com resistências, burst e disengage; forma errada abre janela clara.", { power: 9, laneImpact: 10, draftImpact: 8 }),
    s("E", "DISPLACEMENT", "Martelo afasta point-and-click e interrompe entrada, exigindo contato corporal.", { power: 8, reach: 1, coverage: 1 }),
    s("E", "RANGE_AMPLIFICATION", "Acceleration Gate amplia velocidade e alcance prático do Shock Blast e acelera aliados.", { power: 9, reach: 9, coverage: 3 }),
  ],
  Jhin: [
    s("P", "AUTO_MODIFIER", "Quatro tiros, recarga fixa e AS convertido em dano tornam sua cadência previsível; divers exploram a janela e Jhin não produz DPS contínuo comum.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 7 }),
    s("W", "LONG_RANGE_CC", "Root longo só ocorre após dano prévio de Jhin/aliado e continua sendo projétil estreito; é follow-up, não engage confiável isolado.", { power: 8, reach: 10, reliability: 5 }),
    s("R", "CHANNEL", "Quatro tiros de enorme alcance exigem linha e proteção; dive, flanco e frontline bloqueando anulam a janela.", { power: 9, reach: 10, coverage: 3, reliability: 6 }),
  ],
  Jinx: [
    s("P", "RESET_CHAIN", "Estruturas, campeões e monstros épicos abatidos dão velocidade/AS e permitem encadear luta e objetivo.", { power: 10, draftImpact: 10, coverage: 5 }),
    s("E", "TRAP_CONTROL", "Chompers criam parede curta que enraíza após armar; excelente follow-up, fraca como resposta instantânea no corpo.", { power: 8, reach: 7, coverage: 3, reliability: 6 }),
    s("R", "GLOBAL_DAMAGE", "Foguete escala com distância e vida perdida, mas para no primeiro campeão e pode ser interceptado.", { power: 8, reach: 10, coverage: 3, reliability: 6 }),
  ],
  "K'Sante": [
    s("W", "UNSTOPPABLE", "Durante a preparação fica imparável e reduz dano; direção e tempo são telegráficos e ele perde distância se interromper cedo.", { power: 9, laneImpact: 10, draftImpact: 8 }),
    s("R", "TARGET_ISOLATION", "Empurra o alvo através de parede e separa a luta; sem terreno perde alcance e K'Sante sacrifica vida/resistências.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 3 }),
    s("R", "FORM_SHIFT", "All Out troca defesa por dano/mobilidade, então a mesma entrada pode ser ótima para matar e péssima para sobreviver.", { power: 10, laneImpact: 10, draftImpact: 9 }),
  ],
  "Kai'Sa": [
    s("R", "MARKED_FOLLOW", "Dash de longo alcance só pode ir ao redor de inimigo marcado por plasma; aliado com hard CC aumenta muito a entrega.", { power: 9, reach: 9, coverage: 1 }),
    s("Q", "SINGLE_TARGET_AMPLIFICATION", "Mísseis distribuem entre alvos próximos; isolamento concentra dano, wave e summons diluem.", { power: 9, laneImpact: 9, reach: 6, coverage: 1 }),
  ],
  Kalista: [
    s("P", "AUTO_MODIFIER", "Cada ataque permite salto, mas slows reduzem distância/ritmo e o dano do auto tem regra própria; anti-dash e AS slow são excepcionais.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 6 }),
    s("E", "OBJECTIVE_EXECUTE", "Rend acumula lanças sem limite prático e reseta ao executar; segurança cresce com tempo livre batendo.", { power: 9, laneImpact: 7, draftImpact: 9, reach: 7 }),
    s("R", "ALLY_SAVE", "Puxa o aliado vinculado para intargetabilidade e permite que ele se arremesse; separação e vínculo escolhido limitam.", { power: 10, reach: 10, coverage: 2 }),
  ],
  Karma: [
    s("R", "ABILITY_ARSENAL", "Mantra transforma Q em poke/zone, W em sustain prolongado e E em mobilidade/escudo coletivo.", { power: 9, laneImpact: 9, draftImpact: 10, coverage: 5 }),
    s("W", "TETHER", "Root exige manter vínculo por toda duração; mobilidade e range quebram, aproximação sem saída é punida.", { power: 8, laneImpact: 9, reach: 6 }),
  ],
  Karthus: [
    s("P", "DEATH_PASSIVE", "Continua lançando por alguns segundos após morrer e torna-se inalvejável; matar no centro da equipe ainda pode favorecer Karthus.", { power: 10, laneImpact: 7, draftImpact: 10, coverage: 5 }),
    s("R", "GLOBAL_DAMAGE", "Dano global em todos os vivos após canal; stasis, escudo, cura e interrupção antes da morte respondem.", { power: 10, reach: 10, coverage: 5 }),
    s("R", "CHANNEL", "O canal visível cria janela de interrupção se Karthus estiver vivo e acessível.", { power: 8, reliability: 8 }),
  ],
  Kassadin: [
    s("R", "WALL_CROSS", "Blink de cooldown baixo acumula custo e dano; mana e grounding limitam quantos reposicionamentos existem.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 6 }),
    s("P", "ANTI_MAGIC", "Redução de dano mágico e ghosting favorecem lanes AP e trânsito por wave; matchups AD ignoram a principal defesa.", { power: 8, laneImpact: 10, draftImpact: 7 }),
  ],
  Katarina: [
    s("P", "RESET_CHAIN", "Takedowns reduzem drasticamente cooldowns e permitem limpar lutas; negar o primeiro abate é mais valioso que CC tardio.", { power: 10, draftImpact: 10, coverage: 5 }),
    s("P", "EXTERNAL_OBJECT_DEPENDENCY", "Adagas no chão definem dano e rotas de Shunpo; zonear o ponto de queda prevê a próxima posição.", { power: 10, laneImpact: 10, reach: 5, coverage: 3 }),
    s("R", "CHANNEL", "Ultimate em área é interrompida por hard CC/silêncio e exige entrada corporal.", { power: 9, laneImpact: 9, reach: 2, coverage: 5 }),
  ],
  Kayle: [
    s("P", "FORM_SHIFT", "Níveis 6/11/16 alteram alcance e área; pressão precoce e tempo de escala mudam completamente o draft.", { power: 10, laneImpact: 7, draftImpact: 10 }),
    s("R", "INVULNERABLE", "Torna a si ou aliado invulnerável e depois causa dano em área; força espera e nega execução.", { power: 10, reach: 6, coverage: 4 }),
  ],
  Kayn: [
    s("P", "FORM_SHIFT", "Rhaast e Shadow Assassin respondem a frontline/sustain ou backline frágil; a forma precisa ser tratada como variante.", { power: 10, draftImpact: 10, reliability: 7 }),
    s("E", "WALL_CROSS", "Move-se por paredes e cura, tornando visão e rotas tradicionais menos confiáveis; dano/CC encurtam a travessia.", { power: 10, reach: 9 }),
    s("R", "UNTARGETABLE", "Entra em alvo previamente danificado e fica inalvejável; stasis/torre/aliados podem preparar a saída.", { power: 10, reach: 6 }),
  ],
  Kennen: [
    s("P", "RELIABLE_CC", "Três marcas atordoam; aplicações vêm de fontes distintas e a terceira pode ser preparada, mas não é controle instantâneo do zero.", { power: 9, laneImpact: 9, draftImpact: 9, coverage: 4 }),
    s("R", "PERSISTENT_ZONE", "Tempestade móvel aplica múltiplas marcas em área; precisa entrar, sofre com disengage e domina comps agrupadas.", { power: 10, reach: 2, coverage: 5 }),
  ],
  "Kha'Zix": [
    s("Q", "SINGLE_TARGET_AMPLIFICATION", "Dano aumenta em alvo isolado; minions, aliados e summons próximos removem a condição.", { power: 10, laneImpact: 9, draftImpact: 9, reach: 2 }),
    s("R", "STEALTH", "Invisibilidade repetida quebra seleção e reposiciona; revelação e dano em área reduzem janela.", { power: 9, coverage: 1 }),
    s("E", "RESET_CHAIN", "Com evolução, abates resetam o salto e permitem limpar backline; sem primeiro takedown a saída falta.", { power: 9, draftImpact: 9, reach: 7 }),
  ],
  Kindred: [
    s("P", "INFINITE_SCALING", "Marcas aumentam alcance e habilidades; a rota de caça é pública e contestável.", { power: 9, draftImpact: 9 }),
    s("R", "DEATH_PREVENTION", "Todos dentro da área, inclusive inimigos, não podem morrer e são curados ao final; displacement e timing decidem quem ganha.", { power: 10, laneImpact: 7, draftImpact: 10, coverage: 5 }),
  ],
  Kled: [
    s("P", "FORM_SHIFT", "Desmonta em vez de morrer e pode remontar por coragem; burst na forma desmontada nega a segunda barra.", { power: 10, laneImpact: 10, draftImpact: 8, reliability: 6 }),
    s("R", "GLOBAL_JOIN", "Carga semiglobal cria caminho e persegue o primeiro campeão encontrado; trajetórias e interceptação da frontline importam.", { power: 9, reach: 10, coverage: 5 }),
  ],
  "Kog'Maw": [
    s("P", "DEATH_PASSIVE", "Após morrer ganha velocidade e explode em dano verdadeiro; espaçar depois do abate evita troca gratuita.", { power: 7, laneImpact: 7, draftImpact: 6 }),
    s("W", "PERCENT_HEALTH_DAMAGE", "Alcance e dano mágico percentual durante janela limitada destroem frontline; dive e espera do cooldown respondem.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 9 }),
  ],
  LeBlanc: [
    s("P", "CLONE_DECEPTION", "Ao ficar baixa cria clone e invisibilidade curta; AoE, reveal e leitura de movimento reduzem engano.", { power: 8, laneImpact: 9 }),
    s("W", "FORCED_RETURN", "Dash deixa âncora para retorno opcional; zona persistente e CC atrasado podem punir exatamente a saída.", { power: 10, laneImpact: 10, draftImpact: 8, reach: 7 }),
    s("E", "TETHER", "Corrente precisa conectar e manter alcance para enraizar; minions bloqueiam o projétil e mobilidade quebra vínculo.", { power: 9, laneImpact: 10, reach: 8, reliability: 5 }),
  ],
  "Lee Sin": [
    s("Q", "MARKED_FOLLOW", "Segundo Q acompanha o alvo marcado e escala com vida perdida; pode levar Lee a counter-engage ou stasis.", { power: 9, reach: 9 }),
    s("W", "ALLY_LINK", "Dash em aliado/ward oferece rota de fuga ou reposicionamento; negar wards/âncoras reduz segurança.", { power: 9, reach: 7 }),
    s("R", "DISPLACEMENT", "Kick point-and-click desloca um alvo e knockupa os atravessados; posição relativa vale mais que dano.", { power: 10, reach: 2, coverage: 5 }),
  ],
  Leona: [
    s("E", "LONG_RANGE_CC", "Projétil atravessa minions e leva Leona ao último campeão atingido; pode ser usado contra ela ao puxá-la para zona ruim.", { power: 9, reach: 8, reliability: 6 }),
    s("Q", "RELIABLE_CC", "Stun por ataque é confiável depois que Leona toca o alvo; range/peel são a defesa real.", { power: 9, reach: 1 }),
    s("R", "LONG_RANGE_CC", "Centro atordoa e borda desacelera; follow-up aumenta confiabilidade, cast isolado é desviável.", { power: 9, reach: 10, coverage: 5, reliability: 5 }),
  ],
  Lillia: [
    s("P", "PERCENT_HEALTH_DAMAGE", "Habilidades aplicam burn percentual e cura; exige acertos repetidos e espaço para orbitar.", { power: 8, laneImpact: 8, draftImpact: 8, reach: 6, coverage: 5 }),
    s("R", "SLEEP_SETUP", "Pode adormecer à distância todos marcados pela passiva; cleanse, spell shield e não ser atingido antes quebram setup.", { power: 10, reach: 10, coverage: 5, reliability: 7 }),
  ],
  Lissandra: [
    s("R", "RELIABLE_CC", "No inimigo é stun point-and-click; em si mesma é stasis e cura. A escolha muda engage, anti-dive e sobrevivência.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 5, coverage: 4 }),
    s("R", "STASIS", "Autocast nega burst e cria zona; o inimigo pode esperar e cercar a saída.", { power: 10, coverage: 4 }),
    s("P", "SUMMON", "Inimigos mortos próximos viram thralls explosivos, aumentando muito luta em sequência e espaços apertados.", { power: 8, draftImpact: 9, coverage: 5 }),
  ],
  Locke: [
    s("E", "MARKED_FOLLOW", "Teleporta e então atravessa o próximo alvo, criando acesso condicionado e posição final previsível.", { power: 8, laneImpact: 8, reach: 6 }),
    s("R", "EXECUTE", "Artefato vincula, causa dano e pode selar campeões em limiar, concedendo poder adicional; negar a finalização limita escala.", { power: 9, laneImpact: 8, draftImpact: 8, reach: 6 }),
  ],
  Lucian: [
    s("P", "AUTO_MODIFIER", "Após habilidade dispara dois ataques e interage com buffs aliados; blind/evasão e falta de janela corporal reduzem combo.", { power: 9, laneImpact: 10, reach: 6 }),
    s("R", "CHANNEL", "Rajada de projéteis em uma direção permite mover, mas é bloqueada por unidades e interrompida por CC.", { power: 9, reach: 9, coverage: 2 }),
  ],
  Lulu: [
    s("W", "POLYMORPH", "Point-and-click remove ataque e habilidades do diver; alcance curto significa que Lulu deve estar próxima do alvo protegido.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 6 }),
    s("R", "ALLY_SAVE", "Concede vida, knockup e slow ao redor do aliado sem ser projétil; excelente contra commit corporal.", { power: 10, reach: 7, coverage: 4 }),
    s("E", "REVEAL", "Pix acompanha inimigo e concede visão verdadeira, reduzindo stealth e clone deception.", { power: 8, reach: 7 }),
  ],
  Lux: [
    s("Q", "LONG_RANGE_CC", "Root acerta até dois alvos, mas minions consomem um e projétil pode ser desviado/negado.", { power: 9, laneImpact: 9, reach: 9, coverage: 2, reliability: 5 }),
    s("E", "PERSISTENT_ZONE", "Área revela, desacelera e pode ser mantida para negar corredor antes da explosão.", { power: 8, laneImpact: 9, draftImpact: 8, reach: 9, coverage: 4 }),
  ],
  Malphite: [
    s("E", "ATTACK_SPEED_REDUCTION", "Ground Slam reduz AS em área e é excepcional contra auto-attackers que precisam entrar.", { power: 9, laneImpact: 9, reach: 2, coverage: 4 }),
    s("R", "UNSTOPPABLE", "Dash imparável em área ignora peel durante a trajetória, mas ainda depende de alcance e pode ser antecipado por Flash/stasis.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 8, coverage: 5 }),
  ],
  Malzahar: [
    s("P", "SPELL_SHIELD", "Bloqueia dano e CC até ser removido; poke barato abre janela antes do all-in.", { power: 9, laneImpact: 10 }),
    s("R", "SUPPRESSION", "Supressão point-and-click trava um alvo, mas também canaliza Malzahar; range, QSS e interrupção do caster respondem.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 6 }),
    s("W", "SUMMON", "Voidlings aumentam shove e bloqueiam skillshots, porém morrem para AoE e isolamento.", { power: 7, laneImpact: 8 }),
  ],
  Maokai: [
    s("W", "UNTARGETABLE", "Durante o dash point-and-click fica inalvejável e acompanha movimento do alvo; pode ser levado para posição ruim.", { power: 9, laneImpact: 9, reach: 5 }),
    s("E", "TRAP_CONTROL", "Saplings dão visão e zona, amplificados em arbusto; sweeper e summons absorvem.", { power: 8, draftImpact: 9, reach: 8, coverage: 4 }),
    s("R", "LONG_RANGE_CC", "Raízes largas avançam lentamente e são bloqueadas por campeões; ótima cobertura, baixa surpresa sem flanco.", { power: 9, reach: 10, coverage: 5, reliability: 5 }),
  ],
  "Master Yi": [
    s("Q", "UNTARGETABLE", "Alpha Strike evita alvo durante a animação e termina próximo da unidade; timing de CC/zona na saída é decisivo.", { power: 10, laneImpact: 10, reach: 6, coverage: 4 }),
    s("W", "DAMAGE_REDUCTION", "Meditate reduz dano e cura enquanto canaliza; hard CC interrompe e dano verdadeiro reduz vantagem.", { power: 9, laneImpact: 9 }),
    s("R", "SLOW_IMMUNITY", "Ignora slows e ganha resets parciais em takedown; hard CC e terreno substituem kite por slow.", { power: 10, draftImpact: 9 }),
  ],
  Mel: [
    s("W", "PROJECTILE_REFLECTION", "Reflete projéteis hostis, previne dano e acelera Mel; habilidades centrais refletíveis podem inverter completamente a matchup.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 1, coverage: 3 }),
    s("E", "PERSISTENT_ZONE", "Zona enraíza no centro e desacelera ao redor, protegendo espaço contra entrada previsível.", { power: 9, reach: 8, coverage: 4 }),
    s("R", "GLOBAL_DAMAGE", "Detona Overwhelm em todos os inimigos marcados, transformando poke distribuído em alcance global condicional.", { power: 9, reach: 10, coverage: 5 }),
  ],
  Milio: [
    s("W", "RANGE_AMPLIFICATION", "Aumenta alcance de ataque de aliados dentro da fogueira, mudando quem consegue tocar a frontline sem entrar no engage.", { power: 10, reach: 6, coverage: 4 }),
    s("R", "CC_CLEANSE", "Cura e limpa CC de aliados em grande área, mas Milio precisa não estar controlado e não remove todas as categorias.", { power: 10, laneImpact: 8, draftImpact: 10, coverage: 5 }),
    s("Q", "DISPLACEMENT", "Projétil empurra o primeiro inimigo e explode atrás; minions podem virar ferramenta ou bloqueio.", { power: 8, reach: 8, coverage: 3 }),
  ],
  "Miss Fortune": [
    s("Q", "POSITIONAL_SWEETSPOT", "Bounce usa ângulo da primeira unidade e pode critar ao abater; posicionamento atrás da wave cria lane muito diferente.", { power: 8, laneImpact: 9, reach: 7 }),
    s("R", "CHANNEL", "Cone enorme de dano exige canal protegido; qualquer interrupção ou saída lateral corta grande parte do valor.", { power: 10, draftImpact: 10, reach: 9, coverage: 5 }),
  ],
  Mordekaiser: [
    s("R", "REALM_ISOLATION", "Remove alvo e Mordekaiser da luta, levando apenas entidades da dimensão correspondente; desmonta protetores, summons, zonas e setup externo.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 6 }),
    s("R", "STAT_STEAL", "Rouba atributos do alvo durante o duelo e os mantém até reviver se matar; comps sem dano de duelo não conseguem resgatar o escolhido.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 6 }),
    s("Q", "SINGLE_TARGET_AMPLIFICATION", "Obliterate causa mais dano quando atinge apenas um alvo; wave e summons diluem na lane.", { power: 9, laneImpact: 10, reach: 5 }),
  ],
  Morgana: [
    s("E", "SPELL_SHIELD", "Bloqueia dano mágico e CC enquanto existir; dano físico não remove, poke mágico prepara a quebra.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 7 }),
    s("Q", "LONG_RANGE_CC", "Root muito longo, porém projétil lento e bloqueável; setup e corredores elevam confiabilidade.", { power: 9, reach: 9, reliability: 4 }),
    s("R", "TETHER", "Correntes em área precisam permanecer conectadas para stun; stasis/mobilidade ajudam Morgana, disengage quebra.", { power: 9, reach: 3, coverage: 5 }),
  ],
  Naafiri: [
    s("P", "SUMMON", "Cães bloqueiam skillshots e ampliam dano, mas AoE os remove e abre janela antes do respawn.", { power: 8, laneImpact: 9, coverage: 3 }),
    s("W", "MARKED_FOLLOW", "Dash direcionado pode ser interceptado por outro campeão e tem canal visível; frontline e peel decidem a entrega.", { power: 9, reach: 8, reliability: 6 }),
    s("R", "RESET_CHAIN", "Ultimate concede pack, visão e shield que pode renovar no primeiro takedown; negar a primeira kill reduz muito o snowball.", { power: 8, draftImpact: 8 }),
  ],
  Nami: [
    s("Q", "LONG_RANGE_CC", "Bolha suspende em área, mas tem atraso alto e funciona melhor como follow-up ou em trajetória forçada.", { power: 9, reach: 8, coverage: 3, reliability: 4 }),
    s("R", "LONG_RANGE_CC", "Onda larga atravessa a luta e acelera aliados tocados; projétil lento permite reposicionamento lateral.", { power: 10, reach: 10, coverage: 5, reliability: 6 }),
  ],
  Nasus: [
    s("Q", "INFINITE_SCALING", "Last hits acumulam dano sem limite, tornando negação de wave e tempo de jogo componentes centrais.", { power: 10, laneImpact: 7, draftImpact: 9 }),
    s("W", "ATTACK_SPEED_REDUCTION", "Wither point-and-click aplica slow crescente e redução de AS, excepcional contra carries sem cleanse ou dash.", { power: 10, laneImpact: 10, reach: 6 }),
    s("R", "PERCENT_HEALTH_DAMAGE", "Zona corporal de vida máxima, resistências e Q acelerado transforma duelo prolongado; kite nega tudo simultaneamente.", { power: 9, reach: 1, coverage: 3 }),
  ],
  Nautilus: [
    s("P", "RELIABLE_CC", "Primeiro auto em cada alvo enraíza; confiável após contato, inútil sem acesso.", { power: 9, reach: 1, coverage: 1 }),
    s("Q", "LONG_RANGE_CC", "Hook colide com terreno e unidades; parede pode servir de mobilidade, minion/summon protege carry.", { power: 9, reach: 8, reliability: 5 }),
    s("R", "RELIABLE_CC", "Ultimate point-and-click persegue e knockupa o alvo, também atingindo quem cruza; range inicial ainda limita cast.", { power: 10, reach: 7, coverage: 4 }),
  ],
  Neeko: [
    s("P", "CLONE_DECEPTION", "Disfarça-se como aliado, minion ou unidade e altera informação de draft em campo; dano/reveal quebram.", { power: 9, laneImpact: 8, draftImpact: 10 }),
    s("W", "CLONE_DECEPTION", "Clone e invisibilidade curta criam rota falsa e podem bloquear projétil.", { power: 8, laneImpact: 8 }),
    s("R", "DISPLACEMENT", "Salto/knockup em área pode ocultar preparação pelo disfarce; precisa entrar e sofre contra spacing.", { power: 10, reach: 3, coverage: 5 }),
  ],
  Nidalee: [
    s("R", "FORM_SHIFT", "Forma humana entrega poke/cura; cougar converte marca em acesso e execute. Sem spear/trap, entrada perde alcance.", { power: 9, laneImpact: 9, draftImpact: 8 }),
    s("Q", "SINGLE_TARGET_AMPLIFICATION", "Javelin cresce com distância e é bloqueável; corredores e CC aliado aumentam muito o valor.", { power: 9, reach: 10, reliability: 4 }),
    s("W", "TRAP_CONTROL", "Armadilha revela e marca, preparando cougar e visão de flanco; sweeper e frontline absorvem.", { power: 7, draftImpact: 8, reach: 8 }),
  ],
  Nilah: [
    s("W", "ATTACK_EVASION", "Evita ataques e reduz dano mágico, podendo compartilhar a aliados tocados; spell damage físico ainda conecta.", { power: 10, laneImpact: 10, draftImpact: 9, coverage: 3 }),
    s("P", "HEAL_AMPLIFICATION", "Amplifica cura/escudo recebido e compartilha sustain, tornando enchanters mais valiosos.", { power: 8, laneImpact: 8, draftImpact: 8 }),
    s("R", "DISPLACEMENT", "Canal corporal puxa inimigos e cura; precisa sobreviver na entrada e pode ser afastada/interrompida.", { power: 9, reach: 2, coverage: 5 }),
  ],
  Nocturne: [
    s("W", "SPELL_SHIELD", "Bloqueia uma habilidade e concede AS se acionado; poke/isca remove antes do controle central.", { power: 9, laneImpact: 9 }),
    s("R", "VISION_DENIAL", "Remove visão e comunicação espacial inimiga durante a janela, quebrando saves e follow-up mesmo sem usar o dash.", { power: 10, draftImpact: 10, reach: 10, coverage: 5 }),
    s("R", "GLOBAL_JOIN", "Dash direcionado a um campeão visto ignora frontline entre origem e alvo, mas pode ser recebido por peel no destino.", { power: 10, reach: 10 }),
  ],
  "Nunu & Willump": [
    s("Q", "OBJECTIVE_EXECUTE", "Consume combina dano verdadeiro e cura, oferecendo segurança excepcional em Smite fight se Nunu toca o objetivo.", { power: 10, reliability: 10 }),
    s("W", "PATH_DENIAL", "Snowball exige rota contínua e curva limitada; paredes, terreno criado e interrupção frontal quebram engage.", { power: 9, reach: 9, coverage: 4, reliability: 6 }),
    s("R", "CHANNEL", "Canal em área desacelera e causa burst máximo no fim; hard CC, deslocamento e saída rápida são respostas diretas.", { power: 10, reach: 3, coverage: 5 }),
  ],
  Olaf: [
    s("R", "CC_IMMUNITY", "Remove CC e fica imune enquanto mantém combate; comps dependentes de controle não conseguem parar sua entrada.", { power: 10, laneImpact: 10, draftImpact: 10 }),
    s("Q", "PATH_DENIAL", "Machados repetidos mantêm slow se Olaf consegue recolhê-los; zonear o ponto de queda limita perseguição.", { power: 8, laneImpact: 9, reach: 7 }),
    s("E", "TRUE_DAMAGE", "Dano verdadeiro point-and-click ignora resistência e tem cooldown reduzido por ataques; kite nega repetição.", { power: 8, reach: 2 }),
  ],
  Orianna: [
    s("P", "EXTERNAL_OBJECT_DEPENDENCY", "Todas as zonas principais partem da bola; acompanhar sua posição revela alcance real e setup.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 9, coverage: 5 }),
    s("R", "DISPLACEMENT", "Shockwave puxa em área ao redor da bola, incluindo bola carregada por diver aliado; separação e tracking respondem.", { power: 10, reach: 10, coverage: 5, reliability: 7 }),
  ],
  Ornn: [
    s("E", "POSITIONAL_SWEETSPOT", "Dash só knockupa ao colidir com terreno, inclusive criado por campeões; campo aberto reduz ameaça.", { power: 9, laneImpact: 9, reach: 5, coverage: 4 }),
    s("W", "UNSTOPPABLE", "Fica imparável durante o sopro e aplica Brittle; timing pode negar displacement previsível.", { power: 9, laneImpact: 10 }),
    s("R", "LONG_RANGE_CC", "Primeira passagem aplica slow/Brittle e recast redireciona com knockup; wind wall/interrupção antes do recast anulam.", { power: 10, reach: 10, coverage: 5, reliability: 6 }),
  ],
  Pantheon: [
    s("W", "RELIABLE_CC", "Stun point-and-click só é confiável dentro de alcance curto e após atravessar zoneamento/frontline; não deve contar contra backline inalcançável.", { power: 9, laneImpact: 10, reach: 4 }),
    s("E", "DIRECTIONAL_DEFENSE", "Nega dano vindo da direção encarada enquanto avança/recuа; flanco, espera e dano por trás contornam.", { power: 10, laneImpact: 10, draftImpact: 8, coverage: 3 }),
    s("R", "GLOBAL_JOIN", "Canal semiglobal cria flanco telegráfico; CC aliado e rotas de retirada determinam conversão.", { power: 9, reach: 10, coverage: 4 }),
  ],
  Poppy: [
    s("W", "DASH_DENIAL", "Interrompe dashes inimigos próximos e depois aplica grounding/slow; muda completamente campeões cuja entrada ou saída é dash.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 3, coverage: 5 }),
    s("W", "GROUNDING", "Após bloquear um dash, impede novo deslocamento por uma janela, quebrando sequências e resets.", { power: 10, coverage: 2 }),
    s("E", "POSITIONAL_SWEETSPOT", "Só atordoa ao empurrar contra parede, inclusive terreno criado; posição lateral é condição central.", { power: 10, laneImpact: 10, reach: 4 }),
    s("R", "DISPLACEMENT", "Carga pode remover múltiplos inimigos da luta/objetivo; tap curto oferece knockup de peel.", { power: 10, draftImpact: 10, reach: 8, coverage: 5 }),
  ],
  Pyke: [
    s("W", "CAMOUFLAGE", "Camuflagem acelera rotação e acesso, mas proximidade e control ward revelam.", { power: 8, draftImpact: 9, reach: 8 }),
    s("R", "EXECUTE", "Executa abaixo do limiar, ignora shields no cálculo prático e reseta para sequência; cura/stasis acima do timing negam.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 6, coverage: 5 }),
    s("R", "RESET_CHAIN", "Recast após execução pode limpar luta e gerar ouro extra; negar o primeiro X encerra cadeia.", { power: 10, coverage: 5 }),
  ],
  Qiyana: [
    s("W", "FORM_SHIFT", "Elemento de terreno muda Q entre root, dano e stealth; mapa e posição definem arsenal disponível.", { power: 9, laneImpact: 10, draftImpact: 9 }),
    s("R", "POSITIONAL_SWEETSPOT", "Empurra e detona ao longo de parede/rio/brush; longe dessas superfícies perde stun e grande parte do burst.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 7, coverage: 5 }),
    s("Q", "STEALTH", "Elemento de grama cria trilha de invisibilidade, permitindo esperar cooldown; AoE/reveal respondem.", { power: 8, coverage: 3 }),
  ],
  Quinn: [
    s("E", "DISPLACEMENT", "Vault point-and-click interrompe e reposiciona Quinn à distância de ataque; anti-dash ou CC na aterrissagem punem.", { power: 8, laneImpact: 9, reach: 5 }),
    s("R", "GLOBAL_JOIN", "Velocidade fora de combate permite side/roam, mas dano cancela e a canalização abre janela.", { power: 9, draftImpact: 9, reach: 10 }),
    s("W", "REVEAL", "Pulso revela ampla área e reduz flancos/stealth por informação, não true sight persistente.", { power: 7, draftImpact: 8, reach: 8, coverage: 5 }),
  ],
  Rakan: [
    s("W", "DISPLACEMENT", "Dash com knockup atrasado exige prever saída; Flash ou R aumenta confiabilidade, anti-dash quebra.", { power: 9, reach: 7, coverage: 4 }),
    s("E", "ALLY_LINK", "Dois dashes em aliados dão entrada e saída; separação e falta de âncora o prendem.", { power: 9, reach: 7 }),
    s("R", "RELIABLE_CC", "Charme por contato e velocidade permite cobrir vários, mas exige caminho corporal e não reaplica no mesmo alvo.", { power: 10, reach: 2, coverage: 5 }),
  ],
  Rammus: [
    s("W", "DAMAGE_REFLECTION", "Defesa e retorno de dano por ataque punem auto-attackers, especialmente hits rápidos; AP/spell DPS contorna.", { power: 10, laneImpact: 10, draftImpact: 9, coverage: 3 }),
    s("E", "ATTACK_SPEED_REDUCTION", "Taunt point-and-click força ataques e reduz AS depois; alcance corporal e cleanse limitam.", { power: 10, reach: 2 }),
    s("Q", "PATH_DENIAL", "Powerball ganha velocidade mas colide com unidades; minion/summon e terreno criado interceptam.", { power: 8, reach: 8, coverage: 3 }),
  ],
  "Rek'Sai": [
    s("W", "FORM_SHIFT", "Burrow troca visão normal por tremor e habilita knockup; unidades imóveis somem do sensor e reveal funciona diferente.", { power: 9, draftImpact: 9 }),
    s("E", "PORTAL", "Túneis persistem como rede de mobilidade e podem ser destruídos pelo inimigo.", { power: 9, reach: 8 }),
    s("R", "MARKED_FOLLOW", "Salta ao alvo marcado, fica inalvejável durante parte da animação e executa por vida perdida; stasis nega chegada.", { power: 9, reach: 10 }),
  ],
  Rell: [
    s("P", "STAT_STEAL", "Ataques/habilidades roubam Armor/MR e transferem valor ao foco aliado; múltiplos alvos acumulam frontline.", { power: 8, coverage: 4 }),
    s("Q", "SHIELD_BREAK", "Quebra todos os escudos antes do dano/stun, alterando diretamente drafts de enchanter.", { power: 10, reach: 7, coverage: 3 }),
    s("W", "FORM_SHIFT", "Mount/dismount alterna engage com knockup e forma lenta resistente; errar entrada deixa Rell sem saída.", { power: 9, laneImpact: 9, reliability: 6 }),
    s("R", "PERSISTENT_ZONE", "Campo puxa continuamente sem interromper ações, compactando inimigos para follow-up.", { power: 9, coverage: 5 }),
  ],
  "Renata Glasc": [
    s("W", "DEATH_PREVENTION", "Aliado entra em estado de morte adiada e revive ao conseguir takedown; disengage inimigo nega o gatilho.", { power: 10, laneImpact: 9, draftImpact: 10 }),
    s("R", "FORCED_BERSERK", "Inimigos atingidos atacam aliados próprios; comps de auto e front-to-back agrupadas podem se destruir.", { power: 10, draftImpact: 10, reach: 10, coverage: 5, reliability: 5 }),
    s("Q", "DISPLACEMENT", "Root pode arremessar alvo e atordoar colisões; projétil e segundo comando criam condição dupla.", { power: 8, reach: 8, coverage: 3 }),
  ],
  Renekton: [
    s("W", "SHIELD_BREAK", "Versão fortalecida remove escudos antes do dano e stun, punindo defesas reativas.", { power: 10, laneImpact: 10, reach: 1 }),
    s("E", "FORM_SHIFT", "Segundo dash existe após atravessar unidade e versão com Fury reduz Armor; wave habilita acesso/saída.", { power: 8, laneImpact: 9, reach: 5 }),
    s("R", "PERSISTENT_ZONE", "Vida instantânea e dano corporal ampliam all-in prolongado; kite remove zona e geração de Fury.", { power: 8, reach: 1, coverage: 3 }),
  ],
  Rengar: [
    s("P", "WALL_CROSS", "Em arbusto, ataques saltam até o alvo; controlar brush e visão muda alcance real da lane/luta.", { power: 10, laneImpact: 10, reach: 7 }),
    s("W", "CC_CLEANSE", "W fortalecido limpa CC e cura dano recente; CC repetido ou burst fora da janela responde.", { power: 9, laneImpact: 9 }),
    s("R", "CAMOUFLAGE", "Camuflagem revela o inimigo mais próximo e habilita salto; frontline pode se oferecer como alvo de aproximação.", { power: 9, reach: 10 }),
  ],
  Riven: [
    s("Q", "FORM_SHIFT", "Três casts de dash terminam em knockup; anti-dash e spacing quebram combo, mas recasts atravessam terreno situacionalmente.", { power: 9, laneImpact: 10, reach: 4 }),
    s("R", "EXECUTE", "Wind Slash escala com vida perdida e é projétil em cone; shield/cura e dodge alteram limiar.", { power: 9, reach: 7, coverage: 4 }),
  ],
  Rumble: [
    s("P", "FORM_SHIFT", "Heat fortalece habilidades, mas superaquecimento silencia e força autos; janela é poderosa e previsível.", { power: 9, laneImpact: 10, reliability: 7 }),
    s("R", "PERSISTENT_ZONE", "Linha de dano/slow sem canal domina corredores e corta retirada; mobilidade perpendicular sai mais rápido.", { power: 10, draftImpact: 10, reach: 10, coverage: 5 }),
  ],
  Ryze: [
    s("W", "RELIABLE_CC", "Point-and-click só enraíza com Flux prévio; sem marca é slow, então a entrega exige dois passos.", { power: 8, laneImpact: 9, reach: 6 }),
    s("R", "PORTAL", "Transporta aliados e minions após canal para engage, escape ou macro; CC em Ryze cancela e inimigo pode ler destino.", { power: 9, draftImpact: 10, reach: 10, coverage: 5 }),
  ],
  Samira: [
    s("W", "PROJECTILE_DENIAL", "Destrói projéteis ao redor em dois pulsos; ameaça curta e móvel que pode apagar ultimates centrais.", { power: 10, laneImpact: 10, draftImpact: 10, coverage: 5 }),
    s("P", "MARKED_FOLLOW", "Estende knockup após imobilização aliada e avança ao range; draft com setup muda completamente seu acesso.", { power: 9, reach: 7 }),
    s("R", "CHANNEL", "Só lança em rank S e pode ser interrompida; precisa empilhar estilo e sobreviver no corpo.", { power: 10, reliability: 5, reach: 2, coverage: 5 }),
  ],
  Sejuani: [
    s("P", "SLOW_IMMUNITY", "Fora de combate recebe Frost Armor com imunidade a slow e resistências; poke remove antes do engage.", { power: 8, draftImpact: 8 }),
    s("E", "ALLY_LINK", "Aliados melee aplicam stacks para stun; composição muda velocidade e quantidade de alvos controláveis.", { power: 9, draftImpact: 9, reach: 6 }),
    s("R", "LONG_RANGE_CC", "Projétil atordoa primeiro campeão e cria tempestade; spell shield/frontline interceptam.", { power: 10, reach: 10, coverage: 4, reliability: 6 }),
  ],
  Senna: [
    s("P", "INFINITE_SCALING", "Souls aumentam alcance, dano e crítico; pressão e duração mudam perfil.", { power: 10, draftImpact: 10 }),
    s("E", "CAMOUFLAGE", "Névoa oculta identidade e concede camouflage a aliados, mas proximidade e ataques revelam.", { power: 9, draftImpact: 9, coverage: 5 }),
    s("R", "GLOBAL_SAVE", "Feixe global causa dano no centro e escuda aliados em largura enorme, influenciando luta remota.", { power: 10, reach: 10, coverage: 5 }),
  ],
  Seraphine: [
    s("P", "ABILITY_ARSENAL", "A cada terceira habilidade ocorre double cast, alterando controle, cura e dano disponíveis naquele instante.", { power: 9, laneImpact: 9, reliability: 7 }),
    s("R", "LONG_RANGE_CC", "Charm estende alcance ao tocar qualquer campeão, aliado ou inimigo; formação pode multiplicar ou bloquear rota.", { power: 10, reach: 10, coverage: 5, reliability: 6 }),
    s("W", "HEAL_AMPLIFICATION", "Com escudo prévio, segundo cast cura por vida perdida em área; composição de shields habilita condição.", { power: 9, coverage: 5 }),
  ],
  Sett: [
    s("W", "POSITIONAL_SWEETSPOT", "Centro causa dano verdadeiro baseado em Grit e concede shield; sair lateralmente ou deslocar Sett evita o núcleo.", { power: 10, laneImpact: 10, reach: 4, coverage: 4 }),
    s("R", "DISPLACEMENT", "Ultimate point-and-click carrega alvo e causa dano por vida bônus em área; tanque inimigo pode virar projétil contra a própria backline.", { power: 10, reach: 3, coverage: 5 }),
    s("E", "POSITIONAL_SWEETSPOT", "Só atordoa se puxar inimigos dos dois lados; formação e minions habilitam.", { power: 9, laneImpact: 9, coverage: 3 }),
  ],
  Shaco: [
    s("Q", "STEALTH", "Blink com invisibilidade cria ângulos não vistos; control ward não revela invisibilidade, mas AoE/reveal verdadeiro sim.", { power: 9, reach: 7 }),
    s("W", "TRAP_CONTROL", "Boxes invisíveis causam fear e zoneiam rotas, mas precisam armar e morrem para reveal/AoE.", { power: 9, draftImpact: 9, coverage: 4 }),
    s("R", "CLONE_DECEPTION", "Fica brevemente inalvejável e cria clone explosivo; disciplina, marca persistente e AoE identificam.", { power: 10, laneImpact: 9, coverage: 3 }),
  ],
  Shen: [
    s("W", "ATTACK_EVASION", "Zona ao redor da espada bloqueia ataques contra aliados dentro; spell damage e espera respondem.", { power: 10, laneImpact: 9, draftImpact: 10, coverage: 4 }),
    s("R", "GLOBAL_SAVE", "Escudo global seguido de teleporte ao aliado; interromper Shen cancela chegada, burst pode atravessar escudo.", { power: 10, reach: 10, coverage: 2 }),
    s("E", "RELIABLE_CC", "Taunt em dash acerta linha e gera acesso; anti-dash/spacing punem.", { power: 9, reach: 6, coverage: 3 }),
  ],
  Shyvana: [
    s("R", "FORM_SHIFT", "Forma dragão muda área/alcance das básicas e só existe com Fury; janela sem ultimate é explorável.", { power: 9, reliability: 7 }),
    s("R", "UNSTOPPABLE", "Salto inicial é imparável e desloca, mas a forma posterior ainda sofre kite/CC.", { power: 8, reach: 6, coverage: 3 }),
  ],
  Singed: [
    s("W", "GROUNDING", "Adhesive impede dashes/blinks e desacelera; excelente para fixar móvel, limitado por alcance da zona.", { power: 10, laneImpact: 10, reach: 6, coverage: 4 }),
    s("E", "DISPLACEMENT", "Fling point-and-click joga alvo para trás e enraíza se cair no W; direção exige contato.", { power: 9, reach: 1 }),
  ],
  Sion: [
    s("P", "DEATH_PASSIVE", "Após morrer continua atacando com vida drenando; kite/CC e afastar-se depois do abate negam troca.", { power: 9, laneImpact: 8, coverage: 3 }),
    s("Q", "CHANNEL", "Knockup/dano crescem durante carga visível; interrupção ou sair da área evita pico.", { power: 9, laneImpact: 10, reach: 5, coverage: 4 }),
    s("R", "UNSTOPPABLE", "Carga longa fica imparável e causa knockup conforme distância, mas rota tem curva limitada e terreno bloqueia.", { power: 10, reach: 10, coverage: 5, reliability: 5 }),
  ],
  Sivir: [
    s("E", "SPELL_SHIELD", "Nega uma habilidade e cura, premiando leitura; poke múltiplo/isca abre a janela.", { power: 9, laneImpact: 10 }),
    s("R", "TEAM_MOBILITY", "Velocidade coletiva inicia ou desfaz lutas e reduz cooldowns básicos com ataques.", { power: 9, draftImpact: 9, coverage: 5 }),
  ],
  Skarner: [
    s("E", "WALL_CROSS", "Carga atravessa terreno, agarra e atordoa ao colidir; visão lateral e anti-dash respondem.", { power: 10, reach: 8, coverage: 3 }),
    s("R", "SUPPRESSION", "Suprime e arrasta até três campeões após preparação; spacing, spell shield e interrupção antes do cast reduzem.", { power: 10, reach: 4, coverage: 3, reliability: 6 }),
  ],
  Smolder: [
    s("P", "INFINITE_SCALING", "Stacks evoluem área, burn e execução do Q; tempo e acesso à wave são condições.", { power: 10, draftImpact: 10 }),
    s("E", "WALL_CROSS", "Voa sobre terreno por janela curta enquanto dispara; grounding e CC encerram segurança.", { power: 8, reach: 6 }),
    s("Q", "EXECUTE", "Em stacks altos aplica burn e execução percentual, mudando frontline no late.", { power: 9, laneImpact: 5, draftImpact: 10, reach: 7 }),
  ],
  Sona: [
    s("P", "ABILITY_ARSENAL", "Power Chord pode reduzir dano, desacelerar ou ampliar burst conforme última aura; escolha é parte central do duelo.", { power: 8, laneImpact: 8, reliability: 8 }),
    s("R", "RELIABLE_CC", "Stun em linha e redução passiva de cooldown; projétil e alcance médio permitem dodge/negação.", { power: 9, reach: 8, coverage: 5, reliability: 6 }),
  ],
  Soraka: [
    s("E", "SILENCE", "Zona instantânea silencia e depois enraíza quem permanece; destrói canais/combos, mas segunda parte é evitável.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 8, coverage: 4 }),
    s("R", "GLOBAL_SAVE", "Cura todos aliados vivos globalmente; anti-heal e burst acima da janela reduzem.", { power: 10, reach: 10, coverage: 5 }),
  ],
  Swain: [
    s("P", "INFINITE_SCALING", "Soul fragments concedem vida permanente e cura; hard CC e alvos pegos aceleram escala.", { power: 8, draftImpact: 8 }),
    s("E", "TETHER", "Projétil retorna e enraíza na volta, depois permite pull; minions só importam na explosão e spacing lateral responde.", { power: 8, reach: 8, coverage: 3, reliability: 5 }),
    s("R", "PERSISTENT_ZONE", "Ultimate continua enquanto drena campeões; disengage completo encerra, comp curta alimenta duração.", { power: 10, reach: 3, coverage: 5 }),
  ],
  Sylas: [
    s("R", "ULTIMATE_THEFT", "Valor depende dos cinco ultimates inimigos, ratios e função; uma única ultimate excepcional pode mudar o pick.", { power: 10, laneImpact: 8, draftImpact: 10, reach: 9 }),
    s("W", "DAMAGE_REDUCTION", "Cura aumenta em vida baixa e dano é point-and-click; anti-heal, range e burst antes do limiar respondem.", { power: 8, laneImpact: 10, reach: 4 }),
  ],
  Syndra: [
    s("P", "FORM_SHIFT", "Splinters melhoram cada habilidade e dão pico final de AP; progressão é finita, mas altera regras do kit.", { power: 9, draftImpact: 9 }),
    s("E", "EXTERNAL_OBJECT_DEPENDENCY", "Empurra inimigos/esferas; esfera alinhada vira stun de longo alcance, então objetos no chão definem ameaça.", { power: 10, laneImpact: 10, reach: 9, coverage: 5 }),
    s("R", "EXECUTE", "Dano point-and-click escala com número de esferas e ganha execute após upgrade; stasis/range impedem cast ou impacto.", { power: 9, reach: 7 }),
  ],
  "Tahm Kench": [
    s("R", "ALLY_SAVE", "Engole aliado e o retira de alvo/dano antes de reposicionar; separação e cooldown limitam proteção.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 2 }),
    s("R", "TARGET_ISOLATION", "Após três stacks, engole inimigo e o remove temporariamente; exige contato acumulado.", { power: 9, laneImpact: 10, reach: 2 }),
    s("W", "CHANNEL", "Mergulho cria chegada larga após preparação visível; CC interrompe canal e reação lateral evita knockup.", { power: 8, reach: 8, coverage: 4 }),
  ],
  Taliyah: [
    s("E", "DASH_DENIAL", "Dashes sobre o campo detonam pedras e atordoam; campeões dependentes de múltiplos dashes perdem entrada e saída.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 7, coverage: 5 }),
    s("W", "DISPLACEMENT", "Empurra na direção escolhida após atraso; combina com E, mas mobilidade e dodge reduzem confiabilidade.", { power: 9, reach: 8, coverage: 3, reliability: 5 }),
    s("R", "TERRAIN_CREATION", "Parede semiglobal corta mapa e permite surfar; dano/CC derruba Taliyah e wall-cross atravessa.", { power: 10, draftImpact: 10, reach: 10, coverage: 5 }),
  ],
  Talon: [
    s("E", "WALL_CROSS", "Salta cada parede com cooldown próprio, criando rotas únicas; grounding e espaço aberto reduzem.", { power: 10, draftImpact: 9, reach: 9 }),
    s("R", "STEALTH", "Lâminas e invisibilidade criam reposicionamento/burst; reveal e AoE preservam resposta.", { power: 9, coverage: 3 }),
  ],
  Taric: [
    s("W", "ALLY_LINK", "Habilidades também saem do aliado vinculado, duplicando geometria de stun/cura; separação quebra cobertura.", { power: 10, draftImpact: 10, reach: 8, coverage: 4 }),
    s("R", "INVULNERABLE", "Após atraso deixa aliados próximos invulneráveis; disengage durante preparação ou burst antes dela responde.", { power: 10, draftImpact: 10, coverage: 5, reliability: 7 }),
  ],
  Teemo: [
    s("Q", "BLIND", "Blind point-and-click nega ataques e empowered autos; spell damage e cleanse aguardam janela.", { power: 10, laneImpact: 10, reach: 7 }),
    s("R", "TRAP_CONTROL", "Cogumelos invisíveis dão visão, slow e dano em área; sweeper, summons e alcance de limpeza respondem.", { power: 10, draftImpact: 9, reach: 10, coverage: 5 }),
    s("P", "CAMOUFLAGE", "Fica invisível parado e pode mover em brush; AoE e reveal expõem.", { power: 8, laneImpact: 8 }),
  ],
  Thresh: [
    s("W", "ALLY_SAVE", "Lantern puxa aliado que clica e atravessa terreno; ward/campeões podem bloquear clique e CC impede interação.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 9 }),
    s("Q", "LONG_RANGE_CC", "Hook prende e oferece recast de entrada; minions, summons e projectile denial bloqueiam.", { power: 9, reach: 9, reliability: 5 }),
    s("E", "DISPLACEMENT", "Flay instantâneo interrompe dash e reposiciona; alcance médio exige proximidade.", { power: 9, reach: 4, coverage: 3 }),
  ],
  Tristana: [
    s("W", "RESET_CHAIN", "Takedown e detonação máxima de E resetam salto; CC durante o voo interrompe.", { power: 10, laneImpact: 9, draftImpact: 9, reach: 7 }),
    s("R", "DISPLACEMENT", "Knockback point-and-click afasta diver ou explode bomb em área; também pode salvar o alvo.", { power: 9, reach: 7, coverage: 3 }),
  ],
  Trundle: [
    s("E", "TERRAIN_CREATION", "Pilar instantâneo cria terreno, interrompe canais/movimentos e desacelera; blink/dash pode atravessar.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 8, coverage: 3 }),
    s("R", "STAT_STEAL", "Rouba vida e resistências, tornando tanque inimigo mais frágil enquanto fortalece Trundle.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 7 }),
  ],
  Tryndamere: [
    s("R", "DEATH_PREVENTION", "Não cai abaixo da vida mínima e pode lançar sob a maioria dos CCs; kite/stasis vencem a janela.", { power: 10, laneImpact: 10, draftImpact: 9 }),
    s("E", "WALL_CROSS", "Spin atravessa terreno e reduz cooldown com críticos; blind/evasão diminuem recasts.", { power: 9, reach: 6 }),
  ],
  "Twisted Fate": [
    s("W", "RELIABLE_CC", "Gold Card é stun por ataque selecionável e visível; alcance de auto e spell shield limitam entrega.", { power: 9, laneImpact: 10, reach: 7 }),
    s("R", "GLOBAL_VISION", "Revela todos inimigos, reduzindo stealth/flanco e habilitando Destiny.", { power: 9, draftImpact: 10, reach: 10, coverage: 5 }),
    s("R", "GLOBAL_JOIN", "Teleporte semiglobal cria números, mas canal e destino visível permitem resposta.", { power: 10, reach: 10 }),
  ],
  Twitch: [
    s("Q", "CAMOUFLAGE", "Camuflagem longa prepara flanco; control ward/proximidade e reveal respondem.", { power: 9, draftImpact: 9, reach: 9 }),
    s("R", "AUTO_MODIFIER", "Autos ganham alcance e atravessam como projéteis que podem errar unidades em movimento; formação alinhada amplia dano.", { power: 10, draftImpact: 9, reach: 10, coverage: 5 }),
  ],
  Udyr: [
    s("P", "ABILITY_ARSENAL", "Awaken escolhe uma de quatro posturas ampliadas; usar uma bloqueia todas até novo cooldown.", { power: 10, laneImpact: 9, draftImpact: 9 }),
    s("E", "CC_IMMUNITY", "Awakened Stampede concede imunidade a CC por janela curta e stun por contato.", { power: 9, reach: 2, coverage: 2 }),
    s("R", "PERSISTENT_ZONE", "Tempestade acompanha o último alvo atingido na versão Awakened, punindo alvos sem saída.", { power: 9, reach: 5, coverage: 4 }),
  ],
  Urgot: [
    s("W", "AUTO_MODIFIER", "Dispara automaticamente no alvo próximo/priorizado e reduz velocidade; summons e posição desviam foco.", { power: 9, laneImpact: 9, reach: 5 }),
    s("E", "DISPLACEMENT", "Dash com shield arremessa o primeiro campeão; windup pode bufferar CC, mas não é imparável.", { power: 9, laneImpact: 10, reach: 4 }),
    s("R", "EXECUTE", "Projétil marca e puxa abaixo do limiar para execução/fear; stasis, untargetable e cleanses específicos importam.", { power: 10, reach: 10, coverage: 4 }),
  ],
  Varus: [
    s("W", "PERCENT_HEALTH_DAMAGE", "Blight acumula por autos e habilidades detonam por vida máxima; negar autos reduz anti-tank.", { power: 9, reach: 8 }),
    s("R", "LONG_RANGE_CC", "Corrente enraíza primeiro campeão e espalha a próximos; spacing e negação de projétil impedem cadeia.", { power: 10, reach: 9, coverage: 5, reliability: 5 }),
    s("Q", "CHANNEL", "Carga aumenta alcance/dano, mas reduz mobilidade e pode ser interrompida.", { power: 7, reach: 10 }),
  ],
  Vayne: [
    s("W", "TRUE_DAMAGE", "Terceiro hit causa dano verdadeiro percentual; blind, evasão e negar sequência respondem.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 6 }),
    s("E", "POSITIONAL_SWEETSPOT", "Condemn só atordoa ao colidir com terreno, inclusive paredes criadas; campo aberto reduz ameaça.", { power: 10, laneImpact: 10, reach: 6 }),
    s("R", "STEALTH", "Tumble concede invisibilidade durante ultimate, quebrando seleção repetidamente; reveal/AoE respondem.", { power: 9 }),
  ],
  Veigar: [
    s("P", "INFINITE_SCALING", "Acertos e abates acumulam AP sem limite; alcance à wave e duração importam.", { power: 10, draftImpact: 10 }),
    s("E", "TERRAIN_CREATION", "Cage cria perímetro que atordoa quem cruza, isolando zona mesmo sem acerto direto; blink atravessa, dash toca borda.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 8, coverage: 5 }),
    s("R", "EXECUTE", "Dano point-and-click cresce com vida perdida; stasis, spell shield e cura antes do impacto respondem.", { power: 9, reach: 7 }),
  ],
  "Vel'Koz": [
    s("P", "TRUE_DAMAGE", "Três stacks detonam dano verdadeiro; negar sequência reduz anti-resistência.", { power: 9, laneImpact: 9, reach: 9 }),
    s("R", "CHANNEL", "Feixe longo desacelera e causa verdadeiro em alvos pesquisados; dive/interrupção corta canal.", { power: 10, reach: 10, coverage: 4 }),
  ],
  Vex: [
    s("P", "DASH_DENIAL", "Dashes/blinks inimigos ficam marcados e aceleram Gloom; fear preparado interrompe entrada.", { power: 10, laneImpact: 10, draftImpact: 10, reach: 8, coverage: 5 }),
    s("R", "MARKED_FOLLOW", "Projétil marca e recast leva Vex ao alvo, resetando em takedown; spell shield/frontline e posição final punem.", { power: 9, reach: 10 }),
  ],
  Vi: [
    s("R", "RELIABLE_CC", "Ultimate point-and-click persegue, fica imparável e knockupa; não é peelada na trajetória, mas o destino prepara resposta.", { power: 10, reach: 8, coverage: 3 }),
    s("Q", "CHANNEL", "Dash carregado é interrompível e telegráfico; acerto desloca e abre combo.", { power: 8, reach: 7, reliability: 6 }),
  ],
  Viego: [
    s("P", "POSSESSION", "Após takedown usa itens e básicas do inimigo, cura e fica inalvejável na transformação; valor depende dos kits disponíveis.", { power: 10, draftImpact: 10, coverage: 5, reliability: 6 }),
    s("R", "RESET_CHAIN", "Heartbreaker fica disponível em cada possessão e executa vida perdida, saltando entre corpos.", { power: 10, coverage: 5 }),
  ],
  Viktor: [
    s("P", "FORM_SHIFT", "Fragments melhoram básicas e depois ultimate; evolução muda alcance e controle, embora seja finita.", { power: 9, draftImpact: 9 }),
    s("W", "PERSISTENT_ZONE", "Campo desacelera e atordoa quem permanece, excelente contra curta distância, evitável por mobilidade/range.", { power: 9, reach: 7, coverage: 4 }),
    s("R", "CHANNEL", "Tempestade interrompe canais no impacto e persegue; sair do raio ou matar Viktor reduz controle.", { power: 9, reach: 8, coverage: 4 }),
  ],
  Vladimir: [
    s("W", "UNTARGETABLE", "Pool fica inalvejável e atravessa unidades, mas custa vida; zona persistente e timing da saída punem.", { power: 10, laneImpact: 10, coverage: 3 }),
    s("R", "DAMAGE_AMPLIFICATION", "Marca área, amplifica dano recebido e cura Vladimir depois; disengage durante a janela reduz conversão.", { power: 10, draftImpact: 9, coverage: 5 }),
  ],
  Volibear: [
    s("R", "TOWER_DISABLE", "Salto desabilita torres atingidas, criando dives que outros bruisers não executam.", { power: 10, laneImpact: 9, draftImpact: 8, coverage: 2 }),
    s("R", "UNSTOPPABLE", "Salto é imparável durante a ação, mas Volibear ainda sofre kite depois da chegada.", { power: 8, reach: 7, coverage: 4 }),
    s("Q", "RELIABLE_CC", "Ataque stun point-and-click; se imobilizado antes de acertar, cooldown reseta, então uma única camada de CC pode ajudar.", { power: 9, reach: 2 }),
  ],
  Warwick: [
    s("Q", "MARKED_FOLLOW", "Ao segurar, acompanha dashes/blinks e fica imune a displacement durante a mordida; pode ser levado para posição ruim.", { power: 9, laneImpact: 10, reach: 2 }),
    s("E", "DAMAGE_REDUCTION", "Reduz dano e depois causa fear em área; burst pode esperar recast, cleanse responde ao fear.", { power: 9, laneImpact: 9, coverage: 4 }),
    s("R", "SUPPRESSION", "Salto escala com velocidade e suprime primeiro campeão; pode errar e CC após chegada interrompe canal.", { power: 9, reach: 9, reliability: 5 }),
  ],
  Wukong: [
    s("W", "CLONE_DECEPTION", "Dash/invisibilidade deixa clone que ataca e replica ultimate; reveal/AoE identificam.", { power: 9, laneImpact: 9, coverage: 3 }),
    s("R", "DISPLACEMENT", "Dois casts de knockup em área móvel, também replicados pelo clone; exige entrada, mas cobre formação ampla.", { power: 10, reach: 3, coverage: 5 }),
  ],
  Xayah: [
    s("E", "EXTERNAL_OBJECT_DEPENDENCY", "Feathers no chão retornam e enraízam com três; posição acumulada define ameaça e pode ser evitada lateralmente.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 9, coverage: 5 }),
    s("R", "UNTARGETABLE", "Fica inalvejável durante salto e espalha penas, negando engage direcionado; zona na queda pune.", { power: 10, laneImpact: 9, draftImpact: 9, coverage: 4 }),
  ],
  Xerath: [
    s("Q", "RANGE_AMPLIFICATION", "Carga fornece poke extremo, mas reduz movimento e revela timing; flanco/engage durante carga pune.", { power: 9, laneImpact: 10, reach: 10, coverage: 2 }),
    s("R", "CHANNEL", "Canal imóvel lança vários tiros de alcance enorme; dive, visão e mobilidade lateral reduzem acertos.", { power: 9, reach: 10, coverage: 5, reliability: 5 }),
    s("E", "LONG_RANGE_CC", "Stun cresce com distância, porém minions e projectile denial bloqueiam; no corpo dura pouco.", { power: 8, reach: 8, reliability: 5 }),
  ],
  "Xin Zhao": [
    s("R", "OUTSIDE_ZONE_IMMUNITY", "Dano de campeões fora do círculo não o afeta; ranged precisam entrar ou esperar, salvo alvo desafiado.", { power: 10, draftImpact: 10, coverage: 1 }),
    s("W", "MARKED_FOLLOW", "Spear marca e aumenta alcance do E, transformando skillshot em acesso; dodge impede.", { power: 8, reach: 8 }),
  ],
  Yasuo: [
    s("W", "PROJECTILE_DENIAL", "Parede destrói projéteis por vários segundos e pode invalidar carries/ultimates; não-projéteis e flanco contornam.", { power: 10, laneImpact: 10, draftImpact: 10, coverage: 5 }),
    s("E", "EXTERNAL_OBJECT_DEPENDENCY", "Dash usa cada unidade uma vez por cooldown, fazendo wave/summons virarem rede de acesso e fuga.", { power: 10, laneImpact: 10, reach: 5, coverage: 3 }),
    s("R", "MARKED_FOLLOW", "Só ulta alvos airborne, inclusive por aliados; draft de knockup aumenta confiabilidade.", { power: 10, draftImpact: 10, reach: 10, coverage: 5 }),
  ],
  Yone: [
    s("E", "FORCED_RETURN", "Deixa corpo-âncora e retorna obrigatoriamente; CC/zona atrasada na âncora ou afastar alvo nega saída segura.", { power: 10, laneImpact: 10, draftImpact: 9, reach: 8 }),
    s("R", "DISPLACEMENT", "Dash em linha leva Yone atrás do último atingido e agrupa alvos; desvio lateral e posição final são cruciais.", { power: 10, reach: 9, coverage: 5, reliability: 5 }),
  ],
  Yorick: [
    s("W", "TERRAIN_CREATION", "Parede circular prende quem não cruza terreno; autos rápidos, dash e Flash removem/atravessam.", { power: 9, laneImpact: 10, reach: 5, coverage: 2 }),
    s("P", "SUMMON", "Ghouls e Maiden formam exército persistente; AoE, Smite e isolamento removem base de dano.", { power: 10, laneImpact: 10, draftImpact: 9, coverage: 5 }),
    s("R", "EXTERNAL_OBJECT_DEPENDENCY", "Maiden aplica marca percentual e pressão autônoma, mas não acompanha Realm do Mordekaiser.", { power: 10, draftImpact: 9 }),
  ],
  Yunara: [
    s("R", "FORM_SHIFT", "Transcendência aprimora todas as básicas e muda W/E, criando janela de carry rastreável.", { power: 10, draftImpact: 9, reliability: 8 }),
    s("P", "AUTO_MODIFIER", "Críticos causam dano mágico adicional e Q transforma autos em splash/on-hit.", { power: 9, reach: 7, coverage: 4 }),
  ],
  Yuumi: [
    s("W", "ALLY_ATTACH", "Fica inalvejável anexada e amplifica um aliado; separação depende da morte/posição do host.", { power: 10, draftImpact: 10 }),
    s("Q", "POSITIONAL_SWEETSPOT", "Anexada controla a trajetória inicial do projétil; bodyblock e distância do host limitam.", { power: 7, reach: 9, reliability: 6 }),
    s("R", "CHANNEL", "Ondas canalizadas curam aliados e desaceleram inimigos enquanto Yuumi troca de host.", { power: 8, coverage: 5 }),
  ],
  Zaahen: [
    s("P", "SELF_REVIVE", "Ao encher determinação pode reviver em vida cheia; negar stacks e preparar segundo abate responde.", { power: 10, laneImpact: 9, draftImpact: 9, reliability: 6 }),
    s("Q", "RELIABLE_CC", "Segundo ataque fortalecido knockupa e ambos curam; blind/evasão e spacing quebram sequência.", { power: 8, reach: 2 }),
    s("W", "DISPLACEMENT", "Linha puxa inimigos atingidos; dodge lateral e proteção de projétil respondem quando aplicável.", { power: 8, reach: 7, coverage: 3 }),
  ],
  Zac: [
    s("P", "SELF_REVIVE", "Divide-se em blobs que precisam ser destruídos; AoE, Smite e controle de área garantem segundo abate.", { power: 10, laneImpact: 8, draftImpact: 9, coverage: 4 }),
    s("E", "CHANNEL", "Carga de enorme alcance pode vir de fog, mas é interrompível e o destino é telegráfico.", { power: 10, reach: 10, coverage: 5, reliability: 6 }),
    s("Q", "DISPLACEMENT", "Liga duas unidades e as bate; minion, ward ou summon habilita segunda âncora.", { power: 9, reach: 6, coverage: 3 }),
  ],
  Zed: [
    s("W", "EXTERNAL_OBJECT_DEPENDENCY", "Sombras duplicam Q/E e oferecem troca de posição; rastrear sombra/cooldown define alcance e fuga.", { power: 10, laneImpact: 10,draftImpact: 9, reach: 8, coverage: 3 }),
    s("R", "UNTARGETABLE", "Fica inalvejável no início e aparece atrás do alvo, deixando sombra de retorno; CC/zona na saída e stasis negam.", { power: 10, laneImpact: 10, reach: 6 }),
    s("R", "DAMAGE_AMPLIFICATION", "Marca repete parte do dano da janela; shield, cura, stasis e negar follow-up reduzem.", { power: 9, reach: 6 }),
  ],
  Zeri: [
    s("Q", "AUTO_MODIFIER", "Ataque básico é skillshot e Q funciona como ataque; blind interage diferente, bodyblock e projectile denial importam.", { power: 10, laneImpact: 10, reach: 7 }),
    s("E", "WALL_CROSS", "Dash atravessa paredes inteiras conforme ângulo; grounding/anti-dash e luta longe de terreno reduzem.", { power: 10, reach: 9 }),
    s("R", "RESET_CHAIN", "Acertos mantêm e ampliam velocidade durante luta prolongada; disengage completo remove stacks.", { power: 9, draftImpact: 9, coverage: 5 }),
  ],
  Ziggs: [
    s("W", "STRUCTURE_EXECUTE", "Satchel executa torre abaixo do limiar e cria ameaça de siege única.", { power: 10, laneImpact: 8, draftImpact: 9, reach: 7 }),
    s("W", "DISPLACEMENT", "Explosão lança Ziggs e inimigos, servindo de escape/interrupt; grounding e antecipação punem.", { power: 8, reach: 5, coverage: 3 }),
    s("R", "GLOBAL_DAMAGE", "Bomba semiglobal causa mais no centro; mobilidade e visão permitem sair do sweetspot.", { power: 9, reach: 10, coverage: 5 }),
  ],
  Zilean: [
    s("R", "ALLY_REVIVE", "Marca aliado e revive se morrer na janela; esperar, disengage ou matar outro alvo reduz valor.", { power: 10, laneImpact: 9, draftImpact: 10, reach: 7 }),
    s("Q", "POSITIONAL_SWEETSPOT", "Duas bombas no mesmo alvo causam stun; primeira pode ser carregada por aliado/minion.", { power: 9, reach: 8, coverage: 5, reliability: 6 }),
    s("E", "RELIABLE_CC", "Slow point-and-click extremo ou speed aliado; alcance médio e cleanse respondem.", { power: 9, reach: 6 }),
  ],
  Zoe: [
    s("W", "ULTIMATE_THEFT", "Coleta summoners/ativos caídos e reutiliza; valor depende dos feitiços disponíveis.", { power: 9, laneImpact: 9, draftImpact: 8 }),
    s("E", "SLEEP_SETUP", "Projétil atravessa parede ampliando alcance e cria armadilha; bodyblock, cleanse e projectile denial respondem.", { power: 10, reach: 10, reliability: 5 }),
    s("R", "FORCED_RETURN", "Portal sempre retorna Zoe ao ponto inicial; skillshots, CC e zona podem ser colocados na âncora.", { power: 9, laneImpact: 10, reach: 7 }),
  ],
  Zyra: [
    s("P", "SUMMON", "Sementes viram plantas e controlam zona; AoE/range clear e isolamento removem.", { power: 9, laneImpact: 9, draftImpact: 9, coverage: 5 }),
    s("W", "EXTERNAL_OBJECT_DEPENDENCY", "Posição das sementes define plantas, visão e DPS, tornando preparação central.", { power: 9, draftImpact: 9, reach: 8, coverage: 5 }),
    s("R", "PERSISTENT_ZONE", "Área causa knockup atrasado e fortalece plantas; sair antes da erupção ou interromper setup responde.", { power: 10, reach: 8, coverage: 5 }),
  ],
};

function stripHtml(value = "") {
  return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function abilityFor(champion, slot) {
  if (slot === "P") return champion.passive;
  const index = "QWER".indexOf(slot);
  return champion.spells[index];
}

function expandEntry(champion, entry) {
  const definition = TAXONOMY[entry.type];
  if (!definition) throw new Error(`Mecânica desconhecida ${entry.type} em ${champion.name}`);
  const ability = abilityFor(champion, entry.slot);
  if (!ability) throw new Error(`Habilidade ${entry.slot} ausente em ${champion.name}`);
  const metrics = { ...definition.defaults };
  for (const key of Object.keys(metrics)) if (entry[key] != null) metrics[key] = entry[key];
  return {
    slot: entry.slot,
    ability: ability.name,
    type: entry.type,
    label: definition.label,
    category: definition.category,
    ...metrics,
    accessRequired: entry.accessRequired ?? (metrics.reach <= 5),
    exploits: entry.exploits ?? definition.exploits,
    checkedBy: entry.checkedBy ?? definition.checkedBy,
    confidence: entry.confidence,
    note: entry.note,
    officialSummary: stripHtml(ability.description),
  };
}

function build() {
  const missing = champions.filter((champion) => !CURATED[champion.name]?.length).map((champion) => champion.name);
  if (missing.length) throw new Error(`Campeões sem mapeamento: ${missing.join(", ")}`);
  const mapped = champions.map((champion) => ({
    champion: champion.name,
    championId: champion.id,
    mechanics: CURATED[champion.name].map((entry) => expandEntry(champion, entry)),
  }));
  const mechanicCounts = {};
  for (const row of mapped) for (const mechanic of row.mechanics) mechanicCounts[mechanic.type] = (mechanicCounts[mechanic.type] ?? 0) + 1;
  return {
    metadata: {
      patch: "26.16",
      dataDragon: "16.16.1",
      profileVersion: "1.3-signature-mechanics",
      championCount: mapped.length,
      mechanicEntryCount: mapped.reduce((sum, row) => sum + row.mechanics.length, 0),
      confidencePolicy: {
        CURATED: "Interação central revisada; pode influenciar score, mas hardcounter ainda exige regra/evidência específica.",
        OFFICIAL_TEXT: "Efeito explícito no kit oficial, aguardando revisão de exceções.",
        INFERRED: "Hipótese lógica; apenas explicativa até validação.",
      },
      mechanicCounts,
    },
    taxonomy: Object.fromEntries(Object.entries(TAXONOMY).map(([id, definition]) => [id, { label: definition.label, category: definition.category, exploits: definition.exploits, checkedBy: definition.checkedBy }])),
    champions: mapped,
  };
}

function markdown(data) {
  const lines = [
    "# Mapeamento de mecânicas centrais por campeão v1.3",
    "",
    `Base oficial: Data Dragon ${data.metadata.dataDragon} / Patch ${data.metadata.patch}.`,
    "",
    "Este arquivo lista somente habilidades que alteram de forma material uma matchup ou a geometria do draft. Valores de 0 a 10 medem relevância condicional, não dano bruto.",
    "",
    "| Campeão | Skill | Mecânica | Lane | Draft | Entrega | Avaliação |",
    "|---|---|---|---:|---:|---:|---|",
  ];
  for (const champion of data.champions) {
    champion.mechanics.forEach((mechanic, index) => lines.push(`| ${index ? "" : champion.champion} | ${mechanic.slot} · ${mechanic.ability} | ${mechanic.label} | ${mechanic.laneImpact} | ${mechanic.draftImpact} | ${mechanic.reliability}/10 · alcance ${mechanic.reach}/10 · cobertura ${mechanic.coverage}/5 | ${mechanic.note} |`));
  }
  lines.push("", "## Regra de uso", "", "Uma mecânica só pontua quando encontra uma dependência concreta do adversário e passa pela camada de acesso. Point-and-click não significa aplicação automática; alcance, frontline, peel, zona e setup dos dois times alteram a entrega.");
  return `${lines.join("\n")}\n`;
}

const data = build();
fs.writeFileSync(path.join(root, "app/data/signature-mechanics.json"), `${JSON.stringify(data, null, 2)}\n`);
fs.writeFileSync(path.join(root, "docs/mapeamento-mecanicas-centrais-v1.3.md"), markdown(data));
console.log(`signature-mechanics: ${data.metadata.championCount} campeões, ${data.metadata.mechanicEntryCount} entradas`);
