import {
  evaluateOverGrid,
  parseInequalityExpression,
  validateInequalityExpression,
} from '../../src/lib/expressionParser';

describe('Inequality - Deep', () => {
  describe('parseInequalityExpression edge cases', () => {
    it('handles spaces around operator', () => {
      const result = parseInequalityExpression('y   >   x');
      expect(result).toEqual({ rearranged: '(y) - (x)', operator: '>' });
    });

    it('handles nested expressions', () => {
      const result = parseInequalityExpression('sin(x) + cos(y) < exp(x*y)');
      expect(result).toEqual({ rearranged: '(sin(x) + cos(y)) - (exp(x*y))', operator: '<' });
    });

    it('returns null for empty lhs', () => {
      expect(parseInequalityExpression('> 5')).toBeNull();
    });

    it('returns null for empty rhs', () => {
      expect(parseInequalityExpression('x >')).toBeNull();
    });

    it('prefers >= over >', () => {
      const result = parseInequalityExpression('y >= x');
      expect(result?.operator).toBe('>=');
    });

    it('prefers <= over <', () => {
      const result = parseInequalityExpression('y <= x');
      expect(result?.operator).toBe('<=');
    });
  });

  describe('validateInequalityExpression edge cases', () => {
    it('rejects syntactically invalid math after rearranging', () => {
      const result = validateInequalityExpression('y > x^^2');
      expect(result.valid).toBe(false);
    });

    it('validates complex inequality', () => {
      expect(validateInequalityExpression('sin(x) + cos(y) > 0')).toEqual({ valid: true });
    });
  });

  describe('grid evaluation for inequalities', () => {
    it('evaluateOverGrid on rearranged inequality produces valid grid', () => {
      const parsed = parseInequalityExpression('y > x^2');
      expect(parsed).not.toBeNull();
      const grid = evaluateOverGrid(parsed!.rearranged, -5, 5, -5, 5, 50, 50);
      expect(grid.x).toHaveLength(50);
      expect(grid.y).toHaveLength(50);
      expect(grid.z).toHaveLength(50);
      expect(grid.z[0]).toHaveLength(50);
    });

    it('grid values are positive where inequality holds (y > x^2)', () => {
      const parsed = parseInequalityExpression('y > x^2');
      // At (0, 1): y - x^2 = 1 - 0 = 1 > 0 — inequality holds
      const grid = evaluateOverGrid(parsed!.rearranged, -1, 1, -1, 1, 3, 3);
      // y values: [-1, 0, 1], x values: [-1, 0, 1]
      // At y=1 (j=2), x=0 (i=1): z = 1 - 0 = 1
      expect(grid.z[2][1]).toBeCloseTo(1);
    });

    it('evaluateOverGrid with variables', () => {
      const parsed = parseInequalityExpression('y > a*x^2');
      const grid = evaluateOverGrid(parsed!.rearranged, -2, 2, -2, 2, 5, 5, [{ name: 'a', value: 2 }]);
      expect(grid.x).toHaveLength(5);
      expect(grid.z).toHaveLength(5);
    });
  });
});
