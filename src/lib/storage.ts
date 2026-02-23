import type { AppState, Equation3D } from '../types';
import { getColor } from './colorPalette';

const STORAGE_KEY = 'calculus-lab-state';

export function saveState(state: AppState): void {
  try {
    const serialized = JSON.stringify({
      equations: state.equations,
      pointDataSets: state.pointDataSets,
      threeDGraphing: state.threeDGraphing,
      parametric: state.parametric,
      manipulate: state.manipulate,
      history: state.history,
      variables: state.variables,
      darkMode: state.darkMode,
    });
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Storage full or unavailable
  }
}

export function loadState(): Partial<AppState> | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized) as Partial<AppState>;
    // Migrate: ensure equations have mode field
    if (parsed.equations) {
      parsed.equations = parsed.equations.map((eq) => ({ ...eq, mode: eq.mode ?? 'standard' }));
    }
    // Migrate: convert 3D equations from colorscale/opacity to color
    if (parsed.threeDGraphing?.equations) {
      parsed.threeDGraphing.equations = parsed.threeDGraphing.equations.map((eq, i) => {
        const legacy = eq as Equation3D & { colorscale?: string; opacity?: number };
        if (!legacy.color) {
          const { colorscale: _, opacity: __, ...rest } = legacy;
          return { ...rest, color: getColor(i) };
        }
        return eq;
      });
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
