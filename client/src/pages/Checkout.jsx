import { CreditCard, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/State";
import { money } from "../lib/api";
import { useShopStore } from "../store/useShopStore";

export function Checkout() {
  const { cart, cartError, orderLoading, applyCoupon, createOrder } = useShopStore();
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [discount, setDiscount] = useState(0);
  const [formError, setFormError] = useState("");
  const total = subtotal + (subtotal > 100 ? 0 : 9.95) + subtotal * 0.08 - discount;

  const placeOrder = async (event) => {
    event.preventDefault();
    setFormError("");
    const formData = new FormData(event.currentTarget);
    try {
      await createOrder({
        shippingAddress: {
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          line1: formData.get("line1"),
          city: formData.get("city"),
          state: formData.get("state"),
          postalCode: formData.get("postalCode"),
          country: "United States"
        },
        paymentMethod: "card"
      });
      navigate("/orders");
    } catch (error) {
      setFormError(error.message);
    }
  };

  const submitCoupon = async () => {
    setCouponError("");
    try {
      const applied = await applyCoupon(coupon);
      if (!applied) return;
      const value = applied.type === "percentage" ? subtotal * (applied.value / 100) : applied.value;
      setDiscount(value);
    } catch (error) {
      setCouponError(error.message);
      setDiscount(0);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="Nothing to checkout" body="Your clothing bag is empty." />
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <form onSubmit={placeOrder} className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
        <h1 className="text-3xl font-extrabold">Secure clothing checkout</h1>
        {(formError || cartError) && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{formError || cartError}</p>}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Full name", "fullName"],
            ["Phone", "phone"],
            ["Address line", "line1"],
            ["City", "city"],
            ["State", "state"],
            ["Postal code", "postalCode"]
          ].map(([label, name]) => (
            <input
              key={label}
              name={name}
              required
              className="focus-ring rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
              placeholder={label}
            />
          ))}
        </div>
        <div className="mt-8 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-brand-600" />
            <h2 className="font-bold">Payment structure</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            The backend includes a Stripe payment-intent endpoint for production clothing orders.
          </p>
        </div>
        <Button className="mt-6 w-full sm:w-auto" variant="accent" disabled={orderLoading}>
          <LockKeyhole className="h-4 w-4" /> {orderLoading ? "Placing order" : "Place order"}
        </Button>
      </form>
      <aside className="h-fit rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
        <h2 className="text-xl font-extrabold">Clothing order summary</h2>
        <div className="mt-5 flex gap-2">
          <input
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
            className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Coupon code"
          />
          <Button type="button" variant="outline" onClick={submitCoupon}>Apply</Button>
        </div>
        {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Discount</dt><dd>-{money(discount)}</dd></div>
          <div className="flex justify-between"><dt>Tax</dt><dd>{money(subtotal * 0.08)}</dd></div>
          <div className="border-t pt-3 text-lg font-extrabold dark:border-slate-800 flex justify-between"><dt>Total</dt><dd>{money(total)}</dd></div>
        </dl>
      </aside>
    </section>
  );
}
