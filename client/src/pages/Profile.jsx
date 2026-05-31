import { MapPin, Shirt, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/useAuthStore";

export function Profile() {
  const { user } = useAuthStore();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold">Profile</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-[320px_1fr]">
        <aside className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
          <UserRound className="h-10 w-10 text-black dark:text-white" />
          <h2 className="mt-4 text-xl font-extrabold">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <p className="mt-2 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold uppercase text-black dark:bg-white/10 dark:text-white">
            {user?.role}
          </p>
        </aside>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
            <MapPin className="h-6 w-6 text-black dark:text-white" />
            <h2 className="mt-3 text-xl font-extrabold">Shipping addresses</h2>
            <p className="mt-2 text-sm text-slate-500">Manage delivery addresses through the profile API structure.</p>
            <div className="mt-4 space-y-3 text-sm">
              {(user?.addresses || []).map((address) => (
                <div key={address._id || address.line1} className="rounded-lg bg-mist p-3 dark:bg-slate-950">
                  {address.line1}, {address.city}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-slate-900">
            <Shirt className="h-6 w-6 text-black dark:text-white" />
            <h2 className="mt-3 text-xl font-extrabold">Clothing orders</h2>
            <p className="mt-2 text-sm text-slate-500">Track clothing order status, payment state, invoices, and shipment details.</p>
            <Link className="mt-5 inline-block" to="/orders">
              <Button variant="outline">View clothing orders</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
