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
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#E8001C] flex items-center justify-center">
            <span className="text-white font-black text-xs">e</span>
          </div>
          <span className="font-semibold text-white tracking-tight text-base">
            <span className="text-[#E8001C]">e</span>tranzact
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-[#E8001C]/20 border border-[#E8001C]/30 flex items-center justify-center shrink-0">
            <span className="text-[#E8001C] font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2 px-1">
          <Badge variant={isAdmin ? 'warning' : 'info'} dot>
            {isAdmin ? 'Aggregator Admin' : 'MDA Viewer'}
          </Badge>
        </div>
      </div>

      {!isAdmin && user?.mdaName && (
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Your MDA</p>
          <p className="text-sm text-white font-medium truncate">{user.mdaName}</p>
          <div className="flex gap-3 mt-1">
            <span className="text-xs text-gray-400">
              Code: <span className="text-gray-300">{user.collectionCode}</span>
            </span>
            <span className="text-xs text-gray-400">
              SVC: <span className="text-gray-300">{user.serviceCode}</span>
            </span>
          </div>
        </div>
      )}

      {isAdmin && user?.aggregatorName && (
        <div className="px-5 py-3 border-b border-white/10">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Aggregator</p>
          <p className="text-sm text-white font-medium truncate">{user.aggregatorName}</p>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider px-2 mb-2">
          Navigation
        </p>
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-[#E8001C] text-white'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0'
                  }`}
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
