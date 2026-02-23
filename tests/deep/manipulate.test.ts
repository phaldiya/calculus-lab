import { evaluateOverRange } from '../../src/lib/expressionParser';
import { extractParameters } from '../../src/lib/parameterDetector';

describe('Manipulate - Deep', () => {
  describe('extractParameters edge cases', () => {
    it('detects multiple parameters in complex expression', () => {
      const params = extractParameters('a * sin(b * x) + c * cos(d * x)');
      expect(params).toEqual(['a', 'b', 'c', 'd']);
    });

    it('ignores theta as a builtin', () => {
      const params = extractParameters('r * cos(theta)');
      expect(params).toEqual(['r']);
    });

    it('handles expression with no variables', () => {
      expect(extractParameters('3 + 4')).toEqual([]);
    });

    it('handles underscore-prefixed names', () => {
      const params = extractParameters('_scale * x');
      expect(params).toEqual(['_scale']);
    });
  });

  describe('evaluation with slider variables', () => {
    it('slider variable overrides default evaluation', () => {
      const result = evaluateOverRange('a * x^2', -2, 2, 5, [{ name: 'a', value: 3 }]);
      // At x=0: y = 3*0 = 0, at x=2: y = 3*4 = 12
      expect(result.y[2]).toBeCloseTo(0); // x=0 at midpoint
      expect(result.y[4]).toBeCloseTo(12); // x=2 at end
    });

    it('multiple slider variables work together', () => {
      const result = evaluateOverRange('a * x + b', 0, 1, 3, [
        { name: 'a', value: 2 },
        { name: 'b', value: 5 },
      ]);
      // At x=0: y = 0 + 5 = 5
      expect(result.y[0]).toBeCloseTo(5);
      // At x=1: y = 2 + 5 = 7
      expect(result.y[2]).toBeCloseTo(7);
    });

    it('changing slider value changes output', () => {
      const result1 = evaluateOverRange('k * sin(x)', 0, Math.PI, 3, [{ name: 'k', value: 1 }]);
      const result2 = evaluateOverRange('k * sin(x)', 0, Math.PI, 3, [{ name: 'k', value: 5 }]);
      // At x=pi/2: sin(pi/2) = 1, so k*1 = k
      expect(result1.y[1]).toBeCloseTo(1);
      expect(result2.y[1]).toBeCloseTo(5);
    });
  });
});
