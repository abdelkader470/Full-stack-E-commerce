import { FileText, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { EmptyState, LoadingState } from "../components/ui/State";
import { api, money } from "../lib/api";

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const { data } = await api.get(`/orders/${orderId}/invoice`);
      alert(`Invoice ${data.invoiceNumber}\nTotal: ${money(data.totals.total)}`);
    } catch (requestError) {
      setError(requestError.message);
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
                <Button variant="outline" onClick={() => openInvoice(order._id)}><FileText className="h-4 w-4" /> Invoice</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
