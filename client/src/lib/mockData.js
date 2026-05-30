export const categories = [
  {
    _id: "cat-women",
    name: "Women",
    slug: "women",
    description: "Tailored dresses, elevated basics, and seasonal layers",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"
  },
  {
    _id: "cat-men",
    name: "Men",
    slug: "men",
    description: "Modern shirting, outerwear, denim, and everyday essentials",
    image: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80"
  },
  {
    _id: "cat-denim",
    name: "Denim",
    slug: "denim",
    description: "Jeans, jackets, trousers, and refined everyday denim",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80"
  },
  {
    _id: "cat-activewear",
    name: "Activewear",
    slug: "activewear",
    description: "Performance layers, leggings, hoodies, and training sets",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80"
  }
];

export const products = [
  {
    _id: "prod-midi-dress",
    name: "Atelier Satin Midi Dress",
    slug: "atelier-satin-midi-dress",
    brand: "Atelier Muse",
    category: categories[0],
    price: 168,
    compareAtPrice: 220,
    stock: 28,
    rating: 4.8,
    numReviews: 128,
    isFeatured: true,
    isBestSeller: true,
    tags: ["dress", "occasionwear", "satin"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
        alt: "Satin midi dress"
      }
    ],
    variants: [
      { _id: "v1", size: "S", color: "Champagne", stock: 8, price: 168 },
      { _id: "v2", size: "M", color: "Champagne", stock: 12, price: 168 },
      { _id: "v3", size: "L", color: "Black", stock: 8, price: 168 }
    ],
    description: "A softly draped satin midi dress with a clean neckline, fluid movement, and event-ready polish."
  },
  {
    _id: "prod-overshirt",
    name: "Northline Wool Blend Overshirt",
    slug: "northline-wool-blend-overshirt",
    brand: "Northline",
    category: categories[1],
    price: 142,
    stock: 21,
    rating: 4.7,
    numReviews: 86,
    isFeatured: true,
    tags: ["menswear", "overshirt", "layering"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
        alt: "Men's wool blend overshirt"
      }
    ],
    variants: [
      { _id: "v4", size: "M", color: "Charcoal", stock: 7, price: 142 },
      { _id: "v5", size: "L", color: "Charcoal", stock: 8, price: 142 },
      { _id: "v6", size: "XL", color: "Camel", stock: 6, price: 142 }
    ],
    description: "A structured wool blend overshirt with a relaxed fit, warm hand feel, and polished utility pockets."
  },
  {
    _id: "prod-wide-leg-denim",
    name: "Vale Wide-Leg Denim Trouser",
    slug: "vale-wide-leg-denim-trouser",
    brand: "Vale",
    category: categories[2],
    price: 128,
    compareAtPrice: 158,
    stock: 14,
    rating: 4.6,
    numReviews: 74,
    isFlashSale: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
        alt: "Wide-leg denim trousers"
      }
    ],
    variants: [
      { _id: "v7", size: "28", color: "Indigo", stock: 4, price: 128 },
      { _id: "v8", size: "30", color: "Indigo", stock: 5, price: 128 },
      { _id: "v9", size: "32", color: "Washed Black", stock: 5, price: 128 }
    ],
    description: "A wide-leg denim trouser with a high-rise waist, structured drape, and polished everyday styling."
  },
  {
    _id: "prod-trench",
    name: "Harbor Double-Breasted Trench",
    slug: "harbor-double-breasted-trench",
    brand: "Harbor & Co.",
    category: categories[0],
    price: 236,
    stock: 5,
    rating: 4.9,
    numReviews: 91,
    isBestSeller: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=900&q=80",
        alt: "Classic double-breasted trench coat"
      }
    ],
    variants: [
      { _id: "v10", size: "S", color: "Stone", stock: 1, price: 236 },
      { _id: "v11", size: "M", color: "Stone", stock: 2, price: 236 },
      { _id: "v12", size: "L", color: "Navy", stock: 2, price: 236 }
    ],
    description: "A weather-ready trench coat with a double-breasted front, belted waist, and refined tailoring."
  },
  {
    _id: "prod-ribbed-legging",
    name: "Core Ribbed Performance Legging",
    slug: "core-ribbed-performance-legging",
    brand: "Coreform",
    category: categories[3],
    price: 76,
    compareAtPrice: 96,
    stock: 32,
    rating: 4.7,
    numReviews: 64,
    isFeatured: true,
    tags: ["activewear", "leggings", "training"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=900&q=80",
        alt: "Ribbed performance leggings"
      }
    ],
    variants: [
      { _id: "v13", size: "XS", color: "Ink", stock: 8, price: 76 },
      { _id: "v14", size: "S", color: "Ink", stock: 10, price: 76 },
      { _id: "v15", size: "M", color: "Moss", stock: 14, price: 76 }
    ],
    description: "Supportive ribbed leggings with four-way stretch, a smoothing high rise, and studio-to-street comfort."
  }
];
