const STORAGE_KEY = 'rom.project.state.v1';

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
    return hydrateProjectState(defaultState, parsedValue);
  } catch {
    return defaultState;
  }
}

export function persistProjectState(state) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Intentionally ignore localStorage write errors.
  }
}

export { STORAGE_KEY };
