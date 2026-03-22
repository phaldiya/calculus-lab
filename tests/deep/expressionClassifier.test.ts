import {
  classifyExpression,
  expressionTypeBadgeClass,
  expressionTypeLabel,
  is2DType,
  is3DType,
} from '../../src/lib/expressionClassifier';

describe('Expression Classifier - Deep', () => {
  describe('classifyExpression edge cases', () => {
    it('handles >= inequality', () => {
      const result = classifyExpression('y >= 2*x');
      expect(result.type).toBe('inequality-2d');
      expect(result.inequalityOp).toBe('>=');
    });

    it('handles < inequality', () => {
      const result = classifyExpression('x^2 + y^2 < 9');
      expect(result.type).toBe('inequality-2d');
      expect(result.inequalityOp).toBe('<');
    });

    it('handles parametric with 4+ semicolons (takes first 3)', () => {
      const result = classifyExpression('a; b; c; d');
      expect(result.type).toBe('parametric-3d');
      expect(result.components).toHaveLength(3);
    });

    it('handles expression with only y (no x) as standard-2d', () => {
      const result = classifyExpression('sin(y)');
      // Only y, not both x and y → not surface-3d
      expect(result.type).toBe('standard-2d');
    });

    it('handles constant expression as standard-2d', () => {
      const result = classifyExpression('5');
      expect(result.type).toBe('standard-2d');
    });

    it('detects no params in builtin-only expressions', () => {
      const result = classifyExpression('sin(x) + cos(x)');
      expect(result.detectedParams).toEqual([]);
    });

    it('invalid expression falls through to standard-2d', () => {
      const result = classifyExpression('+++');
      expect(result.type).toBe('standard-2d');
    });
  });

  describe('expressionTypeBadgeClass covers all types', () => {
    const types = [
      'standard-2d',
      'implicit-2d',
      'inequality-2d',
      'polar',
      'parametric-2d',
      'parametric-3d',
      'surface-3d',
    ] as const;

    for (const type of types) {
      it(`returns badge class for ${type}`, () => {
        const cls = expressionTypeBadgeClass(type);
        expect(cls).toContain('bg-');
        expect(cls).toContain('text-');
        expect(cls).toContain('dark:');
      });
    }
  });

  describe('expressionTypeLabel covers all types', () => {
    it('returns label for every type', () => {
      expect(expressionTypeLabel('standard-2d')).toBe('2D');
      expect(expressionTypeLabel('implicit-2d')).toBe('implicit');
      expect(expressionTypeLabel('inequality-2d')).toBe('inequality');
      expect(expressionTypeLabel('polar')).toBe('polar');
      expect(expressionTypeLabel('parametric-2d')).toBe('param 2D');
      expect(expressionTypeLabel('parametric-3d')).toBe('param 3D');
      expect(expressionTypeLabel('surface-3d')).toBe('3D');
    });
  });

  describe('is2DType/is3DType exhaustive', () => {
    it('no type is both 2D and 3D', () => {
      const types = [
        'standard-2d',
        'implicit-2d',
        'inequality-2d',
        'polar',
        'parametric-2d',
        'parametric-3d',
        'surface-3d',
      ] as const;
      for (const t of types) {
        expect(is2DType(t) && is3DType(t)).toBe(false);
      }
    });

    it('every type is either 2D or 3D', () => {
      const types = [
        'standard-2d',
        'implicit-2d',
        'inequality-2d',
        'polar',
        'parametric-2d',
        'parametric-3d',
        'surface-3d',
      ] as const;
      for (const t of types) {
        expect(is2DType(t) || is3DType(t)).toBe(true);
      }
    });
  });
});
