import { generateSteps } from '../../src/lib/stepEngine';

describe('Step Engine - Deep', () => {
  describe('arithmetic operations', () => {
    it('3*4 generates Multiply step', () => {
      const steps = generateSteps('3*4');
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0].label).toBe('Multiply');
      expect(steps[0].resultTex).toBe('12');
    });

    it('10/2 generates Divide step', () => {
      const steps = generateSteps('10/2');
      expect(steps[0].label).toBe('Divide');
      expect(steps[0].resultTex).toBe('5');
    });

    it('8-3 generates Subtract step', () => {
      const steps = generateSteps('8-3');
      expect(steps[0].label).toBe('Subtract');
    });

    it('2+3 generates Add step', () => {
      const steps = generateSteps('2+3');
      expect(steps[0].label).toBe('Add');
      expect(steps[0].resultTex).toBe('5');
    });
  });

  describe('power and functions', () => {
    it('2^3 generates Apply power step', () => {
      const steps = generateSteps('2^3');
      expect(steps[0].label).toBe('Apply power');
      expect(steps[0].resultTex).toBe('8');
    });

    it('sqrt(9) generates Evaluate sqrt step', () => {
      const steps = generateSteps('sqrt(9)');
      expect(steps[0].label).toBe('Evaluate sqrt');
      expect(steps[0].resultTex).toBe('3');
    });

    it('sin(0) generates Evaluate sin step', () => {
      const steps = generateSteps('sin(0)');
      expect(steps[0].label).toBe('Evaluate sin');
      expect(steps[0].resultTex).toBe('0');
    });
  });

  describe('constants', () => {
    it('pi generates Substitute pi step', () => {
      const steps = generateSteps('pi');
      expect(steps[0].label).toBe('Substitute pi');
    });

    it('e generates Substitute e step', () => {
      const steps = generateSteps('e');
      expect(steps[0].label).toBe('Substitute e');
    });
  });

  describe('multi-step expressions', () => {
    it('(2+3)*4 generates multiple steps', () => {
      const steps = generateSteps('(2+3)*4');
      expect(steps.length).toBeGreaterThanOrEqual(3);
      // First step should be inner addition
      expect(steps[0].label).toBe('Add');
      // Last step should be Final result
      expect(steps[steps.length - 1].label).toBe('Final result');
      expect(steps[steps.length - 1].resultTex).toBe('20');
    });

    it('sin(pi/2) generates multiple steps', () => {
      const steps = generateSteps('sin(pi/2)');
      expect(steps.length).toBeGreaterThan(1);
      expect(steps[steps.length - 1].label).toBe('Final result');
    });
  });

  describe('edge cases', () => {
    it('empty string returns empty', () => {
      expect(generateSteps('')).toEqual([]);
    });

    it('invalid expression returns empty', () => {
      expect(generateSteps('+++')).toEqual([]);
    });

    it('single number returns empty (no steps needed)', () => {
      expect(generateSteps('42')).toEqual([]);
    });

    it('each step has required fields', () => {
      const steps = generateSteps('2+3');
      for (const step of steps) {
        expect(step.label).toBeDefined();
        expect(step.fullExpressionTex).toBeDefined();
        expect(step.subExpressionTex).toBeDefined();
        expect(step.resultTex).toBeDefined();
      }
    });
  });
});
