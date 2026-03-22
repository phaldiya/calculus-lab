import {
  classifyExpression,
  expressionTypeBadgeClass,
  expressionTypeLabel,
  is2DType,
  is3DType,
} from '../../src/lib/expressionClassifier';

describe('Expression Classifier - Smoke', () => {
  describe('classifyExpression', () => {
    it('classifies sin(x) as standard-2d', () => {
      const result = classifyExpression('sin(x)');
      expect(result.type).toBe('standard-2d');
      expect(result.components).toEqual(['sin(x)']);
    });

    it('classifies x^2 as standard-2d', () => {
      expect(classifyExpression('x^2').type).toBe('standard-2d');
    });

    it('classifies x^2+y^2=25 as implicit-2d', () => {
      const result = classifyExpression('x^2+y^2=25');
      expect(result.type).toBe('implicit-2d');
    });

    it('classifies y > x^2 as inequality-2d', () => {
      const result = classifyExpression('y > x^2');
      expect(result.type).toBe('inequality-2d');
      expect(result.inequalityOp).toBe('>');
    });

    it('classifies y <= sin(x) as inequality-2d', () => {
      const result = classifyExpression('y <= sin(x)');
      expect(result.type).toBe('inequality-2d');
      expect(result.inequalityOp).toBe('<=');
    });

    it('classifies 1 + cos(theta) as polar', () => {
      const result = classifyExpression('1 + cos(theta)');
      expect(result.type).toBe('polar');
    });

    it('classifies sin(x)*cos(y) as surface-3d', () => {
      const result = classifyExpression('sin(x)*cos(y)');
      expect(result.type).toBe('surface-3d');
    });

    it('classifies cos(t); sin(t) as parametric-2d', () => {
      const result = classifyExpression('cos(t); sin(t)');
      expect(result.type).toBe('parametric-2d');
      expect(result.components).toEqual(['cos(t)', 'sin(t)']);
    });

    it('classifies cos(t); sin(t); t/10 as parametric-3d', () => {
      const result = classifyExpression('cos(t); sin(t); t/10');
      expect(result.type).toBe('parametric-3d');
      expect(result.components).toHaveLength(3);
    });

    it('detects parameters in a*sin(x)', () => {
      const result = classifyExpression('a*sin(x)');
      expect(result.type).toBe('standard-2d');
      expect(result.detectedParams).toEqual(['a']);
    });

    it('detects parameters in parametric with sliders', () => {
      const result = classifyExpression('a*cos(t); b*sin(t)');
      expect(result.type).toBe('parametric-2d');
      expect(result.detectedParams).toEqual(['a', 'b']);
    });

    it('handles trailing semicolon gracefully', () => {
      const result = classifyExpression('sin(x);');
      // single part after filter → falls through to standard checks
      expect(result.type).toBe('standard-2d');
    });

    it('trims whitespace', () => {
      const result = classifyExpression('  sin(x)  ');
      expect(result.type).toBe('standard-2d');
      expect(result.components).toEqual(['sin(x)']);
    });
  });

  describe('expressionTypeLabel', () => {
    it('returns correct labels', () => {
      expect(expressionTypeLabel('standard-2d')).toBe('2D');
      expect(expressionTypeLabel('implicit-2d')).toBe('implicit');
      expect(expressionTypeLabel('inequality-2d')).toBe('inequality');
      expect(expressionTypeLabel('polar')).toBe('polar');
      expect(expressionTypeLabel('parametric-2d')).toBe('param 2D');
      expect(expressionTypeLabel('parametric-3d')).toBe('param 3D');
      expect(expressionTypeLabel('surface-3d')).toBe('3D');
    });
  });

  describe('expressionTypeBadgeClass', () => {
    it('returns non-empty class string for each type', () => {
      expect(expressionTypeBadgeClass('standard-2d')).toContain('bg-');
      expect(expressionTypeBadgeClass('surface-3d')).toContain('bg-');
      expect(expressionTypeBadgeClass('polar')).toContain('bg-');
    });
  });

  describe('is2DType / is3DType', () => {
    it('identifies 2D types', () => {
      expect(is2DType('standard-2d')).toBe(true);
      expect(is2DType('implicit-2d')).toBe(true);
      expect(is2DType('inequality-2d')).toBe(true);
      expect(is2DType('polar')).toBe(true);
      expect(is2DType('parametric-2d')).toBe(true);
      expect(is2DType('surface-3d')).toBe(false);
      expect(is2DType('parametric-3d')).toBe(false);
    });

    it('identifies 3D types', () => {
      expect(is3DType('surface-3d')).toBe(true);
      expect(is3DType('parametric-3d')).toBe(true);
      expect(is3DType('standard-2d')).toBe(false);
    });
  });
});
