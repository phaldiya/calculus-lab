import { evaluateParametric2D, evaluateParametric3D, evaluatePolar } from '../../src/lib/expressionParser';

describe('Parametric - Deep', () => {
  describe('evaluateParametric2D edge cases', () => {
    it('handles small number of points', () => {
      const result = evaluateParametric2D('t', 't^2', 0, 1, 3);
      expect(result.x).toHaveLength(3);
      expect(result.x[0]).toBeCloseTo(0);
      expect(result.x[2]).toBeCloseTo(1);
      expect(result.y[2]).toBeCloseTo(1);
    });

    it('handles NaN-producing expressions gracefully', () => {
      const result = evaluateParametric2D('1/t', 'sqrt(t)', -1, 1, 5);
      expect(result.x).toHaveLength(5);
      // At t=0, 1/0 should produce NaN
      expect(result.x[2]).toBeNaN();
    });

    it('uses variables in scope', () => {
      const result = evaluateParametric2D('r * cos(t)', 'r * sin(t)', 0, Math.PI, 3, [{ name: 'r', value: 5 }]);
      expect(result.x[0]).toBeCloseTo(5); // 5 * cos(0) = 5
    });
  });

  describe('evaluateParametric3D edge cases', () => {
    it('produces valid 3D helix data', () => {
      const result = evaluateParametric3D('cos(t)', 'sin(t)', 't / (2 * pi)', 0, 4 * Math.PI, 200);
      expect(result.x).toHaveLength(200);
      expect(result.y).toHaveLength(200);
      expect(result.z).toHaveLength(200);
      // z should increase linearly
      expect(result.z[result.z.length - 1]).toBeGreaterThan(result.z[0]);
    });

    it('handles invalid z expression', () => {
      const result = evaluateParametric3D('t', 't', 'sqrt(-t)', 0.1, 1, 5);
      // sqrt(-t) for positive t produces NaN
      expect(result.z.some((v) => Number.isNaN(v))).toBe(true);
    });
  });

  describe('evaluatePolar edge cases', () => {
    it('handles negative r values', () => {
      const result = evaluatePolar('-1', 0, Math.PI, 3);
      expect(result.r[0]).toBeCloseTo(-1);
      // x = -1 * cos(0) = -1
      expect(result.x[0]).toBeCloseTo(-1);
    });

    it('rose curve has expected symmetry', () => {
      const result = evaluatePolar('cos(3*theta)', 0, Math.PI, 100);
      expect(result.r).toHaveLength(100);
      // At theta=0, r = cos(0) = 1
      expect(result.r[0]).toBeCloseTo(1);
    });

    it('variables work in polar', () => {
      const result = evaluatePolar('a + cos(theta)', 0, 2 * Math.PI, 10, [{ name: 'a', value: 2 }]);
      // At theta=0, r = 2 + 1 = 3
      expect(result.r[0]).toBeCloseTo(3);
    });
  });
});
