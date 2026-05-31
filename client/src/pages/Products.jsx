import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/product/ProductCard";
import { EmptyState, LoadingState } from "../components/ui/State";
import { useShopStore } from "../store/useShopStore";

export function Products() {
  const [params] = useSearchParams();
  const queryString = params.toString();
  const { products, categories, loading, error, fetchCatalog } = useShopStore();
  const [filters, setFilters] = useState({
    search: params.get("search") || "",
    category: params.get("category") || "",
    featured: params.get("featured") || "",
    bestSeller: params.get("bestSeller") || "",
    flashSale: params.get("flashSale") || "",
    newArrivals: params.get("newArrivals") || "",
    maxPrice: "",
    sort: "-createdAt"
  });

  useEffect(() => {
    const currentParams = new URLSearchParams(queryString);
    setFilters((prev) => ({
      ...prev,
      search: currentParams.get("search") || "",
      category: currentParams.get("category") || "",
      featured: currentParams.get("featured") || "",
      bestSeller: currentParams.get("bestSeller") || "",
      flashSale: currentParams.get("flashSale") || "",
      newArrivals: currentParams.get("newArrivals") || ""
    }));
  }, [queryString]);

  useEffect(() => {
    fetchCatalog(Object.fromEntries(Object.entries(filters).filter(([, value]) => value)));
  }, [fetchCatalog, filters]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !filters.search ||
        [product.name, product.brand, product.description, product.category?.name]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(filters.search.toLowerCase()));
      const matchesCategory = !filters.category || product.category?._id === filters.category || product.category === filters.category;
      const matchesFeatured = !filters.featured || product.isFeatured === true;
      const matchesBestSeller = !filters.bestSeller || product.isBestSeller === true;
      const matchesFlashSale = !filters.flashSale || product.isFlashSale === true;
      const matchesNewArrivals =
        !filters.newArrivals ||
        !product.createdAt ||
        new Date(product.createdAt) >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
      const matchesMaxPrice = !filters.maxPrice || product.price <= Number(filters.maxPrice);
      return (
        matchesSearch &&
        matchesCategory &&
        matchesFeatured &&
        matchesBestSeller &&
        matchesFlashSale &&
        matchesNewArrivals &&
        matchesMaxPrice
      );
    });
  }, [products, filters]);

  const collectionValue =
    (filters.featured && "featured") ||
    (filters.bestSeller && "bestSeller") ||
    (filters.flashSale && "flashSale") ||
    (filters.newArrivals && "newArrivals") ||
    "";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Helmet>
        <title>Shop Clothing | Marketlane</title>
      </Helmet>
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-neutral-500 dark:text-neutral-400">Clothing store</p>
          <h1 className="text-5xl font-extrabold leading-tight">Clothing catalog</h1>
          {error && <p className="mt-2 text-sm text-slate-500">{error}</p>}
        </div>
        <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
          <label className="relative">
            <input
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              className="focus-ring w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              placeholder="Search"
            />
          </label>
          <select
            value={filters.category}
            onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={collectionValue}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                featured: event.target.value === "featured" ? "true" : "",
                bestSeller: event.target.value === "bestSeller" ? "true" : "",
                flashSale: event.target.value === "flashSale" ? "true" : "",
                newArrivals: event.target.value === "newArrivals" ? "true" : ""
              }))
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All collections</option>
            <option value="featured">Featured</option>
            <option value="bestSeller">Best sellers</option>
            <option value="flashSale">Flash deals</option>
            <option value="newArrivals">New arrivals</option>
          </select>
          <select
            value={filters.sort}
            onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="-createdAt">Newest</option>
            <option value="price">Price low to high</option>
            <option value="-price">Price high to low</option>
            <option value="-salesCount">Best selling</option>
          </select>
          <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold shadow-sm dark:bg-slate-900">
            <SlidersHorizontal className="h-4 w-4" /> {filtered.length} items
          </span>
        </div>
      </div>
      <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}
          className={`shrink-0 rounded-full border px-5 py-2 text-sm font-bold transition ${
            !filters.category ? "border-noir bg-noir text-white dark:border-white dark:bg-white dark:text-noir" : "border-slate-200 bg-white text-slate-600 hover:border-noir dark:border-slate-800 dark:bg-slate-900"
          }`}
        >
          All clothing
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category._id}
            onClick={() => setFilters((prev) => ({ ...prev, category: category._id }))}
            className={`shrink-0 rounded-full border px-5 py-2 text-sm font-bold transition ${
              filters.category === category._id ? "border-noir bg-noir text-white dark:border-white dark:bg-white dark:text-noir" : "border-slate-200 bg-white text-slate-600 hover:border-noir dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      {loading ? (
        <LoadingState label="Loading clothing" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No clothing found" body="Try another search, category, or collection filter." />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product._id} product={product} editorial />
          ))}
        </div>
      )}
    </section>
  );
}
