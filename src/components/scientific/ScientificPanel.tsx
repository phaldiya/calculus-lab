import { evaluate, parse } from 'mathjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import type { CalculationStep } from '../../lib/stepEngine';
import { generateSteps } from '../../lib/stepEngine';
import { safeToTex } from '../../lib/texHelpers';
import KaTeXRenderer from '../shared/KaTeXRenderer';
import StepViewer from '../shared/StepViewer';

type AngleMode = 'deg' | 'rad';

// Scientific function rows (6 columns each)
const SCI_ROWS = [
  ['(', ')', 'mc', 'm+', 'm-', 'mr'],
  ['2nd', 'x²', 'x³', 'xʸ', 'eˣ', '10ˣ'],
  ['1/x', '²√x', '³√x', 'ʸ√x', 'ln', 'log₁₀'],
  ['x!', 'sin', 'cos', 'tan', 'e', 'EE'],
  ['Rand', 'sinh', 'cosh', 'tanh', 'π', 'Deg'],
];

// 2nd mode swaps — matches iOS calculator exactly
const SECOND_MODE_MAP: Record<string, string> = {
  // Row 1: only eˣ and 10ˣ swap
  eˣ: 'yˣ',
  '10ˣ': '2ˣ',
  // Row 2: only ln and log₁₀ swap
  ln: 'logᵧ',
  'log₁₀': 'log₂',
  // Row 3: trig → inverse trig
  sin: 'sin⁻¹',
  cos: 'cos⁻¹',
  tan: 'tan⁻¹',
  // Row 4: hyp → inverse hyp
  sinh: 'sinh⁻¹',
  cosh: 'cosh⁻¹',
  tanh: 'tanh⁻¹',
};

// Number pad rows (4 columns, operator on right)
const NUM_ROWS = [
  ['⌫', 'AC', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['±', '0', '.', '='],
];

const SHORTCUT_TOOLTIPS: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '.': '.',
  '+': '+',
  '−': '-',
  '×': '*',
  '÷': '/',
  '%': '%',
  '(': '(',
  ')': ')',
  xʸ: '^',
  'x!': '!',
  '=': 'Enter',
  '⌫': 'Backspace',
  AC: 'Esc',
  π: 'p',
  e: 'e',
};

const BUTTON_ARIA_LABELS: Record<string, string> = {
  '±': 'Toggle sign',
  '⌫': 'Backspace',
  xʸ: 'x to the power of y',
  'x²': 'x squared',
  'x³': 'x cubed',
  '10ˣ': '10 to the power of x',
  eˣ: 'e to the power of x',
  '1/x': 'Reciprocal',
  'x!': 'Factorial',
  '²√x': 'Square root',
  '³√x': 'Cube root',
  'ʸ√x': 'Nth root',
  'sin⁻¹': 'Inverse sine',
  'cos⁻¹': 'Inverse cosine',
  'tan⁻¹': 'Inverse tangent',
  'sinh⁻¹': 'Inverse hyperbolic sine',
  'cosh⁻¹': 'Inverse hyperbolic cosine',
  'tanh⁻¹': 'Inverse hyperbolic tangent',
  'log₁₀': 'Log base 10',
  'log₂': 'Log base 2',
  logᵧ: 'Log base y',
  '2ˣ': '2 to the power of x',
  yˣ: 'y to the power of x',
  Rand: 'Random number',
  EE: 'Scientific notation',
  Deg: 'Toggle degrees/radians',
  Rad: 'Toggle degrees/radians',
  '2nd': 'Toggle second functions',
  mc: 'Memory clear',
  mr: 'Memory recall',
  'm+': 'Memory add',
  'm-': 'Memory subtract',
};

