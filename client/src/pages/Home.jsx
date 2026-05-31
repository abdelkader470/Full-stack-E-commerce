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

function ProductRail({ title, eyebrow, body, products, loading, emptyTitle, action, carousel = false }) {
  return (
    <section className="fashion-section">
      <SectionHeader eyebrow={eyebrow} title={title} body={body} action={action} />
      {loading ? (
        <ProductSkeletonGrid />
      ) : products.length === 0 ? (
        <EmptyState title={emptyTitle || "No clothing available"} body="Clothing will appear here once the catalog has data." />
      ) : carousel ? (
        <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {products.map((product) => (
            <div key={product._id} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[27rem]">
              <ProductCard product={product} editorial />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} editorial />
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

      <section className="relative min-h-screen overflow-hidden bg-noir text-white">
        <img
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=80"
          alt="Premium clothing editorial display"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/48 to-black/12" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-mist to-transparent dark:from-[#080808]" />
        <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-white" /> Summer wardrobe edit: save up to 30% on premium apparel
            </p>
            <h1 className="max-w-4xl text-6xl font-extrabold leading-[0.95] sm:text-7xl lg:text-8xl">
              Elevated clothing for wardrobes worth building.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/82">
              Curated apparel departments, limited-time outfit deals, best-selling styles, secure checkout, and a polished fashion shopping experience from first tap to final delivery.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
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
            {error && <p className="mt-5 text-sm text-white/75">{error}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.14, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="luxury-glass rounded-lg p-5">
              <div className="overflow-hidden rounded-lg bg-white text-black">
                <img
                  src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"
                  alt="Curated clothing"
                  className="h-[30rem] w-full object-cover"
                />
                <div className="p-6">
                  <p className="text-xs font-extrabold uppercase text-black">Editorial drop</p>
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

      <section className="mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-3 rounded-lg border border-white/60 bg-white/80 p-4 shadow-editorial backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:grid-cols-4">
          {[
            ["Free shipping", "On orders above $100", Truck],
            ["Secure payment", "Protected checkout flow", ShieldCheck],
            ["Easy returns", "Status-ready returns", BadgePercent],
            ["Priority support", "Human help when needed", Sparkles]
          ].map(([label, body, Icon]) => (
            <div key={label} className="flex items-center gap-4 p-3">
              <span className="rounded-lg bg-neutral-100 p-3 text-black dark:bg-white/10 dark:text-white">
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

      <motion.section {...sectionMotion} className="bg-white py-20 dark:bg-[#080808]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured categories"
            title="Shop by clothing department"
            body="Apparel departments with visual discovery, quick filtering, and style paths that stay fast on every device."
            action={
              <Link className="inline-flex items-center gap-2 font-extrabold text-black dark:text-white" to="/products">
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
        carousel
      />

      <ProductRail
        eyebrow="Best sellers"
        title="Styles customers keep choosing"
        body="High-converting clothing cards with price clarity, sale badges, ratings, stock signals, saved styles, and one-tap bag actions."
        products={bestSellers}
        loading={loading}
        emptyTitle="No best sellers yet"
      />

      <section className="bg-white py-20 dark:bg-[#080808]">
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

      <section className="bg-white py-20 dark:bg-[#080808]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Featured brands"
            title="Curated clothing labels"
            body="A polished brand strip helps customers scan familiar fashion names and reinforces store trust."
          />
          <BrandStrip />
        </div>
      </section>

      <section className="fashion-section">
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

      <section className="bg-noir py-20 text-white">
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

      <section className="fashion-section">
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

      <section className="bg-white py-20 dark:bg-[#080808]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <NewsletterPanel />
        </div>
      </section>

      <section className="fashion-section">
        <AppPromo />
      </section>

      <section className="bg-white py-20 dark:bg-[#080808]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Social showcase"
            title="Styled by the community"
            body="A social commerce band for Instagram posts, creator looks, and outfit storytelling."
          />
          <SocialShowcase />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
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
