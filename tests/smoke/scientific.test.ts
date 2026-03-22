import { evaluate } from 'mathjs';

import { generateSteps } from '../../src/lib/stepEngine';

describe('QA Audit: Scientific - Smoke', () => {
  describe('basic arithmetic via mathjs evaluate', () => {
    it('adds: 2+3=5', () => {
      expect(evaluate('2+3')).toBe(5);
    });

    it('subtracts: 10-4=6', () => {
      expect(evaluate('10-4')).toBe(6);
    });

    it('multiplies: 3*7=21', () => {
      expect(evaluate('3*7')).toBe(21);
    });

    it('divides: 20/4=5', () => {
      expect(evaluate('20/4')).toBe(5);
    });

    it('handles decimals: 1.5+2.5=4', () => {
      expect(evaluate('1.5+2.5')).toBe(4);
    });
  });

  describe('operator precedence and parentheses', () => {
    it('respects precedence: 2+3*4=14', () => {
      expect(evaluate('2+3*4')).toBe(14);
    });

    it('respects parentheses: (2+3)*4=20', () => {
      expect(evaluate('(2+3)*4')).toBe(20);
    });
  });

  describe('powers and roots', () => {
    it('power: 2^10=1024', () => {
      expect(evaluate('2^10')).toBe(1024);
    });

    it('sqrt: sqrt(144)=12', () => {
      expect(evaluate('sqrt(144)')).toBe(12);
    });
  });

  describe('trigonometry', () => {
    it('sin(0)=0', () => {
      expect(evaluate('sin(0)')).toBe(0);
    });

    it('cos(0)=1', () => {
      expect(evaluate('cos(0)')).toBe(1);
    });
  });

  describe('constants', () => {
    it('substitutes pi', () => {
      expect(evaluate('pi')).toBeCloseTo(Math.PI);
    });

    it('substitutes e', () => {
      expect(evaluate('e')).toBeCloseTo(Math.E);
    });
  });

  describe('factorial and logs', () => {
    it('factorial: 5!=120', () => {
      expect(evaluate('5!')).toBe(120);
    });

    it('log base 10: log10(100)=2', () => {
      expect(evaluate('log10(100)')).toBe(2);
    });

    it('natural log: log(e)=1', () => {
      expect(evaluate('log(e)')).toBeCloseTo(1);
    });

    it('log base 2: log2(8)=3', () => {
      expect(evaluate('log2(8)')).toBe(3);
    });
  });

  describe('hyperbolic functions', () => {
    it('sinh(0)=0', () => {
      expect(evaluate('sinh(0)')).toBe(0);
    });

    it('cosh(0)=1', () => {
      expect(evaluate('cosh(0)')).toBe(1);
    });

    it('tanh(0)=0', () => {
      expect(evaluate('tanh(0)')).toBe(0);
    });

    it('asinh(0)=0', () => {
      expect(evaluate('asinh(0)')).toBe(0);
    });
  });

  describe('roots', () => {
    it('cbrt(27)=3', () => {
      expect(evaluate('cbrt(27)')).toBe(3);
    });

    it('nthRoot(16, 4)=2', () => {
      expect(evaluate('nthRoot(16, 4)')).toBe(2);
    });
  });

  describe('generateSteps', () => {
    it('generates steps for 2+3 ending in result 5', () => {
      const steps = generateSteps('2+3');
      expect(steps.length).toBeGreaterThan(0);
      const last = steps[steps.length - 1];
      expect(last.label).toBe('Final result');
      expect(last.resultTex).toBe('5');
    });

    it('returns empty array for invalid expression', () => {
      const steps = generateSteps('invalid');
      expect(steps).toEqual([]);
    });
  });
});
