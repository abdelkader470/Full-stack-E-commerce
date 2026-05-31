import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { money } from "../../../lib/api";
import { EmptyState } from "../../ui/State";

export function SalesChart({ data }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mb-4">
        <h3 className="text-lg font-extrabold">Sales over time</h3>
        <p className="mt-1 text-sm text-neutral-500">Daily sales and order volume for the selected period.</p>
      </div>
      {!data?.length ? (
        <EmptyState title="No sales data" body="Sales will appear after matching orders are created." />
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 16, top: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value, name) => (name === "sales" ? money(value) : value)} />
              <Line type="monotone" dataKey="sales" stroke="#111111" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="orders" stroke="#737373" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
