import { create } from "zustand";
import { api } from "../lib/api";

const savedUser = localStorage.getItem("marketlane-user");
const savedToken = localStorage.getItem("marketlane-token");
const savedLanguage = localStorage.getItem("marketlane-language") || "en";

export const useAuthStore = create((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  language: savedLanguage,
  loading: false,
  error: "",
  login: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const { data } = await api.post("/auth/login", payload);
      localStorage.setItem("marketlane-token", data.token);
      localStorage.setItem("marketlane-user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  register: async (payload) => {
    set({ loading: true, error: "" });
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("marketlane-token", data.token);
      localStorage.setItem("marketlane-user", JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem("marketlane-token");
    localStorage.removeItem("marketlane-user");
    localStorage.removeItem("marketlane-cart");
    localStorage.removeItem("marketlane-wishlist");
    set({ user: null, token: null });
  },
  setLanguage: (language) => {
    const supportedLanguage = language === "ar" ? "ar" : "en";
    localStorage.setItem("marketlane-language", supportedLanguage);
    set({ language: supportedLanguage });
  }
}));
