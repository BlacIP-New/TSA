import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SessionExpiredModal } from '../auth/SessionExpiredModal';
import { PageTitleProvider, usePageTitle } from '../../context/PageTitleContext';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/mda-management': 'User Management',
  '/audit-log': 'Audit Log',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? '';

  return (
    <PageTitleProvider>
      <AppLayoutShell title={title} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
    </PageTitleProvider>
  );
}

function AppLayoutShell({
  title,
  sidebarOpen,
  setSidebarOpen,
}: {
  title: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const { titleOverride } = usePageTitle();

  return (
    <div className="app-shell-grid flex h-dvh min-h-0 overflow-hidden bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={titleOverride ?? title} />

        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>

      <SessionExpiredModal />
    </div>
  );
}
