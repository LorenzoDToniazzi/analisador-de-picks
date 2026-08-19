import { BUILD_TAGS, DraftEngine, RISK_TAGS, TAG_LABELS, inferBuildModifiers, modifiersFromProfile, resolveBuildProfile, scoreWeights } from "./engine.js";
import { clearState, exportState, importState, loadState, newId, saveState } from "./storage.js";

const VERSION = "16.16.1";
const PROFILE_MODEL = "1.1-qualitative-0-10";
const ROLES = ["TOP", "JUNGLE", "MID", "BOTTOM", "SUPPORT"];
const ROLE_LABEL = { TOP: "TOP", JUNGLE: "JUNGLE", MID: "MID", BOTTOM: "ADC", SUPPORT: "SUP" };
const POOL_LABEL = { principal: "Principal", secundaria: "Secundária", laboratorio: "Laboratório" };
const RELATION_LABEL = { HARDCOUNTERED: "Hardcountered", VERY_BAD: "Muito ruim", BAD: "Ruim", SLIGHTLY_BAD: "Levemente ruim", NEUTRAL: "Neutra", GOOD: "Boa", VERY_GOOD: "Muito boa" };
const MATCHUP_LABEL = {
  SEVERE_COUNTER: "Counter severo", COUNTERED: "Desfavorável", SLIGHTLY_COUNTERED: "Levemente desfavorável", BLIND: "Blind",
  EVEN: "Equilibrada", ADVANTAGED: "Favorável", STRONG_ADVANTAGE: "Muito favorável", HARDCOUNTERS: "Counter forte",
};

let state = loadState();
let champions = [];
let championByName = new Map();
let items = [];
let itemById = new Map();
let runes = [];
let engine;
let selectedItemIds = [];
let editorModifiers = null;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const championIcon = (champion) => `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/champion/${championByName.get(champion)?.id ?? champion}.png`;
const itemIcon = (item) => `https://ddragon.leagueoflegends.com/cdn/${VERSION}/img/item/${item.image}`;

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2600);
}

function persist(message = "Salvo localmente") {
  saveState(state);
  $("#save-status").textContent = message;
  setTimeout(() => { $("#save-status").textContent = "Salvo localmente"; }, 900);
}

function championOptions(selected = "", blank = "Selecione...") {
  return `<option value="">${blank}</option>${champions.map((champion) => `<option value="${escapeHtml(champion.name)}" ${champion.name === selected ? "selected" : ""}>${escapeHtml(champion.name)}</option>`).join("")}`;
}

