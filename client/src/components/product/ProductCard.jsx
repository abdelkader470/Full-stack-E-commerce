import { Heart, ShoppingBag, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { money } from "../../lib/api";
import { useShopStore } from "../../store/useShopStore";
import { Button } from "../ui/Button";

export function ProductCard({ product }) {
  const { addToCart, toggleWishlist, wishlist } = useShopStore();
  const liked = wishlist.some((item) => item._id === product._id);
  const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80";
  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;
  const lowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;
  const inStock = product.stock === undefined || product.stock === null || Number(product.stock) > 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900">
      <Link to={`/products/${product.slug || product._id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {discount > 0 && (
              <span className="rounded-full bg-coral px-2.5 py-1 text-xs font-extrabold text-white">
                -{discount}%
              </span>
            )}
            {product.isFlashSale && (
              <span className="inline-flex items-center gap-1 rounded-full bg-saffron px-2.5 py-1 text-xs font-extrabold text-ink">
                <Zap className="h-3 w-3" /> Deal
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-brand-600">{product.brand}</p>
            <Link to={`/products/${product.slug || product._id}`} className="mt-1 block font-extrabold leading-snug hover:text-brand-600">
              {product.name}
            </Link>
          </div>
          <button
            aria-label="Save style"
            onClick={() => toggleWishlist(product)}
            className={`rounded-lg p-2 transition ${liked ? "bg-coral text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-lg font-extrabold">{money(product.price)}</span>
            {product.compareAtPrice && (
              <span className="ml-2 text-xs text-slate-400 line-through">{money(product.compareAtPrice)}</span>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-saffron/15 px-2 py-1 text-xs font-bold text-ink dark:text-saffron">
            <Star className="h-4 w-4 fill-saffron text-saffron" /> {product.rating || "New"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className={`font-bold ${lowStock ? "text-coral" : "text-slate-500 dark:text-slate-400"}`}>
            {inStock ? (lowStock ? `Only ${product.stock} left` : "In stock") : "Out of stock"}
          </span>
          <span className="text-slate-400">{product.category?.name}</span>
        </div>
        <Button className="w-full" variant="accent" onClick={() => addToCart(product)} disabled={!inStock}>
          <ShoppingBag className="h-4 w-4" /> Add to bag
        </Button>
      </div>
    </article>
  );
}
