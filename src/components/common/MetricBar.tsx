interface MetricItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
}

interface MetricBarProps {
  items: MetricItem[];
}

export default function MetricBar({ items }: MetricBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)] border-t border-black/[0.04]/10">
      <div className="flex justify-around items-center px-4 py-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {item.icon}
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                {item.label}
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-sm font-black text-[var(--color-text)]">
                  {item.value}
                </span>
                {item.suffix && (
                  <span className="text-[10px] text-[var(--color-text-muted)]">
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
