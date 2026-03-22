import { getColor, nextColor, resetColorIndex } from '../../src/lib/colorPalette';
import {
  evaluateExpression,
  evaluateOverRange,
  parseExpression,
  validateExpression,
} from '../../src/lib/expressionParser';
import { applyActions, createTestState } from '../helpers/testReducer';

describe('QA Audit: Graphing - Smoke', () => {
  describe('parseExpression', () => {
    it('parses x^2 without throwing', () => {
      expect(() => parseExpression('x^2')).not.toThrow();
    });
  });

  describe('evaluateExpression', () => {
    it('evaluates x^2 at x=3 to 9', () => {
      expect(evaluateExpression('x^2', { x: 3 })).toBe(9);
    });
  });

  describe('evaluateOverRange', () => {
    it('returns 5 points for x from -10 to 10', () => {
      const result = evaluateOverRange('x', -10, 10, 5);
      expect(result.x).toHaveLength(5);
      expect(result.y).toHaveLength(5);
    });

    it('returns 100 points for sin(x) from 0 to 6.28', () => {
      const result = evaluateOverRange('sin(x)', 0, 6.28, 100);
      expect(result.x).toHaveLength(100);
      expect(result.y).toHaveLength(100);
    });
  });

  describe('validateExpression', () => {
    it('validates x^2 as valid', () => {
      expect(validateExpression('x^2')).toEqual({ valid: true });
    });

    it('validates x^^2 as invalid', () => {
      const result = validateExpression('x^^2');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('reducer: graph equation actions', () => {
    it('GRAPH_ADD_EQUATION adds an equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '1',
            rawInput: 'x^2',
            type: 'standard-2d',
            components: ['x^2'],
            color: '#6366f1',
            visible: true,
          },
        },
      ]);
      expect(next.graph.equations).toHaveLength(1);
      expect(next.graph.equations[0].rawInput).toBe('x^2');
    });

    it('GRAPH_REMOVE_EQUATION removes by id', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            { id: '1', rawInput: 'x^2', type: 'standard-2d', components: ['x^2'], color: '#6366f1', visible: true },
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
            { id: '1', rawInput: 'x^2', type: 'standard-2d', components: ['x^2'], color: '#6366f1', visible: true },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_TOGGLE_EQUATION', id: '1' }]);
      expect(next.graph.equations[0].visible).toBe(false);
    });
  });

  describe('colorPalette', () => {
    beforeEach(() => {
      resetColorIndex();
    });

    it('nextColor cycles through palette', () => {
      const first = nextColor();
      const second = nextColor();
      expect(first).not.toBe(second);
      expect(first).toBe('#6366f1');
    });

    it('getColor returns color by index', () => {
      expect(getColor(0)).toBe('#6366f1');
      expect(getColor(1)).toBe('#ef4444');
    });
  });
});