function setTab(name) {
  $$(".tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === name));
  $$(".view").forEach((view) => view.classList.toggle("hidden", view.id !== `view-${name}`));
  if (name === "pool") renderPool();
  if (name === "builds") renderBuildArea();
  if (name === "overrides") renderOverrides();
  if (name === "settings") renderDataSummary();
}

function renderEnabledPools() {
  $("#enabled-pools").innerHTML = `<legend>Pools avaliadas</legend><div class="pool-toggle-list">${Object.keys(POOL_LABEL).map((pool) => `<label class="pool-toggle"><input type="checkbox" data-pool="${pool}" ${state.settings.enabledPools[pool] ? "checked" : ""}> ${POOL_LABEL[pool]}</label>`).join("")}</div><p id="pool-mode-hint" class="pool-mode-hint"></p>`;
  const updateModeHint = () => {
    const discoveryMode = Object.values(state.settings.enabledPools).every((enabled) => !enabled);
    $("#pool-mode-hint").textContent = discoveryMode
      ? "Modo Todos da rota: builds padrão, sem afinidade ou conforto."
      : "Somente as pools marcadas entram no ranking.";
    $("#enabled-pools").classList.toggle("discovery-mode", discoveryMode);
  };
  updateModeHint();
  $$("#enabled-pools input").forEach((input) => input.addEventListener("change", () => {
    state.settings.enabledPools[input.dataset.pool] = input.checked;
    persist(); updateModeHint();
  }));
}

function renderDraftBoard() {
  $("#draft-lane").value = state.draft.lane;
  for (const side of ["ally", "enemy"]) {
    const target = $(`#${side}-slots`);
    target.innerHTML = ROLES.map((role) => {
      const candidate = side === "ally" && role === state.draft.lane;
      return `<div class="slot ${candidate ? "candidate" : ""}"><span class="slot-name">${ROLE_LABEL[role]}</span>${candidate
        ? `<div class="candidate-placeholder">Sua variante entra aqui</div>`
        : `<select data-side="${side}" data-role="${role}" aria-label="${side} ${role}">${championOptions(state.draft[side][role], "Desconhecido")}</select>`}</div>`;
    }).join("");
  }
  $$(".slot select").forEach((select) => select.addEventListener("change", () => {
    state.draft[select.dataset.side][select.dataset.role] = select.value;
    persist();
  }));
}

function scoreClass(result) {
  if (result.status === "HARDCOUNTERED") return "score-hard";
  if (result.score >= 85) return "score-excellent";
  if (result.score >= 70) return "score-great";
  if (result.score >= 55) return "score-good";
  if (result.score >= 45) return "score-risk";
  if (result.score >= 30) return "score-avoid";
  return "score-no";
}

function renderMatchupAnalysis(result) {
  const matchup = result.matchupDetails;
  if (!matchup) return "";
  if (matchup.hard) return `<details class="matchup-analysis"><summary>Ver análise específica da matchup 1v1</summary><div class="matchup-analysis-body"><div class="matchup-head"><div><span>Contra</span><b>${escapeHtml(matchup.opponent)}</b></div><div><span>Veredito da lane</span><b>HARDCOUNTERED</b></div></div><p class="matchup-evidence">${escapeHtml(matchup.reason)}</p><p class="matchup-note">O veto pertence à matchup revelada; composição e conforto não devolvem nota a esta variante.</p></div></details>`;
  const list = (rows, empty) => rows.length
    ? `<ul class="matchup-list">${rows.map((row) => `<li>${escapeHtml(row.label)}</li>`).join("")}</ul>`
    : `<p class="muted">${empty}</p>`;
  const evidence = matchup.evidence
    ? `<p class="matchup-evidence">Δ2 ${matchup.evidence.delta2 > 0 ? "+" : ""}${matchup.evidence.delta2} · confiança estatística ${matchup.evidence.reliability}% · ${matchup.evidence.currentGames} jogos no patch / ${matchup.evidence.stableGames} em 30 dias</p>`
    : `<p class="matchup-evidence">Sem amostra direcional suficiente: leitura feita principalmente pelas ferramentas dos dois kits.</p>`;
  return `<details class="matchup-analysis"><summary>Ver análise específica da matchup 1v1</summary><div class="matchup-analysis-body">
    <div class="matchup-head"><div><span>Contra</span><b>${escapeHtml(matchup.opponent)}</b></div><div><span>Leitura isolada</span><b>${escapeHtml(MATCHUP_LABEL[matchup.tier] ?? matchup.tier)}</b></div><div><span>Índice 1v1</span><b>${matchup.score > 0 ? "+" : ""}${matchup.score}</b></div><div><span>Impacto no draft</span><b>${matchup.impact > 0 ? "+" : ""}${matchup.impact}</b></div></div>
    ${evidence}
    ${matchup.blind ? `<p class="muted">A lane está oculta. O índice usa a cauda dos piores adversários plausíveis, incluindo hardcounters.</p>` : `<div class="matchup-columns"><section><h4>O que favorece o pick</h4>${list(matchup.advantages, "Nenhuma vantagem estrutural forte identificada.")}</section><section><h4>O que dificulta a lane</h4>${list(matchup.risks, "Nenhum risco estrutural forte identificado.")}</section></div>`}
    <p class="matchup-note">Este painel isola o 1v1. Ele explica a matchup, mas não cria uma segunda nota nem altera o peso da composição.</p>
  </div></details>`;
}

function renderResults(results, discoveryMode = false) {
  const container = $("#results");
  if (!results.length) {
    container.innerHTML = `<div class="empty">Nenhuma variante habilitada para ${state.draft.lane}. Cadastre uma pool ou desmarque todas para avaliar os campeões da rota.</div>`;
    return;
  }
  const modeDescription = discoveryMode ? "Todos da rota · build padrão · afinidade neutra" : "Pools habilitadas · variantes cadastradas";
  container.innerHTML = `<div class="page-heading"><div><p class="eyebrow">${results.length} VARIANTES AVALIADAS</p><h2>Ranking completo</h2><p>${modeDescription}</p></div><p>Nota de adequação, não win rate.</p></div>${results.map((result, index) => {
    const hard = result.status === "HARDCOUNTERED";
    const unavailable = result.status === "UNAVAILABLE";
    const scoreText = hard ? "HARDCOUNTERED" : unavailable ? "INDISPONÍVEL" : `${result.score} · ${result.label}`;
    const components = result.components ? [
      ["Matchup", result.components.lane], ["Junglers", result.components.jungle], ["Comp inimiga", result.components.enemyComp],
      ["Comp aliada", result.components.allyComp], ["Prior", result.components.population], ["Afinidade", result.components.pool], ["Conforto", result.components.comfort],
    ] : [];
    return `<details class="result-card" ${index === 0 && result.status === "SCORED" ? "open" : ""}>
      <summary><div class="result-summary"><div class="result-identity"><span class="rank">${index + 1}</span><img class="champion-avatar" src="${championIcon(result.champion)}" alt=""><div><div class="result-name">${escapeHtml(result.champion)}</div><div class="result-build">${escapeHtml(result.name)} · ${result.kind === "CUSTOM" ? "custom" : "padrão"}</div></div></div><div class="score-badge ${scoreClass(result)}">${scoreText}</div></div></summary>
      <div class="result-body">${components.length ? `<div class="components">${components.map(([label, value]) => `<div class="component"><span>${label}</span><b>${value > 0 ? "+" : ""}${value}</b></div>`).join("")}</div>` : ""}
      ${renderMatchupAnalysis(result)}
      <p><b>${hard ? "Sem nota." : `Matchup: ${escapeHtml(result.matchupTier ?? "-")} · Confiança: ${escapeHtml(result.confidence ?? "-")}`}</b></p>
      <ul class="reason-list">${(result.reasons ?? [result.reason]).filter(Boolean).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}</ul></div>
    </details>`;
  }).join("")}`;
}

function analyzeDraft() {
  const duplicatePicks = [...Object.values(state.draft.ally), ...Object.values(state.draft.enemy)].filter(Boolean);
  const duplicated = duplicatePicks.find((name, index) => duplicatePicks.indexOf(name) !== index);
  const message = $("#draft-message");
  if (duplicated) {
    message.textContent = `${duplicated} aparece duas vezes no draft. Corrija antes da análise.`;
    message.classList.remove("hidden");
    return;
  }
  message.classList.add("hidden");
  const discoveryMode = Object.values(state.settings.enabledPools).every((enabled) => !enabled);
  renderResults(engine.rank(state.draft, state), discoveryMode);
}

function renderPool() {
  $("#pool-champion").innerHTML = championOptions();
  const container = $("#pool-list");
  if (!state.pools.length) {
    container.innerHTML = `<div class="empty">Nenhum campeão cadastrado. O aplicativo não inventa uma pool por você.</div>`;
    return;
  }
  container.innerHTML = state.pools.slice().sort((a, b) => a.lane.localeCompare(b.lane) || a.champion.localeCompare(b.champion)).map((entry) => `<div class="list-card" data-id="${entry.id}"><div class="list-main"><img class="champion-avatar" src="${championIcon(entry.champion)}" alt=""><div><b>${escapeHtml(entry.champion)}</b><p>${entry.lane} · ${POOL_LABEL[entry.pool]} · conforto ${entry.comfort}</p></div></div><div class="list-actions"><label class="pool-toggle"><input class="default-toggle" type="checkbox" ${entry.includeDefault !== false ? "checked" : ""}> padrão</label><select class="pool-type-inline"><option value="principal" ${entry.pool === "principal" ? "selected" : ""}>Principal</option><option value="secundaria" ${entry.pool === "secundaria" ? "selected" : ""}>Secundária</option><option value="laboratorio" ${entry.pool === "laboratorio" ? "selected" : ""}>Laboratório</option></select><select class="comfort-inline">${[5,4,3,2,1].map((value) => `<option value="${value}" ${entry.comfort === value ? "selected" : ""}>Conforto ${value}</option>`).join("")}</select><button class="button danger small remove-pool">Remover</button></div></div>`).join("");
  $$("#pool-list .list-card").forEach((card) => {
    const entry = state.pools.find((row) => row.id === card.dataset.id);
    card.querySelector(".default-toggle").addEventListener("change", (event) => { entry.includeDefault = event.target.checked; persist(); });
    card.querySelector(".pool-type-inline").addEventListener("change", (event) => { entry.pool = event.target.value; persist(); renderPool(); });
    card.querySelector(".comfort-inline").addEventListener("change", (event) => { entry.comfort = Number(event.target.value); persist(); renderPool(); });
    card.querySelector(".remove-pool").addEventListener("click", () => { state.pools = state.pools.filter((row) => row.id !== entry.id); persist(); renderPool(); toast("Removido da pool. Builds foram preservadas."); });
  });
}

function poolEntryOptions(selected = "") {
  if (!state.pools.length) return `<option value="">Cadastre uma pool primeiro</option>`;
  return state.pools.slice().sort((a, b) => a.champion.localeCompare(b.champion)).map((entry) => `<option value="${entry.id}" ${entry.id === selected ? "selected" : ""}>${escapeHtml(entry.champion)} · ${entry.lane}</option>`).join("");
}

function renderSelectedItems() {
  $("#selected-items").innerHTML = selectedItemIds.length ? selectedItemIds.map((id) => {
    const item = itemById.get(id);
    return item ? `<span class="chip"><img src="${itemIcon(item)}" alt="">${escapeHtml(item.name)}<button type="button" data-id="${id}" aria-label="Remover ${escapeHtml(item.name)}">×</button></span>` : "";
  }).join("") : `<span class="muted">Nenhum item. Você ainda pode registrar manualmente o perfil.</span>`;
  $$("#selected-items button").forEach((button) => button.addEventListener("click", () => { selectedItemIds = selectedItemIds.filter((id) => id !== button.dataset.id); renderSelectedItems(); }));
}

function renderSliders() {
  if (!editorModifiers) return;
  const entry = state.pools.find((row) => row.id === $("#build-pool-entry").value);
  const champion = championByName.get(entry?.champion);
  if (!champion) return;
  const render = (tags, side) => tags.map((tag) => {
    const base = champion.profile[side]?.[tag] ?? 0;
    const delta = editorModifiers[side]?.[tag] ?? 0;
    const final = Math.max(0, Math.min(10, base + delta));
    const direction = delta > 0 ? `+${delta}` : `${delta}`;
    return `<label class="slider-row"><span>${escapeHtml(TAG_LABELS[tag] ?? tag)}</span><span class="base-score">${base}</span><input type="range" min="-10" max="10" step="0.5" value="${delta}" data-side="${side}" data-tag="${tag}"><output><b>${direction}</b><strong>${final}</strong></output></label>`;
  }).join("");
  $("#strength-sliders").innerHTML = `<div class="attribute-head"><span>Atributo</span><span>Padrão</span><span>Ajuste</span><span>Final</span></div>${render(BUILD_TAGS, "strengths")}`;
  $("#risk-sliders").innerHTML = `<p class="risk-help">Nas fraquezas, valor positivo piora o risco e valor negativo reduz.</p><div class="attribute-head"><span>Fraqueza</span><span>Padrão</span><span>Ajuste</span><span>Final</span></div>${render(RISK_TAGS, "weaknesses")}`;
  $$(".slider-row input").forEach((input) => input.addEventListener("input", () => {
    editorModifiers[input.dataset.side] ??= {};
    const value = Number(input.value);
    editorModifiers[input.dataset.side][input.dataset.tag] = value;
    const base = champion.profile[input.dataset.side]?.[input.dataset.tag] ?? 0;
    const output = input.nextElementSibling;
    output.querySelector("b").textContent = value > 0 ? `+${value}` : `${value}`;
    output.querySelector("strong").textContent = Math.max(0, Math.min(10, base + value));
  }));
}

function resetBuildEditor(entryId = state.pools[0]?.id ?? "") {
  $("#build-id").value = "";
  $("#build-pool-entry").innerHTML = poolEntryOptions(entryId);
  $("#build-name").value = "";
  $("#build-keystone").value = "";
  $("#build-runes-note").value = "";
  $("#build-notes").value = "";
  $("#build-enabled").checked = true;
  selectedItemIds = [];
  const entry = state.pools.find((row) => row.id === $("#build-pool-entry").value);
  editorModifiers = entry ? { strengths: Object.fromEntries(BUILD_TAGS.map((tag) => [tag, 0])), weaknesses: Object.fromEntries(RISK_TAGS.map((tag) => [tag, 0])) } : null;
  renderSelectedItems();
  renderSliders();
}

function migrateBuildProfiles() {
  let changed = false;
  for (const build of state.builds) {
    if (build.profileModel === PROFILE_MODEL) continue;
    const champion = championByName.get(build.champion);
    if (!champion) continue;
    const modifiers = structuredClone(build.modifiers ?? (build.profile ? modifiersFromProfile(champion.profile, build.profile) : inferBuildModifiers(champion, [], build.keystone)));
    const selected = (build.itemIds ?? []).map((id) => itemById.get(id)).filter(Boolean);
    modifiers.mechanics = inferBuildModifiers(champion, selected, build.keystone).mechanics;
    build.modifiers = modifiers;
    build.profile = resolveBuildProfile(champion.profile, modifiers);
    build.profileModel = PROFILE_MODEL;
    changed = true;
  }
  if (changed) saveState(state);
}

function renderBuildList() {
  const container = $("#build-list");
  if (!state.builds.length) {
    container.innerHTML = `<div class="empty">Nenhuma build customizada.</div>`;
    return;
  }
  container.innerHTML = state.builds.map((build) => `<div class="list-card" data-id="${build.id}"><div class="list-main"><img class="champion-avatar" src="${championIcon(build.champion)}" alt=""><div><b>${escapeHtml(build.champion)} · ${escapeHtml(build.name)}</b><p>${build.lane} · ${build.itemIds?.length ?? 0} itens · ${escapeHtml(build.keystone || "sem runa-chave")} ${build.enabled === false ? "· desabilitada" : ""}</p></div></div><div class="list-actions"><button class="button secondary small edit-build">Editar</button><button class="button danger small delete-build">Excluir</button></div></div>`).join("");
  $$("#build-list .list-card").forEach((card) => {
    card.querySelector(".edit-build").addEventListener("click", () => editBuild(card.dataset.id));
    card.querySelector(".delete-build").addEventListener("click", () => {
      state.builds = state.builds.filter((build) => build.id !== card.dataset.id);
      state.overrides = state.overrides.filter((rule) => rule.variantId !== card.dataset.id);
      persist(); renderBuildArea(); toast("Build e overrides ligados a ela foram removidos.");
    });
  });
}

function editBuild(id) {
  const build = state.builds.find((row) => row.id === id);
  if (!build) return;
  const entry = state.pools.find((row) => row.champion === build.champion && row.lane === build.lane);
  $("#build-id").value = build.id;
  $("#build-pool-entry").innerHTML = poolEntryOptions(entry?.id);
  $("#build-name").value = build.name;
  $("#build-keystone").value = build.keystone ?? "";
  $("#build-runes-note").value = build.runesNote ?? "";
  $("#build-notes").value = build.notes ?? "";
  $("#build-enabled").checked = build.enabled !== false;
  selectedItemIds = [...(build.itemIds ?? [])];
  const champion = championByName.get(build.champion);
  editorModifiers = structuredClone(build.modifiers ?? modifiersFromProfile(champion.profile, build.profile));
  renderSelectedItems(); renderSliders();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBuildArea() {
  $("#build-pool-entry").innerHTML = poolEntryOptions($("#build-pool-entry").value);
  if (!editorModifiers && state.pools.length) resetBuildEditor();
  renderBuildList();
}

function variantOptions() {
  const rows = [];
  for (const entry of state.pools) {
    if (entry.includeDefault !== false) rows.push({ id: `default:${entry.lane}:${entry.champion}`, champion: entry.champion, lane: entry.lane, name: "Build padrão" });
    for (const build of state.builds.filter((build) => build.champion === entry.champion && build.lane === entry.lane)) rows.push(build);
  }
  return rows;
}

function renderOverrides() {
  const variants = variantOptions();
  $("#override-variant").innerHTML = variants.length ? variants.map((variant) => `<option value="${variant.id}">${escapeHtml(variant.champion)} · ${variant.lane} · ${escapeHtml(variant.name)}</option>`).join("") : `<option value="">Cadastre a pool primeiro</option>`;
  $("#override-opponent").innerHTML = championOptions();
  const container = $("#override-list");
  if (!state.overrides.length) { container.innerHTML = `<div class="empty">Nenhuma relação pessoal registrada.</div>`; return; }
  container.innerHTML = state.overrides.map((rule) => `<div class="list-card"><div><b>${escapeHtml(rule.champion)} · ${escapeHtml(rule.variantName)} vs ${escapeHtml(rule.opponent)}</b><p>${rule.lane} · ${RELATION_LABEL[rule.relation]} · ${escapeHtml(rule.confidence)}</p><p>${escapeHtml(rule.reason)}</p></div><button class="button danger small delete-override" data-id="${rule.id}">Excluir</button></div>`).join("");
  $$(".delete-override").forEach((button) => button.addEventListener("click", () => { state.overrides = state.overrides.filter((rule) => rule.id !== button.dataset.id); persist(); renderOverrides(); }));
}

function renderDataSummary() {
  $("#data-summary").innerHTML = `<h3>Base carregada</h3><ul class="clean-list"><li><b>${champions.length}</b> campeões com perfil 0-10</li><li><b>${items.length}</b> itens de SR</li><li><b>${runes.length}</b> runas-chave</li><li><b>${state.pools.length}</b> entradas de pool</li><li><b>${state.builds.length}</b> builds customizadas</li><li><b>${state.overrides.length}</b> relações pessoais</li></ul><p class="muted">Patch 26.16 · Data Dragon ${VERSION} · estatística Diamond+ com prior Emerald+.</p><p class="muted">Pesos: lane ${scoreWeights.laneMatchup}, jungler ${scoreWeights.jungleInteraction}, comp inimiga ${scoreWeights.enemyComp}, comp aliada ${scoreWeights.allyComp}.</p>`;
}

function bindEvents() {
  $$(".tab").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.tab)));
  $("#draft-lane").addEventListener("change", (event) => {
    state.draft.lane = event.target.value;
    state.draft.ally[state.draft.lane] = "";
    persist(); renderDraftBoard(); $("#results").innerHTML = "";
  });
  $("#analyze-button").addEventListener("click", analyzeDraft);
  $("#clear-draft").addEventListener("click", () => { for (const side of ["ally", "enemy"]) for (const role of ROLES) state.draft[side][role] = ""; persist(); renderDraftBoard(); $("#results").innerHTML = ""; });

  $("#pool-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const champion = $("#pool-champion").value;
    const lane = $("#pool-lane").value;
    if (!champion) return;
    if (state.pools.some((entry) => entry.champion === champion && entry.lane === lane)) return toast("Esse campeão já está cadastrado nessa rota.");
    state.pools.push({ id: newId("pool"), champion, lane, pool: $("#pool-type").value, comfort: Number($("#pool-comfort").value), includeDefault: $("#pool-default").checked });
    persist(); renderPool(); toast(`${champion} entrou na pool de ${lane}.`);
  });

  $("#build-pool-entry").addEventListener("change", () => resetBuildEditor($("#build-pool-entry").value));
  $("#add-item").addEventListener("click", () => {
    const name = $("#item-search").value.trim().toLowerCase();
    const item = items.find((row) => row.name.toLowerCase() === name);
    if (!item) return toast("Escolha um item existente da lista.");
    if (selectedItemIds.includes(item.id)) return toast("Esse item já está na build.");
    if (selectedItemIds.length >= 6) return toast("A build avaliada aceita até seis itens. Alternativas podem ficar nas notas.");
    selectedItemIds.push(item.id); $("#item-search").value = ""; renderSelectedItems();
  });
  $("#infer-profile").addEventListener("click", () => {
    const entry = state.pools.find((row) => row.id === $("#build-pool-entry").value);
    if (!entry) return toast("Cadastre ou selecione uma entrada da pool.");
    editorModifiers = inferBuildModifiers(championByName.get(entry.champion), selectedItemIds.map((id) => itemById.get(id)).filter(Boolean), $("#build-keystone").value);
    renderSliders(); toast("Sugestão recalculada. Revise antes de salvar.");
  });
  $("#cancel-build").addEventListener("click", () => resetBuildEditor());
  $("#build-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const entry = state.pools.find((row) => row.id === $("#build-pool-entry").value);
    if (!entry || !editorModifiers) return toast("Selecione uma entrada da pool.");
    const champion = championByName.get(entry.champion);
    editorModifiers.mechanics = inferBuildModifiers(champion, selectedItemIds.map((id) => itemById.get(id)).filter(Boolean), $("#build-keystone").value).mechanics;
    const existingId = $("#build-id").value;
    const build = {
      id: existingId || newId("build"), champion: entry.champion, lane: entry.lane, name: $("#build-name").value.trim(),
      itemIds: [...selectedItemIds], keystone: $("#build-keystone").value, runesNote: $("#build-runes-note").value.trim(),
      notes: $("#build-notes").value.trim(), enabled: $("#build-enabled").checked,
      modifiers: structuredClone(editorModifiers), profile: resolveBuildProfile(champion.profile, editorModifiers), profileModel: PROFILE_MODEL, updatedAt: new Date().toISOString(),
    };
    if (!build.name) return;
    const index = state.builds.findIndex((row) => row.id === build.id);
    if (index >= 0) state.builds[index] = build; else state.builds.push(build);
    persist(); resetBuildEditor(entry.id); renderBuildList(); toast("Variante independente salva.");
  });

  $("#override-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const variant = variantOptions().find((row) => row.id === $("#override-variant").value);
    if (!variant || !$("#override-opponent").value) return;
    state.overrides.push({ id: newId("matchup"), variantId: variant.id, variantName: variant.name, champion: variant.champion, lane: variant.lane, opponent: $("#override-opponent").value, relation: $("#override-relation").value, confidence: $("#override-confidence").value, reason: $("#override-reason").value.trim() });
    persist(); $("#override-reason").value = ""; renderOverrides(); toast("Relação pessoal registrada.");
  });

  $("#export-data").addEventListener("click", () => exportState(state));
  $("#import-data").addEventListener("change", async (event) => {
    try { state = await importState(event.target.files[0]); persist("Importado"); renderAll(); toast("Dados importados."); }
    catch { toast("JSON inválido. Nada foi alterado."); }
    event.target.value = "";
  });
  $("#clear-data").addEventListener("click", () => {
    if (!confirm("Limpar pool, builds, overrides e draft deste navegador?")) return;
    state = clearState(); editorModifiers = null; selectedItemIds = []; renderAll(); toast("Dados locais removidos.");
  });
}

