import { Heart, Menu, Moon, Search, ShoppingBag, Sparkles, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { t } from "../../lib/i18n";
import { useAuthStore } from "../../store/useAuthStore";
import { useShopStore } from "../../store/useShopStore";
import { useUiStore } from "../../store/useUiStore";
import { Button } from "../ui/Button";

const navLink = ({ isActive }) =>
  `text-sm font-semibold transition ${isActive ? "text-brand-600" : "text-slate-600 hover:text-ink dark:text-slate-300 dark:hover:text-white"}`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user, logout, language, setLanguage } = useAuthStore();
  const { cart, wishlist, resetUserData } = useShopStore();
  const { theme, toggleTheme } = useUiStore();

  const submit = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    resetUserData();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/92 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/92">
      <div className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-bold sm:px-6 lg:px-8">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          {t(language, "promo")}
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-normal">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-sm text-white shadow-sm dark:bg-white dark:text-ink">
            ML
          </span>
          <span>
            Market<span className="text-brand-600">lane</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          <NavLink className={navLink} to="/products">
            {t(language, "shop")}
          </NavLink>
          <NavLink className={navLink} to="/products?bestSeller=true">
            {t(language, "bestSellers")}
          </NavLink>
          <NavLink className={navLink} to="/products?flashSale=true">
            {t(language, "deals")}
          </NavLink>
          <NavLink className={navLink} to="/wishlist">
            {t(language, "wishlist")}
          </NavLink>
          {user?.role === "admin" && (
            <NavLink className={navLink} to="/admin">
              {t(language, "admin")}
            </NavLink>
          )}
        </nav>
        <form onSubmit={submit} className="hidden min-w-0 flex-1 md:block">
          <label className="relative block">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="focus-ring w-full rounded-lg border border-slate-200 bg-mist py-2.5 pe-3 ps-10 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900"
              placeholder={t(language, "searchProducts")}
            />
          </label>
        </form>
        <select
          aria-label={t(language, "language")}
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="hidden rounded-lg border border-slate-200 bg-white px-2 py-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-900 sm:block"
        >
          <option value="en">EN</option>
          <option value="ar">AR</option>
        </select>
        <Button variant="ghost" aria-label={t(language, "toggleTheme")} onClick={toggleTheme} className="px-3">
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Link to="/wishlist" className="relative rounded-lg p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t(language, "wishlist")}>
          <Heart className="h-5 w-5" />
          {wishlist.length > 0 && <span className="absolute end-0 top-0 h-2.5 w-2.5 rounded-full bg-coral" />}
        </Link>
        <Link to="/cart" className="relative rounded-lg p-2.5 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t(language, "cart")}>
          <ShoppingBag className="h-5 w-5" />
          {cart.length > 0 && (
            <span className="absolute -end-1 -top-1 rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
              {cart.length}
            </span>
          )}
        </Link>
        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/profile" className="rounded-lg p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={t(language, "profile")}>
              <UserRound className="h-5 w-5" />
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              {t(language, "logout")}
            </Button>
          </div>
        ) : (
          <Link to="/login" className="hidden sm:block">
            <Button variant="accent">{t(language, "signIn")}</Button>
          </Link>
        )}
        <Button variant="ghost" className="px-3 md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      {open && (
        <div className="space-y-4 border-t border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <form onSubmit={submit}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="focus-ring w-full rounded-lg border border-slate-200 bg-mist px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder={t(language, "searchShort")}
            />
          </form>
          <select
            aria-label={t(language, "language")}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="focus-ring w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          <NavLink className={navLink} to="/products">
            {t(language, "shop")}
          </NavLink>
          <NavLink className={`${navLink({ isActive: false })} ms-5`} to="/products?flashSale=true">
            {t(language, "deals")}
          </NavLink>
          <NavLink className={`${navLink({ isActive: false })} ms-5`} to="/profile">
            {t(language, "profile")}
          </NavLink>
          {!user && (
            <Link to="/login" className="block">
              <Button variant="accent" className="w-full">
                {t(language, "signIn")}
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
