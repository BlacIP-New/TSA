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
    <div className="inline-flex w-full flex-wrap gap-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-sm">
      {TAB_OPTIONS.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#E8001C] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
