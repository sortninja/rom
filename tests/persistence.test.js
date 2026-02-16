import test from 'node:test';
import assert from 'node:assert/strict';

import {
  hydrateProjectState,
  loadPersistedProjectState,
  persistProjectState,
  STORAGE_KEY,
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

test('persistProjectState writes serialized state using storage key', () => {
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
  assert.deepEqual(JSON.parse(storedValue), defaultState);
  globalThis.window = originalWindow;
});
