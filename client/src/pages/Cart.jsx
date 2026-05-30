import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState, LoadingState } from "../components/ui/State";
import { money } from "../lib/api";
import { useShopStore } from "../store/useShopStore";

export function Cart() {
  const { cart, cartLoading, cartError, updateQuantity, removeFromCart, fetchCart } = useShopStore();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (cartLoading && cart.length === 0) {
    return <LoadingState label="Loading cart" />;
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="Your cart is empty" body="Add clothing to start a secure checkout." action={<Link to="/products"><Button variant="accent">Shop clothing</Button></Link>} />
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div>
        <h1 className="mb-6 text-4xl font-extrabold">Shopping bag</h1>
        {cartError && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{cartError}</p>}
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item._id} className="flex gap-4 rounded-lg bg-white p-4 shadow-sm dark:bg-slate-900">
              <img src={item.images?.[0]?.url} alt={item.name} className="h-24 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <h2 className="font-bold">{item.name}</h2>
                <p className="text-sm text-slate-500">{money(item.price)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="rounded-lg border p-2 dark:border-slate-700" onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <button className="rounded-lg border p-2 dark:border-slate-700" onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button className="self-start rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => removeFromCart(item._id)}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <aside className="h-fit rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="text-xl font-extrabold">Order summary</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{subtotal > 100 ? "Free" : money(9.95)}</dd></div>
          <div className="flex justify-between"><dt>Estimated tax</dt><dd>{money(subtotal * 0.08)}</dd></div>
          <div className="border-t pt-3 text-lg font-extrabold dark:border-slate-800 flex justify-between"><dt>Total</dt><dd>{money(subtotal + (subtotal > 100 ? 0 : 9.95) + subtotal * 0.08)}</dd></div>
        </dl>
        <Link to="/checkout" className="mt-6 block">
          <Button className="w-full" variant="accent">Checkout clothing</Button>
        </Link>
      </aside>
    </section>
  );
}
