const STORAGE_KEY = 'rom.project.state.v1';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function hydrateProjectState(defaultState, persistedState) {
  if (!isObject(persistedState)) {
    return defaultState;
  }

  return {
    ...defaultState,
    ...persistedState,
    projectInfo: {
      ...defaultState.projectInfo,
      ...(isObject(persistedState.projectInfo) ? persistedState.projectInfo : {}),
    },
    modules: {
      ...defaultState.modules,
      ...(isObject(persistedState.modules) ? persistedState.modules : {}),
    },
    moduleData: {
      ...defaultState.moduleData,
      ...(isObject(persistedState.moduleData) ? persistedState.moduleData : {}),
    },
    assumptions: Array.isArray(persistedState.assumptions) ? persistedState.assumptions : defaultState.assumptions,
    requirements: Array.isArray(persistedState.requirements) ? persistedState.requirements : defaultState.requirements,
    requirementsDocument: persistedState.requirementsDocument ?? defaultState.requirementsDocument,
  };
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
