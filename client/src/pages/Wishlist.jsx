import { useEffect } from "react";
import { ProductCard } from "../components/product/ProductCard";
import { EmptyState } from "../components/ui/State";
import { useShopStore } from "../store/useShopStore";

export function Wishlist() {
  const { wishlist, fetchWishlist } = useShopStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-extrabold">Saved styles</h1>
      {wishlist.length === 0 ? (
        <EmptyState title="No saved styles yet" body="Tap the heart on clothing you want to save for later." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
