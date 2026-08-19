import assert from "node:assert/strict";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const happyPath = process.env.HAPPY_DOM_PATH;
if (!happyPath) {
  console.log("app-dom: ignorado (HAPPY_DOM_PATH ausente)");
  process.exit(0);
}
const { Window } = await import(happyPath);
const window = new Window({ url: process.env.DRAFTLAB_URL ?? "http://127.0.0.1:4173/" });
window.document.write(fs.readFileSync(new URL("../index.html", import.meta.url), "utf8"));
const nativeFetch = globalThis.fetch;
const relativeFetch = (input, init) => nativeFetch(new URL(String(input), window.location.href), init);
Object.assign(globalThis, {
  window,
  document: window.document,
  localStorage: window.localStorage,
  location: window.location,
  Blob: window.Blob,
  URL: window.URL,
  confirm: () => true,
  fetch: relativeFetch,
});

await import(pathToFileURL(new URL("../app/app.js", import.meta.url).pathname));
for (let index = 0; index < 200 && window.document.querySelector("#view-draft")?.classList.contains("hidden"); index += 1) await new Promise((resolve) => setTimeout(resolve, 25));
assert.ok(!window.document.querySelector("#view-draft").classList.contains("hidden"), "app deve carregar");
assert.equal(window.document.querySelectorAll("#pool-champion option").length, 174, "173 campeões + vazio");
assert.equal(window.document.querySelectorAll("#build-keystone option").length, 18, "17 runas-chave + vazio");
assert.ok(window.document.querySelector("#data-summary").textContent.includes("211"), "catálogo de itens deve aparecer");

const set = (selector, value) => { const element = window.document.querySelector(selector); element.value = value; element.dispatchEvent(new window.Event("change", { bubbles: true })); };
window.document.querySelector('[data-tab="pool"]').click();
set("#pool-champion", "Mel");
set("#pool-lane", "MID");
set("#pool-type", "principal");
set("#pool-comfort", "5");
window.document.querySelector("#pool-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
set("#pool-champion", "Tahm Kench");
set("#pool-type", "laboratorio");
window.document.querySelector("#pool-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(window.document.querySelectorAll("#pool-list .list-card").length, 2, "pool deve aceitar duas entradas");

window.document.querySelector('[data-tab="builds"]').click();
const tahmOption = [...window.document.querySelectorAll("#build-pool-entry option")].find((option) => option.textContent === "Tahm Kench · MID");
set("#build-pool-entry", tahmOption.value);
set("#build-name", "AP/Bruiser teste");
set("#item-search", "Hextech Rocketbelt");
window.document.querySelector("#add-item").click();
set("#build-keystone", "Hail of Blades");
window.document.querySelector("#infer-profile").click();
window.document.querySelector("#build-form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
assert.equal(window.document.querySelectorAll("#build-list .list-card").length, 1, "build custom deve ser salva");

window.document.querySelector('[data-tab="draft"]').click();
set('select[data-side="enemy"][data-role="MID"]', "Cassiopeia");
set('select[data-side="enemy"][data-role="TOP"]', "Ornn");
window.document.querySelector("#analyze-button").click();
assert.equal(window.document.querySelectorAll("#results .result-card").length, 3, "cada variante deve ocupar uma linha");
assert.ok(window.document.querySelector("#results").textContent.includes("HARDCOUNTERED"), "Mel deve ficar sem nota contra Cassiopeia");
assert.ok(window.document.querySelector("#results").textContent.includes("AP/Bruiser teste"), "build custom deve aparecer no ranking");

for (const input of window.document.querySelectorAll("#enabled-pools input")) {
  input.checked = false;
  input.dispatchEvent(new window.Event("change", { bubbles: true }));
}
assert.ok(window.document.querySelector("#pool-mode-hint").textContent.includes("Todos da rota"), "interface deve explicitar o modo neutro");
window.document.querySelector("#analyze-button").click();
assert.ok(window.document.querySelectorAll("#results .result-card").length > 50, "sem pools marcadas deve exibir o roster completo da lane");
assert.ok(window.document.querySelector("#results").textContent.includes("afinidade neutra"), "ranking deve identificar o modo sem afinidade");

console.log("app-dom: 13 checks passaram");
