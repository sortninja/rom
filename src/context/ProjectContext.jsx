import React, { createContext, useContext, useEffect, useReducer } from 'react';
import {
  clearPersistedProjectState,
  loadPersistedProjectState,
  normalizePersistedRequirementsDocument,
  persistProjectState,
  preparePersistedProjectState,
} from '../utils/persistence';
import { SAMPLE_QUOTES } from '../utils/quotes';

const ProjectContext = createContext();

const initialState = {
  projectInfo: {
    name: 'Untitled Project',
    sales: '',
    lead: '',
    contractAward: '',
    goLive: '',
    quoteDue: '',
    status: 'working',
  },
  modules: {
    operational_data: { id: 'operational_data', selected: true, sourcing: 'In-House' },
    implementation: { id: 'implementation', selected: true, sourcing: 'In-House' },
  },
  moduleData: {
    // Store form data for each module
    operational_data: {
      throughput: {
        peakUnitsPerHour: 5000,
        averageUnitsPerHour: 3500,
        dailyOrderVolume: 12000,
      },
      operatingHours: {
        shiftsPerDay: 2,
        hoursPerShift: 8,
        daysPerWeek: 5,
      },
      inventory: {
        totalSKUs: 15000,
        activeSKUs: 4000,
        storageVolume: '10000 pallets',
      }
    },
    robotic_systems: {
      robots: [
        { id: 1, type: 'AMR', quantity: 10, vendor: 'Fetch', unitCost: 35000 },
      ]
    },
    conveyance: {
      segments: [
        { id: 1, type: 'MDR', length: 100, width: 24, zones: 10 },
      ]
    },
    storage: {
      zones: [
        { id: 1, type: 'Selective Racking', positions: 5000, height: 30, aisleWidth: 10 },
      ]
    },
    controls: {
      panels: [
        { id: 1, name: 'Main PLC Panel', panelType: 'PLC Panel', quantity: 1, ioCount: 128, unitCost: 28000 },
      ]
    },
    software: {
      applications: [
        { id: 1, name: 'Warehouse Control', category: 'WCS', licenseType: 'Annual Subscription', seats: 10, annualCost: 85000 },
      ]
    },
    implementation: {
      services: [
        { id: 1, phase: 'Project Management', resourceType: 'PM', hours: 120, hourlyRate: 145 },
      ]
    }
  },
  assumptions: [],
  requirements: [],
  requirementsDocument: null,

  projectQuotes: SAMPLE_QUOTES,
};





function normalizeProjectInfo(projectInfo, defaultProjectInfo) {
  if (!projectInfo || typeof projectInfo !== 'object') {
    return defaultProjectInfo;
  }

  return {
    ...defaultProjectInfo,
    name: String(projectInfo.name ?? defaultProjectInfo.name),
    sales: String(projectInfo.sales ?? defaultProjectInfo.sales),
    lead: String(projectInfo.lead ?? defaultProjectInfo.lead),
    contractAward: String(projectInfo.contractAward ?? defaultProjectInfo.contractAward),
    goLive: String(projectInfo.goLive ?? defaultProjectInfo.goLive),
    quoteDue: String(projectInfo.quoteDue ?? defaultProjectInfo.quoteDue),
    status: projectInfo.status === 'complete' ? 'complete' : 'working',
  };
}


