import { extractParameters } from '../../src/lib/parameterDetector';
import { applyActions, createTestState } from '../helpers/testReducer';

describe('Manipulate - Smoke', () => {
  describe('extractParameters', () => {
    it('detects a and b in a * sin(b * x)', () => {
      const params = extractParameters('a * sin(b * x)');
      expect(params).toEqual(['a', 'b']);
    });

    it('ignores builtin symbols x, y, z, t, e, pi', () => {
      const params = extractParameters('x + y + z + t + e + pi');
      expect(params).toEqual([]);
    });

    it('ignores builtin functions', () => {
      const params = extractParameters('sin(x) + cos(x) + sqrt(x)');
      expect(params).toEqual([]);
    });

    it('detects k in k * x^2', () => {
      const params = extractParameters('k * x^2');
      expect(params).toEqual(['k']);
    });

    it('returns empty for invalid expression', () => {
      expect(extractParameters('x^^2')).toEqual([]);
    });
  });

  describe('reducer: graph equation with sliders', () => {
    it('GRAPH_ADD_EQUATION adds equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'GRAPH_ADD_EQUATION',
          equation: {
            id: '1',
            rawInput: 'a * sin(x)',
            type: 'standard-2d',
            components: ['a * sin(x)'],
            color: '#6366f1',
            visible: true,
          },
        },
      ]);
      expect(next.graph.equations).toHaveLength(1);
    });

    it('GRAPH_TOGGLE_EQUATION toggles visibility', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            {
              id: '1',
              rawInput: 'a * sin(x)',
              type: 'standard-2d',
              components: ['a * sin(x)'],
              color: '#6366f1',
              visible: true,
            },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_TOGGLE_EQUATION', id: '1' }]);
      expect(next.graph.equations[0].visible).toBe(false);
    });

    it('GRAPH_REMOVE_EQUATION removes by id', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          equations: [
            {
              id: '1',
              rawInput: 'a * sin(x)',
              type: 'standard-2d',
              components: ['a * sin(x)'],
              color: '#6366f1',
              visible: true,
            },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_REMOVE_EQUATION', id: '1' }]);
      expect(next.graph.equations).toHaveLength(0);
    });
  });

  describe('reducer: slider actions', () => {
    it('GRAPH_ADD_SLIDER adds a slider', () => {
      const state = createTestState();
      const next = applyActions(state, [
        { type: 'GRAPH_ADD_SLIDER', slider: { id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 } },
      ]);
      expect(next.graph.sliders).toHaveLength(1);
      expect(next.graph.sliders[0].name).toBe('a');
    });

    it('GRAPH_UPDATE_SLIDER updates value', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_UPDATE_SLIDER', id: '1', value: 3.5 }]);
      expect(next.graph.sliders[0].value).toBe(3.5);
    });

    it('GRAPH_UPDATE_SLIDER_CONFIG updates config', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
        },
      });
      const next = applyActions(state, [
        { type: 'GRAPH_UPDATE_SLIDER_CONFIG', id: '1', updates: { min: -10, max: 10 } },
      ]);
      expect(next.graph.sliders[0].min).toBe(-10);
      expect(next.graph.sliders[0].max).toBe(10);
    });

    it('GRAPH_REMOVE_SLIDER removes by id', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_REMOVE_SLIDER', id: '1' }]);
      expect(next.graph.sliders).toHaveLength(0);
    });

    it('GRAPH_CLEAR resets all state', () => {
      const state = createTestState({
        graph: {
          equations: [
            {
              id: '1',
              rawInput: 'a * sin(x)',
              type: 'standard-2d',
              components: ['a * sin(x)'],
              color: '#6366f1',
              visible: true,
            },
          ],
          pointDataSets: [],
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 3 }],
          xRange: [-20, 20],
          yRange: [-20, 20],
          gridResolution: 100,
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_CLEAR' }]);
      expect(next.graph.equations).toHaveLength(0);
      expect(next.graph.sliders).toHaveLength(0);
      expect(next.graph.xRange).toEqual([-10, 10]);
    });
  });
});
