import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';

import CalculusPanel from './components/calculus/CalculusPanel';
import DocsPage from './components/DocsPage';
import GraphPanel from './components/graphing/GraphPanel';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MatrixPanel from './components/matrix/MatrixPanel';
import ScientificPanel from './components/scientific/ScientificPanel';
import ErrorBoundary from './components/shared/ErrorBoundary';
import ExpressionHistory from './components/shared/ExpressionHistory';
import { CloseIcon } from './components/shared/Icons';
import VariablePanel from './components/shared/VariablePanel';
import StatisticsPanel from './components/statistics/StatisticsPanel';
import ThreeDGraphingPanel from './components/threeDGraphing/ThreeDGraphingPanel';
import { AppProvider, useAppContext } from './context/AppContext';
import type { TabId } from './types';

const pathToTab: Record<string, TabId> = {
  '/scientific': 'scientific',
  '/graphing': 'graphing',
  '/3d-graphing': '3d-graphing',
  '/calculus': 'calculus',
  '/matrix': 'matrix',
  '/statistics': 'statistics',
};

function TabSync() {
  const location = useLocation();
  const { dispatch } = useAppContext();

  useEffect(() => {
    const tab = pathToTab[location.pathname];
    if (tab) {
      dispatch({ type: 'SET_TAB', tab });
    }
  }, [location.pathname, dispatch]);

  return null;
}

function RightPanelContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-3">
      <div className="shrink-0">
        <VariablePanel />
      </div>
      <div className="flex min-h-0 flex-1 flex-col border-[var(--color-border)] border-t pt-3">
        <ExpressionHistory />
      </div>
    </div>
  );
}

function CalculatorLayout() {
  const location = useLocation();
  const tabName = pathToTab[location.pathname] || 'scientific';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(() => window.matchMedia('(min-width: 1280px)').matches);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen((prev) => !prev);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen]);

  return (
    <div className="flex h-dvh flex-col bg-[var(--color-bg)]">
      <a href="#main-content" id="skip-nav">
        Skip to content
      </a>
      <Header
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onToggleRightPanel={toggleRightPanel}
        rightPanelOpen={rightPanelOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main id="main-content" className="flex-1 overflow-hidden pb-16 md:pb-0">
          <ErrorBoundary tabName={tabName}>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Desktop right sidebar */}
        <aside
          aria-label="Variables and history"
          className={`hidden flex-col overflow-hidden border-[var(--color-border)] border-l bg-[var(--color-surface)] transition-[width] duration-200 ease-in-out lg:flex ${rightPanelOpen ? 'w-56' : 'w-0 border-l-0'}`}
        >
          <RightPanelContent />
        </aside>
      </div>

      {/* Mobile/Tablet right sidebar drawer */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close panel"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            tabIndex={-1}
          />
          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className="fixed top-0 right-0 z-50 flex h-full w-72 flex-col border-[var(--color-border)] border-l bg-[var(--color-surface)] shadow-xl lg:hidden"
          >
            <div className="flex items-center justify-between border-[var(--color-border)] border-b px-3 py-2">
              <span id="drawer-title" className="font-semibold text-[var(--color-text)] text-sm">
                Variables & History
              </span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close panel"
                className="rounded-lg p-1.5 transition-colors hover:bg-[var(--color-surface-alt)]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
            <RightPanelContent />
          </div>
        </>
      )}

      <TabSync />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<CalculatorLayout />}>
          <Route index element={<Navigate to="/scientific" replace />} />
          <Route path="/scientific" element={<ScientificPanel />} />
          <Route path="/graphing" element={<GraphPanel />} />
          <Route path="/3d-graphing" element={<ThreeDGraphingPanel />} />
          <Route path="/calculus" element={<CalculusPanel />} />
          <Route path="/matrix" element={<MatrixPanel />} />
          <Route path="/statistics" element={<StatisticsPanel />} />
        </Route>
        <Route path="/docs/*" element={<DocsPage />} />
      </Routes>
    </AppProvider>
  );
}
