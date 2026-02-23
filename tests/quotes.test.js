import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addQuoteTotal,
  calculateQuoteBuckets,
  createEmptyQuote,
  formatCurrency,
  summarizeQuoteTotals,
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
