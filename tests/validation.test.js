import test from 'node:test';
import assert from 'node:assert/strict';

import {
  validateOperationalData,
  validateRobotFleet,
  validateConveyanceSegments,
  validateStorageZones,
  validateControlPanels,
  validateSoftwareApplications,
  validateImplementationServices,
  hasRowErrors,
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
  calculateSoftwareApplicationAnnualCost,
  calculateSoftwareSystemsCost,
  calculateImplementationServiceCost,
  calculateImplementationServicesCost,
  calculateProjectCostEstimate,
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



test('validateSoftwareApplications enforces required name and numeric constraints', () => {
  const errors = validateSoftwareApplications([
    { name: '', seats: 0, annualCost: -1 },
  ]);

  assert.equal(errors[0].name, 'Application name is required.');
  assert.equal(errors[0].seats, 'Seats must be a whole number greater than 0.');
  assert.equal(errors[0].annualCost, 'Annual cost must be 0 or greater.');
});

test('validateImplementationServices enforces positive hours and rate', () => {
  const errors = validateImplementationServices([
    { hours: 0, hourlyRate: -1 },
  ]);

  assert.equal(errors[0].hours, 'Hours must be greater than 0.');
  assert.equal(errors[0].hourlyRate, 'Rate must be 0 or greater.');
});



test('hasRowErrors returns true only when at least one row has keys', () => {
  assert.equal(hasRowErrors([]), false);
  assert.equal(hasRowErrors([undefined, {}]), false);
  assert.equal(hasRowErrors([undefined, { field: 'error' }]), true);
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


test('calculateSoftwareApplicationAnnualCost and calculateSoftwareSystemsCost sanitize invalid values', () => {
  assert.equal(calculateSoftwareApplicationAnnualCost({ annualCost: 1000 }), 1000);
  assert.equal(calculateSoftwareApplicationAnnualCost({ annualCost: -1 }), 0);

  const total = calculateSoftwareSystemsCost([
    { annualCost: 1000 },
    { annualCost: '2500' },
    { annualCost: 'abc' },
  ]);

  assert.equal(total, 3500);
});

test('calculateImplementationServiceCost and calculateImplementationServicesCost sanitize invalid values', () => {
  assert.equal(calculateImplementationServiceCost({ hours: 10, hourlyRate: 100 }), 1000);
  assert.equal(calculateImplementationServiceCost({ hours: -1, hourlyRate: 100 }), 0);

  const total = calculateImplementationServicesCost([
    { hours: 10, hourlyRate: 100 },
    { hours: '2', hourlyRate: '50' },
    { hours: 'abc', hourlyRate: 50 },
  ]);

  assert.equal(total, 1100);
});


test('calculateProjectCostEstimate rolls up all modules with shared sanitization', () => {
  const estimate = calculateProjectCostEstimate({
    robotic_systems: { robots: [{ quantity: 2, unitCost: 1000 }] },
    conveyance: { segments: [{ type: 'MDR', length: 10 }] },
    storage: { zones: [{ type: 'Selective Racking', positions: 10 }] },
    controls: { panels: [{ quantity: 2, unitCost: 1000 }] },
    software: { applications: [{ annualCost: 5000 }] },
    implementation: { services: [{ hours: 10, hourlyRate: 100 }] },
  });

  assert.equal(estimate.breakdown.robotic_systems, 2000);
  assert.equal(estimate.breakdown.conveyance, 3500);
  assert.equal(estimate.breakdown.storage, 600);
  assert.equal(estimate.breakdown.controls, 2000);
  assert.equal(estimate.breakdown.software, 5000);
  assert.equal(estimate.breakdown.implementation, 1000);
  assert.equal(estimate.total, 14100);
});

test('calculateProjectCostEstimate ignores invalid numeric values safely', () => {
  const estimate = calculateProjectCostEstimate({
    robotic_systems: { robots: [{ quantity: 'abc', unitCost: 1000 }] },
    conveyance: { segments: [{ type: 'MDR', length: 'abc' }] },
    storage: { zones: [{ type: 'Push Back', positions: 'abc' }] },
    controls: { panels: [{ quantity: 'abc', unitCost: 1000 }] },
    software: { applications: [{ annualCost: -1 }] },
    implementation: { services: [{ hours: -1, hourlyRate: 100 }] },
  });

  assert.equal(estimate.total, 0);
});
