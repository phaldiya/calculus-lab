import { initialGraph } from '../../src/context/AppContext';
import { clearState, loadState, saveState } from '../../src/lib/storage';
import type { AppState } from '../../src/types';

const makeState = (overrides: Partial<AppState> = {}): AppState => ({
  activeTab: 'scientific',
  graph: initialGraph,
  calculus: {
    derivativeExpr: '',
    derivativeResult: '',
    integralExpr: '',
    integralLower: '',
    integralUpper: '',
    integralResult: '',
    limitExpr: '',
    limitPoint: '',
    limitResult: '',
  },
  matrix: { matrixA: [[0]], matrixB: [[0]], operation: 'add', result: null, error: null },
  statistics: {
    data: [],
    dataInput: '',
    results: null,
    regressionType: 'linear',
    regressionDegree: 2,
    regressionResult: null,
    xyData: [],
  },
  history: [],
  variables: [],
  darkMode: false,
  ...overrides,
});

describe('Storage - Smoke', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveState / loadState round-trip', () => {
    it('saves and loads graph state', () => {
      const state = makeState({
        graph: {
          ...initialGraph,
          equations: [
            { id: '1', rawInput: 'sin(x)', type: 'standard-2d', components: ['sin(x)'], color: '#f00', visible: true },
          ],
        },
      });
      saveState(state);
      const loaded = loadState();
      expect(loaded).not.toBeNull();
      expect(loaded!.graph!.equations).toHaveLength(1);
      expect(loaded!.graph!.equations[0].rawInput).toBe('sin(x)');
    });

    it('saves and loads darkMode', () => {
      saveState(makeState({ darkMode: true }));
      const loaded = loadState();
      expect(loaded!.darkMode).toBe(true);
    });

    it('saves and loads variables', () => {
      saveState(makeState({ variables: [{ name: 'a', value: 5 }] }));
      const loaded = loadState();
      expect(loaded!.variables).toEqual([{ name: 'a', value: 5 }]);
    });
  });

  describe('loadState returns null for empty storage', () => {
    it('returns null when nothing saved', () => {
      expect(loadState()).toBeNull();
    });
  });

  describe('clearState', () => {
    it('removes saved state', () => {
      saveState(makeState());
      clearState();
      expect(loadState()).toBeNull();
    });
  });

  describe('legacy state migration', () => {
    it('migrates old equations to graph.equations', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          equations: [{ id: '1', expression: 'x^2', color: '#f00', visible: true, mode: 'standard' }],
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph).toBeDefined();
      expect(loaded!.graph!.equations).toHaveLength(1);
      expect(loaded!.graph!.equations[0].type).toBe('standard-2d');
      expect(loaded!.graph!.equations[0].rawInput).toBe('x^2');
    });

    it('migrates implicit equations', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          equations: [{ id: '1', expression: 'x^2+y^2=25', color: '#f00', visible: true, mode: 'implicit' }],
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('implicit-2d');
    });

    it('migrates inequality equations', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          equations: [
            { id: '1', expression: 'y > x^2', color: '#f00', visible: true, mode: 'inequality', inequalityOp: '>' },
          ],
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('inequality-2d');
      expect(loaded!.graph!.equations[0].inequalityOp).toBe('>');
    });

    it('migrates 3D equations', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          threeDGraphing: {
            equations: [{ id: '1', expression: 'sin(x)*cos(y)', color: '#0f0', visible: true }],
            xRange: [-5, 5],
            yRange: [-5, 5],
            gridResolution: 50,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('surface-3d');
    });

    it('migrates parametric equations', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          parametric: {
            equations: [
              {
                id: '1',
                plotType: 'parametric-2d',
                xExpr: 'cos(t)',
                yExpr: 'sin(t)',
                tMin: 0,
                tMax: 6.28,
                numPoints: 500,
                color: '#00f',
                visible: true,
              },
            ],
            activePlotType: 'parametric-2d',
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('parametric-2d');
      expect(loaded!.graph!.equations[0].components).toEqual(['cos(t)', 'sin(t)']);
    });

    it('migrates polar equations', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          parametric: {
            equations: [
              {
                id: '1',
                plotType: 'polar',
                xExpr: '1+cos(theta)',
                yExpr: '',
                tMin: 0,
                tMax: 6.28,
                numPoints: 500,
                color: '#f0f',
                visible: true,
              },
            ],
            activePlotType: 'polar',
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('polar');
    });

    it('migrates manipulate equations and sliders', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          manipulate: {
            equations: [{ id: '1', expression: 'a*sin(x)', color: '#f00', visible: true, plotType: 'standard-2d' }],
            sliders: [{ id: 's1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
            xRange: [-10, 10],
            yRange: [-10, 10],
            gridResolution: 50,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('standard-2d');
      expect(loaded!.graph!.sliders).toHaveLength(1);
      expect(loaded!.graph!.sliders[0].name).toBe('a');
    });

    it('migrates legacy tab IDs', () => {
      localStorage.setItem('calculus-lab-state', JSON.stringify({ activeTab: 'graphing' }));
      const loaded = loadState();
      expect(loaded!.activeTab).toBe('graph');
    });

    it('does not migrate when graph state already exists', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          graph: {
            equations: [],
            pointDataSets: [],
            sliders: [],
            xRange: [-10, 10],
            yRange: [-10, 10],
            gridResolution: 50,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('returns null for invalid JSON', () => {
      localStorage.setItem('calculus-lab-state', 'not-json');
      expect(loadState()).toBeNull();
    });
  });
});
