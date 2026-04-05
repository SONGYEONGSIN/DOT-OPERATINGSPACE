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
            <tr className="border-b border-outline-variant/10">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider px-4 py-3 ${col.className ?? ""}`}
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
                className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2.5 text-sm text-on-surface ${col.className ?? ""}`}
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
        <div className="border-t border-outline-variant/10 px-4 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}