function generateQuoteId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `quote-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeProjectQuote(rawQuote = {}) {
  return {
    id: rawQuote.id || generateQuoteId(),
    projectNumber: String(rawQuote.projectNumber ?? '').trim(),
    projectName: String(rawQuote.projectName ?? '').trim(),
    sales: String(rawQuote.sales ?? '').trim(),
    leadEngineer: String(rawQuote.leadEngineer ?? '').trim(),
    contractAward: String(rawQuote.contractAward ?? '').trim(),
    goLive: String(rawQuote.goLive ?? '').trim(),
    quoteDue: String(rawQuote.quoteDue ?? '').trim(),
    status: rawQuote.status === 'complete' ? 'complete' : 'working',
    pricingMode: rawQuote.pricingMode === 'auto' ? 'auto' : 'manual',
    inHouse: Number(rawQuote.inHouse || 0),
    buyout: Number(rawQuote.buyout || 0),
    services: Number(rawQuote.services || 0),
    modules: rawQuote.modules && typeof rawQuote.modules === 'object' ? rawQuote.modules : {},
  };
}

function normalizeLoadedProjectState(state) {
  const normalizedQuotes = Array.isArray(state.projectQuotes)
    ? state.projectQuotes.filter((quote) => quote && typeof quote === 'object').map((quote) => normalizeProjectQuote(quote))
    : [];

  return {
    ...state,
    projectInfo: normalizeProjectInfo(state.projectInfo, initialState.projectInfo),
    modules: state.modules && typeof state.modules === 'object' ? state.modules : initialState.modules,
    moduleData: state.moduleData && typeof state.moduleData === 'object' ? state.moduleData : initialState.moduleData,
    assumptions: Array.isArray(state.assumptions) ? state.assumptions : [],
    requirements: Array.isArray(state.requirements) ? state.requirements : [],
    requirementsDocument: normalizePersistedRequirementsDocument(state.requirementsDocument),
    projectQuotes: normalizedQuotes,
  };
}

function projectReducer(state, action) {
  switch (action.type) {
    case 'SET_PROJECT_INFO':
      return { ...state, projectInfo: { ...state.projectInfo, ...action.payload } };

    case 'TOGGLE_MODULE': {
      const { moduleId, isSelected, defaultSourcing } = action.payload;
      const newModules = { ...state.modules };

      if (isSelected) {
        newModules[moduleId] = {
          id: moduleId,
          selected: true,
          sourcing: defaultSourcing
        };
      } else {
        delete newModules[moduleId];
      }
      return { ...state, modules: newModules };
    }

    case 'SET_SOURCING': {
      const { moduleId, sourcing } = action.payload;
      return {
        ...state,
        modules: {
          ...state.modules,
          [moduleId]: {
            ...state.modules[moduleId],
            sourcing
          }
        }
      };
    }

    case 'ADD_ASSUMPTION':
      return { ...state, assumptions: [...state.assumptions, action.payload] };

    case 'REMOVE_ASSUMPTION':
      return {
        ...state,
        assumptions: state.assumptions.filter((assumption) => assumption.id !== action.payload),
      };

    case 'ADD_REQUIREMENT':
      return { ...state, requirements: [...state.requirements, action.payload] };

    case 'REMOVE_REQUIREMENT':
      return {
        ...state,
        requirements: state.requirements.filter((requirement) => requirement.id !== action.payload),
      };

    case 'SET_REQUIREMENTS_DOCUMENT':
      return {
        ...state,
        requirementsDocument: action.payload,
      };

    case 'UPDATE_MODULE_DATA': {
      const { moduleId, data } = action.payload;
      return {
        ...state,
        moduleData: {
          ...state.moduleData,
          [moduleId]: {
            ...state.moduleData[moduleId],
            ...data
          }
        }
      };
    }

    case 'SET_MODULE_DATA': {
      const { moduleId, data } = action.payload;
      return {
        ...state,
        moduleData: {
          ...state.moduleData,
          [moduleId]: data
        }
      };
    }

    case 'ADD_PROJECT_QUOTE':
      return {
        ...state,
        projectQuotes: [...state.projectQuotes, action.payload],
      };

    case 'UPDATE_PROJECT_QUOTE':
      return {
        ...state,
        projectQuotes: state.projectQuotes.map((quote) => (
          quote.id === action.payload.id ? { ...quote, ...action.payload.updates } : quote
        )),
      };

    case 'REMOVE_PROJECT_QUOTE':
      return {
        ...state,
        projectQuotes: state.projectQuotes.filter((quote) => quote.id !== action.payload),
      };

    case 'TOGGLE_PROJECT_QUOTE_MODULE': {
      const { quoteId, moduleId, isSelected, defaultSourcing } = action.payload;
      return {
        ...state,
        projectQuotes: state.projectQuotes.map((quote) => {
          if (quote.id !== quoteId) return quote;

          const nextModules = { ...(quote.modules || {}) };
          if (isSelected) {
            nextModules[moduleId] = {
              id: moduleId,
              selected: true,
              sourcing: defaultSourcing,
            };
          } else {
            delete nextModules[moduleId];
          }

          return { ...quote, modules: nextModules };
        }),
      };
    }

    case 'SET_PROJECT_QUOTE_MODULE_SOURCING': {
      const { quoteId, moduleId, sourcing } = action.payload;
      return {
        ...state,
        projectQuotes: state.projectQuotes.map((quote) => {
          if (quote.id !== quoteId || !quote.modules?.[moduleId]) return quote;

          return {
            ...quote,
            modules: {
              ...quote.modules,
              [moduleId]: {
                ...quote.modules[moduleId],
                sourcing,
              },
            },
          };
        }),
      };
    }

    case 'RESET_PROJECT_STATE':
      return initialState;
    // Add more reducers as we implement features
    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(
    projectReducer,
    initialState,
    (defaultState) => loadPersistedProjectState(defaultState, { normalizeState: normalizeLoadedProjectState })
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      persistProjectState(state, { prepareState: preparePersistedProjectState });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [state]);

  const resetProjectState = () => {
    clearPersistedProjectState();
    dispatch({ type: 'RESET_PROJECT_STATE' });
  };

  return (
    <ProjectContext.Provider value={{ state, dispatch, resetProjectState }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