function renderAll() {
  renderEnabledPools(); renderDraftBoard(); renderPool(); resetBuildEditor(); renderBuildList(); renderOverrides(); renderDataSummary(); $("#results").innerHTML = "";
}

async function load() {
  try {
    const paths = {
      champions: "app/data/champions.json", items: "app/data/items.json", runes: "app/data/runes.json",
      midCurrent: "data/midlane-matchups-diamond-26.16.json", midStable: "data/midlane-matchups-diamond-30d-26.16.json", midFallback: "data/midlane-matchups-emerald-30d-26.16.json",
      topCurrent: "data/toplane-matchups-diamond-26.16.json", topStable: "data/toplane-matchups-diamond-30d-26.16.json", topFallback: "data/toplane-matchups-emerald-30d-26.16.json",
    };
    const loaded = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([key, path]) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`${response.status} em ${path}`);
      return [key, await response.json()];
    })));
    champions = loaded.champions.champions;
    championByName = new Map(champions.map((champion) => [champion.name, champion]));
    items = loaded.items.items;
    itemById = new Map(items.map((item) => [item.id, item]));
    runes = loaded.runes.styles.flatMap((style) => style.keystones);
    engine = new DraftEngine(champions, {
      MID: { current: loaded.midCurrent, stable: loaded.midStable, fallback: loaded.midFallback },
      TOP: { current: loaded.topCurrent, stable: loaded.topStable, fallback: loaded.topFallback },
    });
    migrateBuildProfiles();
    $("#item-options").innerHTML = items.map((item) => `<option value="${escapeHtml(item.name)}">${item.gold} ouro</option>`).join("");
    $("#build-keystone").innerHTML = `<option value="">Sem runa definida</option>${runes.map((rune) => `<option value="${escapeHtml(rune.name)}">${escapeHtml(rune.name)}</option>`).join("")}`;
    bindEvents(); renderAll();
    $("#loading").classList.add("hidden");
    $("#view-draft").classList.remove("hidden");
  } catch (error) {
    $("#loading").innerHTML = `<div><strong>Não foi possível carregar a base.</strong><p>${escapeHtml(error.message)}</p><p>Abra por um servidor HTTP ou pela página publicada.</p></div>`;
    console.error(error);
  }
}

load();
