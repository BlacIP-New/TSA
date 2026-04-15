import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  Users,
  ClipboardList,
  LogOut,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';

interface NavItem {
  label: string;
  to: string;
  icon: React.FC<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', to: '/transactions', icon: List },
  { label: 'MDA Management', to: '/mda-management', icon: Users, adminOnly: true },
  { label: 'Audit Log', to: '/audit-log', icon: ClipboardList, adminOnly: true },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'aggregator_admin';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-slate-200/80 bg-white/72 text-slate-900 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-200/70 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-blue-600 text-sm font-extrabold text-white">
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

      <div className="border-b border-slate-200/70 px-4 py-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3">
            <Badge variant={isAdmin ? 'info' : 'neutral'} dot>
              {isAdmin ? 'Aggregator Admin' : 'MDA Viewer'}
            </Badge>
          </div>
        </div>
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
              `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold tracking-[-0.01em] transition-all ${
                isActive
                  ? 'border border-gray-300 bg-blue-600 text-white'
                  : 'border border-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/75 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-sky-700' : 'text-slate-400 group-hover:text-slate-700'}`} />
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-all ${
                    isActive
                      ? 'translate-x-0 opacity-100 text-sky-700'
                      : '-translate-x-1 opacity-0 text-slate-300 group-hover:translate-x-0 group-hover:opacity-70'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200/70 px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-slate-200/80 hover:bg-white/75 hover:text-slate-900"
        >
          <LogOut className="h-4.5 w-4.5 text-slate-400" />
          Sign out
        </button>
      </div>
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
          fixed inset-y-0 left-0 z-40 w-[288px] transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