function renderLabel(btn: string): React.ReactNode {
  switch (btn) {
    case '2nd':
      return (
        <span>
          2<sup className="text-[0.6em]">nd</sup>
        </span>
      );
    case 'x²':
      return (
        <span>
          x<sup>2</sup>
        </span>
      );
    case 'x³':
      return (
        <span>
          x<sup>3</sup>
        </span>
      );
    case 'xʸ':
      return (
        <span>
          x<sup>y</sup>
        </span>
      );
    case 'eˣ':
      return (
        <span>
          e<sup>x</sup>
        </span>
      );
    case '10ˣ':
      return (
        <span>
          10<sup>x</sup>
        </span>
      );
    case '2ˣ':
      return (
        <span>
          2<sup>x</sup>
        </span>
      );
    case 'yˣ':
      return (
        <span>
          y<sup>x</sup>
        </span>
      );
    case '²√x':
      return (
        <span>
          <sup>2</sup>√x
        </span>
      );
    case '³√x':
      return (
        <span>
          <sup>3</sup>√x
        </span>
      );
    case 'ʸ√x':
      return (
        <span>
          <sup>y</sup>√x
        </span>
      );
    case '1/x':
      return (
        <span>
          <sup>1</sup>/<sub>x</sub>
        </span>
      );
    case 'log₁₀':
      return (
        <span>
          log<sub>10</sub>
        </span>
      );
    case 'log₂':
      return (
        <span>
          log<sub>2</sub>
        </span>
      );
    case 'logᵧ':
      return (
        <span>
          log<sub>y</sub>
        </span>
      );
    case 'sin⁻¹':
      return (
        <span>
          sin<sup>-1</sup>
        </span>
      );
    case 'cos⁻¹':
      return (
        <span>
          cos<sup>-1</sup>
        </span>
      );
    case 'tan⁻¹':
      return (
        <span>
          tan<sup>-1</sup>
        </span>
      );
    case 'sinh⁻¹':
      return (
        <span>
          sinh<sup>-1</sup>
        </span>
      );
    case 'cosh⁻¹':
      return (
        <span>
          cosh<sup>-1</sup>
        </span>
      );
    case 'tanh⁻¹':
      return (
        <span>
          tanh<sup>-1</sup>
        </span>
      );
    case 'x!':
      return <span>x!</span>;
    default:
      return btn;
  }
}

function getSciButtonStyle(btn: string, isSecondActive: boolean): string {
  const base =
    'flex items-center justify-center rounded-lg text-xs font-medium transition-all active:scale-95 select-none ';
  if (btn === '2nd') {
    return isSecondActive
      ? `${base}bg-[var(--color-primary)] text-white`
      : `${base}bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800`;
  }
  return `${base}bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900`;
}

function getNumButtonStyle(btn: string): string {
  const base = 'flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 select-none ';
  if (btn === '=')
    return `${base}bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-lg font-bold`;
  if (['÷', '×', '−', '+'].includes(btn))
    return `${base}bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-lg font-bold`;
  if (['AC', '⌫', '%'].includes(btn))
    return `${base}bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800 text-sm`;
  return `${base}bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] border border-[var(--color-border)] text-base`;
}

