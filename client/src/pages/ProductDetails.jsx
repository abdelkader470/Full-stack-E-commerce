import { Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/State";
import { money } from "../lib/api";
import { useShopStore } from "../store/useShopStore";

export function ProductDetails() {
  const { idOrSlug } = useParams();
  const { products, fetchCatalog, addToCart, toggleWishlist, wishlist, trackViewed, recentlyViewed } = useShopStore();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const product = useMemo(
    () => products.find((item) => item.slug === idOrSlug || item._id === idOrSlug),
    [products, idOrSlug]
  );

  useEffect(() => {
    if (products.length === 0) fetchCatalog();
  }, [fetchCatalog, products.length]);

  useEffect(() => {
    if (product) trackViewed(product);
  }, [product, trackViewed]);

  if (!product) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState title="Clothing unavailable" body="This style may still be loading or has been removed." />
      </section>
    );
  }

  const liked = wishlist.some((item) => item._id === product._id);
  const related = products.filter((item) => item.category?._id === product.category?._id && item._id !== product._id).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Helmet>
        <title>{product.name} | Marketlane</title>
        <meta name="description" content={product.description} />
      </Helmet>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-lg bg-white shadow-sm dark:bg-slate-900">
          <img src={product.images?.[0]?.url} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div className="self-center">
          <p className="text-sm font-bold uppercase text-neutral-500 dark:text-neutral-400">{product.brand}</p>
          <h1 className="mt-2 text-4xl font-extrabold">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-extrabold">{money(selectedVariant?.price || product.price)}</span>
            {product.compareAtPrice && <span className="text-lg text-slate-400 line-through">{money(product.compareAtPrice)}</span>}
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold text-black dark:bg-neutral-900 dark:text-white">
              <Star className="h-4 w-4 fill-black text-black dark:fill-white dark:text-white" /> {product.rating} ({product.numReviews})
            </span>
          </div>
          <p className="mt-5 text-slate-600 dark:text-slate-300">{product.description}</p>
          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-bold">Size / color</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      selectedVariant?._id === variant._id
                        ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    {[variant.size, variant.color].filter(Boolean).join(" / ") || variant.sku}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="accent" onClick={() => addToCart(product, 1, selectedVariant || {})}>
              <ShoppingBag className="h-4 w-4" /> Add to bag
            </Button>
            <Button variant="outline" onClick={() => toggleWishlist(product)}>
              <Heart className={`h-4 w-4 ${liked ? "fill-black text-black dark:fill-white dark:text-white" : ""}`} /> Save style
            </Button>
          </div>
          <div className="mt-8 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-3">
            <span>Stock: {product.stock}</span>
            <span>Category: {product.category?.name}</span>
            <span>Checkout: Secure</span>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold">Related styles</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}
      {recentlyViewed.length > 1 && (
        <div className="mt-16">
          <h2 className="mb-4 text-xl font-extrabold">Recently viewed styles</h2>
          <div className="flex flex-wrap gap-3">
            {recentlyViewed
              .filter((item) => item._id !== product._id)
              .map((item) => (
                <Link key={item._id} to={`/products/${item.slug}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm dark:bg-slate-900">
                  {item.name}
                </Link>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
