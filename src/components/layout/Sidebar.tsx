import { useLocation, useNavigate } from 'react-router-dom';

import { CalculatorIcon, CubeIcon, GraphIcon, IntegralIcon, MatrixIcon, StatsIcon } from '../shared/Icons';

const tabs = [
  { path: '/scientific', label: 'Calc', Icon: CalculatorIcon, tooltip: 'Arithmetic, trig, logs, and memory' },
  { path: '/graphing', label: 'Graph', Icon: GraphIcon, tooltip: 'Plot functions with zoom and pan' },
  { path: '/3d-graphing', label: '3D', Icon: CubeIcon, tooltip: '3D surface plots of z = f(x,y)' },
  { path: '/calculus', label: 'Calculus', Icon: IntegralIcon, tooltip: 'Derivatives, integrals, and limits' },
  { path: '/matrix', label: 'Matrix', Icon: MatrixIcon, tooltip: 'Matrix operations up to 5x5' },
  { path: '/statistics', label: 'Stats', Icon: StatsIcon, tooltip: 'Descriptive stats and regression' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop: vertical sidebar */}
      <nav
        aria-label="Calculator modes"
        className="hidden w-20 flex-col items-center gap-2 border-[var(--color-border)] border-r bg-[var(--color-surface)] py-4 md:flex"
      >
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          const color = active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]';
          return (
            <div key={tab.path} className="group relative">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate(tab.path)}
                className={`flex w-16 flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                  active ? 'bg-indigo-50 dark:bg-indigo-950' : 'hover:bg-[var(--color-surface-alt)]'
                }`}
              >
                <tab.Icon className={`h-5 w-5 ${color}`} />
                <span
                  className={`text-xs ${
                    active ? 'font-medium text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
              <div className="pointer-events-none absolute top-1/2 left-full z-10 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-white text-xs opacity-0 transition-opacity duration-150 group-hover:opacity-100 dark:bg-slate-700">
                {tab.tooltip}
                <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700" />
              </div>
            </div>
          );
        })}
      </nav>

      {/* Mobile: fixed bottom tab bar */}
      <nav
        aria-label="Calculator modes"
        className="fixed right-0 bottom-0 left-0 z-40 flex border-[var(--color-border)] border-t bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {tabs.map((tab) => {
          const active = location.pathname === tab.path;
          const color = active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]';
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active}
              aria-current={active ? 'page' : undefined}
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <tab.Icon className={`h-5 w-5 ${color}`} />
              <span className={`text-[10px] ${active ? 'font-medium' : ''}`}>{tab.label}</span>
              {active && (
                <div className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b bg-[var(--color-primary)]" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
