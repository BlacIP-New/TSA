type MDATabKey = 'mdas' | 'collections' | 'users';

interface TabOption {
  key: MDATabKey;
  label: string;
}

interface MDATabNavigationProps {
  activeTab: MDATabKey;
  onChange: (tab: MDATabKey) => void;
}

const TAB_OPTIONS: TabOption[] = [
  { key: 'mdas', label: 'MDAs' },
  { key: 'collections', label: 'Collections & Settlements' },
  { key: 'users', label: 'Users' },
];

export function MDATabNavigation({ activeTab, onChange }: MDATabNavigationProps) {
  return (
    <div className="app-panel border-gray-300 w-full overflow-x-auto p-2">
      <div className="inline-flex min-w-max gap-2">
      {TAB_OPTIONS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            className={`rounded px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'border border-gray-300 bg-[#335CFF] text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
