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

  describe('reducer: 3D equation actions', () => {
    it('ADD_3D_EQUATION adds a 3D equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'ADD_3D_EQUATION',
          equation: { id: '1', expression: 'sin(x) * cos(y)', color: '#6366f1', visible: true },
        },
      ]);
      expect(next.threeDGraphing.equations).toHaveLength(1);
      expect(next.threeDGraphing.equations[0].expression).toBe('sin(x) * cos(y)');
    });

    it('REMOVE_3D_EQUATION removes by id', () => {
      const state = createTestState({
        threeDGraphing: {
          equations: [{ id: '1', expression: 'x + y', color: '#6366f1', visible: true }],
          xRange: [-5, 5],
          yRange: [-5, 5],
          gridResolution: 50,
        },
      });
      const next = applyActions(state, [{ type: 'REMOVE_3D_EQUATION', id: '1' }]);
      expect(next.threeDGraphing.equations).toHaveLength(0);
    });

    it('TOGGLE_3D_EQUATION toggles visibility', () => {
      const state = createTestState({
        threeDGraphing: {
          equations: [{ id: '1', expression: 'x + y', color: '#6366f1', visible: true }],
          xRange: [-5, 5],
          yRange: [-5, 5],
          gridResolution: 50,
        },
      });
      const next = applyActions(state, [{ type: 'TOGGLE_3D_EQUATION', id: '1' }]);
      expect(next.threeDGraphing.equations[0].visible).toBe(false);
    });

    it('SET_3D_GRAPHING updates partial state', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'SET_3D_GRAPHING', updates: { gridResolution: 80 } }]);
      expect(next.threeDGraphing.gridResolution).toBe(80);
    });

    it('CLEAR_3D_GRAPHING resets to initial state', () => {
      const state = createTestState({
        threeDGraphing: {
          equations: [{ id: '1', expression: 'x + y', color: '#6366f1', visible: true }],
          xRange: [-10, 10],
          yRange: [-10, 10],
          gridResolution: 80,
        },
      });
      const next = applyActions(state, [{ type: 'CLEAR_3D_GRAPHING' }]);
      expect(next.threeDGraphing.equations).toHaveLength(0);
      expect(next.threeDGraphing.gridResolution).toBe(50);
    });
  });
});
