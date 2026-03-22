import { applyActions, createTestState } from '../helpers/testReducer';

describe('AppContext Reducer - Deep', () => {
  describe('GRAPH_UPDATE_POINT_DATA', () => {
    it('updates point data label', () => {
      const state = createTestState({
        graph: {
          ...createTestState().graph,
          pointDataSets: [
            { id: 'p1', points: [{ x: 1, y: 2 }], color: '#f00', visible: true, label: 'A', mode: 'markers' },
          ],
        },
      });
      const next = applyActions(state, [{ type: 'GRAPH_UPDATE_POINT_DATA', id: 'p1', updates: { label: 'B' } }]);
      expect(next.graph.pointDataSets[0].label).toBe('B');
    });
  });

  describe('GRAPH_SET_CONFIG', () => {
    it('updates xRange', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'GRAPH_SET_CONFIG', updates: { xRange: [-5, 5] } }]);
      expect(next.graph.xRange).toEqual([-5, 5]);
    });

    it('updates yRange', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'GRAPH_SET_CONFIG', updates: { yRange: [-20, 20] } }]);
      expect(next.graph.yRange).toEqual([-20, 20]);
    });

    it('updates gridResolution', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'GRAPH_SET_CONFIG', updates: { gridResolution: 100 } }]);
      expect(next.graph.gridResolution).toBe(100);
    });
  });

  describe('SET_TAB', () => {
    it('sets active tab', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'SET_TAB', tab: 'graph' }]);
      expect(next.activeTab).toBe('graph');
    });
  });

  describe('TOGGLE_DARK_MODE', () => {
    it('toggles dark mode on', () => {
      const state = createTestState({ darkMode: false });
      const next = applyActions(state, [{ type: 'TOGGLE_DARK_MODE' }]);
      expect(next.darkMode).toBe(true);
    });

    it('toggles dark mode off', () => {
      const state = createTestState({ darkMode: true });
      const next = applyActions(state, [{ type: 'TOGGLE_DARK_MODE' }]);
      expect(next.darkMode).toBe(false);
    });
  });

  describe('variable actions', () => {
    it('ADD_VARIABLE adds a variable', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'ADD_VARIABLE', variable: { name: 'k', value: 3 } }]);
      expect(next.variables).toHaveLength(1);
      expect(next.variables[0]).toEqual({ name: 'k', value: 3 });
    });

    it('UPDATE_VARIABLE updates value', () => {
      const state = createTestState({ variables: [{ name: 'k', value: 3 }] });
      const next = applyActions(state, [{ type: 'UPDATE_VARIABLE', name: 'k', value: 7 }]);
      expect(next.variables[0].value).toBe(7);
    });

    it('REMOVE_VARIABLE removes by name', () => {
      const state = createTestState({ variables: [{ name: 'k', value: 3 }] });
      const next = applyActions(state, [{ type: 'REMOVE_VARIABLE', name: 'k' }]);
      expect(next.variables).toHaveLength(0);
    });
  });

  describe('history actions', () => {
    it('ADD_HISTORY adds entry to front', () => {
      const state = createTestState();
      const entry = { id: '1', tab: 'scientific' as const, expression: '2+3', result: '5', timestamp: Date.now() };
      const next = applyActions(state, [{ type: 'ADD_HISTORY', entry }]);
      expect(next.history).toHaveLength(1);
      expect(next.history[0].expression).toBe('2+3');
    });

    it('ADD_HISTORY caps at 100 entries', () => {
      const entries = Array.from({ length: 101 }, (_, i) => ({
        id: String(i),
        tab: 'scientific' as const,
        expression: `${i}+1`,
        result: String(i + 1),
        timestamp: Date.now(),
      }));
      const state = createTestState();
      const next = applyActions(
        state,
        entries.map((entry) => ({ type: 'ADD_HISTORY' as const, entry })),
      );
      expect(next.history).toHaveLength(100);
    });

    it('CLEAR_HISTORY empties history', () => {
      const state = createTestState({
        history: [{ id: '1', tab: 'scientific', expression: '1+1', result: '2', timestamp: Date.now() }],
      });
      const next = applyActions(state, [{ type: 'CLEAR_HISTORY' }]);
      expect(next.history).toHaveLength(0);
    });
  });

  describe('calculus actions', () => {
    it('SET_CALCULUS updates partial state', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'SET_CALCULUS', updates: { derivativeExpr: 'x^3' } }]);
      expect(next.calculus.derivativeExpr).toBe('x^3');
      expect(next.calculus.integralExpr).toBe('');
    });

    it('CLEAR_CALCULUS resets to initial', () => {
      const state = createTestState();
      const modified = applyActions(state, [
        { type: 'SET_CALCULUS', updates: { derivativeExpr: 'x^3', derivativeResult: '3x^2' } },
      ]);
      const next = applyActions(modified, [{ type: 'CLEAR_CALCULUS' }]);
      expect(next.calculus.derivativeExpr).toBe('');
      expect(next.calculus.derivativeResult).toBe('');
    });
  });

  describe('LOAD_STATE', () => {
    it('merges partial state', () => {
      const state = createTestState();
      const next = applyActions(state, [{ type: 'LOAD_STATE', state: { darkMode: true } }]);
      expect(next.darkMode).toBe(true);
      expect(next.activeTab).toBe('scientific');
    });
  });
});
