const STORAGE_KEY = 'rom.project.state.v1';
const STORAGE_VERSION = 1;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(defaultValue, persistedValue) {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(persistedValue) ? persistedValue : defaultValue;
  }

  if (isObject(defaultValue)) {
    if (!isObject(persistedValue)) {
      return defaultValue;
    }

    const merged = { ...defaultValue };

    Object.keys(persistedValue).forEach((key) => {
      merged[key] = key in defaultValue
        ? deepMerge(defaultValue[key], persistedValue[key])
        : persistedValue[key];
    });

    return merged;
  }

  return persistedValue === undefined ? defaultValue : persistedValue;
}

function unwrapPersistedPayload(parsedValue) {
  // Backward compatibility with the previous raw-state format.
  if (isObject(parsedValue) && isObject(parsedValue.state)) {
    return parsedValue.state;
  }

  return parsedValue;
}

export function hydrateProjectState(defaultState, persistedState) {
  if (!isObject(persistedState)) {
    return defaultState;
  }

  return deepMerge(defaultState, persistedState);
}

export function loadPersistedProjectState(defaultState) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultState;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return defaultState;
    }

    const parsedValue = JSON.parse(rawValue);
    const payload = unwrapPersistedPayload(parsedValue);
    return hydrateProjectState(defaultState, payload);
  } catch {
    return defaultState;
  }
}

export function persistProjectState(state) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const envelope = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    // Intentionally ignore localStorage write errors.
  }
}

export function clearPersistedProjectState() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Intentionally ignore localStorage removal errors.
  }
}

export { STORAGE_KEY, STORAGE_VERSION };
