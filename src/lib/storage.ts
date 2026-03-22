import type {
  AppState,
  Equation,
  Equation3D,
  GraphState,
  ManipulateState,
  ParametricEquation,
  ParametricState,
  PointData,
  ThreeDGraphingState,
  UnifiedEquation,
} from '../types';
import { getColor } from './colorPalette';

const STORAGE_KEY = 'calculus-lab-state';

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify({
      graph: state.graph,
      history: state.history,
      variables: state.variables,
      darkMode: state.darkMode,
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Storage full or unavailable
  }
}

interface LegacyState {
  equations?: Equation[];
  pointDataSets?: PointData[];
  threeDGraphing?: ThreeDGraphingState;
  parametric?: ParametricState;
  manipulate?: ManipulateState;
  graph?: GraphState;
  history?: AppState['history'];
  variables?: AppState['variables'];
  darkMode?: boolean;
  activeTab?: string;
}

function migrateEquation(eq: Equation): UnifiedEquation {
  let type: UnifiedEquation['type'] = 'standard-2d';
  if (eq.mode === 'implicit') type = 'implicit-2d';
  if (eq.mode === 'inequality') type = 'inequality-2d';
  return {
    id: eq.id,
    rawInput: eq.expression,
    type,
    components: [eq.expression],
    color: eq.color,
    visible: eq.visible,
    inequalityOp: eq.inequalityOp,
  };
}

function migrate3DEquation(eq: Equation3D): UnifiedEquation {
  return {
    id: eq.id,
    rawInput: eq.expression,
    type: 'surface-3d',
    components: [eq.expression],
    color: eq.color,
    visible: eq.visible,
  };
}

function migrateParametricEquation(eq: ParametricEquation): UnifiedEquation {
  let rawInput: string;
  let type: UnifiedEquation['type'];
  let components: string[];

  if (eq.plotType === 'polar') {
    type = 'polar';
    rawInput = eq.xExpr;
    components = [eq.xExpr];
  } else if (eq.plotType === 'parametric-3d') {
    type = 'parametric-3d';
    rawInput = `${eq.xExpr}; ${eq.yExpr}; ${eq.zExpr ?? '0'}`;
    components = [eq.xExpr, eq.yExpr, eq.zExpr ?? '0'];
  } else {
    type = 'parametric-2d';
    rawInput = `${eq.xExpr}; ${eq.yExpr}`;
    components = [eq.xExpr, eq.yExpr];
  }

  return {
    id: eq.id,
    rawInput,
    type,
    components,
    color: eq.color,
    visible: eq.visible,
    paramRange: { min: eq.tMin, max: eq.tMax, numPoints: eq.numPoints },
  };
}

function migrateManipulateEquation(eq: {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
  plotType: string;
}): UnifiedEquation {
  let type: UnifiedEquation['type'] = 'standard-2d';
  if (eq.plotType === 'implicit') type = 'implicit-2d';
  if (eq.plotType === '3d-surface') type = 'surface-3d';
  return {
    id: eq.id,
    rawInput: eq.expression,
    type,
    components: [eq.expression],
    color: eq.color,
    visible: eq.visible,
  };
}

function migrateLegacyToGraph(legacy: LegacyState): GraphState {
  const equations: UnifiedEquation[] = [];

  if (legacy.equations) {
    for (const eq of legacy.equations) {
      equations.push(migrateEquation({ ...eq, mode: eq.mode ?? 'standard' }));
    }
  }

  if (legacy.threeDGraphing?.equations) {
    for (const eq of legacy.threeDGraphing.equations) {
      const migrated = eq as Equation3D & { colorscale?: string; opacity?: number };
      if (!migrated.color) {
        const { colorscale: _, opacity: __, ...rest } = migrated;
        equations.push(migrate3DEquation({ ...rest, color: getColor(equations.length) }));
      } else {
        equations.push(migrate3DEquation(eq));
      }
    }
  }

  if (legacy.parametric?.equations) {
    for (const eq of legacy.parametric.equations) {
      equations.push(migrateParametricEquation(eq));
    }
  }

  if (legacy.manipulate?.equations) {
    for (const eq of legacy.manipulate.equations) {
      equations.push(migrateManipulateEquation(eq));
    }
  }

  return {
    equations,
    pointDataSets: legacy.pointDataSets ?? [],
    sliders: legacy.manipulate?.sliders ?? [],
    xRange: legacy.manipulate?.xRange ?? legacy.threeDGraphing?.xRange ?? [-10, 10],
    yRange: legacy.manipulate?.yRange ?? legacy.threeDGraphing?.yRange ?? [-10, 10],
    gridResolution: legacy.manipulate?.gridResolution ?? legacy.threeDGraphing?.gridResolution ?? 50,
  };
}

const LEGACY_TAB_MAP: Record<string, string> = {
  graphing: 'graph',
  '3d-graphing': 'graph',
  parametric: 'graph',
  manipulate: 'graph',
};

export function loadState(): Partial<AppState> | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized) as LegacyState;

    // Detect legacy state (has equations/threeDGraphing/parametric/manipulate at top level but no graph)
    const isLegacy =
      !parsed.graph && (parsed.equations || parsed.threeDGraphing || parsed.parametric || parsed.manipulate);

    const result: Partial<AppState> = {
      history: parsed.history,
      variables: parsed.variables,
      darkMode: parsed.darkMode,
    };

    if (isLegacy) {
      result.graph = migrateLegacyToGraph(parsed);
    } else if (parsed.graph) {
      result.graph = parsed.graph;
    }

    // Migrate legacy tab IDs
    if (parsed.activeTab && LEGACY_TAB_MAP[parsed.activeTab]) {
      result.activeTab = LEGACY_TAB_MAP[parsed.activeTab] as AppState['activeTab'];
    }

    return result;
  } catch {
    return null;
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
