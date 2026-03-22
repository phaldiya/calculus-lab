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

  describe('reducer: parametric graph actions', () => {
    it('GRAPH_ADD_EQUATION adds parametric 2D equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '1',
            rawInput: 'cos(t); sin(t)',
            type: 'parametric-2d',
            components: ['cos(t)', 'sin(t)'],
            color: '#6366f1',
            visible: true,
            paramRange: { min: 0, max: 6.28, numPoints: 500 },
          },
        },
      ]);
      expect(next.graph.equations).toHaveLength(1);
      expect(next.graph.equations[0].components[0]).toBe('cos(t)');
    });

    it('GRAPH_TOGGLE_EQUATION toggles parametric visibility', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            {
              id: '1',
              rawInput: 'cos(t); sin(t)',
              type: 'parametric-2d',
              components: ['cos(t)', 'sin(t)'],
              color: '#6366f1',
              visible: true,
              paramRange: { min: 0, max: 6.28, numPoints: 500 },
            },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_TOGGLE_EQUATION', id: '1' }]);
      expect(next.graph.equations[0].visible).toBe(false);
    });

    it('GRAPH_REMOVE_EQUATION removes parametric by id', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            {
              id: '1',
              rawInput: '2 + cos(3*theta)',
              type: 'polar',
              components: ['2 + cos(3*theta)'],
              color: '#ef4444',
              visible: true,
              paramRange: { min: 0, max: 6.28, numPoints: 500 },
            },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_REMOVE_EQUATION', id: '1' }]);
      expect(next.graph.equations).toHaveLength(0);
    });

    it('GRAPH_CLEAR resets parametric state', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            {
              id: '1',
              rawInput: 'cos(t); sin(t)',
              type: 'parametric-2d',
              components: ['cos(t)', 'sin(t)'],
              color: '#6366f1',
              visible: true,
              paramRange: { min: 0, max: 6.28, numPoints: 500 },
            },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_CLEAR' }]);
      expect(next.graph.equations).toHaveLength(0);
    });
  });
});
