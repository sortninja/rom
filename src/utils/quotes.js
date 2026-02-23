import {
  calculateConveyanceHardwareCost,
  calculateControlsElectricalCost,
  calculateImplementationServicesCost,
  calculateRoboticsHardwareCost,
  calculateSoftwareSystemsCost,
  calculateStorageInfrastructureCost,
} from './costs.js';

export const SAMPLE_QUOTES = [
  {
    id: 'sample-1',
    projectNumber: '1001',
    projectName: 'project 1',
    sales: 'danny1',
    leadEngineer: 'chuck 1',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'working',
    pricingMode: 'manual',
    inHouse: 10000,
    buyout: 30000,
    services: 10000,
    modules: {},
  },
  {
    id: 'sample-2',
    projectNumber: '1002',
    projectName: 'project 2',
    sales: 'danny2',
    leadEngineer: 'chuck 2',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    pricingMode: 'manual',
    inHouse: 25123,
    buyout: 13584,
    services: 9676.75,
    modules: {},
  },
  {
    id: 'sample-3',
    projectNumber: '1003',
    projectName: 'project 3',
    sales: 'danny3',
    leadEngineer: 'chuck 3',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'working',
    pricingMode: 'manual',
    inHouse: 0,
    buyout: 1550015,
    services: 186001.8,
    modules: {},
  },
  {
    id: 'sample-4',
    projectNumber: '1004',
    projectName: 'project 4',
    sales: 'danny4',
    leadEngineer: 'chuck 4',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    pricingMode: 'manual',
    inHouse: 2000,
    buyout: 1510,
    services: 877.5,
    modules: {},
  },
  {
    id: 'sample-5',
    projectNumber: '1005',
    projectName: 'project 5',
    sales: 'danny5',
    leadEngineer: 'chuck 5',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    pricingMode: 'manual',
    inHouse: 16258,
    buyout: 545115,
    services: 39296.11,
    modules: {},
  },
  {
    id: 'sample-6',
    projectNumber: '1006',
    projectName: 'project 6',
    sales: 'danny6',
    leadEngineer: 'chuck 6',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    pricingMode: 'manual',
    inHouse: 250000,
    buyout: 0,
    services: 62500,
    modules: {},
  },
  {
    id: 'sample-7',
    projectNumber: '1007',
    projectName: 'project 7',
    sales: 'danny7',
    leadEngineer: 'chuck 7',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'working',
    pricingMode: 'manual',
    inHouse: 0,
    buyout: 250000,
    services: 17500,
    modules: {},
  },
];

