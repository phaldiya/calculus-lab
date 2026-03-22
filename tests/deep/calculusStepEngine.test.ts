import { generateDerivativeSteps, generateIntegralSteps, generateLimitSteps } from '../../src/lib/calculusStepEngine';

describe('Calculus Step Engine - Deep', () => {
  describe('generateDerivativeSteps', () => {
    it('generates steps for x^3', () => {
      const steps = generateDerivativeSteps('x^3');
      expect(steps.length).toBeGreaterThan(1);
      expect(steps[0].label).toBe('Setup');
      expect(steps[steps.length - 1].label).toBe('Final result');
    });

    it('generates steps for sin(x)', () => {
      const steps = generateDerivativeSteps('sin(x)');
      expect(steps.length).toBeGreaterThan(1);
    });

    it('generates steps for product x*cos(x)', () => {
      const steps = generateDerivativeSteps('x*cos(x)');
      expect(steps.some((s) => s.label.includes('Product'))).toBe(true);
    });

    it('generates steps for chain rule sin(x^2)', () => {
      const steps = generateDerivativeSteps('sin(x^2)');
      expect(steps.length).toBeGreaterThan(1);
    });

    it('generates steps for constant', () => {
      const steps = generateDerivativeSteps('5');
      expect(steps.length).toBeGreaterThan(0);
    });

    it('generates steps for sum x + x^2', () => {
      const steps = generateDerivativeSteps('x + x^2');
      expect(steps.some((s) => s.label.includes('Sum'))).toBe(true);
    });

    it('handles invalid expression gracefully', () => {
      const steps = generateDerivativeSteps('+++');
      // Should still return steps array (possibly with error message)
      expect(Array.isArray(steps)).toBe(true);
    });
  });

  describe('generateIntegralSteps', () => {
    it('generates steps for x^2 from 0 to 1', () => {
      const steps = generateIntegralSteps('x^2', '0', '1', '0.333333');
      expect(steps.length).toBeGreaterThan(2);
      expect(steps[0].label).toBe('Setup');
      expect(steps.some((s) => s.label.includes('Simpson'))).toBe(true);
    });

    it('includes sample evaluations step', () => {
      const steps = generateIntegralSteps('sin(x)', '0', String(Math.PI), '2.000000');
      expect(steps.some((s) => s.label.includes('Sample'))).toBe(true);
    });

    it('includes result step', () => {
      const steps = generateIntegralSteps('x', '0', '1', '0.5');
      expect(steps[steps.length - 1].label).toBe('Result');
    });
  });

  describe('generateLimitSteps', () => {
    it('generates steps for sin(x)/x as x→0', () => {
      const steps = generateLimitSteps('sin(x)/x', '0', '1.000000');
      expect(steps.length).toBeGreaterThan(2);
      expect(steps[0].label).toBe('Setup');
    });

    it('includes left and right approach tables', () => {
      const steps = generateLimitSteps('sin(x)/x', '0', '1');
      expect(steps.some((s) => s.label.includes('Left'))).toBe(true);
      expect(steps.some((s) => s.label.includes('Right'))).toBe(true);
    });

    it('includes conclusion step', () => {
      const steps = generateLimitSteps('x^2', '2', '4');
      expect(steps[steps.length - 1].label).toBe('Conclusion');
    });

    it('handles expression that cannot be parsed for tex', () => {
      // Even with bad tex, steps are still generated using fallback plain text
      const steps = generateLimitSteps('x', '0', '0');
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
    });
  });
});
