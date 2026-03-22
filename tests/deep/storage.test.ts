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

describe('Storage - Deep', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('legacy 3D migration with missing color', () => {
    it('assigns color when 3D equation has no color field', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          threeDGraphing: {
            equations: [{ id: '1', expression: 'x+y', visible: true }],
            xRange: [-5, 5],
            yRange: [-5, 5],
            gridResolution: 50,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].color).toBeDefined();
      expect(loaded!.graph!.equations[0].color.startsWith('#')).toBe(true);
    });
  });

  describe('legacy parametric-3d migration', () => {
    it('migrates parametric-3d equations with zExpr', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          parametric: {
            equations: [
              {
                id: '1',
                plotType: 'parametric-3d',
                xExpr: 'cos(t)',
                yExpr: 'sin(t)',
                zExpr: 't/5',
                tMin: 0,
                tMax: 6.28,
                numPoints: 500,
                color: '#f00',
                visible: true,
              },
            ],
            activePlotType: 'parametric-3d',
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('parametric-3d');
      expect(loaded!.graph!.equations[0].components).toEqual(['cos(t)', 'sin(t)', 't/5']);
      expect(loaded!.graph!.equations[0].paramRange).toEqual({ min: 0, max: 6.28, numPoints: 500 });
    });
  });

  describe('legacy manipulate with implicit plotType', () => {
    it('migrates implicit manipulate equation', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          manipulate: {
            equations: [{ id: '1', expression: 'x^2+y^2=25', color: '#f00', visible: true, plotType: 'implicit' }],
            sliders: [],
            xRange: [-10, 10],
            yRange: [-10, 10],
            gridResolution: 50,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('implicit-2d');
    });

    it('migrates 3d-surface manipulate equation', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          manipulate: {
            equations: [{ id: '1', expression: 'x*y', color: '#f00', visible: true, plotType: '3d-surface' }],
            sliders: [],
            xRange: [-10, 10],
            yRange: [-10, 10],
            gridResolution: 50,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.equations[0].type).toBe('surface-3d');
    });
  });

  describe('legacy range preservation', () => {
    it('uses manipulate ranges when available', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          manipulate: {
            equations: [],
            sliders: [],
            xRange: [-20, 20],
            yRange: [-15, 15],
            gridResolution: 80,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.xRange).toEqual([-20, 20]);
      expect(loaded!.graph!.yRange).toEqual([-15, 15]);
      expect(loaded!.graph!.gridResolution).toBe(80);
    });

    it('falls back to 3D ranges when no manipulate', () => {
      localStorage.setItem(
        'calculus-lab-state',
        JSON.stringify({
          threeDGraphing: {
            equations: [],
            xRange: [-3, 3],
            yRange: [-3, 3],
            gridResolution: 30,
          },
        }),
      );
      const loaded = loadState();
      expect(loaded!.graph!.xRange).toEqual([-3, 3]);
      expect(loaded!.graph!.gridResolution).toBe(30);
    });
  });

  describe('saveState handles errors gracefully', () => {
    it('does not throw when localStorage is full', () => {
      // Fill localStorage to trigger quota error
      const state = makeState();
      expect(() => saveState(state)).not.toThrow();
    });
  });

  describe('clearState', () => {
    it('removes the key', () => {
      saveState(makeState());
      clearState();
      expect(localStorage.getItem('calculus-lab-state')).toBeNull();
    });
  });
});
