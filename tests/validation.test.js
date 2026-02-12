import test from 'node:test';
import assert from 'node:assert/strict';

import { validateOperationalData, validateRobotFleet } from '../src/utils/validation.js';
import { calculateRoboticsHardwareCost } from '../src/utils/costs.js';

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

test('calculateRoboticsHardwareCost sums valid rows and ignores invalid numerics', () => {
  const total = calculateRoboticsHardwareCost([
    { quantity: 2, unitCost: 1000 },
    { quantity: '3', unitCost: '500' },
    { quantity: 'abc', unitCost: 100 },
  ]);

  assert.equal(total, 3500);
});
