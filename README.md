# Marketlane Full-Stack Clothing Store

Marketlane is a professional full-stack clothing e-commerce app built with React, Vite, Tailwind CSS, Zustand, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, image uploads, coupons, order tracking structure, payment intent structure, email notification structure, and an admin dashboard.

## Folder Structure

```text
.
|-- client/                 # React clothing storefront and admin UI
|   |-- src/components      # Reusable layout, product, and UI components
|   |-- src/pages           # Storefront, auth, checkout, profile, admin routes
|   |-- src/store           # Zustand auth/shop/theme stores
|   `-- src/lib             # API client, apparel mock catalog fallback, i18n
`-- server/                 # Express REST API
    |-- src/controllers     # Request handlers
    |-- src/models          # Mongoose schemas
    |-- src/routes          # REST route modules
    |-- src/middleware      # Auth, validation, uploads, errors
    |-- src/utils           # JWT/email/invoice helpers
    `-- src/seed            # Clothing categories, apparel products, users, coupons
```

## Features

- Clothing listing, details, search, filtering, categories, related styles, featured clothing, best sellers, flash sale flags, size/color variants, multiple images, reviews and ratings.
- Cart, wishlist, recently viewed clothing, checkout flow, coupons, shipping address structure, payment status and order tracking structure, invoices.
- JWT authentication, customer/admin RBAC, bcrypt password hashing, user profile and order history.
- Admin dashboard for clothing inventory, categories, users, orders, order status, stock tracking, analytics, coupons and discounts.
- Secure Express architecture with Helmet, CORS, rate limiting, Mongo sanitization, validation, centralized error handling and environment variables.
- Newsletter subscription, email notification structure, image upload support, SEO metadata, dark/light mode and Arabic/English language structure.

## Setup

1. Install dependencies:

```bash
npm run install:all
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Update `server/.env` with a strong `JWT_SECRET` and your MongoDB connection string.

4. Seed clothing sample data:

```bash
npm run seed
```

This resets sample database data and creates apparel categories: Women, Men, Denim, and Activewear.

Seeded accounts:

- Admin: `admin@example.com` / `Password123!`
- Customer: `customer@example.com` / `Password123!`

5. Run the backend and frontend in two terminals:

```bash
npm run dev:server
npm run dev:client
```

Frontend: `http://localhost:5173`

Backend health check: `http://localhost:5000/health`

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:idOrSlug`
- `POST /api/products` admin
- `PUT /api/products/:id` admin
- `DELETE /api/products/:id` admin archive
- `POST /api/products/:id/reviews`
- `GET /api/categories`
- `POST /api/categories` admin
- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `GET /api/cart/wishlist`
- `PUT /api/cart/wishlist/:productId`
- `POST /api/orders/payment-intent`
- `POST /api/orders`
- `GET /api/orders/mine`
- `GET /api/orders/:id/invoice`
- `GET /api/admin/analytics` admin
- `GET /api/admin/users` admin
- `GET /api/admin/orders` admin
- `GET /api/admin/coupons` admin

## Deployment

- Frontend: build with `npm run build --prefix client` and deploy `client/dist` to Vercel, Netlify, Cloudflare Pages, or any static host.
- Backend: deploy `server` to Render, Railway, Fly.io, or AWS. Set `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, SMTP values and Stripe values.
- Database: use MongoDB Atlas in production.
- Images: local uploads are suitable for development. For production, replace `multer.diskStorage` with S3, Cloudinary, or another object store.
- Payments: the API includes the Stripe payment intent endpoint; wire Stripe Elements in `client/src/pages/Checkout.jsx` for live card collection.

## Notes

The frontend includes clothing demo catalog fallback data, so the UI remains browsable before MongoDB/API setup. Once the API is running, it automatically uses live backend data. Run `npm run seed` after this change when you want the live database to show the clothing-only catalog.
