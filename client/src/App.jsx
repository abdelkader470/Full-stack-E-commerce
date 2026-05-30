import { useEffect } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { Auth } from "./pages/Auth";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { OrderHistory } from "./pages/OrderHistory";
import { ProductDetails } from "./pages/ProductDetails";
import { Products } from "./pages/Products";
import { Profile } from "./pages/Profile";
import { Wishlist } from "./pages/Wishlist";
import { isRtl } from "./lib/i18n";
import { useAuthStore } from "./store/useAuthStore";
import { useUiStore } from "./store/useUiStore";

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "products", element: <Products /> },
        { path: "products/:idOrSlug", element: <ProductDetails /> },
        { path: "cart", element: <Cart /> },
        { path: "wishlist", element: <Wishlist /> },
        { path: "login", element: <Auth mode="login" /> },
        { path: "register", element: <Auth mode="register" /> },
        {
          element: <ProtectedRoute />,
          children: [
            { path: "profile", element: <Profile /> },
            { path: "checkout", element: <Checkout /> },
            { path: "orders", element: <OrderHistory /> }
          ]
        },
        {
          element: <ProtectedRoute role="admin" />,
          children: [{ path: "admin", element: <AdminDashboard /> }]
        },
        { path: "*", element: <Navigate to="/" replace /> }
      ]
    }
  ],
  {
    future: {
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

export default function App() {
  const language = useAuthStore((state) => state.language);
  const initTheme = useUiStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl(language) ? "rtl" : "ltr";
  }, [language]);

  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
