export function ReportStatsCard({ label, value, helper, icon: Icon, trend }) {
  const positive = Number(trend) >= 0;

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-glow dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-normal text-neutral-500">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-black dark:text-white">{value}</p>
        </div>
        {Icon && (
          <span className="rounded-lg bg-neutral-100 p-2 text-black dark:bg-white/10 dark:text-white">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold">
        <span className="text-neutral-500">{helper}</span>
        {trend !== undefined && (
          <span className={positive ? "text-emerald-600" : "text-red-500"}>
            {positive ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}