export default function ScientificPanel() {
  const { dispatch } = useAppContext();
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<AngleMode>('rad');
  const [secondMode, setSecondMode] = useState(false);
  const [steps, setSteps] = useState<CalculationStep[]>([]);
  const [showSteps, setShowSteps] = useState(false);

  const appendToExpression = useCallback(
    (value: string) => {
      if (display !== '0' || value === '.' || value === '0') {
        setExpression((prev) => prev + value);
        setDisplay((prev) => (prev === '0' && value !== '.' ? value : prev + value));
      } else {
        setExpression(value);
        setDisplay(value);
      }
    },
    [display],
  );

  const toMathExpr = (expr: string): string => {
    let result = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/mod/g, '%')
      .replace(/\blog10\(/g, 'log10(')
      .replace(/\blog2\(/g, 'log2(')
      .replace(/\bln\(/g, 'log(');

    if (angleMode === 'deg') {
      result = result.replace(/\bsin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
      result = result.replace(/\bcos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
      result = result.replace(/\btan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
    }

    return result;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: toMathExpr is stable for a given angleMode
  const calculateResult = useCallback(() => {
    if (!expression.trim()) return;
    try {
      const mathExpr = toMathExpr(expression);
      const result = evaluate(mathExpr);
      const resultStr =
        typeof result === 'number'
          ? Number.isInteger(result)
            ? result.toString()
            : parseFloat(result.toFixed(10)).toString()
          : String(result);
      const isNewComputation = expression !== resultStr;
      setDisplay(resultStr);
      setExpression(resultStr);

      let expressionTex: string | undefined;
      try {
        expressionTex = safeToTex(parse(mathExpr));
      } catch {
        // fallback: no tex
      }

      const generatedSteps = generateSteps(mathExpr);
      setSteps(generatedSteps);

      if (isNewComputation) {
        dispatch({
          type: 'ADD_HISTORY',
          entry: {
            id: crypto.randomUUID(),
            tab: 'scientific',
            expression: expression,
            result: resultStr,
            timestamp: Date.now(),
            expressionTex,
            resultTex: resultStr,
          },
        });
      }
    } catch (_e) {
      setDisplay('Error');
      setSteps([]);
      setTimeout(() => {
        setDisplay('0');
        setExpression('');
      }, 1500);
    }
  }, [expression, angleMode, dispatch]);

  const handleButton = useCallback(
    (btn: string) => {
      switch (btn) {
        case 'AC':
          setExpression('');
          setDisplay('0');
          setSteps([]);
          setShowSteps(false);
          break;
        case '⌫':
          setExpression((prev) => prev.slice(0, -1) || '');
          setDisplay((prev) => prev.slice(0, -1) || '0');
          break;
        case '=':
          calculateResult();
          break;
        case '±':
          if (expression.startsWith('-')) {
            setExpression(expression.slice(1));
            setDisplay(display.startsWith('-') ? display.slice(1) : display);
          } else {
            setExpression(`-${expression}`);
            setDisplay(`-${display}`);
          }
          break;
        case 'mc':
          setMemory(0);
          break;
        case 'mr':
          appendToExpression(memory.toString());
          break;
        case 'm+':
          try {
            setMemory(memory + parseFloat(display));
          } catch {
            /* ignore */
          }
          break;
        case 'm-':
          try {
            setMemory(memory - parseFloat(display));
          } catch {
            /* ignore */
          }
          break;
        case '2nd':
          setSecondMode((v) => !v);
          break;
        case 'Deg':
        case 'Rad':
          setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'));
          break;
        case 'π':
          appendToExpression('π');
          break;
        case 'e':
          appendToExpression('e');
          break;
        case 'sin':
        case 'cos':
        case 'tan':
        case 'ln':
        case 'sinh':
        case 'cosh':
        case 'tanh':
          appendToExpression(`${btn}(`);
          break;
        case 'log₁₀':
          appendToExpression('log10(');
          break;
        case 'log₂':
          appendToExpression('log2(');
          break;
        case 'logᵧ':
          appendToExpression('log(');
          break;
        case 'sin⁻¹':
          appendToExpression('asin(');
          break;
        case 'cos⁻¹':
          appendToExpression('acos(');
          break;
        case 'tan⁻¹':
          appendToExpression('atan(');
          break;
        case 'sinh⁻¹':
          appendToExpression('asinh(');
          break;
        case 'cosh⁻¹':
          appendToExpression('acosh(');
          break;
        case 'tanh⁻¹':
          appendToExpression('atanh(');
          break;
        case '²√x':
          appendToExpression('sqrt(');
          break;
        case '³√x':
          appendToExpression('cbrt(');
          break;
        case 'ʸ√x':
          appendToExpression('nthRoot(');
          break;
        case 'x²':
          appendToExpression('^2');
          break;
        case 'x³':
          appendToExpression('^3');
          break;
        case 'xʸ':
          appendToExpression('^');
          break;
        case '10ˣ':
          appendToExpression('10^');
          break;
        case 'eˣ':
          appendToExpression('e^');
          break;
        case '2ˣ':
          appendToExpression('2^');
          break;
        case 'yˣ':
          appendToExpression('^');
          break;
        case '1/x':
          appendToExpression('1/(');
          break;
        case 'x!':
          appendToExpression('!');
          break;
        case 'EE':
          appendToExpression('e');
          break;
        case 'Rand':
          appendToExpression(Math.random().toFixed(6));
          break;
        case '%':
        case '÷':
        case '×':
        case '−':
        case '+':
        case '(':
        case ')':
        case '.':
          appendToExpression(btn);
          break;
        default:
          appendToExpression(btn);
          break;
      }
    },
    [expression, display, memory, appendToExpression, calculateResult],
  );

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapperRef.current?.focus();
  }, []);

  useEffect(() => {
    const KEY_MAP: Record<string, string> = {
      '0': '0',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '.': '.',
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
      '%': '%',
      '(': '(',
      ')': ')',
      '^': 'xʸ',
      '!': 'x!',
      Enter: '=',
      '=': '=',
      Backspace: '⌫',
      Escape: 'AC',
      p: 'π',
      e: 'e',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      // Apple-style shortcuts with Alt/Option
      if (e.altKey) {
        if (e.key === 'v' || e.key === '√') {
          e.preventDefault();
          handleButton('²√x');
          return;
        }
        if (e.key === '-') {
          e.preventDefault();
          handleButton('±');
          return;
        }
        return;
      }

      // Shift-E for scientific notation (EE)
      if (e.shiftKey && e.key === 'E') {
        e.preventDefault();
        handleButton('EE');
        return;
      }

      const mapped = KEY_MAP[e.key];
      if (mapped) {
        e.preventDefault();
        handleButton(mapped);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleButton]);

  let expressionTex: string | undefined;
  try {
    if (expression && display !== 'Error') {
      const mathExpr = toMathExpr(expression);
      expressionTex = safeToTex(parse(mathExpr));
    }
  } catch {
    // fallback to plain text
  }

  const resolveBtn = (btn: string): string => {
    if (!secondMode) return btn;
    return SECOND_MODE_MAP[btn] ?? btn;
  };

  return (
    <div className="flex h-full">
      <div className="flex flex-1 items-center justify-start overflow-y-auto px-3 py-6 sm:justify-center sm:px-6">
        <div ref={wrapperRef} tabIndex={-1} className="flex w-full max-w-lg flex-col gap-3 outline-none">
          {/* Display */}
          <output
            aria-live="polite"
            className="flex min-h-[100px] flex-col justify-end rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="mb-1 min-h-[1.25rem] truncate text-right text-[var(--color-text-secondary)] text-xs">
              {expressionTex ? (
                <KaTeXRenderer tex={expressionTex} ariaLabel={expression || ' '} />
              ) : (
                <span className="font-mono">{expression || ' '}</span>
              )}
            </div>
            <div className="truncate text-right font-bold font-mono text-3xl text-[var(--color-text)]">{display}</div>
          </output>

          {/* Show Steps button */}
          {steps.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSteps((v) => !v)}
              aria-expanded={showSteps}
              className="self-end rounded px-3 py-1 font-medium text-[var(--color-primary)] text-xs transition-colors hover:bg-[var(--color-surface-alt)]"
            >
              {showSteps ? 'Hide Steps' : 'Show Steps'}
            </button>
          )}

          {/* Step viewer */}
          {showSteps && steps.length > 0 && (
            <StepViewer
              steps={steps.map((s) => ({
                label: s.label,
                contentTex: s.subExpressionTex,
              }))}
              onClose={() => setShowSteps(false)}
            />
          )}

          {/* Mode & memory indicator */}
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[var(--color-text-secondary)] text-xs">
              {angleMode === 'rad' ? 'Rad' : 'Deg'}
            </span>
            {memory !== 0 && <span className="font-mono text-[var(--color-text-secondary)] text-xs">M = {memory}</span>}
          </div>

          {/* Scientific function rows (6 columns) */}
          <div className="flex flex-col gap-1">
            {SCI_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-6 gap-1">
                {row.map((rawBtn, btnIdx) => {
                  const btn = resolveBtn(rawBtn);
                  const displayBtn = btn === 'Deg' ? (angleMode === 'rad' ? 'Deg' : 'Rad') : btn;
                  return (
                    <button
                      type="button"
                      key={`sci-${rowIdx}-${btnIdx}`}
                      onClick={() => handleButton(btn)}
                      className={`${getSciButtonStyle(btn, secondMode)} h-10`}
                      title={SHORTCUT_TOOLTIPS[btn] ? `Keyboard: ${SHORTCUT_TOOLTIPS[btn]}` : undefined}
                      aria-label={BUTTON_ARIA_LABELS[btn] ?? btn}
                    >
                      {renderLabel(displayBtn)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Number pad rows (4 columns) */}
          <div className="flex flex-col gap-1.5">
            {NUM_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-4 gap-1.5">
                {row.map((btn, btnIdx) => (
                  <button
                    type="button"
                    key={`num-${rowIdx}-${btnIdx}`}
                    onClick={() => handleButton(btn)}
                    className={`${getNumButtonStyle(btn)} h-12`}
                    title={SHORTCUT_TOOLTIPS[btn] ? `Keyboard: ${SHORTCUT_TOOLTIPS[btn]}` : undefined}
                    aria-label={BUTTON_ARIA_LABELS[btn] ?? btn}
                  >
                    {btn}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
