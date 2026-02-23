import {
  detectEquationMode,
  parseInequalityExpression,
  validateInequalityExpression,
} from '../../src/lib/expressionParser';
import { applyActions, createTestState } from '../helpers/testReducer';

describe('Inequality - Smoke', () => {
  describe('parseInequalityExpression', () => {
    it('parses y > x^2', () => {
      const result = parseInequalityExpression('y > x^2');
      expect(result).toEqual({ rearranged: '(y) - (x^2)', operator: '>' });
    });

    it('parses x^2 + y^2 < 25', () => {
      const result = parseInequalityExpression('x^2 + y^2 < 25');
      expect(result).toEqual({ rearranged: '(x^2 + y^2) - (25)', operator: '<' });
    });

    it('parses y >= 2*x', () => {
      const result = parseInequalityExpression('y >= 2*x');
      expect(result).toEqual({ rearranged: '(y) - (2*x)', operator: '>=' });
    });

    it('parses y <= sin(x)', () => {
      const result = parseInequalityExpression('y <= sin(x)');
      expect(result).toEqual({ rearranged: '(y) - (sin(x))', operator: '<=' });
    });

    it('returns null for plain expression', () => {
      expect(parseInequalityExpression('x^2 + 1')).toBeNull();
    });

    it('returns null for implicit equation', () => {
      expect(parseInequalityExpression('x^2 + y^2 = 25')).toBeNull();
    });
  });

  describe('validateInequalityExpression', () => {
    it('validates y > x^2 as valid', () => {
      expect(validateInequalityExpression('y > x^2')).toEqual({ valid: true });
    });

    it('validates malformed inequality as invalid', () => {
      const result = validateInequalityExpression('> x^2');
      expect(result.valid).toBe(false);
    });

    it('validates expression without inequality as invalid', () => {
      const result = validateInequalityExpression('x^2 + 1');
      expect(result.valid).toBe(false);
    });
  });

  describe('detectEquationMode', () => {
    it('detects inequality for y > x^2', () => {
      expect(detectEquationMode('y > x^2')).toBe('inequality');
    });

    it('detects inequality for y >= x', () => {
      expect(detectEquationMode('y >= x')).toBe('inequality');
    });

    it('detects inequality for y <= x', () => {
      expect(detectEquationMode('y <= x')).toBe('inequality');
    });

    it('detects implicit for x^2 + y^2 = 25', () => {
      expect(detectEquationMode('x^2 + y^2 = 25')).toBe('implicit');
    });

    it('detects standard for sin(x)', () => {
      expect(detectEquationMode('sin(x)')).toBe('standard');
    });
  });

  describe('reducer: inequality equations', () => {
    it('ADD_EQUATION with inequality mode stores inequalityOp', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'ADD_EQUATION',
          equation: {
            id: '1',
            expression: 'y > x^2',
            color: '#6366f1',
            visible: true,
            mode: 'inequality',
            inequalityOp: '>',
          },
        },
      ]);
      expect(next.equations).toHaveLength(1);
      expect(next.equations[0].mode).toBe('inequality');
      expect(next.equations[0].inequalityOp).toBe('>');
    });

    it('TOGGLE_EQUATION works with inequality equations', () => {
      const state = createTestState({
        equations: [
          { id: '1', expression: 'y > x^2', color: '#6366f1', visible: true, mode: 'inequality', inequalityOp: '>' },
        ],
      });
      const next = applyActions(state, [{ type: 'TOGGLE_EQUATION', id: '1' }]);
      expect(next.equations[0].visible).toBe(false);
      expect(next.equations[0].inequalityOp).toBe('>');
    });
  });
});
