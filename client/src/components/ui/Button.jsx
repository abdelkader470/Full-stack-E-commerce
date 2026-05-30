export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-ink text-white hover:bg-slate-800 dark:bg-white dark:text-ink dark:hover:bg-slate-100",
    accent: "bg-brand-600 text-white hover:bg-brand-700",
    outline:
      "border border-slate-200 bg-white text-ink hover:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white",
    ghost: "text-ink hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
  };

  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
