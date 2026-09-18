interface StatusTab<T extends string> {
  value: T;
  label: string;
}

interface StatusTabsProps<T extends string> {
  tabs: StatusTab<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function StatusTabs<T extends string>({ tabs, value, onChange }: StatusTabsProps<T>) {
  return (
    <div className="mb-4 flex gap-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            value === tab.value ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
