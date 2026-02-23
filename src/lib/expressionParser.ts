import { evaluate, type MathNode, parse } from 'mathjs';

import type { EquationMode, InequalityOperator, Variable } from '../types';

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

export function parseInequalityExpression(expr: string): { rearranged: string; operator: InequalityOperator } | null {
  // Check multi-char operators first
  for (const op of ['>=', '<='] as const) {
    const idx = expr.indexOf(op);
    if (idx !== -1) {
      const lhs = expr.slice(0, idx).trim();
      const rhs = expr.slice(idx + op.length).trim();
      if (!lhs || !rhs) return null;
      return { rearranged: `(${lhs}) - (${rhs})`, operator: op };
    }
  }
  // Then single-char operators (avoid matching inside >= or <=)
  for (const op of ['>', '<'] as const) {
    const idx = expr.indexOf(op);
    if (idx !== -1) {
      // Ensure it's not part of >= or <=
      if (expr[idx + 1] === '=') continue;
      const lhs = expr.slice(0, idx).trim();
      const rhs = expr.slice(idx + 1).trim();
      if (!lhs || !rhs) return null;
      return { rearranged: `(${lhs}) - (${rhs})`, operator: op };
    }
  }
  return null;
}

export function validateInequalityExpression(expr: string): { valid: boolean; error?: string } {
  const parsed = parseInequalityExpression(expr);
  if (!parsed) return { valid: false, error: 'Not a valid inequality (use >, <, >=, or <=)' };
  return validateExpression(parsed.rearranged);
}

export function evaluateParametric2D(
  xExpr: string,
  yExpr: string,
  tMin: number,
  tMax: number,
  numPoints: number = 500,
  variables: Variable[] = [],
): { x: number[]; y: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (tMax - tMin) / (numPoints - 1);
  const compiledX = parse(xExpr).compile();
  const compiledY = parse(yExpr).compile();

  const scope: Record<string, number> = {};
  for (const v of variables) {
    scope[v.name] = v.value;
  }

  for (let i = 0; i < numPoints; i++) {
    const t = tMin + i * step;
    try {
      scope.t = t;
      const xVal = compiledX.evaluate(scope) as number;
      const yVal = compiledY.evaluate(scope) as number;
      if (typeof xVal === 'number' && Number.isFinite(xVal) && typeof yVal === 'number' && Number.isFinite(yVal)) {
        xs.push(xVal);
        ys.push(yVal);
      } else {
        xs.push(NaN);
        ys.push(NaN);
      }
    } catch {
      xs.push(NaN);
      ys.push(NaN);
    }
  }

  return { x: xs, y: ys };
}

export function evaluateParametric3D(
  xExpr: string,
  yExpr: string,
  zExpr: string,
  tMin: number,
  tMax: number,
  numPoints: number = 500,
  variables: Variable[] = [],
): { x: number[]; y: number[]; z: number[] } {
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[] = [];
  const step = (tMax - tMin) / (numPoints - 1);
  const compiledX = parse(xExpr).compile();
  const compiledY = parse(yExpr).compile();
  const compiledZ = parse(zExpr).compile();

  const scope: Record<string, number> = {};
  for (const v of variables) {
    scope[v.name] = v.value;
  }

  for (let i = 0; i < numPoints; i++) {
    const t = tMin + i * step;
    try {
      scope.t = t;
      const xVal = compiledX.evaluate(scope) as number;
      const yVal = compiledY.evaluate(scope) as number;
      const zVal = compiledZ.evaluate(scope) as number;
      if (
        typeof xVal === 'number' &&
        Number.isFinite(xVal) &&
        typeof yVal === 'number' &&
        Number.isFinite(yVal) &&
        typeof zVal === 'number' &&
        Number.isFinite(zVal)
      ) {
        xs.push(xVal);
        ys.push(yVal);
        zs.push(zVal);
      } else {
        xs.push(NaN);
        ys.push(NaN);
        zs.push(NaN);
      }
    } catch {
      xs.push(NaN);
      ys.push(NaN);
      zs.push(NaN);
    }
  }

  return { x: xs, y: ys, z: zs };
}

export function evaluatePolar(
  rExpr: string,
  thetaMin: number,
  thetaMax: number,
  numPoints: number = 500,
  variables: Variable[] = [],
): { r: number[]; theta: number[]; x: number[]; y: number[] } {
  const rs: number[] = [];
  const thetas: number[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  const step = (thetaMax - thetaMin) / (numPoints - 1);
  const compiled = parse(rExpr).compile();

  const scope: Record<string, number> = {};
  for (const v of variables) {
    scope[v.name] = v.value;
  }

  for (let i = 0; i < numPoints; i++) {
    const theta = thetaMin + i * step;
    try {
      scope.theta = theta;
      const r = compiled.evaluate(scope) as number;
      if (typeof r === 'number' && Number.isFinite(r)) {
        rs.push(r);
        thetas.push((theta * 180) / Math.PI); // Convert to degrees for Plotly
        xs.push(r * Math.cos(theta));
        ys.push(r * Math.sin(theta));
      } else {
        rs.push(NaN);
        thetas.push(NaN);
        xs.push(NaN);
        ys.push(NaN);
      }
    } catch {
      rs.push(NaN);
      thetas.push(NaN);
      xs.push(NaN);
      ys.push(NaN);
    }
  }

  return { r: rs, theta: thetas, x: xs, y: ys };
}

export function detectEquationMode(expr: string): EquationMode {
  // Check inequality before implicit since >= and <= contain =
  if (parseInequalityExpression(expr) !== null) return 'inequality';
  return parseImplicitEquation(expr) !== null ? 'implicit' : 'standard';
}
