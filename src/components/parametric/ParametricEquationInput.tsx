import { useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import { nextColor } from '../../lib/colorPalette';
import { validateExpression } from '../../lib/expressionParser';
import type { ParametricPlotType } from '../../types';

const placeholders: Record<ParametricPlotType, Record<string, string>> = {
  'parametric-2d': { x: 'x(t), e.g. cos(t)', y: 'y(t), e.g. sin(t)' },
  'parametric-3d': { x: 'x(t), e.g. cos(t)', y: 'y(t), e.g. sin(t)', z: 'z(t), e.g. t/10' },
  polar: { r: 'r(theta), e.g. 2 + cos(3*theta)' },
};

export default function ParametricEquationInput() {
  const { state, dispatch } = useAppContext();
  const plotType = state.parametric.activePlotType;

  const [xExpr, setXExpr] = useState('');
  const [yExpr, setYExpr] = useState('');
  const [zExpr, setZExpr] = useState('');
  const [tMin, setTMin] = useState('0');
  const [tMax, setTMax] = useState(plotType === 'polar' ? '6.2832' : '6.2832');
  const [numPoints, setNumPoints] = useState('500');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nPts = Number.parseInt(numPoints, 10) || 500;
    const tMinVal = Number.parseFloat(tMin) || 0;
    const tMaxVal = Number.parseFloat(tMax) || 2 * Math.PI;

    if (plotType === 'polar') {
      if (!xExpr.trim()) {
        setError('Enter an r(theta) expression');
        return;
      }
      const v = validateExpression(xExpr.trim());
      if (!v.valid) {
        setError(v.error || 'Invalid expression');
        return;
      }
      dispatch({
        type: 'ADD_PARAMETRIC_EQUATION',
        equation: {
          id: crypto.randomUUID(),
          plotType: 'polar',
          xExpr: xExpr.trim(),
          yExpr: '',
          tMin: tMinVal,
          tMax: tMaxVal,
          numPoints: nPts,
          color: nextColor(),
          visible: true,
        },
      });
    } else if (plotType === 'parametric-3d') {
      if (!xExpr.trim() || !yExpr.trim() || !zExpr.trim()) {
        setError('Enter x(t), y(t), and z(t) expressions');
        return;
      }
      for (const expr of [xExpr, yExpr, zExpr]) {
        const v = validateExpression(expr.trim());
        if (!v.valid) {
          setError(v.error || 'Invalid expression');
          return;
        }
      }
      dispatch({
        type: 'ADD_PARAMETRIC_EQUATION',
        equation: {
          id: crypto.randomUUID(),
          plotType: 'parametric-3d',
          xExpr: xExpr.trim(),
          yExpr: yExpr.trim(),
          zExpr: zExpr.trim(),
          tMin: tMinVal,
          tMax: tMaxVal,
          numPoints: nPts,
          color: nextColor(),
          visible: true,
        },
      });
    } else {
      if (!xExpr.trim() || !yExpr.trim()) {
        setError('Enter x(t) and y(t) expressions');
        return;
      }
      for (const expr of [xExpr, yExpr]) {
        const v = validateExpression(expr.trim());
        if (!v.valid) {
          setError(v.error || 'Invalid expression');
          return;
        }
      }
      dispatch({
        type: 'ADD_PARAMETRIC_EQUATION',
        equation: {
          id: crypto.randomUUID(),
          plotType: 'parametric-2d',
          xExpr: xExpr.trim(),
          yExpr: yExpr.trim(),
          tMin: tMinVal,
          tMax: tMaxVal,
          numPoints: nPts,
          color: nextColor(),
          visible: true,
        },
      });
    }

    setXExpr('');
    setYExpr('');
    setZExpr('');
    setError('');
  };

  const ph = placeholders[plotType];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {plotType === 'polar' ? (
        <input
          type="text"
          value={xExpr}
          onChange={(e) => {
            setXExpr(e.target.value);
            setError('');
          }}
          placeholder={ph.r}
          aria-label="Polar expression"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />
      ) : (
        <>
          <input
            type="text"
            value={xExpr}
            onChange={(e) => {
              setXExpr(e.target.value);
              setError('');
            }}
            placeholder={ph.x}
            aria-label="X expression"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <input
            type="text"
            value={yExpr}
            onChange={(e) => {
              setYExpr(e.target.value);
              setError('');
            }}
            placeholder={ph.y}
            aria-label="Y expression"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          {plotType === 'parametric-3d' && (
            <input
              type="text"
              value={zExpr}
              onChange={(e) => {
                setZExpr(e.target.value);
                setError('');
              }}
              placeholder={ph.z}
              aria-label="Z expression"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          )}
        </>
      )}

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="mb-1 block text-[var(--color-text-secondary)] text-xs">
            {plotType === 'polar' ? 'θ min' : 't min'}
            <input
              type="number"
              value={tMin}
              onChange={(e) => setTMin(e.target.value)}
              aria-label="Parameter minimum"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1.5 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[var(--color-text-secondary)] text-xs">
            {plotType === 'polar' ? 'θ max' : 't max'}
            <input
              type="number"
              value={tMax}
              onChange={(e) => setTMax(e.target.value)}
              aria-label="Parameter maximum"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1.5 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
        </div>
        <div className="w-16">
          <label className="mb-1 block text-[var(--color-text-secondary)] text-xs">
            Points
            <input
              type="number"
              value={numPoints}
              onChange={(e) => setNumPoints(e.target.value)}
              aria-label="Number of points"
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-2 py-1.5 text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-[var(--color-primary-hover)]"
      >
        Plot
      </button>
      {error && (
        <p role="alert" className="text-[var(--color-error)] text-xs">
          {error}
        </p>
      )}
    </form>
  );
}
