import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addQuoteTotal,
  buildQuoteFromProjectState,
  formatCurrency,
  normalizeQuoteStatus,
  summarizeQuoteTotals,
} from '../src/utils/quotes.js';

test('normalizeQuoteStatus maps complete variants and defaults to working', () => {
  assert.equal(normalizeQuoteStatus('COMPLETE'), 'complete');
  assert.equal(normalizeQuoteStatus('Done'), 'working');
  assert.equal(normalizeQuoteStatus(''), 'working');
});

test('buildQuoteFromProjectState calculates in-house, buyout, and services totals', () => {
  const quote = buildQuoteFromProjectState({
    projectInfo: { name: 'Alpha', lead: 'Taylor', status: 'complete' },
    modules: {
      robotic_systems: { sourcing: 'Buyout' },
      conveyance: { sourcing: 'In-House' },
      storage: { sourcing: 'Hybrid' },
      implementation: { sourcing: 'In-House' },
    },
    moduleData: {
      robotic_systems: { robots: [{ quantity: 1, unitCost: 1000 }] },
      conveyance: { segments: [{ type: 'MDR', length: 2 }] },
      storage: { zones: [{ type: 'Selective Racking', positions: 10 }] },
      implementation: { services: [{ hours: 10, hourlyRate: 100 }] },
    },
  });

  assert.equal(quote.projectName, 'Alpha');
  assert.equal(quote.status, 'complete');
  assert.equal(quote.buyout, 1300);
  assert.equal(quote.inHouse, 1000);
  assert.equal(quote.services, 1000);
});

test('addQuoteTotal and summarizeQuoteTotals combine quote totals', () => {
  const quoteA = addQuoteTotal({ inHouse: 10, buyout: 20, services: 5 });
  const quoteB = addQuoteTotal({ inHouse: 4, buyout: 1, services: 0 });

  assert.equal(quoteA.total, 35);

  const totals = summarizeQuoteTotals([quoteA, quoteB]);
  assert.deepEqual(totals, {
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
