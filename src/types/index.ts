export type TabId =
  | 'scientific'
  | 'graphing'
  | '3d-graphing'
  | 'calculus'
  | 'matrix'
  | 'statistics'
  | 'parametric'
  | 'manipulate';

export type EquationMode = 'standard' | 'implicit' | 'inequality';

export type InequalityOperator = '>' | '<' | '>=' | '<=';

export interface Equation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  mode?: EquationMode;
  inequalityOp?: InequalityOperator;
}

export interface Equation3D {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

export interface ThreeDGraphingState {
  equations: Equation3D[];
  xRange: [number, number];
  yRange: [number, number];
  gridResolution: number;
}

export interface PointData {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  visible: boolean;
  label: string;
  mode: 'markers' | 'lines' | 'lines+markers';
}

export interface CalculusState {
  derivativeExpr: string;
  derivativeResult: string;
  integralExpr: string;
  integralLower: string;
  integralUpper: string;
  integralResult: string;
  limitExpr: string;
  limitPoint: string;
  limitResult: string;
}

export interface MatrixState {
  matrixA: number[][];
  matrixB: number[][];
  operation: MatrixOperation;
  result: number[][] | number | string | null;
  error: string | null;
}

export type MatrixOperation =
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'determinant'
  | 'inverse'
  | 'transpose'
  | 'scalar_multiply';

export interface StatisticsState {
  data: number[];
  dataInput: string;
  results: StatsResults | null;
  regressionType: 'linear' | 'polynomial';
  regressionDegree: number;
  regressionResult: RegressionResult | null;
  xyData: { x: number; y: number }[];
}

export interface StatsResults {
  mean: number;
  median: number;
  mode: number[];
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  count: number;
  sum: number;
  q1: number;
  q3: number;
  iqr: number;
}

export interface RegressionResult {
  equation: string;
  coefficients: number[];
  rSquared: number;
  predictions: { x: number; y: number }[];
}

export interface HistoryEntry {
  id: string;
  tab: TabId;
  expression: string;
  result: string;
  timestamp: number;
  expressionTex?: string;
  resultTex?: string;
}

export interface Variable {
  name: string;
  value: number;
}

export type ParametricPlotType = 'parametric-2d' | 'parametric-3d' | 'polar';

export interface ParametricEquation {
  id: string;
  plotType: ParametricPlotType;
  xExpr: string;
  yExpr: string;
  zExpr?: string;
  tMin: number;
  tMax: number;
  numPoints: number;
  color: string;
  visible: boolean;
}

export interface ParametricState {
  equations: ParametricEquation[];
  activePlotType: ParametricPlotType;
}

export interface SliderParam {
  id: string;
  name: string;
  min: number;
  max: number;
  step: number;
  value: number;
}

export type ManipulatePlotType = 'standard-2d' | 'implicit' | '3d-surface';

export interface ManipulateEquation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  plotType: ManipulatePlotType;
}

export interface ManipulateState {
  equations: ManipulateEquation[];
  sliders: SliderParam[];
  xRange: [number, number];
  yRange: [number, number];
  gridResolution: number;
}

export interface AppState {
  activeTab: TabId;
  equations: Equation[];
  pointDataSets: PointData[];
  calculus: CalculusState;
  matrix: MatrixState;
  statistics: StatisticsState;
  threeDGraphing: ThreeDGraphingState;
  parametric: ParametricState;
  manipulate: ManipulateState;
  history: HistoryEntry[];
  variables: Variable[];
  darkMode: boolean;
}

export type AppAction =
  | { type: 'SET_TAB'; tab: TabId }
  | { type: 'ADD_EQUATION'; equation: Equation }
  | { type: 'UPDATE_EQUATION'; id: string; expression: string }
  | { type: 'TOGGLE_EQUATION'; id: string }
  | { type: 'REMOVE_EQUATION'; id: string }
  | { type: 'ADD_POINT_DATA'; pointData: PointData }
  | { type: 'UPDATE_POINT_DATA'; id: string; updates: Partial<PointData> }
  | { type: 'REMOVE_POINT_DATA'; id: string }
  | { type: 'SET_CALCULUS'; updates: Partial<CalculusState> }
  | { type: 'SET_MATRIX'; updates: Partial<MatrixState> }
  | { type: 'SET_STATISTICS'; updates: Partial<StatisticsState> }
  | { type: 'ADD_HISTORY'; entry: HistoryEntry }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'CLEAR_EQUATIONS' }
  | { type: 'CLEAR_CALCULUS' }
  | { type: 'CLEAR_MATRIX' }
  | { type: 'CLEAR_STATISTICS' }
  | { type: 'ADD_VARIABLE'; variable: Variable }
  | { type: 'UPDATE_VARIABLE'; name: string; value: number }
  | { type: 'REMOVE_VARIABLE'; name: string }
  | { type: 'ADD_3D_EQUATION'; equation: Equation3D }
  | { type: 'UPDATE_3D_EQUATION'; id: string; updates: Partial<Equation3D> }
  | { type: 'TOGGLE_3D_EQUATION'; id: string }
  | { type: 'REMOVE_3D_EQUATION'; id: string }
  | { type: 'SET_3D_GRAPHING'; updates: Partial<ThreeDGraphingState> }
  | { type: 'CLEAR_3D_GRAPHING' }
  | { type: 'ADD_PARAMETRIC_EQUATION'; equation: ParametricEquation }
  | { type: 'UPDATE_PARAMETRIC_EQUATION'; id: string; updates: Partial<ParametricEquation> }
  | { type: 'TOGGLE_PARAMETRIC_EQUATION'; id: string }
  | { type: 'REMOVE_PARAMETRIC_EQUATION'; id: string }
  | { type: 'SET_PARAMETRIC'; updates: Partial<ParametricState> }
  | { type: 'CLEAR_PARAMETRIC' }
  | { type: 'ADD_MANIPULATE_EQUATION'; equation: ManipulateEquation }
  | { type: 'TOGGLE_MANIPULATE_EQUATION'; id: string }
  | { type: 'REMOVE_MANIPULATE_EQUATION'; id: string }
  | { type: 'ADD_SLIDER'; slider: SliderParam }
  | { type: 'UPDATE_SLIDER'; id: string; value: number }
  | { type: 'UPDATE_SLIDER_CONFIG'; id: string; updates: Partial<SliderParam> }
  | { type: 'REMOVE_SLIDER'; id: string }
  | { type: 'SET_MANIPULATE'; updates: Partial<ManipulateState> }
  | { type: 'CLEAR_MANIPULATE' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'LOAD_STATE'; state: Partial<AppState> };
