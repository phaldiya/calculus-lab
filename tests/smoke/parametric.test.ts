import { evaluateParametric2D, evaluateParametric3D, evaluatePolar } from '../../src/lib/expressionParser';
import { applyActions, createTestState } from '../helpers/testReducer';

describe('Parametric - Smoke', () => {
  describe('evaluateParametric2D', () => {
    it('evaluates circle parametrically', () => {
      const result = evaluateParametric2D('cos(t)', 'sin(t)', 0, 2 * Math.PI, 100);
      expect(result.x).toHaveLength(100);
      expect(result.y).toHaveLength(100);
      // At t=0: x=1, y=0
      expect(result.x[0]).toBeCloseTo(1);
      expect(result.y[0]).toBeCloseTo(0);
    });

    it('handles variables', () => {
      const result = evaluateParametric2D('a * cos(t)', 'a * sin(t)', 0, 2 * Math.PI, 10, [{ name: 'a', value: 3 }]);
      expect(result.x[0]).toBeCloseTo(3);
    });
  });

  describe('evaluateParametric3D', () => {
    it('evaluates helix', () => {
      const result = evaluateParametric3D('cos(t)', 'sin(t)', 't', 0, 4 * Math.PI, 100);
      expect(result.x).toHaveLength(100);
      expect(result.y).toHaveLength(100);
      expect(result.z).toHaveLength(100);
      expect(result.z[0]).toBeCloseTo(0);
    });
  });

  describe('evaluatePolar', () => {
    it('evaluates cardioid r = 1 + cos(theta)', () => {
      const result = evaluatePolar('1 + cos(theta)', 0, 2 * Math.PI, 100);
      expect(result.r).toHaveLength(100);
      expect(result.theta).toHaveLength(100);
      expect(result.x).toHaveLength(100);
      expect(result.y).toHaveLength(100);
      // At theta=0: r = 2, x = 2, y = 0
      expect(result.r[0]).toBeCloseTo(2);
      expect(result.x[0]).toBeCloseTo(2);
    });

    it('theta values are in degrees for Plotly', () => {
      const result = evaluatePolar('1', 0, Math.PI, 3);
      // theta = [0, pi/2, pi] in radians -> [0, 90, 180] in degrees
      expect(result.theta[0]).toBeCloseTo(0);
      expect(result.theta[1]).toBeCloseTo(90);
      expect(result.theta[2]).toBeCloseTo(180);
    });
  });

  describe('reducer: parametric actions', () => {
    it('ADD_PARAMETRIC_EQUATION adds equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'ADD_PARAMETRIC_EQUATION',
          equation: {
            id: '1',
            plotType: 'parametric-2d',
            xExpr: 'cos(t)',
            yExpr: 'sin(t)',
            tMin: 0,
            tMax: 6.28,
            numPoints: 500,
            color: '#6366f1',
            visible: true,
          },
        },
      ]);
      expect(next.parametric.equations).toHaveLength(1);
      expect(next.parametric.equations[0].xExpr).toBe('cos(t)');
    });

    it('TOGGLE_PARAMETRIC_EQUATION toggles visibility', () => {
      const state = createTestState({
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
              color: '#6366f1',
              visible: true,
            },
          ],
          activePlotType: 'parametric-2d',
        },
      });
      const next = applyActions(state, [{ type: 'TOGGLE_PARAMETRIC_EQUATION', id: '1' }]);
      expect(next.parametric.equations[0].visible).toBe(false);
    });

    it('REMOVE_PARAMETRIC_EQUATION removes by id', () => {
      const state = createTestState({
        parametric: {
          equations: [
            {
              id: '1',
              plotType: 'polar',
              xExpr: '2 + cos(3*theta)',
              yExpr: '',
              tMin: 0,
              tMax: 6.28,
              numPoints: 500,
              color: '#ef4444',
              visible: true,
            },
          ],
          activePlotType: 'polar',
        },
      });
      const next = applyActions(state, [{ type: 'REMOVE_PARAMETRIC_EQUATION', id: '1' }]);
      expect(next.parametric.equations).toHaveLength(0);
    });

    it('SET_PARAMETRIC updates active plot type', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'SET_PARAMETRIC', updates: { activePlotType: 'polar' } }]);
      expect(next.parametric.activePlotType).toBe('polar');
    });

    it('CLEAR_PARAMETRIC resets state', () => {
      const state = createTestState({
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
              color: '#6366f1',
              visible: true,
            },
          ],
          activePlotType: 'parametric-3d',
        },
      });
      const next = applyActions(state, [{ type: 'CLEAR_PARAMETRIC' }]);
      expect(next.parametric.equations).toHaveLength(0);
      expect(next.parametric.activePlotType).toBe('parametric-2d');
    });
  });
});
