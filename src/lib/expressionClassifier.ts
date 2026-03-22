import { parse, type SymbolNode } from 'mathjs';

import type { InequalityOperator } from '../types';
import { detectEquationMode, parseInequalityExpression } from './expressionParser';
import { extractParameters } from './parameterDetector';

export type UnifiedExpressionType =
  | 'standard-2d'
  | 'implicit-2d'
  | 'inequality-2d'
  | 'polar'
  | 'parametric-2d'
  | 'parametric-3d'
  | 'surface-3d';

export interface ClassificationResult {
  type: UnifiedExpressionType;
  components: string[];
  inequalityOp?: InequalityOperator;
  detectedParams: string[];
}

const AXIS_VARIABLES = new Set(['x', 'y', 't', 'theta']);
const BUILTIN_FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'sinh',
  'cosh',
  'tanh',
  'asinh',
  'acosh',
  'atanh',
  'sqrt',
  'cbrt',
  'abs',
  'ceil',
  'floor',
  'round',
  'exp',
  'log',
  'log2',
  'log10',
  'ln',
  'pow',
  'mod',
  'sign',
  'min',
  'max',
  'gcd',
  'lcm',
  'factorial',
]);

/**
 * Extract which axis variables (x, y, t, theta) are used as free symbols in an expression.
 */
function extractAxisVariables(expr: string): Set<string> {
  try {
    const node = parse(expr);
    const vars = new Set<string>();
    node.traverse((n) => {
      if (n.type === 'SymbolNode') {
        const sym = n as SymbolNode;
        if (AXIS_VARIABLES.has(sym.name) && !BUILTIN_FUNCTIONS.has(sym.name)) {
          vars.add(sym.name);
        }
      }
    });
    return vars;
  } catch {
    return new Set();
  }
}

/**
 * Classify an expression into one of the unified expression types.
 *
 * Priority order:
 * 1. Parametric (semicolon-separated components)
 * 2. Inequality (>, <, >=, <=)
 * 3. Implicit (bare = with x or y)
 * 4. Polar (uses theta variable)
 * 5. Surface 3D (uses both x and y as free vars)
 * 6. Standard 2D (everything else)
 */
export function classifyExpression(input: string): ClassificationResult {
  const trimmed = input.trim();

  // 1. Check for parametric (semicolon-separated)
  if (trimmed.includes(';')) {
    const parts = trimmed
      .split(';')
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 2) {
      return {
        type: 'parametric-2d',
        components: parts,
        detectedParams: collectParams(parts),
      };
    }
    if (parts.length >= 3) {
      return {
        type: 'parametric-3d',
        components: parts.slice(0, 3),
        detectedParams: collectParams(parts.slice(0, 3)),
      };
    }
    // Single part after filtering — fall through to other checks
  }

  // 2. Check inequality (before implicit, since >= and <= contain =)
  const mode = detectEquationMode(trimmed);
  if (mode === 'inequality') {
    const parsed = parseInequalityExpression(trimmed);
    return {
      type: 'inequality-2d',
      components: [trimmed],
      inequalityOp: parsed?.operator,
      detectedParams: extractParameters(trimmed),
    };
  }

  // 3. Check implicit (has bare =)
  if (mode === 'implicit') {
    return {
      type: 'implicit-2d',
      components: [trimmed],
      detectedParams: extractParameters(trimmed),
    };
  }

  // 4. Check polar (uses theta variable)
  const axisVars = extractAxisVariables(trimmed);
  if (axisVars.has('theta')) {
    return {
      type: 'polar',
      components: [trimmed],
      detectedParams: extractParameters(trimmed),
    };
  }

  // 5. Check surface 3D (uses both x and y as free vars, no = or inequality)
  if (axisVars.has('x') && axisVars.has('y')) {
    return {
      type: 'surface-3d',
      components: [trimmed],
      detectedParams: extractParameters(trimmed),
    };
  }

  // 6. Default: standard 2D
  return {
    type: 'standard-2d',
    components: [trimmed],
    detectedParams: extractParameters(trimmed),
  };
}

/**
 * Collect all detected slider parameters from multiple expression components.
 */
function collectParams(exprs: string[]): string[] {
  const params = new Set<string>();
  for (const expr of exprs) {
    for (const p of extractParameters(expr)) {
      params.add(p);
    }
  }
  return Array.from(params).sort();
}

/**
 * Get a human-readable label for a unified expression type.
 */
export function expressionTypeLabel(type: UnifiedExpressionType): string {
  switch (type) {
    case 'standard-2d':
      return '2D';
    case 'implicit-2d':
      return 'implicit';
    case 'inequality-2d':
      return 'inequality';
    case 'polar':
      return 'polar';
    case 'parametric-2d':
      return 'param 2D';
    case 'parametric-3d':
      return 'param 3D';
    case 'surface-3d':
      return '3D';
  }
}

/**
 * Get Tailwind badge classes for a unified expression type.
 */
export function expressionTypeBadgeClass(type: UnifiedExpressionType): string {
  switch (type) {
    case 'standard-2d':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
    case 'implicit-2d':
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
    case 'inequality-2d':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    case 'polar':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';
    case 'parametric-2d':
      return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';
    case 'parametric-3d':
      return 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300';
    case 'surface-3d':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
  }
}

/**
 * Whether the expression type renders on a 2D plot.
 */
export function is2DType(type: UnifiedExpressionType): boolean {
  return (
    type === 'standard-2d' ||
    type === 'implicit-2d' ||
    type === 'inequality-2d' ||
    type === 'polar' ||
    type === 'parametric-2d'
  );
}

/**
 * Whether the expression type renders on a 3D plot.
 */
export function is3DType(type: UnifiedExpressionType): boolean {
  return type === 'surface-3d' || type === 'parametric-3d';
}
