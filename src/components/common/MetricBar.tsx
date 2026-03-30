interface MetricItem {
  icon: string;
  label: string;
  value: string;
  suffix?: string;
}

interface MetricBarProps {
  items: MetricItem[];
}

export default function MetricBar({ items }: MetricBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container border-t border-outline-variant/10">
      <div className="flex justify-around items-center px-4 py-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-lg">
              {item.icon}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
                {item.label}
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm font-black text-on-surface">
                  {item.value}
                </span>
                {item.suffix && (
                  <span className="text-[10px] text-on-surface-variant">
                    {item.suffix}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
