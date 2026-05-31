import { FileText, Printer, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyState, LoadingState } from "../components/ui/State";
import { api, money } from "../lib/api";

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : "Not available");

function AddressBlock({ address }) {
  if (!address) return <p className="text-sm text-slate-500">No shipping address saved.</p>;

  return (
    <address className="not-italic text-sm leading-6 text-slate-600 dark:text-slate-300">
      <strong className="block text-black dark:text-white">{address.fullName}</strong>
      {address.line1}
      {address.line2 && <>, {address.line2}</>}
      <br />
      {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
      <br />
      {address.country}
      {address.phone && <span className="block">Phone: {address.phone}</span>}
    </address>
  );
}

function InvoiceModal({ invoice, onClose }) {
  if (!invoice) return null;

  const printInvoice = () => {
    document.body.classList.add("invoice-printing");
    const cleanup = () => {
      document.body.classList.remove("invoice-printing");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    window.setTimeout(cleanup, 1000);
  };

  return (
    <div className="invoice-print-layer fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex justify-end gap-2 print:hidden">
          <Button type="button" variant="outline" onClick={printInvoice}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button type="button" variant="primary" onClick={onClose}>
            <X className="h-4 w-4" /> Close
          </Button>
        </div>

        <article className="invoice-sheet overflow-hidden rounded-lg bg-white shadow-editorial dark:bg-neutral-950">
          <header className="grid gap-6 border-b border-neutral-200 p-8 dark:border-neutral-800 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase text-neutral-500">Marketlane Clothing</p>
              <h2 className="mt-2 text-4xl font-extrabold text-black dark:text-white">Invoice</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Professional receipt for your clothing order. Keep this invoice for payment, delivery, and return reference.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 text-sm dark:border-neutral-800">
              <dl className="space-y-2">
                <div className="flex justify-between gap-8">
                  <dt className="text-slate-500">Invoice</dt>
                  <dd className="font-extrabold">{invoice.invoiceNumber}</dd>
                </div>
                <div className="flex justify-between gap-8">
                  <dt className="text-slate-500">Order</dt>
                  <dd className="font-extrabold">#{invoice.orderNumber}</dd>
                </div>
                <div className="flex justify-between gap-8">
                  <dt className="text-slate-500">Issued</dt>
                  <dd>{formatDate(invoice.issuedAt)}</dd>
                </div>
                <div className="flex justify-between gap-8">
                  <dt className="text-slate-500">Order date</dt>
                  <dd>{formatDate(invoice.orderDate)}</dd>
                </div>
              </dl>
            </div>
          </header>

          <section className="grid gap-6 border-b border-neutral-200 p-8 dark:border-neutral-800 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-extrabold uppercase">Bill to</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                <strong className="block text-black dark:text-white">{invoice.customer?.name || "Customer"}</strong>
                {invoice.customer?.email}
                {invoice.customer?.phone && <span className="block">Phone: {invoice.customer.phone}</span>}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase">Ship to</h3>
              <div className="mt-3">
                <AddressBlock address={invoice.shippingAddress} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase">Status</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Payment</dt>
                  <dd className="font-bold capitalize">{invoice.payment?.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Method</dt>
                  <dd className="font-bold capitalize">{invoice.payment?.method}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Fulfillment</dt>
                  <dd className="font-bold capitalize">{invoice.fulfillment?.status}</dd>
                </div>
                {invoice.fulfillment?.trackingNumber && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Tracking</dt>
                    <dd className="font-bold">{invoice.fulfillment.trackingNumber}</dd>
                  </div>
                )}
              </dl>
            </div>
          </section>

          <section className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-neutral-200 text-xs uppercase text-slate-500 dark:border-neutral-800">
                  <tr>
                    <th className="py-3">Item</th>
                    <th className="py-3">Size / Color</th>
                    <th className="py-3 text-right">Unit</th>
                    <th className="py-3 text-right">Qty</th>
                    <th className="py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {invoice.items.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          {item.image && <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover print:hidden" />}
                          <span className="font-bold">{item.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500">
                        {[item.selectedOptions?.size, item.selectedOptions?.color].filter(Boolean).join(" / ") || "Standard"}
                      </td>
                      <td className="py-4 text-right">{money(item.price)}</td>
                      <td className="py-4 text-right">{item.quantity}</td>
                      <td className="py-4 text-right font-bold">{money(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[1fr_340px]">
              <div className="rounded-lg bg-neutral-50 p-5 text-sm leading-6 text-slate-600 dark:bg-neutral-900 dark:text-slate-300">
                <h3 className="font-extrabold text-black dark:text-white">Notes</h3>
                <p className="mt-2">
                  Returns and exchanges follow the order status and clothing condition policy. Include this invoice number when contacting support.
                </p>
                {invoice.couponCode && <p className="mt-2 font-bold">Coupon applied: {invoice.couponCode}</p>}
              </div>
              <dl className="space-y-3 rounded-lg border border-neutral-200 p-5 text-sm dark:border-neutral-800">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd>{money(invoice.totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd>{money(invoice.totals.shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tax</dt>
                  <dd>{money(invoice.totals.tax)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Discount</dt>
                  <dd>-{money(invoice.totals.discount)}</dd>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-4 text-xl font-extrabold dark:border-neutral-800">
                  <dt>Total</dt>
                  <dd>{money(invoice.totals.total)}</dd>
                </div>
              </dl>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState("");
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/mine");
        setOrders(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const openInvoice = async (orderId) => {
    setError("");
    setInvoiceLoading(orderId);
    try {
      const { data } = await api.get(`/orders/${orderId}/invoice`);
      setInvoice(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setInvoiceLoading("");
    }
  };

  if (loading) return <LoadingState label="Loading clothing orders" />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold">Clothing order history</h1>
      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No clothing orders yet" body="Checkout with a saved outfit and it will appear here." />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-sm dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-extrabold">Clothing order #{order._id.slice(-8).toUpperCase()}</h2>
                <p className="text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()} - {order.orderStatus} - {order.paymentStatus} - {money(order.totalPrice)}
                </p>
                {order.trackingNumber && <p className="mt-1 text-sm text-black dark:text-white">Tracking: {order.trackingNumber}</p>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><Truck className="h-4 w-4" /> {order.orderStatus}</Button>
                <Button variant="outline" onClick={() => openInvoice(order._id)} disabled={invoiceLoading === order._id}>
                  <FileText className="h-4 w-4" /> {invoiceLoading === order._id ? "Opening" : "Invoice"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <InvoiceModal invoice={invoice} onClose={() => setInvoice(null)} />
    </section>
  );
}
