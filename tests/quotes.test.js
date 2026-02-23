import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addQuoteTotal,
  calculateQuoteBuckets,
  calculateQuoteCostDetails,
  createEmptyQuote,
  formatCurrency,
  isProjectNumberInUse,
  isValidDateString,
  normalizeQuote,
  sortQuotes,
  summarizeQuoteTotals,
  toCsvCell,
  validateQuoteFields,
} from '../src/utils/quotes.js';

test('addQuoteTotal calculates total from in-house, buyout, and services', () => {
  const quote = addQuoteTotal({ inHouse: 10, buyout: 20, services: 5, pricingMode: 'manual' });
  assert.equal(quote.total, 35);
});

test('calculateQuoteBuckets auto mode derives values from selected modules and sourcing', () => {
  const quote = {
    pricingMode: 'auto',
    modules: {
      robotic_systems: { id: 'robotic_systems', selected: true, sourcing: 'Buyout' },
      storage: { id: 'storage', selected: true, sourcing: 'Hybrid' },
      implementation: { id: 'implementation', selected: true, sourcing: 'In-House' },
    },
  };

  const moduleData = {
    robotic_systems: { robots: [{ quantity: 1, unitCost: 1000 }] },
    storage: { zones: [{ type: 'Selective Racking', positions: 10 }] },
    implementation: { services: [{ hours: 10, hourlyRate: 100 }] },
  };

  const buckets = calculateQuoteBuckets(quote, moduleData);

  assert.equal(buckets.inHouse, 300);
  assert.equal(buckets.buyout, 1300);
  assert.equal(buckets.services, 1000);
});

test('summarizeQuoteTotals aggregates rows', () => {
  const rows = [
    addQuoteTotal({ inHouse: 10, buyout: 20, services: 5 }),
    addQuoteTotal({ inHouse: 4, buyout: 1, services: 0 }),
  ];

  assert.deepEqual(summarizeQuoteTotals(rows), {
    inHouse: 14,
    buyout: 21,
    services: 5,
    total: 40,
  });
});

test('formatCurrency uses dash for zero and currency for positive values', () => {
  assert.equal(formatCurrency(0), '$ -');
  assert.equal(formatCurrency(1234.5), '$1,234.50');
});

test('createEmptyQuote provides required quote defaults and override support', () => {
  const quote = createEmptyQuote({ projectNumber: '9001' });

  assert.equal(typeof quote.id, 'string');
  assert.equal(quote.projectNumber, '9001');
  assert.equal(quote.status, 'working');
  assert.equal(quote.pricingMode, 'manual');
  assert.equal(quote.inHouse, 0);
  assert.deepEqual(quote.modules, {});
});


test('calculateQuoteCostDetails includes moduleBreakdown rows in auto mode', () => {
  const details = calculateQuoteCostDetails(
    {
      pricingMode: 'auto',
      modules: {
        robotic_systems: { selected: true, sourcing: 'Buyout' },
        implementation: { selected: true, sourcing: 'In-House' },
      },
    },
    {
      robotic_systems: { robots: [{ quantity: 1, unitCost: 500 }] },
      implementation: { services: [{ hours: 2, hourlyRate: 100 }] },
    }
  );

  assert.equal(details.moduleBreakdown.length, 2);
  assert.equal(details.moduleBreakdown[0].moduleId, 'robotic_systems');
  assert.equal(details.moduleBreakdown[1].services, 200);
});


test('isProjectNumberInUse detects duplicates and supports exclusion', () => {
  const quotes = [
    { id: 'a', projectNumber: '1001' },
    { id: 'b', projectNumber: '1002' },
  ];

  assert.equal(isProjectNumberInUse(quotes, '1001'), true);
  assert.equal(isProjectNumberInUse(quotes, ' 1001 '), true);
  assert.equal(isProjectNumberInUse(quotes, '1001', 'a'), false);
  assert.equal(isProjectNumberInUse(quotes, '9999'), false);
});


test('isValidDateString validates MM/DD/YYYY and rejects invalid dates', () => {
  assert.equal(isValidDateString(''), true);
  assert.equal(isValidDateString('02/29/2024'), true);
  assert.equal(isValidDateString('02/30/2024'), false);
  assert.equal(isValidDateString('2024-02-29'), false);
});

test('validateQuoteFields enforces required fields and date ordering', () => {
  const errors = validateQuoteFields({
    projectNumber: '2001',
    projectName: 'Alpha',
    sales: 'Dana',
    leadEngineer: 'Chris',
    quoteDue: '05/10/2026',
    contractAward: '05/01/2026',
    goLive: '04/01/2026',
  });

  assert.equal(errors.includes('Quote due must be on or before contract award.'), true);
  assert.equal(errors.includes('Contract award must be on or before go live.'), true);
});


test('sortQuotes supports project number, total, and quote due sorting', () => {
  const rows = [
    { projectNumber: '1002', total: 200, quoteDue: '05/10/2026' },
    { projectNumber: '1001', total: 500, quoteDue: '04/01/2026' },
    { projectNumber: '1003', total: 100, quoteDue: '' },
  ];

  assert.deepEqual(sortQuotes(rows, 'projectNumberAsc').map((row) => row.projectNumber), ['1001', '1002', '1003']);
  assert.deepEqual(sortQuotes(rows, 'totalDesc').map((row) => row.total), [500, 200, 100]);
  assert.deepEqual(sortQuotes(rows, 'quoteDueAsc').map((row) => row.projectNumber), ['1001', '1002', '1003']);
});


test('normalizeQuote guards missing fields and enforces known modes/status', () => {
  const normalized = normalizeQuote({ projectNumber: 42, status: 'DRAFT', pricingMode: 'weird' });

  assert.equal(normalized.projectNumber, '42');
  assert.equal(normalized.status, 'working');
  assert.equal(normalized.pricingMode, 'manual');
  assert.equal(typeof normalized.modules, 'object');
});


test('toCsvCell escapes embedded double quotes safely', () => {
  assert.equal(toCsvCell('Robot "Alpha"'), '"Robot ""Alpha"""');
  assert.equal(toCsvCell(125), '"125"');
});
