import React, { createContext, useContext, useReducer } from 'react';

const ProjectContext = createContext();

const initialState = {
  projectInfo: {
    name: 'Untitled Project',
    lead: '',
    status: 'DRAFT',
  },
  modules: {
    // Will be populated by module definitions
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
    }
  },
  assumptions: [],
  requirements: [],
};

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
    // Add more reducers as we implement features
    default:
      return state;
  }
}

export function ProjectProvider({ children }) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  return (
    <ProjectContext.Provider value={{ state, dispatch }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
