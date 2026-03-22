import {
  detectEquationMode,
  evaluateOverGrid,
  parseImplicitEquation,
  validateImplicitExpression,
} from '../../src/lib/expressionParser';
import { applyActions, createTestState } from '../helpers/testReducer';

describe('QA Audit: 3D Graphing & Implicit Equations - Smoke', () => {
  describe('evaluateOverGrid', () => {
    it('returns correct dimensions for a 10x10 grid', () => {
      const result = evaluateOverGrid('x + y', -5, 5, -5, 5, 10, 10);
      expect(result.x).toHaveLength(10);
      expect(result.y).toHaveLength(10);
      expect(result.z).toHaveLength(10);
      expect(result.z[0]).toHaveLength(10);
    });

    it('evaluates sin(x) * cos(y) without errors', () => {
      const result = evaluateOverGrid('sin(x) * cos(y)', -3, 3, -3, 3, 5, 5);
      expect(result.z.flat().every((v) => typeof v === 'number')).toBe(true);
    });

    it('produces NaN for invalid points', () => {
      const result = evaluateOverGrid('sqrt(x)', -5, 5, -5, 5, 10, 10);
      const flat = result.z.flat();
      expect(flat.some((v) => Number.isNaN(v))).toBe(true);
    });
  });

  describe('parseImplicitEquation', () => {
    it('parses x^2 + y^2 = 25', () => {
      expect(parseImplicitEquation('x^2 + y^2 = 25')).toBe('(x^2 + y^2) - (25)');
    });

    it('returns null for standard expressions', () => {
      expect(parseImplicitEquation('sin(x)')).toBeNull();
    });

    it('does not match == or <=', () => {
      expect(parseImplicitEquation('x == 5')).toBeNull();
      expect(parseImplicitEquation('x <= 5')).toBeNull();
      expect(parseImplicitEquation('x >= 5')).toBeNull();
    });
  });

  describe('validateImplicitExpression', () => {
    it('validates x^2 + y^2 = 25 as valid', () => {
      expect(validateImplicitExpression('x^2 + y^2 = 25')).toEqual({ valid: true });
    });

    it('rejects expressions without =', () => {
      const result = validateImplicitExpression('sin(x)');
      expect(result.valid).toBe(false);
    });
  });

  describe('detectEquationMode', () => {
    it('detects implicit for x^2 + y^2 = 1', () => {
      expect(detectEquationMode('x^2 + y^2 = 1')).toBe('implicit');
    });

    it('detects standard for sin(x)', () => {
      expect(detectEquationMode('sin(x)')).toBe('standard');
    });
  });

  describe('reducer: 3D graph equation actions', () => {
    it('GRAPH_ADD_EQUATION adds a 3D surface equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '1',
            rawInput: 'sin(x) * cos(y)',
            type: 'surface-3d',
            components: ['sin(x) * cos(y)'],
            color: '#6366f1',
            visible: true,
          },
        },
      ]);
      expect(next.graph.equations).toHaveLength(1);
      expect(next.graph.equations[0].rawInput).toBe('sin(x) * cos(y)');
      expect(next.graph.equations[0].type).toBe('surface-3d');
    });

    it('GRAPH_REMOVE_EQUATION removes by id', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            { id: '1', rawInput: 'x + y', type: 'surface-3d', components: ['x + y'], color: '#6366f1', visible: true },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_REMOVE_EQUATION', id: '1' }]);
      expect(next.graph.equations).toHaveLength(0);
    });

    it('GRAPH_TOGGLE_EQUATION toggles visibility', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            { id: '1', rawInput: 'x + y', type: 'surface-3d', components: ['x + y'], color: '#6366f1', visible: true },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_TOGGLE_EQUATION', id: '1' }]);
      expect(next.graph.equations[0].visible).toBe(false);
    });

    it('GRAPH_SET_CONFIG updates grid resolution', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'GRAPH_SET_CONFIG', updates: { gridResolution: 80 } }]);
      expect(next.graph.gridResolution).toBe(80);
    });

    it('GRAPH_CLEAR resets to initial state', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            { id: '1', rawInput: 'x + y', type: 'surface-3d', components: ['x + y'], color: '#6366f1', visible: true },
          ],
          gridResolution: 80,
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_CLEAR' }]);
      expect(next.graph.equations).toHaveLength(0);
      expect(next.graph.gridResolution).toBe(50);
    });
  });
});
