import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, CircleUserRound, LogOut, Menu, Search, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProfileSettingsModal } from '../ui/ProfileSettingsModal';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  }

  const primaryLabel =
    user?.role === 'aggregator_admin'
      ? user?.aggregatorName || user?.name || 'Aggregator'
      : user?.collectionCode || user?.name || 'Collection code';

  return (
    <>
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded border border-gray-300 bg-white/80 p-2.5 text-slate-500 transition-colors hover:text-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          {title && <h1 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">{title}</h1>}
          <p className="hidden text-xs uppercase tracking-[0.18em] text-slate-400 sm:block">
            TSA Collection Operations Console
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-sm text-slate-400 md:flex">
          <Search className="h-4 w-4" />
          Search coming soon
        </div>
        <button className="relative rounded border border-gray-300 bg-white/80 p-2.5 text-slate-400 transition-colors hover:text-slate-700">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#335CFF]" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-3 rounded border border-gray-300 bg-white px-3 py-2 text-left text-slate-600 transition-colors hover:bg-gray-50 hover:text-slate-900"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <CircleUserRound className="h-5 w-5 shrink-0" />
            <span className="flex min-w-0 flex-col items-start leading-tight">
              <span className="truncate text-sm font-semibold text-slate-900">{primaryLabel}</span>
              <span className="truncate text-xs text-slate-500">{user?.email}</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] w-56 rounded-lg border border-gray-300 bg-white p-2 shadow-none">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setProfileOpen(true);
                }}
                className="mt-2 flex w-full items-center gap-2 rounded px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-gray-50 hover:text-slate-900"
              >
                <Settings className="h-4 w-4" />
                Profile settings
              </button>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2.5 text-sm text-slate-700 transition-colors hover:bg-gray-50 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <ProfileSettingsModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
