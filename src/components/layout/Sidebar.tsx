import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  Users,
  ClipboardList,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.FC<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Settlement Transactions', to: '/transactions', icon: List },
  { label: 'MDA Management', to: '/mda-management', icon: Users, adminOnly: true },
  { label: 'Audit Log', to: '/audit-log', icon: ClipboardList, adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'aggregator_admin';

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-white/72 text-slate-900 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-[#335CFF] text-sm font-extrabold text-white">
            e
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Operations</p>
            <p className="text-base font-semibold tracking-[-0.03em] text-slate-900">eTranzact Console</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-slate-200/70 px-5 py-4">
        <p className="app-kicker">Scope</p>
        <p className="mt-2 text-sm font-semibold text-slate-900">
          {isAdmin ? user?.aggregatorName : user?.mdaName}
        </p>
        {!isAdmin && (
          <p className="mt-1 text-xs text-slate-500">
            {user?.collectionCode} / {user?.serviceCode}
          </p>
        )}
      </div>

      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="app-kicker px-3 pb-2">Workspace</p>
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded px-3 py-3 text-sm font-semibold tracking-[-0.01em] transition-all ${
                isActive
                  ? 'border border-gray-300 bg-[#335CFF] text-white'
                  : 'border border-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/75 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-[#335CFF]' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-all ${
                    isActive
                      ? 'translate-x-0 opacity-100 text-[#335CFF]'
                      : '-translate-x-1 opacity-0 text-slate-300 group-hover:translate-x-0 group-hover:opacity-70'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/18 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-[85vw] max-w-[288px] transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
