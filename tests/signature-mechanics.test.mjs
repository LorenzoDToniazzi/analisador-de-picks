import assert from "node:assert/strict";
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync(new URL("../app/data/signature-mechanics.json", import.meta.url), "utf8"));

assert.equal(data.metadata.championCount, 173, "o catálogo deve cobrir todos os 173 campeões do patch");
assert.equal(data.champions.length, 173, "quantidade de campeões inconsistente");
assert.equal(data.metadata.mechanicEntryCount, 463, "quantidade de mecânicas mudou: revisar o catálogo e atualizar o teste conscientemente");

const championNames = new Set();
for (const champion of data.champions) {
  assert.ok(!championNames.has(champion.champion), `campeão duplicado: ${champion.champion}`);
  championNames.add(champion.champion);
  assert.ok(champion.mechanics.length >= 1, `${champion.champion} sem mecânica central`);

  const signatures = new Set();
  for (const mechanic of champion.mechanics) {
    const signature = `${mechanic.slot}:${mechanic.type}`;
    assert.ok(!signatures.has(signature), `${champion.champion} repete ${signature}`);
    signatures.add(signature);
    assert.ok(data.taxonomy[mechanic.type], `${champion.champion} usa tipo inexistente ${mechanic.type}`);
    assert.match(mechanic.slot, /^[PQWER]$/, `${champion.champion} tem slot inválido`);
    assert.ok(mechanic.ability?.length, `${champion.champion} ${mechanic.slot} sem nome oficial`);
    assert.ok(mechanic.officialSummary?.length, `${champion.champion} ${mechanic.slot} sem texto oficial`);
    assert.ok(mechanic.note?.length >= 30, `${champion.champion} ${mechanic.slot} sem avaliação suficiente`);
    for (const metric of ["power", "laneImpact", "draftImpact", "reliability", "reach"]) {
      assert.ok(Number.isFinite(mechanic[metric]) && mechanic[metric] >= 0 && mechanic[metric] <= 10, `${champion.champion} ${signature}: ${metric} fora de 0-10`);
    }
    assert.ok(Number.isFinite(mechanic.coverage) && mechanic.coverage >= 0 && mechanic.coverage <= 5, `${champion.champion} ${signature}: coverage fora de 0-5`);
    assert.equal(typeof mechanic.accessRequired, "boolean", `${champion.champion} ${signature}: accessRequired inválido`);
    assert.equal(mechanic.confidence, "CURATED", `${champion.champion} ${signature}: confiança inesperada`);
  }
}

for (const required of [
  ["Anivia", "W", "TERRAIN_CREATION"],
  ["Mordekaiser", "R", "REALM_ISOLATION"],
  ["Poppy", "W", "DASH_DENIAL"],
  ["Fiora", "W", "REACTIVE_PARRY"],
  ["Gwen", "W", "OUTSIDE_ZONE_IMMUNITY"],
  ["Mel", "W", "PROJECTILE_REFLECTION"],
  ["Zed", "W", "BLINK"],
]) {
  const [name, slot, type] = required;
  const champion = data.champions.find((row) => row.champion === name);
  assert.ok(champion?.mechanics.some((mechanic) => mechanic.slot === slot && mechanic.type === type), `assinatura crítica ausente: ${name} ${slot} ${type}`);
}

console.log(`signature-mechanics: ${data.champions.length} campeões e ${data.metadata.mechanicEntryCount} interações validadas`);
