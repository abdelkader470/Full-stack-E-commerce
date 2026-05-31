export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100",
    accent: "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-100",
    outline:
      "border border-neutral-300 bg-white text-black hover:border-black hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white dark:hover:border-white",
    ghost: "text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-900"
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
