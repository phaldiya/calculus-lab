import { getColor, nextColor, resetColorIndex } from '../../src/lib/colorPalette';
import { evaluateOverRange, validateExpression } from '../../src/lib/expressionParser';
import { applyActions, createTestState } from '../helpers/testReducer';

describe('QA Audit: Graphing - Deep', () => {
  describe('discontinuity handling', () => {
    it('1/x around x=0 produces NaN at x=0', () => {
      const result = evaluateOverRange('1/x', -1, 1, 3);
      const zeroIdx = result.x.findIndex((v) => Math.abs(v) < 1e-10);
      if (zeroIdx >= 0) {
        expect(Number.isNaN(result.y[zeroIdx])).toBe(true);
      }
    });

    it('sin(x)/x near x=0', () => {
      const result = evaluateOverRange('sin(x)/x', -1, 1, 101);
      const validCount = result.y.filter((y) => !Number.isNaN(y)).length;
      expect(validCount).toBeGreaterThan(90);
    });
  });

  describe('large range', () => {
    it('handles -1e6 to 1e6', () => {
      const result = evaluateOverRange('x', -1e6, 1e6, 10);
      expect(result.x).toHaveLength(10);
      expect(result.y).toHaveLength(10);
    });
  });

  describe('edge cases', () => {
    it('numPoints=1 returns 1 point', () => {
      const result = evaluateOverRange('x', 0, 10, 1);
      expect(result.x).toHaveLength(1);
    });

    it('xMin > xMax still produces points', () => {
      const result = evaluateOverRange('x', 10, 0, 5);
      expect(result.x).toHaveLength(5);
    });
  });

  describe('variables in scope', () => {
    it('evaluates a*x+b with variables', () => {
      const result = evaluateOverRange('a*x+b', 0, 4, 5, [
        { name: 'a', value: 2 },
        { name: 'b', value: 1 },
      ]);
      expect(result.y[0]).toBeCloseTo(1);
      expect(result.y[4]).toBeCloseTo(9);
    });
  });

  describe('multiple equations reducer flow', () => {
    it('add 3, remove middle, verify order', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: { id: '1', rawInput: 'x', type: 'standard-2d', components: ['x'], color: '#f00', visible: true },
        },
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '2',
            rawInput: 'x^2',
            type: 'standard-2d',
            components: ['x^2'],
            color: '#0f0',
            visible: true,
          },
        },
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '3',
            rawInput: 'x^3',
            type: 'standard-2d',
            components: ['x^3'],
            color: '#00f',
            visible: true,
          },
        },
        { type: 'GRAPH_REMOVE_EQUATION', id: '2' },
      ]);
      expect(next.graph.equations).toHaveLength(2);
      expect(next.graph.equations[0].id).toBe('1');
      expect(next.graph.equations[1].id).toBe('3');
    });
  });

  describe('GRAPH_UPDATE_EQUATION', () => {
    it('preserves id and color', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [{ id: '1', rawInput: 'x', type: 'standard-2d', components: ['x'], color: '#f00', visible: true }],
        },
      });
      const next = applyActions(state, [
        { type: 'GRAPH_UPDATE_EQUATION', id: '1', updates: { rawInput: 'x^2', components: ['x^2'] } },
      ]);
      expect(next.graph.equations[0].id).toBe('1');
      expect(next.graph.equations[0].color).toBe('#f00');
      expect(next.graph.equations[0].rawInput).toBe('x^2');
    });
  });

  describe('GRAPH_CLEAR', () => {
    it('resets equations, pointDataSets, and sliders', () => {
      const state = createTestState({
        graph: {
          equations: [{ id: '1', rawInput: 'x', type: 'standard-2d', components: ['x'], color: '#f00', visible: true }],
          pointDataSets: [
            { id: 'p1', points: [{ x: 0, y: 0 }], color: '#00f', visible: true, label: 'test', mode: 'markers' },
          ],
          sliders: [],
          xRange: [-10, 10],
          yRange: [-10, 10],
          gridResolution: 50,
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_CLEAR' }]);
      expect(next.graph.equations).toEqual([]);
      expect(next.graph.pointDataSets).toEqual([]);
    });
  });

  describe('point data reducer', () => {
    it('GRAPH_ADD_POINT_DATA adds a dataset', () => {
      const state = createTestState();
      const pd = {
        id: 'p1',
        points: [{ x: 1, y: 2 }],
        color: '#f00',
        visible: true,
        label: 'A',
        mode: 'markers' as const,
      };
      const next = applyActions(state, [{ type: 'GRAPH_ADD_POINT_DATA', pointData: pd }]);
      expect(next.graph.pointDataSets).toHaveLength(1);
    });

    it('GRAPH_UPDATE_POINT_DATA modifies dataset', () => {
      const pd = {
        id: 'p1',
        points: [{ x: 1, y: 2 }],
        color: '#f00',
        visible: true,
        label: 'A',
        mode: 'markers' as const,
      };
      const state = createTestState({
        graph: { ...createTestState().graph, pointDataSets: [pd] },
      });
      const next = applyActions(state, [{ type: 'GRAPH_UPDATE_POINT_DATA', id: 'p1', updates: { label: 'B' } }]);
      expect(next.graph.pointDataSets[0].label).toBe('B');
    });

    it('GRAPH_REMOVE_POINT_DATA removes dataset', () => {
      const pd = {
        id: 'p1',
        points: [{ x: 1, y: 2 }],
        color: '#f00',
        visible: true,
        label: 'A',
        mode: 'markers' as const,
      };
      const state = createTestState({
        graph: { ...createTestState().graph, pointDataSets: [pd] },
      });
      const next = applyActions(state, [{ type: 'GRAPH_REMOVE_POINT_DATA', id: 'p1' }]);
      expect(next.graph.pointDataSets).toHaveLength(0);
    });
  });

  describe('color palette wrap-around and reset', () => {
    beforeEach(() => {
      resetColorIndex();
    });

    it('wraps around after exhausting palette', () => {
      for (let i = 0; i < 10; i++) nextColor();
      const wrapped = nextColor();
      expect(wrapped).toBe(getColor(0));
    });

    it('resetColorIndex resets to first color', () => {
      nextColor();
      nextColor();
      resetColorIndex();
      expect(nextColor()).toBe(getColor(0));
    });
  });

  describe('validateExpression edge cases', () => {
    it('empty string parses as valid in mathjs', () => {
      const result = validateExpression('');
      expect(result.valid).toBe(true);
    });

    it('unclosed parenthesis is invalid', () => {
      const result = validateExpression('(x+1');
      expect(result.valid).toBe(false);
    });
  });
});
