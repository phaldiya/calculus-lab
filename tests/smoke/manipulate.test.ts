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

  describe('reducer: manipulate equation actions', () => {
    it('ADD_MANIPULATE_EQUATION adds equation', () => {
      const state = createTestState();
      const next = applyActions(state, [
        {
          type: 'ADD_MANIPULATE_EQUATION',
          equation: { id: '1', expression: 'a * sin(x)', color: '#6366f1', visible: true, plotType: 'standard-2d' },
        },
      ]);
      expect(next.manipulate.equations).toHaveLength(1);
    });

    it('TOGGLE_MANIPULATE_EQUATION toggles visibility', () => {
      const state = createTestState({
        manipulate: {
          ...createTestState().manipulate,
          equations: [{ id: '1', expression: 'a * sin(x)', color: '#6366f1', visible: true, plotType: 'standard-2d' }],
        },
      });
      const next = applyActions(state, [{ type: 'TOGGLE_MANIPULATE_EQUATION', id: '1' }]);
      expect(next.manipulate.equations[0].visible).toBe(false);
    });

    it('REMOVE_MANIPULATE_EQUATION removes by id', () => {
      const state = createTestState({
        manipulate: {
          ...createTestState().manipulate,
          equations: [{ id: '1', expression: 'a * sin(x)', color: '#6366f1', visible: true, plotType: 'standard-2d' }],
        },
      });
      const next = applyActions(state, [{ type: 'REMOVE_MANIPULATE_EQUATION', id: '1' }]);
      expect(next.manipulate.equations).toHaveLength(0);
    });
  });

  describe('reducer: slider actions', () => {
    it('ADD_SLIDER adds a slider', () => {
      const state = createTestState();
      const next = applyActions(state, [
        { type: 'ADD_SLIDER', slider: { id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 } },
      ]);
      expect(next.manipulate.sliders).toHaveLength(1);
      expect(next.manipulate.sliders[0].name).toBe('a');
    });

    it('UPDATE_SLIDER updates value', () => {
      const state = createTestState({
        manipulate: {
          ...createTestState().manipulate,
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
        },
      });
      const next = applyActions(state, [{ type: 'UPDATE_SLIDER', id: '1', value: 3.5 }]);
      expect(next.manipulate.sliders[0].value).toBe(3.5);
    });

    it('UPDATE_SLIDER_CONFIG updates config', () => {
      const state = createTestState({
        manipulate: {
          ...createTestState().manipulate,
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
        },
      });
      const next = applyActions(state, [{ type: 'UPDATE_SLIDER_CONFIG', id: '1', updates: { min: -10, max: 10 } }]);
      expect(next.manipulate.sliders[0].min).toBe(-10);
      expect(next.manipulate.sliders[0].max).toBe(10);
    });

    it('REMOVE_SLIDER removes by id', () => {
      const state = createTestState({
        manipulate: {
          ...createTestState().manipulate,
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 1 }],
        },
      });
      const next = applyActions(state, [{ type: 'REMOVE_SLIDER', id: '1' }]);
      expect(next.manipulate.sliders).toHaveLength(0);
    });

    it('CLEAR_MANIPULATE resets all state', () => {
      const state = createTestState({
        manipulate: {
          equations: [{ id: '1', expression: 'a * sin(x)', color: '#6366f1', visible: true, plotType: 'standard-2d' }],
          sliders: [{ id: '1', name: 'a', min: -5, max: 5, step: 0.1, value: 3 }],
          xRange: [-20, 20],
          yRange: [-20, 20],
          gridResolution: 100,
        },
      });
      const next = applyActions(state, [{ type: 'CLEAR_MANIPULATE' }]);
      expect(next.manipulate.equations).toHaveLength(0);
      expect(next.manipulate.sliders).toHaveLength(0);
      expect(next.manipulate.xRange).toEqual([-10, 10]);
    });
  });
});
