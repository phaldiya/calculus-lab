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
      expect(result).not.toBeNull();
      expect(result!.operator).toBe('>');
    });

    it('parses y <= sin(x)', () => {
      const result = parseInequalityExpression('y <= sin(x)');
      expect(result).not.toBeNull();
      expect(result!.operator).toBe('<=');
    });

    it('returns null for non-inequality', () => {
      expect(parseInequalityExpression('x^2 + y^2')).toBeNull();
    });
  });

  describe('validateInequalityExpression', () => {
    it('validates y > x^2 as valid', () => {
      expect(validateInequalityExpression('y > x^2').valid).toBe(true);
    });

    it('rejects missing rhs', () => {
      expect(validateInequalityExpression('y >').valid).toBe(false);
    });
  });

  describe('detectEquationMode', () => {
    it('detects inequality', () => {
      expect(detectEquationMode('y > x^2')).toBe('inequality');
    });

    it('detects implicit', () => {
      expect(detectEquationMode('x^2 + y^2 = 25')).toBe('implicit');
    });

    it('detects standard', () => {
      expect(detectEquationMode('sin(x)')).toBe('standard');
    });
  });

  describe('reducer: inequality equations', () => {
    it('GRAPH_ADD_EQUATION with inequality type stores inequalityOp', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '1',
            rawInput: 'y > x^2',
            type: 'inequality-2d',
            components: ['y > x^2'],
            color: '#ef4444',
            visible: true,
            inequalityOp: '>',
          },
        },
      ]);
      expect(next.graph.equations[0].type).toBe('inequality-2d');
      expect(next.graph.equations[0].inequalityOp).toBe('>');
    });

    it('GRAPH_TOGGLE_EQUATION works with inequality equations', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            {
              id: '1',
              rawInput: 'y > x^2',
              type: 'inequality-2d',
              components: ['y > x^2'],
              color: '#ef4444',
              visible: true,
              inequalityOp: '>',
            },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_TOGGLE_EQUATION', id: '1' }]);
      expect(next.graph.equations[0].visible).toBe(false);
    });
  });
});
