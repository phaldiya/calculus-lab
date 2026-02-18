import { evaluate, type MathNode, parse } from 'mathjs';

import type { EquationMode, Variable } from '../types';

export function parseExpression(expr: string): MathNode {
  return parse(expr);
}

export function evaluateExpression(expr: string, scope: Record<string, number> = {}): number {
  return evaluate(expr, scope) as number;
}

export function evaluateOverRange(
  expr: string,
  xMin: number,
  xMax: number,
  numPoints: number = 500,
  variables: Variable[] = [],
): { x: number[]; y: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (xMax - xMin) / (numPoints - 1);
  const compiled = parse(expr).compile();

  const scope: Record<string, number> = {};
  for (const v of variables) {
    scope[v.name] = v.value;
  }

  for (let i = 0; i < numPoints; i++) {
    const x = xMin + i * step;
    try {
      scope.x = x;
      const y = compiled.evaluate(scope) as number;
      if (typeof y === 'number' && Number.isFinite(y)) {
        xs.push(x);
        ys.push(y);
      } else {
        xs.push(x);
        ys.push(NaN);
      }
    } catch {
      xs.push(x);
      ys.push(NaN);
    }
  }

  return { x: xs, y: ys };
}

export function validateExpression(expr: string): { valid: boolean; error?: string } {
  try {
    parse(expr);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

export function evaluateOverGrid(
  expr: string,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  numPointsX: number = 100,
  numPointsY: number = 100,
  variables: Variable[] = [],
): { x: number[]; y: number[]; z: number[][] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const z: number[][] = [];
  const xStep = (xMax - xMin) / (numPointsX - 1);
  const yStep = (yMax - yMin) / (numPointsY - 1);
  const compiled = parse(expr).compile();

  const scope: Record<string, number> = {};
  for (const v of variables) {
    scope[v.name] = v.value;
  }

  for (let i = 0; i < numPointsX; i++) {
    xs.push(xMin + i * xStep);
  }
  for (let j = 0; j < numPointsY; j++) {
    ys.push(yMin + j * yStep);
  }

  for (let j = 0; j < numPointsY; j++) {
    const row: number[] = [];
    scope.y = ys[j];
    for (let i = 0; i < numPointsX; i++) {
      scope.x = xs[i];
      try {
        const val = compiled.evaluate(scope) as number;
        row.push(typeof val === 'number' && Number.isFinite(val) ? val : NaN);
      } catch {
        row.push(NaN);
      }
    }
    z.push(row);
  }

  return { x: xs, y: ys, z };
}

export function parseImplicitEquation(expr: string): string | null {
  // Don't match <=, >=, ==
  const eqIndex = expr.search(/(?<![<>=!])=(?!=)/);
  if (eqIndex === -1) return null;

  const lhs = expr.slice(0, eqIndex).trim();
  const rhs = expr.slice(eqIndex + 1).trim();
  if (!lhs || !rhs) return null;

  return `(${lhs}) - (${rhs})`;
}

export function validateImplicitExpression(expr: string): { valid: boolean; error?: string } {
  const rearranged = parseImplicitEquation(expr);
  if (!rearranged) return { valid: false, error: 'Not a valid implicit equation (use = sign)' };
  return validateExpression(rearranged);
}

export function detectEquationMode(expr: string): EquationMode {
  return parseImplicitEquation(expr) !== null ? 'implicit' : 'standard';
}
