import { createContext, type ReactNode, useContext, useEffect, useReducer } from 'react';

import { loadState, saveState } from '../lib/storage';
import type { AppAction, AppState, CalculusState, GraphState, MatrixState, StatisticsState } from '../types';

const initialCalculus: CalculusState = {
  derivativeExpr: '',
  derivativeResult: '',
  integralExpr: '',
  integralLower: '',
  integralUpper: '',
  integralResult: '',
  limitExpr: '',
  limitPoint: '',
  limitResult: '',
};

const initialMatrix: MatrixState = {
  matrixA: [
    [0, 0],
    [0, 0],
  ],
  matrixB: [
    [0, 0],
    [0, 0],
  ],
  operation: 'add',
  result: null,
  error: null,
};

const initialStatistics: StatisticsState = {
  data: [],
  dataInput: '',
  results: null,
  regressionType: 'linear',
  regressionDegree: 2,
  regressionResult: null,
  xyData: [],
};

export const initialGraph: GraphState = {
  equations: [],
  pointDataSets: [],
  sliders: [],
  xRange: [-10, 10],
  yRange: [-10, 10],
  gridResolution: 50,
};

const initialState: AppState = {
  activeTab: 'scientific',
  graph: initialGraph,
  calculus: initialCalculus,
  matrix: initialMatrix,
  statistics: initialStatistics,
  history: [],
  variables: [],
  darkMode: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    // --- Unified Graph ---
    case 'GRAPH_ADD_EQUATION':
      return { ...state, graph: { ...state.graph, equations: [...state.graph.equations, action.equation] } };

    case 'GRAPH_UPDATE_EQUATION':
      return {
        ...state,
        graph: {
          ...state.graph,
          equations: state.graph.equations.map((eq) => (eq.id === action.id ? { ...eq, ...action.updates } : eq)),
        },
      };

    case 'GRAPH_TOGGLE_EQUATION':
      return {
        ...state,
        graph: {
          ...state.graph,
          equations: state.graph.equations.map((eq) => (eq.id === action.id ? { ...eq, visible: !eq.visible } : eq)),
        },
      };

    case 'GRAPH_REMOVE_EQUATION':
      return {
        ...state,
        graph: { ...state.graph, equations: state.graph.equations.filter((eq) => eq.id !== action.id) },
      };

    case 'GRAPH_ADD_POINT_DATA':
      return { ...state, graph: { ...state.graph, pointDataSets: [...state.graph.pointDataSets, action.pointData] } };

    case 'GRAPH_UPDATE_POINT_DATA':
      return {
        ...state,
        graph: {
          ...state.graph,
          pointDataSets: state.graph.pointDataSets.map((pd) =>
            pd.id === action.id ? { ...pd, ...action.updates } : pd,
          ),
        },
      };

    case 'GRAPH_REMOVE_POINT_DATA':
      return {
        ...state,
        graph: { ...state.graph, pointDataSets: state.graph.pointDataSets.filter((pd) => pd.id !== action.id) },
      };

    case 'GRAPH_ADD_SLIDER':
      return { ...state, graph: { ...state.graph, sliders: [...state.graph.sliders, action.slider] } };

    case 'GRAPH_UPDATE_SLIDER':
      return {
        ...state,
        graph: {
          ...state.graph,
          sliders: state.graph.sliders.map((s) => (s.id === action.id ? { ...s, value: action.value } : s)),
        },
      };

    case 'GRAPH_UPDATE_SLIDER_CONFIG':
      return {
        ...state,
        graph: {
          ...state.graph,
          sliders: state.graph.sliders.map((s) => (s.id === action.id ? { ...s, ...action.updates } : s)),
        },
      };

    case 'GRAPH_REMOVE_SLIDER':
      return {
        ...state,
        graph: { ...state.graph, sliders: state.graph.sliders.filter((s) => s.id !== action.id) },
      };

    case 'GRAPH_SET_CONFIG':
      return { ...state, graph: { ...state.graph, ...action.updates } };

    case 'GRAPH_CLEAR':
      return { ...state, graph: initialGraph };

    // --- Calculus, Matrix, Statistics ---
    case 'SET_CALCULUS':
      return { ...state, calculus: { ...state.calculus, ...action.updates } };

    case 'SET_MATRIX':
      return { ...state, matrix: { ...state.matrix, ...action.updates } };

    case 'SET_STATISTICS':
      return { ...state, statistics: { ...state.statistics, ...action.updates } };

    case 'ADD_HISTORY':
      return { ...state, history: [action.entry, ...state.history].slice(0, 100) };

    case 'CLEAR_HISTORY':
      return { ...state, history: [] };

    case 'CLEAR_CALCULUS':
      return { ...state, calculus: initialCalculus };

    case 'CLEAR_MATRIX':
      return { ...state, matrix: initialMatrix };

    case 'CLEAR_STATISTICS':
      return { ...state, statistics: initialStatistics };

    case 'ADD_VARIABLE':
      return { ...state, variables: [...state.variables, action.variable] };

    case 'UPDATE_VARIABLE':
      return {
        ...state,
        variables: state.variables.map((v) => (v.name === action.name ? { ...v, value: action.value } : v)),
      };

    case 'REMOVE_VARIABLE':
      return {
        ...state,
        variables: state.variables.filter((v) => v.name !== action.name),
      };

    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };

    case 'LOAD_STATE':
      return { ...state, ...action.state };

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', state: saved });
    }
  }, []);

  // Save state to localStorage on changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode);
  }, [state.darkMode]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
