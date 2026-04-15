import { Bell, Menu, Search } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200/70 bg-white/58 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-2xl border border-slate-200/80 bg-white/80 p-2.5 text-slate-500 transition-colors hover:text-slate-800 lg:hidden"
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
        <div className="hidden items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/70 px-3 py-2 text-sm text-slate-400 shadow-[0_10px_24px_rgba(15,23,42,0.04)] md:flex">
          <Search className="h-4 w-4" />
          Search coming soon
        </div>
        <button className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-2.5 text-slate-400 transition-colors hover:text-slate-700">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-400" />
        </button>
      </div>
    </header>
  );
}
