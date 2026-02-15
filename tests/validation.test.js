import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateOperationalData,
  validateRobotFleet,
  validateConveyanceSegments,
  validateStorageZones,
  validateControlPanels,
} from '../src/utils/validation.js';
import {
  calculateRobotLineCost,
  calculateRoboticsHardwareCost,
  calculateConveyanceHardwareCost,
  calculateConveyanceSegmentCost,
  calculateStorageZoneCost,
  calculateStorageInfrastructureCost,
  calculateControlPanelCost,
  calculateControlsElectricalCost,
} from '../src/utils/costs.js';

test('validateOperationalData accepts valid payload', () => {
  const errors = validateOperationalData({
    throughput: { peakUnitsPerHour: 1000, averageUnitsPerHour: 800 },
    operatingHours: { shiftsPerDay: 2, daysPerWeek: 5 },
  });

  assert.deepEqual(errors, {});
});

test('validateOperationalData rejects average greater than peak', () => {
  const errors = validateOperationalData({
    throughput: { peakUnitsPerHour: 500, averageUnitsPerHour: 700 },
    operatingHours: { shiftsPerDay: 2, daysPerWeek: 5 },
  });

  assert.equal(
    errors.averageUnitsPerHour,
    'Average units/hour cannot be greater than peak units/hour.'
  );
});

test('validateRobotFleet enforces required vendor and positive quantity', () => {
  const errors = validateRobotFleet([
    { id: 1, vendor: '', quantity: 0, unitCost: -1 },
  ]);

  assert.equal(errors[0].vendor, 'Vendor is required.');
  assert.equal(errors[0].quantity, 'Quantity must be a whole number greater than 0.');
  assert.equal(errors[0].unitCost, 'Unit cost must be 0 or greater.');
});

test('validateConveyanceSegments enforces positive integer length and zones', () => {
  const errors = validateConveyanceSegments([
    { id: 1, length: 0, zones: 0 },
  ]);

  assert.equal(errors[0].length, 'Length must be a whole number greater than 0.');
  assert.equal(errors[0].zones, 'Zones must be a whole number greater than 0.');
});


test('validateConveyanceSegments accepts valid whole-number inputs', () => {
  const errors = validateConveyanceSegments([
    { id: 1, length: '15', zones: '4' },
  ]);

  assert.deepEqual(errors, []);
});

test('validateConveyanceSegments rejects non-integer lengths', () => {
  const errors = validateConveyanceSegments([
    { id: 1, length: 10.5, zones: 2 },
  ]);

  assert.equal(errors[0].length, 'Length must be a whole number greater than 0.');
});



test('validateStorageZones enforces positive numeric zone dimensions', () => {
  const errors = validateStorageZones([
    { positions: 0, height: 0, aisleWidth: 0 },
  ]);

  assert.equal(errors[0].positions, 'Pallet positions must be a whole number greater than 0.');
  assert.equal(errors[0].height, 'Height must be greater than 0.');
  assert.equal(errors[0].aisleWidth, 'Aisle width must be greater than 0.');
});

test('validateControlPanels enforces name and numeric constraints', () => {
  const errors = validateControlPanels([
    { name: '', quantity: 0, ioCount: 0, unitCost: -1 },
  ]);

  assert.equal(errors[0].name, 'Panel name is required.');
  assert.equal(errors[0].quantity, 'Quantity must be a whole number greater than 0.');
  assert.equal(errors[0].ioCount, 'I/O count must be a whole number greater than 0.');
  assert.equal(errors[0].unitCost, 'Unit cost must be 0 or greater.');
});

test('calculateRobotLineCost sanitizes invalid numerics', () => {
  assert.equal(calculateRobotLineCost({ quantity: 'abc', unitCost: 100 }), 0);
  assert.equal(calculateRobotLineCost({ quantity: 2, unitCost: -50 }), 0);
});

test('calculateRoboticsHardwareCost sums valid rows and ignores invalid numerics', () => {
  const total = calculateRoboticsHardwareCost([
    { quantity: 2, unitCost: 1000 },
    { quantity: '3', unitCost: '500' },
    { quantity: 'abc', unitCost: 100 },
  ]);

  assert.equal(total, 3500);
});

test('calculateConveyanceSegmentCost sanitizes invalid numeric lengths', () => {
  const total = calculateConveyanceSegmentCost({ type: 'MDR', length: 'abc' });

  assert.equal(total, 0);
});

test('calculateConveyanceSegmentCost applies type-specific rates', () => {
  assert.equal(calculateConveyanceSegmentCost({ type: 'MDR', length: 2 }), 700);
  assert.equal(calculateConveyanceSegmentCost({ type: 'Gravity', length: 2 }), 200);
  assert.equal(calculateConveyanceSegmentCost({ type: 'Sortation', length: 2 }), 1000);
});

test('calculateConveyanceHardwareCost sums lengths by segment type and ignores invalid numerics', () => {
  const total = calculateConveyanceHardwareCost([
    { type: 'MDR', length: 10 },
    { type: 'Gravity', length: '20' },
    { type: 'Sortation', length: 'abc' },
  ]);

  assert.equal(total, 5500);
});


test('calculateStorageZoneCost and calculateStorageInfrastructureCost sanitize invalid values', () => {
  assert.equal(calculateStorageZoneCost({ type: 'Push Back', positions: 10 }), 1200);
  assert.equal(calculateStorageZoneCost({ type: 'Push Back', positions: 'abc' }), 0);

  const total = calculateStorageInfrastructureCost([
    { type: 'Selective Racking', positions: 10 },
    { type: 'Push Back', positions: 2 },
  ]);

  assert.equal(total, 840);
});

test('calculateControlPanelCost and calculateControlsElectricalCost sanitize invalid values', () => {
  assert.equal(calculateControlPanelCost({ quantity: 2, unitCost: 1000 }), 2000);
  assert.equal(calculateControlPanelCost({ quantity: -1, unitCost: 1000 }), 0);

  const total = calculateControlsElectricalCost([
    { quantity: 2, unitCost: 1000 },
    { quantity: '3', unitCost: '500' },
    { quantity: 'abc', unitCost: 500 },
  ]);

  assert.equal(total, 3500);
});
