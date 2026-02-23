import { parse, type SymbolNode } from 'mathjs';

const BUILTIN_SYMBOLS = new Set(['x', 'y', 'z', 't', 'e', 'pi', 'i', 'theta', 'Infinity', 'NaN']);
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

export function extractParameters(expr: string): string[] {
  try {
    const node = parse(expr);
    const symbols = new Set<string>();

    node.traverse((n) => {
      if (n.type === 'SymbolNode') {
        const sym = n as SymbolNode;
        if (!BUILTIN_SYMBOLS.has(sym.name) && !BUILTIN_FUNCTIONS.has(sym.name)) {
          symbols.add(sym.name);
        }
      }
    });

    return Array.from(symbols).sort();
  } catch {
    return [];
  }
}
