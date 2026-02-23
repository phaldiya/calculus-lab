import { evaluate, parse } from 'mathjs';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAppContext } from '../../context/AppContext';
import type { CalculationStep } from '../../lib/stepEngine';
import { generateSteps } from '../../lib/stepEngine';
import { safeToTex } from '../../lib/texHelpers';
import KaTeXRenderer from '../shared/KaTeXRenderer';
import StepViewer from '../shared/StepViewer';

type AngleMode = 'deg' | 'rad';

const BUTTONS = [
  // Row 0: memory & clear
  ['MC', 'MR', 'M+', 'M-', 'AC', 'C'],
  // Row 1: scientific functions top
  ['x²', 'x³', 'xʸ', '10ˣ', 'eˣ', '1/x'],
  // Row 2: scientific functions bottom
  ['sin', 'cos', 'tan', 'ln', 'log', '√'],
  // Row 3: inverse trig + constants
  ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'π', 'e', '|x|'],
  // Row 4: parentheses + operators
  ['(', ')', '%', '÷', '!', 'mod'],
  // Row 5-8: number pad + operators
  ['7', '8', '9', '×', '⌫'],
  ['4', '5', '6', '-', 'Ans'],
  ['1', '2', '3', '+', 'EXP'],
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
  '-': '-',
  '×': '*',
  '÷': '/',
  '%': '%',
  '(': '(',
  ')': ')',
  xʸ: '^',
  '!': '!',
  '=': 'Enter',
  '⌫': 'Backspace',
  AC: 'Esc',
  C: 'Delete',
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
  '|x|': 'Absolute value',
  'sin⁻¹': 'Inverse sine',
  'cos⁻¹': 'Inverse cosine',
  'tan⁻¹': 'Inverse tangent',
};

function getButtonStyle(btn: string): string {
  const base =
    'flex items-center justify-center rounded-lg text-sm font-medium transition-all active:scale-95 select-none ';

  if (btn === '=')
    return `${base}bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] text-lg font-bold`;
  if (btn === 'AC' || btn === 'C') return `${base}bg-red-500/15 text-red-500 hover:bg-red-500/25`;
  if (['÷', '×', '-', '+', '%', 'mod'].includes(btn))
    return `${base}bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 font-bold`;
  if (['(', ')', '⌫'].includes(btn))
    return `${base}bg-[var(--color-surface-alt)] text-[var(--color-text)] hover:bg-[var(--color-border)]`;
  if (/^[0-9.]$/.test(btn) || btn === '±' || btn === 'EXP' || btn === 'Ans')
    return (
      base +
      'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-alt)] border border-[var(--color-border)]'
    );
  // Scientific functions
  return `${base}bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-xs`;
}

export default function ScientificPanel() {
  const { dispatch } = useAppContext();
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [prevResult, setPrevResult] = useState('0');
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<AngleMode>('rad');
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
      .replace(/π/g, 'pi')
      .replace(/mod/g, '%')
      .replace(/\blog\(/g, 'log10(')
      .replace(/\bln\(/g, 'log(');

    // Handle angle mode for trig functions
    if (angleMode === 'deg') {
      result = result.replace(/sin\(([^)]+)\)/g, 'sin(($1) * pi / 180)');
      result = result.replace(/cos\(([^)]+)\)/g, 'cos(($1) * pi / 180)');
      result = result.replace(/tan\(([^)]+)\)/g, 'tan(($1) * pi / 180)');
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
      setPrevResult(resultStr);
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
        case 'C':
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
        case 'Ans':
          appendToExpression(prevResult);
          break;
        case 'MC':
          setMemory(0);
          break;
        case 'MR':
          appendToExpression(memory.toString());
          break;
        case 'M+':
          try {
            setMemory(memory + parseFloat(display));
          } catch {
            /* ignore */
          }
          break;
        case 'M-':
          try {
            setMemory(memory - parseFloat(display));
          } catch {
            /* ignore */
          }
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
        case 'log':
          appendToExpression(`${btn}(`);
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
        case '√':
          appendToExpression('sqrt(');
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
        case '1/x':
          appendToExpression('1/(');
          break;
        case '|x|':
          appendToExpression('abs(');
          break;
        case '!':
          appendToExpression('!');
          break;
        case 'EXP':
          appendToExpression('e');
          break;
        case '%':
        case 'mod':
        case '÷':
        case '×':
        case '-':
        case '+':
        case '(':
        case ')':
        case '.':
          appendToExpression(btn);
          break;
        default:
          // Numbers
          appendToExpression(btn);
          break;
      }
    },
    [expression, display, prevResult, memory, appendToExpression, calculateResult],
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
      '-': '-',
      '*': '×',
      '/': '÷',
      '%': '%',
      '(': '(',
      ')': ')',
      '^': 'xʸ',
      '!': '!',
      Enter: '=',
      '=': '=',
      Backspace: '⌫',
      Escape: 'AC',
      Delete: 'C',
      p: 'π',
      e: 'e',
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

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
            <div className="flex gap-1">
              <button
                type="button"
                aria-pressed={angleMode === 'rad'}
                onClick={() => setAngleMode('rad')}
                className={`rounded px-2 py-0.5 font-medium text-xs transition-colors ${
                  angleMode === 'rad'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]'
                }`}
              >
                RAD
              </button>
              <button
                type="button"
                aria-pressed={angleMode === 'deg'}
                onClick={() => setAngleMode('deg')}
                className={`rounded px-2 py-0.5 font-medium text-xs transition-colors ${
                  angleMode === 'deg'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]'
                }`}
              >
                DEG
              </button>
            </div>
            {memory !== 0 && <span className="font-mono text-[var(--color-text-secondary)] text-xs">M = {memory}</span>}
          </div>

          {/* Button grid */}
          <div className="flex flex-col gap-1.5">
            {BUTTONS.map((row, rowIdx) => (
              <div
                key={rowIdx}
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns:
                    rowIdx <= 4 ? `repeat(${row.length}, minmax(0, 1fr))` : `repeat(5, minmax(0, 1fr))`,
                }}
              >
                {row.map((btn, btnIdx) => (
                  <button
                    type="button"
                    key={`${rowIdx}-${btnIdx}`}
                    onClick={() => handleButton(btn)}
                    className={`${getButtonStyle(btn)} h-11`}
                    style={rowIdx === 8 && btn === '=' ? { gridColumn: 'span 2' } : undefined}
                    title={SHORTCUT_TOOLTIPS[btn] ? `Keyboard: ${SHORTCUT_TOOLTIPS[btn]}` : undefined}
                    aria-label={BUTTON_ARIA_LABELS[btn]}
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
