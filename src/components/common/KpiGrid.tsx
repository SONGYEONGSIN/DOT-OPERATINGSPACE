interface KpiGridProps {
  children: React.ReactNode;
}

export default function KpiGrid({ children }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
  );
}
