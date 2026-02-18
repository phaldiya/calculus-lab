import { createContext, type ReactNode, useContext, useEffect, useReducer } from 'react';

import { loadState, saveState } from '../lib/storage';
import type { AppAction, AppState, CalculusState, MatrixState, StatisticsState, ThreeDGraphingState } from '../types';

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

const initialThreeDGraphing: ThreeDGraphingState = {
  equations: [],
  xRange: [-5, 5],
  yRange: [-5, 5],
  gridResolution: 50,
};

const initialState: AppState = {
  activeTab: 'scientific',
  equations: [],
  pointDataSets: [],
  calculus: initialCalculus,
  matrix: initialMatrix,
  statistics: initialStatistics,
  threeDGraphing: initialThreeDGraphing,
  history: [],
  variables: [],
  darkMode: false,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    case 'ADD_EQUATION':
      return { ...state, equations: [...state.equations, action.equation] };

    case 'UPDATE_EQUATION':
      return {
        ...state,
        equations: state.equations.map((eq) => (eq.id === action.id ? { ...eq, expression: action.expression } : eq)),
      };

    case 'TOGGLE_EQUATION':
      return {
        ...state,
        equations: state.equations.map((eq) => (eq.id === action.id ? { ...eq, visible: !eq.visible } : eq)),
      };

    case 'REMOVE_EQUATION':
      return {
        ...state,
        equations: state.equations.filter((eq) => eq.id !== action.id),
      };

    case 'ADD_POINT_DATA':
      return { ...state, pointDataSets: [...state.pointDataSets, action.pointData] };

    case 'UPDATE_POINT_DATA':
      return {
        ...state,
        pointDataSets: state.pointDataSets.map((pd) => (pd.id === action.id ? { ...pd, ...action.updates } : pd)),
      };

    case 'REMOVE_POINT_DATA':
      return {
        ...state,
        pointDataSets: state.pointDataSets.filter((pd) => pd.id !== action.id),
      };

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

    case 'CLEAR_EQUATIONS':
      return { ...state, equations: [], pointDataSets: [] };

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

    case 'ADD_3D_EQUATION':
      return {
        ...state,
        threeDGraphing: { ...state.threeDGraphing, equations: [...state.threeDGraphing.equations, action.equation] },
      };

    case 'UPDATE_3D_EQUATION':
      return {
        ...state,
        threeDGraphing: {
          ...state.threeDGraphing,
          equations: state.threeDGraphing.equations.map((eq) =>
            eq.id === action.id ? { ...eq, ...action.updates } : eq,
          ),
        },
      };

    case 'TOGGLE_3D_EQUATION':
      return {
        ...state,
        threeDGraphing: {
          ...state.threeDGraphing,
          equations: state.threeDGraphing.equations.map((eq) =>
            eq.id === action.id ? { ...eq, visible: !eq.visible } : eq,
          ),
        },
      };

    case 'REMOVE_3D_EQUATION':
      return {
        ...state,
        threeDGraphing: {
          ...state.threeDGraphing,
          equations: state.threeDGraphing.equations.filter((eq) => eq.id !== action.id),
        },
      };

    case 'SET_3D_GRAPHING':
      return { ...state, threeDGraphing: { ...state.threeDGraphing, ...action.updates } };

    case 'CLEAR_3D_GRAPHING':
      return { ...state, threeDGraphing: initialThreeDGraphing };

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
