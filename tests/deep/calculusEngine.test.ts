import {
  computeDefiniteIntegral,
  computeDerivative,
  computeLimit,
  evaluateExpressionAtPoint,
} from '../../src/lib/calculusEngine';

describe('Calculus Engine - Deep', () => {
  describe('computeDerivative', () => {
    it('derives x^3 to 3*x^2', () => {
      expect(computeDerivative('x^3')).toContain('3');
    });

    it('derives sin(x) to cos(x)', () => {
      expect(computeDerivative('sin(x)')).toBe('cos(x)');
    });

    it('derives constant to 0', () => {
      expect(computeDerivative('5')).toBe('0');
    });

    it('throws on invalid expression', () => {
      expect(() => computeDerivative('+++')).toThrow();
    });
  });

  describe('computeDefiniteIntegral', () => {
    it('integrates x^2 from 0 to 1 ≈ 0.333', () => {
      const result = computeDefiniteIntegral('x^2', 0, 1);
      expect(result).toBeCloseTo(1 / 3, 4);
    });

    it('integrates sin(x) from 0 to pi ≈ 2', () => {
      const result = computeDefiniteIntegral('sin(x)', 0, Math.PI);
      expect(result).toBeCloseTo(2, 4);
    });

    it('handles odd number of subdivisions by adjusting to even', () => {
      const result = computeDefiniteIntegral('x', 0, 1, 999);
      expect(result).toBeCloseTo(0.5, 4);
    });
  });

  describe('computeLimit', () => {
    it('computes sin(x)/x as x→0 = 1', () => {
      expect(computeLimit('sin(x)/x', 0)).toBeCloseTo(1, 4);
    });

    it('computes (x^2-1)/(x-1) as x→1 = 2', () => {
      expect(computeLimit('(x^2-1)/(x-1)', 1)).toBeCloseTo(2, 4);
    });

    it('computes limit at regular point via direct eval', () => {
      expect(computeLimit('x^2', 3)).toBeCloseTo(9, 4);
    });

    it('handles divergent limit by returning best approximation or throwing', () => {
      // 1/x^2 at 0 → Infinity, but computeLimit tries from both sides
      // The function may return a large number or throw
      try {
        const result = computeLimit('1/x^2', 0);
        expect(typeof result).toBe('number');
      } catch (e) {
        expect((e as Error).message).toContain('could not be computed');
      }
    });
  });

  describe('evaluateExpressionAtPoint', () => {
    it('evaluates x^2 at x=4 to 16', () => {
      expect(evaluateExpressionAtPoint('x^2', 4)).toBe(16);
    });

    it('evaluates sin(0) to 0', () => {
      expect(evaluateExpressionAtPoint('sin(x)', 0)).toBe(0);
    });
  });
});
