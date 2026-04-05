import Card from "./Card";

interface TableSectionProps {
  totalCount: number;
  children: React.ReactNode;
}

export default function TableSection({
  totalCount,
  children,
}: TableSectionProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-on-surface-variant tabular-nums">
        총{" "}
        <span className="font-bold text-on-surface">
          {totalCount.toLocaleString()}
        </span>
        건
      </div>
      <Card className="overflow-hidden">{children}</Card>
    </div>
  );
}
