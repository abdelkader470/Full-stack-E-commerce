if (import.meta.env.DEV) {
  const originalWarn = console.warn;

  console.warn = (...args) => {
    const message = args.map((arg) => String(arg || "")).join(" ");
    if (message.includes("React Router Future Flag Warning")) return;
    originalWarn(...args);
  };
}
