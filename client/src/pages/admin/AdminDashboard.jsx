import {
  BarChart3,
  Boxes,
  CheckCircle2,
  Layers3,
  LayoutDashboard,
  PackagePlus,
  Percent,
  RefreshCw,
  ShoppingCart,
  Tags,
  Trash2,
  UsersRound
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { EmptyState, LoadingState } from "../../components/ui/State";
import { api, money } from "../../lib/api";
import { useShopStore } from "../../store/useShopStore";
import { ReportsPage } from "./ReportsPage";

const emptyProduct = {
  name: "",
  brand: "",
  description: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  image: "",
  isFeatured: false,
  isBestSeller: false,
  isFlashSale: false
};

const emptyCategory = {
  name: "",
  description: "",
  image: "",
  isFeatured: true
};

const emptyCoupon = {
  code: "",
  type: "percentage",
  value: "",
  minOrderValue: "",
  usageLimit: ""
};

const inputClass =
  "focus-ring w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-950";
const smallInputClass =
  "focus-ring w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold shadow-inner dark:border-slate-700 dark:bg-slate-950";
const panelClass =
  "rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900";
const labelClass = "mb-1 block text-xs font-extrabold uppercase text-slate-500";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function AdminDashboard({ initialSection = "overview" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, categories, fetchCatalog } = useShopStore();
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeSection, setActiveSection] = useState(initialSection);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [couponForm, setCouponForm] = useState(emptyCoupon);

  const loadAdminData = useCallback(async () => {
    setError("");
    try {
      await fetchCatalog();
      const [
        { data: analyticsData },
        { data: ordersData },
        { data: couponsData },
        { data: usersData }
      ] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/orders"),
        api.get("/admin/coupons"),
        api.get("/admin/users")
      ]);
      setAnalytics(analyticsData);
      setOrders(ordersData);
      setCoupons(couponsData);
      setUsers(usersData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [fetchCatalog]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    setActiveSection(initialSection);
  }, [initialSection]);

  const stats = useMemo(
    () => [
      { label: "Revenue", value: money(analytics?.revenue || 0), icon: BarChart3, tone: "text-black dark:text-white" },
      { label: "Orders", value: analytics?.orders || 0, icon: ShoppingCart, tone: "text-neutral-700 dark:text-neutral-200" },
      { label: "Customers", value: analytics?.customers || 0, icon: UsersRound, tone: "text-neutral-500 dark:text-neutral-400" },
      { label: "Low stock", value: analytics?.lowStock?.length || 0, icon: Boxes, tone: "text-red-500" }
    ],
    [analytics]
  );

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, count: null },
    { id: "reports", label: "Reports", icon: BarChart3, count: null },
    { id: "products", label: "Clothing", icon: PackagePlus, count: products.length },
    { id: "categories", label: "Categories", icon: Layers3, count: categories.length },
    { id: "coupons", label: "Coupons", icon: Percent, count: coupons.length },
    { id: "orders", label: "Orders", icon: ShoppingCart, count: orders.length },
    { id: "users", label: "Users", icon: UsersRound, count: users.length }
  ];

  const runAction = async (message, action) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(message);
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();
    await runAction("Clothing item created.", async () => {
      await api.post("/products", {
        name: productForm.name,
        brand: productForm.brand,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : undefined,
        stock: Number(productForm.stock || 0),
        images: productForm.image ? [{ url: productForm.image, alt: productForm.name }] : [],
        isFeatured: productForm.isFeatured,
        isBestSeller: productForm.isBestSeller,
        isFlashSale: productForm.isFlashSale,
        status: "active"
      });
      setProductForm(emptyProduct);
    });
  };

  const updateProductDetails = async (product, patch, message = "Clothing item updated.") => {
    await runAction(message, async () => {
      await api.put(`/products/${product._id}`, {
        name: product.name,
        brand: product.brand,
        description: product.description,
        category: product.category?._id || product.category,
        price: patch.price !== undefined ? Number(patch.price) : product.price,
        compareAtPrice:
          patch.compareAtPrice !== undefined ? Number(patch.compareAtPrice || 0) : product.compareAtPrice,
        stock: patch.stock !== undefined ? Number(patch.stock) : product.stock,
        images: product.images,
        variants: product.variants,
        isFeatured: product.isFeatured,
        isBestSeller: product.isBestSeller,
        isFlashSale: product.isFlashSale,
        status: product.status || "active"
      });
    });
  };

  const archiveProduct = async (productId) => {
    await runAction("Clothing item archived.", async () => {
      await api.delete(`/products/${productId}`);
    });
  };

  const createCategory = async (event) => {
    event.preventDefault();
    await runAction("Category created.", async () => {
      await api.post("/categories", categoryForm);
      setCategoryForm(emptyCategory);
    });
  };

  const deleteCategory = async (categoryId) => {
    await runAction("Category deleted.", async () => {
      await api.delete(`/categories/${categoryId}`);
    });
  };

  const createCoupon = async (event) => {
    event.preventDefault();
    await runAction("Coupon created.", async () => {
      await api.post("/admin/coupons", {
        code: couponForm.code,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrderValue: Number(couponForm.minOrderValue || 0),
        usageLimit: Number(couponForm.usageLimit || 100)
      });
      setCouponForm(emptyCoupon);
    });
  };

  const deleteCoupon = async (couponId) => {
    await runAction("Coupon deleted.", async () => {
      await api.delete(`/admin/coupons/${couponId}`);
    });
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    await runAction("Order status updated.", async () => {
      const { data } = await api.put(`/orders/${orderId}/status`, { orderStatus });
      setOrders((current) => current.map((order) => (order._id === orderId ? data : order)));
    });
  };

  const updateUser = async (userId, patch) => {
    await runAction("User updated.", async () => {
      await api.put(`/admin/users/${userId}`, patch);
    });
  };

  if (loading) return <LoadingState label="Loading admin dashboard" />;

  const renderStats = () => (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <Icon className={`h-6 w-6 ${tone}`} />
            <span className="rounded-full bg-mist px-2 py-1 text-xs font-bold text-slate-500 dark:bg-slate-950">
              Live
            </span>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-extrabold">{value}</p>
        </div>
      ))}
    </div>
  );

  const renderProductForm = () => (
    <form onSubmit={createProduct} className={panelClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">Add clothing</h2>
          <p className="mt-1 text-sm text-slate-500">Create clothing items with pricing, stock, image and merchandising flags.</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-extrabold text-black dark:bg-white/10 dark:text-white">
          Catalog
        </span>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Clothing name">
          <input className={inputClass} required placeholder="Atelier Satin Midi Dress" value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
        </Field>
        <Field label="Brand">
          <input className={inputClass} placeholder="Atelier Muse" value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} />
        </Field>
        <Field label="Category">
          <select className={inputClass} required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>{category.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Price">
          <input className={inputClass} required type="number" min="0" step="0.01" placeholder="249.00" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} />
        </Field>
        <Field label="Compare at price">
          <input className={inputClass} type="number" min="0" step="0.01" placeholder="299.00" value={productForm.compareAtPrice} onChange={(event) => setProductForm({ ...productForm, compareAtPrice: event.target.value })} />
        </Field>
        <Field label="Stock">
          <input className={inputClass} required type="number" min="0" placeholder="24" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} />
        </Field>
        <Field label="Image URL">
          <input className={`${inputClass} sm:col-span-2`} placeholder="https://..." value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} />
        </Field>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Description</span>
          <textarea className={inputClass} required rows={3} placeholder="Premium clothing description" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {[
          ["Featured", "isFeatured"],
          ["Best seller", "isBestSeller"],
          ["Flash sale", "isFlashSale"]
        ].map(([label, key]) => (
          <label key={key} className="inline-flex items-center gap-2 font-semibold">
            <input type="checkbox" checked={productForm[key]} onChange={(event) => setProductForm({ ...productForm, [key]: event.target.checked })} />
            {label}
          </label>
        ))}
      </div>
      <Button className="mt-5" variant="accent" disabled={saving}>
        <PackagePlus className="h-4 w-4" /> Create clothing
      </Button>
    </form>
  );

  const renderProductsTable = () => (
    <div className={panelClass}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold">Manage clothing</h2>
          <p className="mt-1 text-sm text-slate-500">Edit price, compare-at price, and stock inline. Changes save when the field loses focus.</p>
        </div>
        <span className="rounded-full bg-mist px-3 py-1 text-xs font-extrabold text-slate-500 dark:bg-slate-950">
          {products.length} active
        </span>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="bg-mist dark:bg-slate-950">
              <th className="px-4 py-3">Clothing</th>
              <th>Category</th>
              <th>Price</th>
              <th>Compare at</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((product) => (
              <tr key={product._id} className="transition hover:bg-neutral-50 dark:hover:bg-slate-950">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.images?.[0]?.url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=200&q=80"}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-extrabold">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.brand || "No brand"}</p>
                    </div>
                  </div>
                </td>
                <td>{product.category?.name}</td>
                <td>
                  <input
                    className={smallInputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.price}
                    onBlur={(event) => {
                      if (Number(event.target.value) !== Number(product.price)) {
                        updateProductDetails(product, { price: event.target.value }, "Clothing price updated.");
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    className={smallInputClass}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={product.compareAtPrice || ""}
                    onBlur={(event) => {
                      if (Number(event.target.value || 0) !== Number(product.compareAtPrice || 0)) {
                        updateProductDetails(product, { compareAtPrice: event.target.value }, "Compare-at price updated.");
                      }
                    }}
                  />
                </td>
                <td>
                  <input
                    className={smallInputClass}
                    type="number"
                    min="0"
                    defaultValue={product.stock}
                    onBlur={(event) => {
                      if (Number(event.target.value) !== Number(product.stock)) {
                        updateProductDetails(product, { stock: event.target.value }, "Clothing stock updated.");
                      }
                    }}
                  />
                </td>
                <td>
                  <button type="button" onClick={() => archiveProduct(product._id)} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCategoryPanel = () => (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={createCategory} className={panelClass}>
        <h2 className="text-xl font-extrabold">Add category</h2>
        <p className="mt-1 text-sm text-slate-500">Create clothing departments used by storefront filters and style cards.</p>
        <div className="mt-4 space-y-3">
          <Field label="Category name">
            <input className={inputClass} required placeholder="Women" value={categoryForm.name} onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })} />
          </Field>
          <Field label="Image URL">
            <input className={inputClass} placeholder="https://..." value={categoryForm.image} onChange={(event) => setCategoryForm({ ...categoryForm, image: event.target.value })} />
          </Field>
          <label className="block">
            <span className={labelClass}>Description</span>
            <textarea className={inputClass} rows={2} placeholder="Short category description" value={categoryForm.description} onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })} />
          </label>
        </div>
        <Button className="mt-4" variant="outline" disabled={saving}>Create category</Button>
      </form>

      <div className={panelClass}>
        <h2 className="text-xl font-extrabold">Categories</h2>
        <div className="mt-4 space-y-2 text-sm">
          {categories.map((category) => (
            <div key={category._id} className="flex items-center justify-between rounded-lg bg-mist p-3 dark:bg-slate-950">
              <div>
                <span className="font-bold">{category.name}</span>
                <p className="text-xs text-slate-500">{category.description}</p>
              </div>
              <button type="button" onClick={() => deleteCategory(category._id)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCouponPanel = () => (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <form onSubmit={createCoupon} className={panelClass}>
        <h2 className="text-xl font-extrabold">Add coupon</h2>
        <p className="mt-1 text-sm text-slate-500">Launch percentage or fixed-value promotions.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Code">
            <input className={inputClass} required placeholder="WELCOME10" value={couponForm.code} onChange={(event) => setCouponForm({ ...couponForm, code: event.target.value.toUpperCase() })} />
          </Field>
          <Field label="Type">
            <select className={inputClass} value={couponForm.type} onChange={(event) => setCouponForm({ ...couponForm, type: event.target.value })}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </Field>
          <Field label="Value">
            <input className={inputClass} required type="number" min="0" step="0.01" placeholder="10" value={couponForm.value} onChange={(event) => setCouponForm({ ...couponForm, value: event.target.value })} />
          </Field>
          <Field label="Min order">
            <input className={inputClass} type="number" min="0" step="0.01" placeholder="100" value={couponForm.minOrderValue} onChange={(event) => setCouponForm({ ...couponForm, minOrderValue: event.target.value })} />
          </Field>
        </div>
        <Button className="mt-4" variant="outline" disabled={saving}>
          <Percent className="h-4 w-4" /> Create coupon
        </Button>
      </form>

      <div className={panelClass}>
        <h2 className="text-xl font-extrabold">Coupons</h2>
        <div className="mt-4 space-y-2 text-sm">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg bg-mist p-3 dark:bg-slate-950">
              <span className="font-bold">{coupon.code}</span>
              <span>{coupon.type === "percentage" ? `${coupon.value}%` : money(coupon.value)}</span>
              <button type="button" onClick={() => deleteCoupon(coupon._id)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrdersPanel = () => (
    <div className={panelClass}>
      <h2 className="text-xl font-extrabold">Orders</h2>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" body="Customer orders will appear here." />
      ) : (
        <div className="mt-4 grid gap-3">
          {orders.map((order) => (
            <div key={order._id} className="grid gap-3 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="font-extrabold">#{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-slate-500">{order.user?.email} - {money(order.totalPrice)} - {order.paymentStatus}</p>
              </div>
              <select
                value={order.orderStatus}
                onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
              >
                {["placed", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUsersPanel = () => (
    <div className={panelClass}>
      <h2 className="text-xl font-extrabold">Users</h2>
      <div className="mt-4 grid gap-3">
        {users.map((user) => (
          <div key={user._id} className="grid gap-3 rounded-lg border border-slate-200 p-4 text-sm dark:border-slate-800 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-extrabold">{user.name}</p>
              <p className="text-slate-500">{user.email}</p>
            </div>
            <select
              value={user.role}
              onChange={(event) => updateUser(user._id, { role: event.target.value })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="customer">customer</option>
              <option value="admin">admin</option>
            </select>
            <label className="inline-flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                checked={user.isActive}
                onChange={(event) => updateUser(user._id, { isActive: event.target.checked })}
              />
              Active
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRightContent = () => {
    if (activeSection === "overview") {
      return (
        <div className="space-y-6">
          {renderStats()}
          <div className="grid gap-6 xl:grid-cols-2">
            {renderOrdersPanel()}
            <div className={panelClass}>
              <h2 className="text-xl font-extrabold">Low stock</h2>
              <div className="mt-4 space-y-2 text-sm">
                {(analytics?.lowStock || []).length === 0 ? (
                  <p className="text-slate-500">No low-stock clothing right now.</p>
                ) : (
                  analytics.lowStock.map((product) => (
                    <div key={product._id} className="flex items-center justify-between rounded-lg bg-mist p-3 dark:bg-slate-950">
                      <span className="font-bold">{product.name}</span>
                      <span className="text-red-500">{product.stock} left</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "products") {
      return (
        <div className="space-y-6">
          {renderProductForm()}
          {renderProductsTable()}
        </div>
      );
    }

    if (activeSection === "reports") {
      return <ReportsPage categories={categories} customers={users} products={products} />;
    }

    if (activeSection === "categories") return renderCategoryPanel();
    if (activeSection === "coupons") return renderCouponPanel();
    if (activeSection === "orders") return renderOrdersPanel();
    return renderUsersPanel();
  };

  const activeLabel = navItems.find((item) => item.id === activeSection)?.label || "Overview";

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="bg-black p-5 text-white">
              <p className="text-xs font-extrabold uppercase text-white/70">Admin</p>
              <h1 className="mt-2 text-2xl font-extrabold">Marketlane</h1>
              <p className="mt-2 text-sm text-slate-300">Control clothing, orders, pricing and customers.</p>
            </div>
            <nav className="space-y-1 p-3">
              {navItems.map(({ id, label, icon: Icon, count }) => {
                const active = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setActiveSection(id);
                      if (id === "reports") {
                        navigate("/admin/reports");
                      } else if (location.pathname !== "/admin") {
                        navigate("/admin");
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-extrabold transition ${
                      active
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "text-slate-600 hover:bg-mist dark:text-slate-300 dark:hover:bg-slate-950"
                    }`}
                  >
                    <span className="inline-flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {label}
                    </span>
                    {count !== null && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-950">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <Button variant="outline" onClick={loadAdminData} disabled={saving} className="w-full">
                <RefreshCw className={`h-4 w-4 ${saving ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase text-neutral-500 dark:text-neutral-400">Workspace</p>
                <h2 className="mt-1 text-3xl font-extrabold">{activeLabel}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-sm font-bold text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <Tags className="h-4 w-4" /> Right content panel
              </span>
            </div>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            {success && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-neutral-100 p-3 text-sm font-semibold text-black dark:bg-white/10 dark:text-white">
                <CheckCircle2 className="h-4 w-4" /> {success}
              </p>
            )}
          </div>
          {renderRightContent()}
        </main>
      </div>
    </section>
  );
}
