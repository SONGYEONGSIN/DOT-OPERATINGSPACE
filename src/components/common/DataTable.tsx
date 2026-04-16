interface DataTableColumn {
  key: string;
  label: string;
  className?: string;
}

interface DataTableProps {
  columns: DataTableColumn[];
  data: Record<string, React.ReactNode>[];
  footer?: React.ReactNode;
}

export default function DataTable({ columns, data, footer }: DataTableProps) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.04]/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-4 py-3 ${col.className ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-black/[0.04]/10 hover:bg-[var(--color-surface)] transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 text-sm text-[var(--color-text)] ${col.className ?? ""}`}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer && (
        <div className="border-t border-black/[0.04]/10 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
