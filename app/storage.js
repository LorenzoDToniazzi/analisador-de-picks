const STORAGE_KEY = "pick-analyzer:v1";

export const POOL_TYPES = ["principal", "secundaria", "laboratorio"];
export const LANES = ["MID", "TOP"];

function emptyDraft(lane = "MID") {
  return {
    lane,
    ally: { TOP: "", JUNGLE: "", MID: "", BOTTOM: "", SUPPORT: "" },
    enemy: { TOP: "", JUNGLE: "", MID: "", BOTTOM: "", SUPPORT: "" },
  };
}

export function initialState() {
  return {
    version: 1,
    pools: [],
    builds: [],
    overrides: [],
    settings: {
      enabledPools: { principal: true, secundaria: true, laboratorio: true },
    },
    draft: emptyDraft(),
  };
}

function sanitize(value) {
  const base = initialState();
  if (!value || typeof value !== "object") return base;
  return {
    ...base,
    ...value,
    pools: Array.isArray(value.pools) ? value.pools : [],
    builds: Array.isArray(value.builds) ? value.builds : [],
    overrides: Array.isArray(value.overrides) ? value.overrides : [],
    settings: {
      ...base.settings,
      ...(value.settings ?? {}),
      enabledPools: { ...base.settings.enabledPools, ...(value.settings?.enabledPools ?? {}) },
    },
    draft: {
      ...emptyDraft(value.draft?.lane),
      ...(value.draft ?? {}),
      ally: { ...emptyDraft().ally, ...(value.draft?.ally ?? {}) },
      enemy: { ...emptyDraft().enemy, ...(value.draft?.enemy ?? {}) },
    },
  };
}

export function loadState() {
  try {
    return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return initialState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitize(state)));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
  return initialState();
}

export function exportState(state) {
  const content = JSON.stringify({ ...sanitize(state), exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `analisador-picks-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importState(file) {
  const text = await file.text();
  return sanitize(JSON.parse(text));
}

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

