import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addQuoteTotal,
  createEmptyQuote,
  formatCurrency,
  summarizeQuoteTotals,
} from '../src/utils/quotes.js';

test('addQuoteTotal calculates total from in-house, buyout, and services', () => {
  const quote = addQuoteTotal({ inHouse: 10, buyout: 20, services: 5 });
  assert.equal(quote.total, 35);
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
  assert.equal(quote.inHouse, 0);
  assert.deepEqual(quote.modules, {});
});
