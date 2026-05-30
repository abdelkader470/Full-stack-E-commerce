import { motion } from "framer-motion";
import { ArrowRight, BadgePercent, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AppPromo,
  BenefitGrid,
  BrandStrip,
  CategoryShowcase,
  FaqPreview,
  FinalCta,
  FlashDeal,
  NewsletterPanel,
  ProductSkeletonGrid,
  SectionHeader,
  SocialShowcase,
  Testimonials
} from "../components/home/HomeSections";
import { ProductCard } from "../components/product/ProductCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/State";
import { useShopStore } from "../store/useShopStore";

const sectionMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45 }
};

function ProductRail({ title, eyebrow, body, products, loading, emptyTitle, action }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={eyebrow} title={title} body={body} action={action} />
      {loading ? (
        <ProductSkeletonGrid />
      ) : products.length === 0 ? (
        <EmptyState title={emptyTitle || "No clothing available"} body="Clothing will appear here once the catalog has data." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export function Home() {
  const { products, categories, loading, error, recentlyViewed, fetchCatalog } = useShopStore();

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const featured = useMemo(() => products.filter((product) => product.isFeatured).slice(0, 4), [products]);
  const bestSellers = useMemo(() => {
    const preferred = products.filter((product) => product.isBestSeller);
    return [...new Map([...preferred, ...products].map((product) => [product._id, product])).values()].slice(0, 4);
  }, [products]);
  const newArrivals = useMemo(() => [...products].slice(-4).reverse(), [products]);
  const trending = useMemo(
    () => [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
    [products]
  );
  const flash = products.find((product) => product.isFlashSale || product.compareAtPrice);
  const visibleRecentlyViewed = recentlyViewed.slice(0, 4);

  return (
    <>
      <Helmet>
        <title>Marketlane | Premium Clothing Store</title>
        <meta
          name="description"
          content="Shop a premium clothing store with curated apparel, seasonal edits, flash deals, wishlist, secure checkout, and admin-ready operations."
        />
      </Helmet>

      <section className="relative min-h-[86vh] overflow-hidden bg-ink text-white">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80"
          alt="Premium clothing editorial display"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-brand-900/30" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-mist to-transparent dark:from-slate-950" />
        <div className="relative mx-auto grid min-h-[86vh] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/12 px-4 py-2 text-sm font-bold backdrop-blur">
              <Sparkles className="h-4 w-4 text-saffron" /> Summer wardrobe edit: save up to 30% on premium apparel
            </p>
            <h1 className="max-w-4xl text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
              Elevated clothing for wardrobes worth building.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Curated apparel departments, limited-time outfit deals, best-selling styles, secure checkout, and a polished fashion shopping experience from first tap to final delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products">
                <Button variant="accent" className="px-5 py-3">
                  Shop clothing <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/products?flashSale=true">
                <Button variant="outline" className="border-white/30 bg-white/10 px-5 py-3 text-white hover:bg-white/20">
                  View flash deals
                </Button>
              </Link>
            </div>
            {error && <p className="mt-5 text-sm text-brand-100">{error}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-lg border border-white/15 bg-white/12 p-5 shadow-glow backdrop-blur">
              <div className="overflow-hidden rounded-lg bg-white text-ink">
                <img
                  src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80"
                  alt="Curated clothing"
                  className="h-72 w-full object-cover"
                />
                <div className="p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-coral">Promo banner</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Weekend wardrobe pass</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use WELCOME10 at checkout for member pricing on curated clothing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-glow dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
          {[
            ["Free shipping", "On orders above $100", Truck],
            ["Secure payment", "Protected checkout flow", ShieldCheck],
            ["Easy returns", "Status-ready returns", BadgePercent],
            ["Priority support", "Human help when needed", Sparkles]
          ].map(([label, body, Icon]) => (
            <div key={label} className="flex items-center gap-4 p-3">
              <span className="rounded-lg bg-brand-50 p-3 text-brand-700 dark:bg-brand-600/15 dark:text-brand-100">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold">{label}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <motion.section {...sectionMotion} className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured categories"
            title="Shop by clothing department"
            body="Apparel departments with visual discovery, quick filtering, and style paths that stay fast on every device."
            action={
              <Link className="inline-flex items-center gap-2 font-extrabold text-brand-700 dark:text-brand-100" to="/products">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          {loading ? <ProductSkeletonGrid /> : <CategoryShowcase categories={categories} />}
        </div>
      </motion.section>

      <ProductRail
        eyebrow="Featured clothing"
        title="Curated styles for a polished cart"
        body="Featured clothing stays tied to the same style cards, saved-style state, and bag actions already used across the app."
        products={featured}
        loading={loading}
        emptyTitle="No featured clothing yet"
      />

      <ProductRail
        eyebrow="Best sellers"
        title="Styles customers keep choosing"
        body="High-converting clothing cards with price clarity, sale badges, ratings, stock signals, saved styles, and one-tap bag actions."
        products={bestSellers}
        loading={loading}
        emptyTitle="No best sellers yet"
      />

      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Flash deals"
            title="Limited-time offers"
            body="Promotional space for urgent campaigns, discount codes, countdowns, and seasonal launches."
          />
          <FlashDeal product={flash} />
        </div>
      </section>

      <ProductRail
        eyebrow="New arrivals"
        title="Fresh in the wardrobe"
        body="Recently added apparel and launch-ready seasonal collections for returning shoppers."
        products={newArrivals}
        loading={loading}
        emptyTitle="No new arrivals yet"
      />

      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured brands"
            title="Curated clothing labels"
            body="A polished brand strip helps customers scan familiar fashion names and reinforces store trust."
          />
          <BrandStrip />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Why choose us"
          title="Built for premium clothing shopping from browse to delivery"
          body="The visual layer now matches the backend foundations: payments, order status, inventory, coupons, reviews, and customer accounts."
        />
        <BenefitGrid />
      </section>

      <ProductRail
        eyebrow="Trending now"
        title="Most talked-about styles"
        body="A dynamic-feeling showcase for high-rating and high-interest clothing."
        products={trending}
        loading={loading}
        emptyTitle="No trending styles yet"
      />

      <section className="bg-ink py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Customer reviews"
          title="A shopping experience that feels considered"
            body="Social proof with richer cards, star ratings, and a premium editorial backdrop."
            inverted
          />
          <Testimonials />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Recently viewed"
          title="Pick up where you left off"
          body="Recently viewed clothing is persisted locally through the existing shop store."
        />
        {visibleRecentlyViewed.length === 0 ? (
          <EmptyState title="No recently viewed clothing yet" body="Open a product details page and it will appear here." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleRecentlyViewed.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterPanel />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <AppPromo />
      </section>

      <section className="bg-white py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Social showcase"
            title="Styled by the community"
            body="A social commerce band for Instagram posts, creator looks, and outfit storytelling."
          />
          <SocialShowcase />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <SectionHeader
          eyebrow="FAQ preview"
          title="Answers before checkout"
          body="Give shoppers confidence around shipping, returns, payments, tracking, and support without sending them away."
        />
        <FaqPreview />
      </section>

      <FinalCta />
    </>
  );
}
