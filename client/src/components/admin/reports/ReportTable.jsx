import { EmptyState } from "../../ui/State";

export function ReportTable({ title, subtitle, columns, rows, getKey }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold text-black dark:text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {!rows?.length ? (
        <EmptyState title="No report data" body="Try changing the filters or date range." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-100 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 dark:bg-neutral-900">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-3 ${column.align === "right" ? "text-right" : ""}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {rows.map((row, index) => (
                <tr key={getKey ? getKey(row, index) : row._id || row.id || index} className="transition hover:bg-neutral-50 dark:hover:bg-neutral-900">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 ${column.align === "right" ? "text-right" : ""}`}>
                      {column.render ? column.render(row, index) : row[column.key] ?? "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
