import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  CreditCard,
  Headphones,
  Instagram,
  RefreshCcw,
  ShieldCheck,
  Shirt,
  Layers3,
  Smartphone,
  Sparkles,
  Star,
  Truck
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { api, money } from "../../lib/api";
import { Button } from "../ui/Button";

export function SectionHeader({ eyebrow, title, body, action, align = "left", inverted = false }) {
  const titleColor = inverted ? "text-white" : "text-ink dark:text-white";
  const bodyColor = inverted ? "text-slate-300" : "text-slate-600 dark:text-slate-300";
  const eyebrowColor = inverted ? "text-brand-100" : "text-brand-600 dark:text-brand-100";

  return (
    <div
      className={`mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${
        align === "center" ? "text-center md:block" : ""
      }`}
    >
      <div className={align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={`mb-3 text-xs font-extrabold uppercase tracking-[0.18em] ${eyebrowColor}`}>
            {eyebrow}
          </p>
        )}
        <h2 className={`text-3xl font-extrabold leading-tight sm:text-4xl ${titleColor}`}>{title}</h2>
        {body && <p className={`mt-3 text-base leading-7 ${bodyColor}`}>{body}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ProductSkeletonGrid({ count = 4 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="aspect-[4/3] animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 p-4">
            <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-5 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryShowcase({ categories }) {
  const icons = [Shirt, Sparkles, Layers3, BadgeCheck];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category, index) => {
        const Icon = icons[index % icons.length];
        return (
          <Link
            to={`/products?category=${category._id}`}
            key={category._id}
            className="group relative min-h-72 overflow-hidden rounded-lg bg-ink shadow-sm transition hover:-translate-y-1 hover:shadow-glow"
          >
            <img src={category.image} alt={category.name} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="absolute left-5 top-5 rounded-lg bg-white/90 p-3 text-brand-700 shadow-sm backdrop-blur">
              <Icon className="h-5 w-5" />
            </div>
            <div className="absolute bottom-0 p-5 text-white">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-100">Department</p>
              <h3 className="text-2xl font-extrabold">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-200">{category.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function FlashDeal({ product }) {
  if (!product) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-coral">Flash deals</p>
        <h3 className="mt-3 text-2xl font-extrabold">Limited offers are warming up</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Check back soon for timed markdowns and member-only drops.</p>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 20;

  return (
    <div className="relative overflow-hidden rounded-lg bg-ink text-white shadow-glow">
      <img src={product.images?.[0]?.url} alt={product.name} className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-coral/50" />
      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px] lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-coral px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em]">
            Limited time
          </p>
          <h3 className="mt-4 text-3xl font-extrabold sm:text-4xl">{product.name}</h3>
          <p className="mt-3 max-w-xl text-slate-200">{product.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <span className="text-4xl font-extrabold">{money(product.price)}</span>
            {product.compareAtPrice && <span className="text-xl text-slate-300 line-through">{money(product.compareAtPrice)}</span>}
            <span className="rounded-full bg-saffron px-3 py-1 text-sm font-extrabold text-ink">Save {discount}%</span>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-100">Ends soon</p>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {["02", "18", "44", "12"].map((value, index) => (
              <div key={index} className="rounded-lg bg-white p-3 text-ink">
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-xs font-bold uppercase text-slate-500">{["Days", "Hrs", "Min", "Sec"][index]}</p>
              </div>
            ))}
          </div>
          <Link to={`/products/${product.slug || product._id}`} className="mt-5 block">
            <Button variant="accent" className="w-full">
              Claim offer <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BrandStrip() {
  const brands = ["Atelier Muse", "Northline", "Vale", "Harbor & Co.", "Coreform", "Velora"];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {brands.map((brand) => (
        <div key={brand} className="rounded-lg border border-slate-200 bg-white px-4 py-5 text-center font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:text-brand-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {brand}
        </div>
      ))}
    </div>
  );
}

export function BenefitGrid() {
  const benefits = [
    ["Free express shipping", "Orders over $100 ship fast with tracked delivery.", Truck],
    ["Easy returns", "Simple return flow with transparent status updates.", RefreshCcw],
    ["Secure payments", "Checkout architecture is ready for clothing orders and Stripe payment intents.", CreditCard],
    ["Priority support", "Helpful customer care for order, shipping, sizing, and fit questions.", Headphones],
    ["Verified quality", "Curated apparel with stock, size, and color visibility.", ShieldCheck],
    ["Premium rewards", "Coupons, flash sales, and member offers are built in.", BadgeCheck]
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {benefits.map(([title, body, Icon]) => (
        <div key={title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-glow dark:border-slate-800 dark:bg-slate-900">
          <span className="inline-flex rounded-lg bg-brand-50 p-3 text-brand-700 dark:bg-brand-600/15 dark:text-brand-100">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
        </div>
      ))}
    </div>
  );
}

export function Testimonials() {
  const reviews = [
    ["Beautifully styled.", "The clothing discovery flow feels premium, clear, and quick.", "Maya Chen"],
    ["Fast and reliable.", "Cart, checkout, wishlist, and profile flows make outfit shopping feel calm and predictable.", "Jordan Lee"],
    ["Admin-ready.", "Inventory, sizing, order status, and coupon surfaces are exactly where operators expect them.", "Sam Rivera"]
  ];

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {reviews.map(([quote, body, name]) => (
        <motion.blockquote
          key={quote}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="rounded-lg border border-white/10 bg-white/5 p-6 text-white shadow-sm backdrop-blur"
        >
          <div className="flex gap-1 text-saffron">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="mt-5 text-xl font-extrabold">{quote}</p>
          <p className="mt-3 text-sm leading-6 text-slate-300">{body}</p>
          <footer className="mt-5 text-sm font-bold text-brand-100">{name}</footer>
        </motion.blockquote>
      ))}
    </div>
  );
}

export function AppPromo() {
  return (
    <div className="grid overflow-hidden rounded-lg bg-gradient-to-br from-ink via-slate-900 to-brand-700 text-white shadow-glow lg:grid-cols-[1fr_420px]">
      <div className="p-6 sm:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-100">Mobile shopping</p>
        <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Shop clothing drops, track orders, and save favorites anywhere.</h2>
        <p className="mt-4 max-w-xl text-slate-200">
          The mobile app promotion area is ready for app store links, push-notification outfit drops, and personalized shopping sessions.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button variant="outline" className="border-white/20 bg-white text-ink hover:bg-slate-100">
            App Store
          </Button>
          <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
            Google Play
          </Button>
        </div>
      </div>
      <div className="relative min-h-72 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80"
          alt="Mobile shopping app"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/15 bg-white/15 p-4 backdrop-blur">
          <Smartphone className="h-6 w-6 text-brand-100" />
          <p className="mt-2 font-bold">Live tracking and saved outfits</p>
        </div>
      </div>
    </div>
  );
}

export function SocialShowcase() {
  const posts = [
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80"
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {posts.map((src, index) => (
        <a key={src} href="https://www.instagram.com" className="group relative aspect-square overflow-hidden rounded-lg bg-slate-200" aria-label="Open social showcase">
          <img src={src} alt={`Social showcase ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/45 group-hover:opacity-100">
            <Instagram className="h-6 w-6" />
          </div>
        </a>
      ))}
    </div>
  );
}

export function FaqPreview() {
  const faqs = [
    ["How fast is shipping?", "Most orders ship within two business days with tracking."],
    ["Can I return an item?", "Yes. The return structure supports simple order-based return workflows."],
    ["Are payments secure?", "The backend includes secure payment intent architecture for production clothing orders."]
  ];

  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {faqs.map(([question, answer]) => (
        <details key={question} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-extrabold">
            {question}
            <ChevronRight className="h-5 w-5 transition group-open:rotate-90" />
          </summary>
          <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function NewsletterPanel() {
  const subscribe = async (event) => {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    await api.post("/admin/newsletter", { email }).catch(() => null);
    event.currentTarget.reset();
  };

  return (
    <div className="rounded-lg border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-saffron/20 p-6 shadow-sm dark:border-brand-600/20 dark:from-slate-900 dark:via-slate-900 dark:to-brand-900/30 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-100">Newsletter</p>
          <h2 className="mt-3 text-3xl font-extrabold">Get early access to clothing drops and private offers.</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Plugged into the existing newsletter API endpoint, ready for seasonal edits, outfit launches, and private sale campaigns.
          </p>
        </div>
        <form onSubmit={subscribe} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            className="focus-ring min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Email address"
          />
          <Button variant="accent" type="submit">
            Join the style list
          </Button>
        </form>
      </div>
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-white">
      <img
        src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80"
        alt="Premium clothing collection"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-brand-700/60" />
      <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-100">Ready when you are</p>
        <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl">Build a wardrobe that feels polished from first layer to final detail.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-200">
          Explore curated clothing, save favorites, apply discounts, and move through a secure checkout flow.
        </p>
        <Link to="/products" className="mt-8 inline-block">
          <Button variant="accent">
            Shop clothing <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
