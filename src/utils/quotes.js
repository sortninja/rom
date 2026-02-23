import {
  calculateConveyanceHardwareCost,
  calculateRoboticsHardwareCost,
  calculateStorageInfrastructureCost,
  calculateControlsElectricalCost,
  calculateSoftwareSystemsCost,
  calculateImplementationServicesCost,
} from './costs.js';

export const SAMPLE_QUOTES = [
  {
    projectName: 'project 1',
    sales: 'danny1',
    leadEngineer: 'chuck 1',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'working',
    inHouse: 10000,
    buyout: 30000,
    services: 10000,
  },
  {
    projectName: 'project 2',
    sales: 'danny2',
    leadEngineer: 'chuck 2',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    inHouse: 25123,
    buyout: 13584,
    services: 9676.75,
  },
  {
    projectName: 'project 3',
    sales: 'danny3',
    leadEngineer: 'chuck 3',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'working',
    inHouse: 0,
    buyout: 1550015,
    services: 186001.8,
  },
  {
    projectName: 'project 4',
    sales: 'danny4',
    leadEngineer: 'chuck 4',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    inHouse: 2000,
    buyout: 1510,
    services: 877.5,
  },
  {
    projectName: 'project 5',
    sales: 'danny5',
    leadEngineer: 'chuck 5',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    inHouse: 16258,
    buyout: 545115,
    services: 39296.11,
  },
  {
    projectName: 'project 6',
    sales: 'danny6',
    leadEngineer: 'chuck 6',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'complete',
    inHouse: 250000,
    buyout: 0,
    services: 62500,
  },
  {
    projectName: 'project 7',
    sales: 'danny7',
    leadEngineer: 'chuck 7',
    contractAward: 'mm/dd//yyyy',
    goLive: 'mm/dd//yyyy',
    quoteDue: 'mm/dd//yyyy',
    status: 'working',
    inHouse: 0,
    buyout: 250000,
    services: 17500,
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

export function normalizeQuoteStatus(status) {
  if (!status) {
    return 'working';
  }

  const normalized = String(status).toLowerCase();
  if (normalized.includes('complete')) {
    return 'complete';
  }

  return 'working';
}

export function getProjectCostByModule(moduleData = {}) {
  return {
    robotic_systems: calculateRoboticsHardwareCost(moduleData.robotic_systems?.robots || []),
    conveyance: calculateConveyanceHardwareCost(moduleData.conveyance?.segments || []),
    storage: calculateStorageInfrastructureCost(moduleData.storage?.zones || []),
    controls: calculateControlsElectricalCost(moduleData.controls?.panels || []),
    software: calculateSoftwareSystemsCost(moduleData.software?.applications || []),
    implementation: calculateImplementationServicesCost(moduleData.implementation?.services || []),
  };
}

export function buildQuoteFromProjectState(state) {
  const costByModule = getProjectCostByModule(state.moduleData);

  let inHouse = 0;
  let buyout = 0;

  Object.entries(state.modules).forEach(([moduleId, module]) => {
    const moduleCost = costByModule[moduleId] || 0;
    const sourcing = module?.sourcing;

    if (moduleId === 'implementation') {
      return;
    }

    if (sourcing === 'In-House') {
      inHouse += moduleCost;
      return;
    }

    if (sourcing === 'Hybrid') {
      inHouse += moduleCost * 0.5;
      buyout += moduleCost * 0.5;
      return;
    }

    buyout += moduleCost;
  });

  const services = costByModule.implementation || 0;

  return {
    projectName: state.projectInfo.name || 'Untitled Project',
    sales: state.projectInfo.sales || 'Unassigned',
    leadEngineer: state.projectInfo.lead || 'Unassigned',
    contractAward: state.projectInfo.contractAward || 'mm/dd//yyyy',
    goLive: state.projectInfo.goLive || 'mm/dd//yyyy',
    quoteDue: state.projectInfo.quoteDue || 'mm/dd//yyyy',
    status: normalizeQuoteStatus(state.projectInfo.status),
    inHouse,
    buyout,
    services,
  };
}

export function addQuoteTotal(quote) {
  return {
    ...quote,
    total: quote.inHouse + quote.buyout + quote.services,
  };
}

export function summarizeQuoteTotals(quotes = []) {
  return quotes.reduce(
    (acc, quote) => ({
      inHouse: acc.inHouse + quote.inHouse,
      buyout: acc.buyout + quote.buyout,
      services: acc.services + quote.services,
      total: acc.total + quote.total,
    }),
    { inHouse: 0, buyout: 0, services: 0, total: 0 }
  );
}
