import {
  evaluateOverGrid,
  evaluateOverRange,
  evaluateParametric3D,
  evaluatePolar,
} from '../../src/lib/expressionParser';

describe('Expression Parser - Deep Coverage', () => {
  describe('evaluateOverRange with variables', () => {
    it('uses custom variables in scope', () => {
      const result = evaluateOverRange('a*x', 0, 1, 3, [{ name: 'a', value: 2 }]);
      expect(result.y[0]).toBeCloseTo(0);
      expect(result.y[2]).toBeCloseTo(2);
    });

    it('handles NaN-producing expressions gracefully', () => {
      const result = evaluateOverRange('sqrt(x)', -5, 5, 11);
      // Negative x values produce NaN
      expect(result.x).toHaveLength(11);
      expect(Number.isNaN(result.y[0])).toBe(true); // sqrt(-5)
      expect(result.y[5]).toBeCloseTo(0); // sqrt(0)
    });
  });

  describe('evaluateOverGrid edge cases', () => {
    it('handles invalid expression in grid', () => {
      const result = evaluateOverGrid('sqrt(x)', -5, 5, -5, 5, 5, 5);
      const flat = result.z.flat();
      expect(flat.some((v) => Number.isNaN(v))).toBe(true);
    });

    it('uses custom variables in grid scope', () => {
      const result = evaluateOverGrid('a', -1, 1, -1, 1, 3, 3, [{ name: 'a', value: 7 }]);
      expect(result.z[0][0]).toBe(7);
    });
  });

  describe('evaluateParametric3D edge cases', () => {
    it('handles NaN-producing expressions', () => {
      const result = evaluateParametric3D('sqrt(t)', 'sin(t)', 'cos(t)', -1, 1, 5);
      // sqrt(-1) produces NaN, so first points should be NaN
      expect(Number.isNaN(result.x[0])).toBe(true);
    });

    it('uses custom variables', () => {
      const result = evaluateParametric3D('a*cos(t)', 'a*sin(t)', 't', 0, 1, 3, [{ name: 'a', value: 2 }]);
      expect(result.x[0]).toBeCloseTo(2); // 2*cos(0) = 2
    });
  });

  describe('evaluatePolar edge cases', () => {
    it('handles NaN-producing polar expressions', () => {
      const result = evaluatePolar('sqrt(-1)', 0, Math.PI, 3);
      expect(Number.isNaN(result.r[0])).toBe(true);
    });

    it('uses custom variables in polar', () => {
      const result = evaluatePolar('a', 0, Math.PI, 3, [{ name: 'a', value: 5 }]);
      expect(result.r[0]).toBe(5);
      expect(result.x[0]).toBeCloseTo(5); // 5*cos(0)
    });
  });
});
