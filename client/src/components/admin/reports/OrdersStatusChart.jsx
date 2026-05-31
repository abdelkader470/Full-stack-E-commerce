import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { EmptyState } from "../../ui/State";

export function OrdersStatusChart({ data }) {
  const rows = Object.entries(data || {}).map(([status, count]) => ({ status, count }));

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold">Orders by status</h3>
        <p className="mt-1 text-sm text-neutral-500">Operational order distribution for the filtered period.</p>
      </div>
      {!rows.some((row) => row.count > 0) ? (
        <EmptyState title="No order data" body="Order status counts will appear here." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ left: 0, right: 12, top: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#111111" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
