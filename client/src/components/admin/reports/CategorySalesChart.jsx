import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { money } from "../../../lib/api";
import { EmptyState } from "../../ui/State";

const colors = ["#111111", "#525252", "#a3a3a3", "#d4d4d4", "#737373", "#262626"];

export function CategorySalesChart({ data }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold">Sales by category</h3>
        <p className="mt-1 text-sm text-neutral-500">Category mix by clothing sales value.</p>
      </div>
      {!data?.length ? (
        <EmptyState title="No category sales" body="Category totals will appear after sales are recorded." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_180px] lg:items-center">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="sales" nameKey="category" innerRadius={64} outerRadius={104} paddingAngle={3}>
                  {data.map((entry, index) => (
                    <Cell key={entry.category} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => money(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm">
            {data.slice(0, 6).map((item, index) => (
              <div key={item.category} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-bold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index % colors.length] }} />
                  {item.category}
                </span>
                <span className="text-neutral-500">{money(item.sales)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