export function formatCurrency(value) {
  if (!value) {
    return '$ -';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getModuleBaseCosts(moduleData = {}) {
  return {
    robotic_systems: calculateRoboticsHardwareCost(moduleData.robotic_systems?.robots || []),
    conveyance: calculateConveyanceHardwareCost(moduleData.conveyance?.segments || []),
    storage: calculateStorageInfrastructureCost(moduleData.storage?.zones || []),
    controls: calculateControlsElectricalCost(moduleData.controls?.panels || []),
    software: calculateSoftwareSystemsCost(moduleData.software?.applications || []),
    implementation: calculateImplementationServicesCost(moduleData.implementation?.services || []),
  };
}


export function calculateQuoteCostDetails(quote, moduleData = {}) {
  const moduleBaseCosts = getModuleBaseCosts(moduleData);
  const quotePricingMode = quote?.pricingMode || 'manual';

  if (quotePricingMode !== 'auto') {
    const manualBuckets = {
      inHouse: Number(quote?.inHouse || 0),
      buyout: Number(quote?.buyout || 0),
      services: Number(quote?.services || 0),
    };

    return {
      buckets: manualBuckets,
      moduleBreakdown: [],
    };
  }

  const moduleBreakdown = [];
  let inHouse = 0;
  let buyout = 0;

  Object.entries(quote?.modules || {}).forEach(([moduleId, module]) => {
    if (!module?.selected) {
      return;
    }

    const moduleCost = moduleBaseCosts[moduleId] || 0;

    if (moduleId === 'implementation') {
      moduleBreakdown.push({
        moduleId,
        inHouse: 0,
        buyout: 0,
        services: moduleCost,
        total: moduleCost,
      });
      return;
    }

    if (module.sourcing === 'In-House') {
      inHouse += moduleCost;
      moduleBreakdown.push({ moduleId, inHouse: moduleCost, buyout: 0, services: 0, total: moduleCost });
      return;
    }

    if (module.sourcing === 'Hybrid') {
      const inHousePortion = moduleCost * 0.5;
      const buyoutPortion = moduleCost * 0.5;
      inHouse += inHousePortion;
      buyout += buyoutPortion;
      moduleBreakdown.push({ moduleId, inHouse: inHousePortion, buyout: buyoutPortion, services: 0, total: moduleCost });
      return;
    }

    buyout += moduleCost;
    moduleBreakdown.push({ moduleId, inHouse: 0, buyout: moduleCost, services: 0, total: moduleCost });
  });

  const services = moduleBaseCosts.implementation || 0;

  return {
    buckets: {
      inHouse,
      buyout,
      services,
    },
    moduleBreakdown,
  };
}

export function calculateQuoteBuckets(quote, moduleData = {}) {
  return calculateQuoteCostDetails(quote, moduleData).buckets;
}

export function addQuoteTotal(quote, moduleData) {
  const quoteBuckets = calculateQuoteBuckets(quote, moduleData);

  return {
    ...quote,
    ...quoteBuckets,
    total: Number(quoteBuckets.inHouse || 0) + Number(quoteBuckets.buyout || 0) + Number(quoteBuckets.services || 0),
  };
}

export function summarizeQuoteTotals(quotes = []) {
  return quotes.reduce(
    (acc, quote) => ({
      inHouse: acc.inHouse + Number(quote.inHouse || 0),
      buyout: acc.buyout + Number(quote.buyout || 0),
      services: acc.services + Number(quote.services || 0),
      total: acc.total + Number(quote.total || 0),
    }),
    { inHouse: 0, buyout: 0, services: 0, total: 0 }
  );
}

export function createEmptyQuote(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    projectNumber: '',
    projectName: '',
    sales: '',
    leadEngineer: '',
    contractAward: '',
    goLive: '',
    quoteDue: '',
    status: 'working',
    pricingMode: 'manual',
    inHouse: 0,
    buyout: 0,
    services: 0,
    modules: {},
    ...overrides,
  };
}


export function isProjectNumberInUse(quotes = [], projectNumber = '', excludeQuoteId = null) {
  const normalized = String(projectNumber || '').trim().toLowerCase();
  if (!normalized) return false;

  return quotes.some((quote) => {
    if (excludeQuoteId && quote.id === excludeQuoteId) {
      return false;
    }

    return String(quote.projectNumber || '').trim().toLowerCase() === normalized;
  });
}


export function isValidDateString(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return true;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  );
}

function parseDateOrNull(value) {
  if (!value || !isValidDateString(value)) {
    return null;
  }

  const [month, day, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function validateQuoteFields(quote) {
  const errors = [];

  if (!String(quote?.projectNumber || '').trim()) {
    errors.push('Project # is required.');
  }

  if (!String(quote?.projectName || '').trim()) {
    errors.push('Project name is required.');
  }

  if (!String(quote?.sales || '').trim()) {
    errors.push('Sales is required.');
  }

  if (!String(quote?.leadEngineer || '').trim()) {
    errors.push('Lead engineer is required.');
  }

  const contractAward = String(quote?.contractAward || '').trim();
  const goLive = String(quote?.goLive || '').trim();
  const quoteDue = String(quote?.quoteDue || '').trim();

  if (!isValidDateString(contractAward)) {
    errors.push('Contract award must use MM/DD/YYYY format.');
  }

  if (!isValidDateString(goLive)) {
    errors.push('Go live must use MM/DD/YYYY format.');
  }

  if (!isValidDateString(quoteDue)) {
    errors.push('Quote due must use MM/DD/YYYY format.');
  }

  const contractDate = parseDateOrNull(contractAward);
  const goLiveDate = parseDateOrNull(goLive);
  const quoteDueDate = parseDateOrNull(quoteDue);

  if (contractDate && quoteDueDate && quoteDueDate > contractDate) {
    errors.push('Quote due must be on or before contract award.');
  }

  if (contractDate && goLiveDate && contractDate > goLiveDate) {
    errors.push('Contract award must be on or before go live.');
  }

  return errors;
}


function parseMmDdYyyy(value) {
  if (!isValidDateString(value)) {
    return null;
  }

  const [month, day, year] = value.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function sortQuotes(quotes = [], sortBy = 'projectNumberAsc') {
  const rows = [...quotes];

  rows.sort((left, right) => {
    if (sortBy === 'totalDesc') {
      return Number(right.total || 0) - Number(left.total || 0);
    }

    if (sortBy === 'quoteDueAsc') {
      const leftDate = parseMmDdYyyy(left.quoteDue);
      const rightDate = parseMmDdYyyy(right.quoteDue);

      if (!leftDate && !rightDate) return 0;
      if (!leftDate) return 1;
      if (!rightDate) return -1;

      return leftDate.getTime() - rightDate.getTime();
    }

    return String(left.projectNumber || '').localeCompare(String(right.projectNumber || ''), undefined, { numeric: true });
  });

  return rows;
}
