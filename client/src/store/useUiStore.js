import { create } from "zustand";

const savedTheme = localStorage.getItem("marketlane-theme") || "light";

export const useUiStore = create((set, get) => ({
  theme: savedTheme,
  toggleTheme: () => {
    const theme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("marketlane-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
  initTheme: () => {
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }
}));
