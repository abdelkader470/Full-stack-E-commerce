import { create } from "zustand";
import { api } from "../lib/api";
import { categories as mockCategories, products as mockProducts } from "../lib/mockData";

const tokenExists = () => Boolean(localStorage.getItem("marketlane-token"));

const normalizeCart = (cartData) =>
  (cartData?.items || []).map((item) => {
    const product = item.product || item;
    const image = item.image || product.images?.[0]?.url;
    return {
      ...product,
      _id: product._id,
      name: item.name || product.name,
      price: item.price ?? product.price,
      quantity: item.quantity || 1,
      selectedOptions: item.selectedOptions || {},
      variantId: item.variantId,
      images: image ? [{ url: image, alt: item.name || product.name }] : product.images || []
    };
  });

const saveLocalCart = (cart) => localStorage.setItem("marketlane-cart", JSON.stringify(cart));
const saveLocalWishlist = (wishlist) => localStorage.setItem("marketlane-wishlist", JSON.stringify(wishlist));

export const useShopStore = create((set, get) => ({
  products: [],
  categories: [],
  cart: JSON.parse(localStorage.getItem("marketlane-cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("marketlane-wishlist") || "[]"),
  recentlyViewed: JSON.parse(localStorage.getItem("marketlane-recent") || "[]"),
  loading: false,
  cartLoading: false,
  orderLoading: false,
  error: "",
  cartError: "",
  fetchCatalog: async (params = {}) => {
    set({ loading: true, error: "" });
    try {
      const query = new URLSearchParams(params).toString();
      const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
        api.get(`/products${query ? `?${query}` : ""}`),
        api.get("/categories")
      ]);
      set({
        products: productsData.items || productsData,
        categories: categoriesData,
        loading: false
      });
    } catch {
      set({
        products: mockProducts,
        categories: mockCategories,
        loading: false,
        error: "Showing demo clothing catalog until the API is running."
      });
    }
  },
  fetchCart: async () => {
    if (!tokenExists()) return;
    set({ cartLoading: true, cartError: "" });
    try {
      const { data } = await api.get("/cart");
      const cart = normalizeCart(data);
      saveLocalCart(cart);
      set({ cart, cartLoading: false });
    } catch (error) {
      set({ cartError: error.message, cartLoading: false });
    }
  },
  fetchWishlist: async () => {
    if (!tokenExists()) return;
    try {
      const { data } = await api.get("/cart/wishlist");
      const wishlist = data.products || [];
      saveLocalWishlist(wishlist);
      set({ wishlist });
    } catch (error) {
      set({ cartError: error.message });
    }
  },
  hydrateUserData: async () => {
    await get().syncLocalCartToServer();
    await Promise.all([get().fetchCart(), get().fetchWishlist()]);
  },
  syncLocalCartToServer: async () => {
    if (!tokenExists()) return;
    const localCart = JSON.parse(localStorage.getItem("marketlane-cart") || "[]");
    if (localCart.length === 0) return;
    await Promise.all(
      localCart.map((item) =>
        api
          .post("/cart/items", {
            productId: item._id,
            quantity: item.quantity || 1,
            variantId: item.variantId,
            selectedOptions: item.selectedOptions || {}
          })
          .catch(() => null)
      )
    );
  },
  addToCart: async (product, quantity = 1, selectedOptions = {}) => {
    const variantId = selectedOptions?._id || selectedOptions?.variantId;
    const options = {
      size: selectedOptions?.size,
      color: selectedOptions?.color
    };

    if (tokenExists()) {
      set({ cartLoading: true, cartError: "" });
      try {
        const { data } = await api.post("/cart/items", {
          productId: product._id,
          quantity,
          variantId,
          selectedOptions: options
        });
        const cart = normalizeCart(data);
        saveLocalCart(cart);
        set({ cart, cartLoading: false });
        return;
      } catch (error) {
        set({ cartError: error.message, cartLoading: false });
      }
    }

    const cart = [...get().cart];
    const existing = cart.find((item) => item._id === product._id && String(item.variantId || "") === String(variantId || ""));
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity, selectedOptions: options, variantId });
    saveLocalCart(cart);
    set({ cart });
  },
  updateQuantity: async (productId, quantity) => {
    if (tokenExists()) {
      try {
        const { data } = await api.put(`/cart/items/${productId}`, { quantity });
        const cart = normalizeCart(data);
        saveLocalCart(cart);
        set({ cart });
        return;
      } catch (error) {
        set({ cartError: error.message });
      }
    }

    const cart = get().cart.map((item) => (item._id === productId ? { ...item, quantity } : item));
    saveLocalCart(cart);
    set({ cart });
  },
  removeFromCart: async (productId) => {
    if (tokenExists()) {
      try {
        const { data } = await api.delete(`/cart/items/${productId}`);
        const cart = normalizeCart(data);
        saveLocalCart(cart);
        set({ cart });
        return;
      } catch (error) {
        set({ cartError: error.message });
      }
    }

    const cart = get().cart.filter((item) => item._id !== productId);
    saveLocalCart(cart);
    set({ cart });
  },
  applyCoupon: async (code) => {
    if (!tokenExists() || !code) return null;
    const { data } = await api.post("/cart/coupon", { code });
    return data.coupon;
  },
  clearCart: () => {
    localStorage.removeItem("marketlane-cart");
    set({ cart: [] });
  },
  resetUserData: () => {
    localStorage.removeItem("marketlane-cart");
    localStorage.removeItem("marketlane-wishlist");
    set({ cart: [], wishlist: [] });
  },
  toggleWishlist: async (product) => {
    if (tokenExists()) {
      try {
        const { data } = await api.put(`/cart/wishlist/${product._id}`);
        const wishlist = data.products || [];
        saveLocalWishlist(wishlist);
        set({ wishlist });
        return;
      } catch (error) {
        set({ cartError: error.message });
      }
    }

    const exists = get().wishlist.some((item) => item._id === product._id);
    const wishlist = exists
      ? get().wishlist.filter((item) => item._id !== product._id)
      : [...get().wishlist, product];
    saveLocalWishlist(wishlist);
    set({ wishlist });
  },
  createOrder: async ({ shippingAddress, paymentMethod = "card" }) => {
    set({ orderLoading: true, cartError: "" });
    try {
      const { data } = await api.post("/orders", { shippingAddress, paymentMethod });
      get().clearCart();
      set({ orderLoading: false });
      return data;
    } catch (error) {
      set({ cartError: error.message, orderLoading: false });
      throw error;
    }
  },
  trackViewed: (product) => {
    const recent = [product, ...get().recentlyViewed.filter((item) => item._id !== product._id)].slice(0, 4);
    localStorage.setItem("marketlane-recent", JSON.stringify(recent));
    set({ recentlyViewed: recent });
  }
}));
