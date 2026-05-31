import { Loader2, PackageSearch } from "lucide-react";

export function LoadingState({ label = "Loading" }) {
  return (
    <div className="flex min-h-64 items-center justify-center text-slate-500">
      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
      <PackageSearch className="h-10 w-10 text-black dark:text-white" />
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
