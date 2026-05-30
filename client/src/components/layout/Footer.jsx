import { Facebook, Instagram, Linkedin, Send, ShieldCheck, Truck } from "lucide-react";
import { api } from "../../lib/api";
import { t } from "../../lib/i18n";
import { useAuthStore } from "../../store/useAuthStore";
import { Button } from "../ui/Button";

export function Footer() {
  const language = useAuthStore((state) => state.language);

  const subscribe = async (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    await api.post("/admin/newsletter", { email }).catch(() => null);
    event.currentTarget.reset();
  };

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.2fr] lg:px-8">
        <div>
          <p className="flex items-center gap-2 text-xl font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm text-white dark:bg-white dark:text-ink">ML</span>
            Market<span className="text-brand-600">lane</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {t(language, "footerDescription")}
          </p>
          <div className="mt-5 flex gap-2">
            {[Instagram, Facebook, Linkedin].map((Icon, index) => (
              <a key={index} href="https://www.instagram.com" className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-brand-200 hover:text-brand-700 dark:border-slate-800 dark:text-slate-300">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-extrabold">{t(language, "shop")}</h2>
          <nav className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <a className="block hover:text-brand-700" href="/products">{t(language, "allProducts")}</a>
            <a className="block hover:text-brand-700" href="/products?bestSeller=true">{t(language, "bestSellers")}</a>
            <a className="block hover:text-brand-700" href="/products?flashSale=true">{t(language, "flashDeals")}</a>
            <a className="block hover:text-brand-700" href="/wishlist">{t(language, "wishlist")}</a>
          </nav>
        </div>
        <div>
          <h2 className="font-extrabold">{t(language, "support")}</h2>
          <nav className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <a className="block hover:text-brand-700" href="/orders">{t(language, "orderTracking")}</a>
            <a className="block hover:text-brand-700" href="/profile">{t(language, "account")}</a>
            <a className="block hover:text-brand-700" href="/checkout">{t(language, "checkout")}</a>
            <a className="block hover:text-brand-700" href="/admin">{t(language, "admin")}</a>
          </nav>
        </div>
        <div>
          <h2 className="font-extrabold">{t(language, "launchNewsletter")}</h2>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t(language, "newsletterCopy")}</p>
        </div>
        <form onSubmit={subscribe} className="flex flex-col gap-3 lg:col-start-4">
          <input
            name="email"
            type="email"
            required
            className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-200 bg-mist px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
            placeholder={t(language, "newsletterPlaceholder")}
          />
          <Button variant="accent" type="submit">
            <Send className="h-4 w-4" /> {t(language, "subscribe")}
          </Button>
        </form>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{t(language, "copyright")}</p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4" /> {t(language, "fastShipping")}</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> {t(language, "secureCheckout")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
