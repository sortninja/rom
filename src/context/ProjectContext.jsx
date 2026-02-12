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
