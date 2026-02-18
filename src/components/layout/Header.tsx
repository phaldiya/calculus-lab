import { Link, useLocation } from 'react-router-dom';

import { useAppContext } from '../../context/AppContext';
import { CalculusLabIcon, CloseIcon, MoonIcon, PanelIcon, SunIcon } from '../shared/Icons';

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  onToggleRightPanel?: () => void;
  rightPanelOpen?: boolean;
}

export default function Header({ onToggleSidebar, sidebarOpen, onToggleRightPanel, rightPanelOpen }: HeaderProps) {
  const { state, dispatch } = useAppContext();
  const location = useLocation();
  const hash = location.pathname.replace('/', '');
  const docsTo = hash && hash !== 'docs' ? `/docs/${hash}` : '/docs';

  return (
    <header className="flex items-center justify-between border-[var(--color-border)] border-b bg-[var(--color-surface)] px-4 py-2">
      <div className="flex items-center gap-2">
        <CalculusLabIcon className="h-7 w-7 rounded" />
        <h1 className="font-semibold text-[var(--color-text)] text-lg">Calculus Lab</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to={docsTo}
          className="px-3 py-1.5 text-[var(--color-text-secondary)] text-sm transition-colors hover:text-[var(--color-primary)]"
        >
          Docs
        </Link>
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-alt)]"
          aria-label={state.darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={state.darkMode ? 'Light mode' : 'Dark mode'}
        >
          {state.darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        {/* Right panel toggle — visible at lg+ */}
        {onToggleRightPanel && (
          <button
            type="button"
            onClick={onToggleRightPanel}
            aria-label={rightPanelOpen ? 'Hide variables panel' : 'Show variables panel'}
            aria-expanded={rightPanelOpen}
            className="hidden rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-alt)] lg:block"
            title={rightPanelOpen ? 'Hide panel' : 'Show panel'}
          >
            <PanelIcon className="h-5 w-5" />
          </button>
        )}
        {/* Sidebar toggle — visible below lg */}
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Close variables panel' : 'Open variables panel'}
            aria-expanded={sidebarOpen}
            className="rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-alt)] lg:hidden"
            title={sidebarOpen ? 'Close panel' : 'Open panel'}
          >
            {sidebarOpen ? <CloseIcon className="h-5 w-5" /> : <PanelIcon className="h-5 w-5" />}
          </button>
        )}
      </div>
    </header>
  );
}
