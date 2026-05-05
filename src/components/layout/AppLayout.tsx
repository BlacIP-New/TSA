import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
  return <AppLayoutContainer />;
}

export function AppLayoutContainer({ children }: { children?: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? '';

  return (
    <PageTitleProvider>
      <AppLayoutShell
        title={title}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </AppLayoutShell>
    </PageTitleProvider>
  );
}

function AppLayoutShell({
  title,
  sidebarOpen,
  setSidebarOpen,
  children,
}: {
  title: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: React.ReactNode;
}) {
  const { titleOverride } = usePageTitle();

  return (
    <div className="app-shell-grid flex h-dvh min-h-0 overflow-hidden bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} title={titleOverride ?? title} />

        <main className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>

      <SessionExpiredModal />
    </div>
  );
}
