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


function readPersistedPayload(parsedValue, options) {
  if (isObject(parsedValue) && isObject(parsedValue.state)) {
    const hasVersion = Object.hasOwn(parsedValue, 'version');
    const persistedVersion = Number(parsedValue.version);

    if (hasVersion && persistedVersion !== STORAGE_VERSION) {
      if (typeof options.migrateState === 'function') {
        return options.migrateState(parsedValue.state, {
          fromVersion: persistedVersion,
          toVersion: STORAGE_VERSION,
        });
      }

      return null;
    }
  }

  return unwrapPersistedPayload(parsedValue);
}

export function hydrateProjectState(defaultState, persistedState) {
  if (!isObject(persistedState)) {
    return defaultState;
  }

  return deepMerge(defaultState, persistedState);
}

export function loadPersistedProjectState(defaultState, options = {}) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultState;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return defaultState;
    }

    const parsedValue = JSON.parse(rawValue);
    const payload = readPersistedPayload(parsedValue, options);
    if (!payload) {
      return defaultState;
    }

    const hydratedState = hydrateProjectState(defaultState, payload);

    if (typeof options.normalizeState === 'function') {
      return options.normalizeState(hydratedState);
    }

    return hydratedState;
  } catch {
    return defaultState;
  }
}


function toSerializableRequirementsDocument(requirementsDocument) {
  if (!requirementsDocument || typeof requirementsDocument !== 'object') {
    return requirementsDocument ?? null;
  }

  const looksLikeFile = typeof requirementsDocument.name === 'string'
    && typeof requirementsDocument.size === 'number'
    && typeof requirementsDocument.type === 'string';

  if (!looksLikeFile) {
    return requirementsDocument;
  }

  return {
    name: requirementsDocument.name,
    size: requirementsDocument.size,
    type: requirementsDocument.type,
    lastModified: Number(requirementsDocument.lastModified || 0),
    persistedAs: 'file-metadata',
  };
}

export function preparePersistedProjectState(state) {
  if (!state || typeof state !== 'object') {
    return state;
  }

  return {
    ...state,
    requirementsDocument: toSerializableRequirementsDocument(state.requirementsDocument),
  };
}

export function persistProjectState(state, options = {}) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const envelope = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      state: typeof options.prepareState === 'function' ? options.prepareState(state) : state,
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
