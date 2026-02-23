import test from 'node:test';
import assert from 'node:assert/strict';

import {
  hydrateProjectState,
  loadPersistedProjectState,
  persistProjectState,
  clearPersistedProjectState,
  STORAGE_KEY,
  STORAGE_VERSION,
} from '../src/utils/persistence.js';

const defaultState = {
  projectInfo: { name: 'Untitled Project', lead: '', status: 'DRAFT' },
  modules: {
    operational_data: { id: 'operational_data', selected: true, sourcing: 'In-House' },
    implementation: { id: 'implementation', selected: true, sourcing: 'In-House' },
  },
  moduleData: {
    operational_data: {
      throughput: { peakUnitsPerHour: 5000, averageUnitsPerHour: 3500 },
      operatingHours: { shiftsPerDay: 2, daysPerWeek: 5 },
      inventory: { totalSKUs: 15000 },
    },
  },
  assumptions: [],
  requirements: [],
  requirementsDocument: null,
};

test('hydrateProjectState merges persisted values with defaults', () => {
  const hydrated = hydrateProjectState(defaultState, {
    projectInfo: { name: 'Pilot Site', lead: 'Alex' },
    modules: {
      robotic_systems: { id: 'robotic_systems', selected: true, sourcing: 'Buyout' },
    },
    requirements: [{ id: 'r1', text: 'System must process 1000 UPH' }],
  });

  assert.equal(hydrated.projectInfo.name, 'Pilot Site');
  assert.equal(hydrated.projectInfo.status, 'DRAFT');
  assert.equal(hydrated.modules.operational_data.selected, true);
  assert.equal(hydrated.modules.robotic_systems.sourcing, 'Buyout');
  assert.equal(hydrated.requirements.length, 1);
});

test('hydrateProjectState preserves default nested module fields when persisted payload is partial', () => {
  const hydrated = hydrateProjectState(defaultState, {
    moduleData: {
      operational_data: {
        throughput: { peakUnitsPerHour: 6000 },
      },
    },
  });

  assert.equal(hydrated.moduleData.operational_data.throughput.peakUnitsPerHour, 6000);
  assert.equal(hydrated.moduleData.operational_data.throughput.averageUnitsPerHour, 3500);
  assert.equal(hydrated.moduleData.operational_data.operatingHours.shiftsPerDay, 2);
  assert.equal(hydrated.moduleData.operational_data.inventory.totalSKUs, 15000);
});

test('loadPersistedProjectState supports legacy raw-state payloads', () => {
  const originalWindow = globalThis.window;

  const persisted = {
    projectInfo: { name: 'Legacy Payload' },
    moduleData: {
      operational_data: {
        throughput: { peakUnitsPerHour: 7000 },
      },
    },
  };

  const fakeStorage = {
    getItem: () => JSON.stringify(persisted),
    setItem: () => {},
  };

  globalThis.window = { localStorage: fakeStorage };
  const loaded = loadPersistedProjectState(defaultState);

  assert.equal(loaded.projectInfo.name, 'Legacy Payload');
  assert.equal(loaded.moduleData.operational_data.throughput.averageUnitsPerHour, 3500);
  globalThis.window = originalWindow;
});

test('loadPersistedProjectState returns default state on invalid JSON', () => {
  const originalWindow = globalThis.window;
  const fakeStorage = {
    getItem: () => '{invalid-json',
    setItem: () => {},
  };

  globalThis.window = { localStorage: fakeStorage };
  const loaded = loadPersistedProjectState(defaultState);

  assert.deepEqual(loaded, defaultState);
  globalThis.window = originalWindow;
});

test('persistProjectState writes storage envelope using storage key', () => {
  const originalWindow = globalThis.window;
  let storedKey = '';
  let storedValue = '';

  const fakeStorage = {
    getItem: () => null,
    setItem: (key, value) => {
      storedKey = key;
      storedValue = value;
    },
  };

  globalThis.window = { localStorage: fakeStorage };
  persistProjectState(defaultState);

  assert.equal(storedKey, STORAGE_KEY);

  const parsed = JSON.parse(storedValue);
  assert.equal(parsed.version, STORAGE_VERSION);
  assert.equal(typeof parsed.savedAt, 'string');
  assert.deepEqual(parsed.state, defaultState);

  globalThis.window = originalWindow;
});

test('clearPersistedProjectState removes the storage key', () => {
  const originalWindow = globalThis.window;
  let removedKey = '';

  const fakeStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: (key) => {
      removedKey = key;
    },
  };

  globalThis.window = { localStorage: fakeStorage };
  clearPersistedProjectState();

  assert.equal(removedKey, STORAGE_KEY);
  globalThis.window = originalWindow;
});


test('loadPersistedProjectState applies normalizeState callback when provided', () => {
  const originalWindow = globalThis.window;
  const fakeStorage = {
    getItem: () => JSON.stringify({
      state: {
        assumptions: 'not-an-array',
        requirements: null,
        projectQuotes: [{ id: 'q1', projectNumber: 1001 }, null, 'bad'],
      },
    }),
    setItem: () => {},
  };

  globalThis.window = { localStorage: fakeStorage };
  const loaded = loadPersistedProjectState(defaultState, {
    normalizeState: (state) => ({
      ...state,
      assumptions: Array.isArray(state.assumptions) ? state.assumptions : [],
      requirements: Array.isArray(state.requirements) ? state.requirements : [],
      projectQuotes: Array.isArray(state.projectQuotes)
        ? state.projectQuotes.filter((quote) => quote && typeof quote === 'object')
        : [],
    }),
  });

  assert.deepEqual(loaded.assumptions, []);
  assert.deepEqual(loaded.requirements, []);
  assert.equal(loaded.projectQuotes.length, 1);
  assert.equal(loaded.projectQuotes[0].projectNumber, 1001);

  globalThis.window = originalWindow;
});


test('loadPersistedProjectState returns defaults for unsupported envelope version without migration', () => {
  const originalWindow = globalThis.window;
  const fakeStorage = {
    getItem: () => JSON.stringify({ version: 99, state: { projectInfo: { name: 'Old Schema' } } }),
    setItem: () => {},
  };

  globalThis.window = { localStorage: fakeStorage };
  const loaded = loadPersistedProjectState(defaultState);

  assert.deepEqual(loaded, defaultState);
  globalThis.window = originalWindow;
});


test('loadPersistedProjectState applies migrateState for older envelope version', () => {
  const originalWindow = globalThis.window;
  const fakeStorage = {
    getItem: () => JSON.stringify({
      version: 0,
      state: { projectInfo: { name: 'Migrated Project' }, legacyQuotes: [{ id: 'q1' }] },
    }),
    setItem: () => {},
  };

  globalThis.window = { localStorage: fakeStorage };
  let migrationMeta;
  const loaded = loadPersistedProjectState(defaultState, {
    migrateState: (state, meta) => {
      migrationMeta = meta;
      return {
        ...state,
        projectQuotes: state.legacyQuotes || [],
      };
    },
  });

  assert.equal(loaded.projectInfo.name, 'Migrated Project');
  assert.equal(Array.isArray(loaded.projectQuotes), true);
  assert.equal(loaded.projectQuotes.length, 1);
  assert.deepEqual(migrationMeta, { fromVersion: 0, toVersion: STORAGE_VERSION });

  globalThis.window = originalWindow;
});
