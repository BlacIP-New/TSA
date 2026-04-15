import { Menu, Bell } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export function TopBar({ onMenuClick, title }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-sm font-semibold text-gray-700 hidden sm:block">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E8001C] rounded-full" />
        </button>
        <div className="text-xs text-gray-400 hidden sm:block border-l border-gray-100 pl-3 ml-1">
          TSA Collection Insight Portal
        </div>
      </div>
    </header>
  );
}
