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
    <div className="app-panel border-white/70 inline-flex w-full flex-wrap gap-2 p-2">
      {TAB_OPTIONS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors ${
              isActive
                ? 'border border-sky-200/80 bg-sky-100 text-sky-900 shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            onClick={() => onChange(tab.key)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
