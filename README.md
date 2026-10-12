# Curated Discovery — Amazon & Flipkart Affiliate Discovery Platform

A production-ready product discovery and affiliate shopping platform built with **React (Vite)** on the frontend and **Node.js, Express, TypeScript, and Prisma ORM** on the backend.

The platform reproduces a minimalist, editorial storefront design with a lavender canvas, serif typography, and an asymmetric catalog grid, coupled with an authenticated administrative dashboard, client-side product management, and a secure server-side affiliate redirection gateway with analytics tracking.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC STOREFRONT (React + Vite)                │
│  • Reference Lavender Background (#DFDAEB)    • Left Sticky Sidebar   │
│  • Asymmetric 3-Column Product Grid           • Tracked Modal/Drawer  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & PROXY GATEWAY                             │
│  Vite Dev Proxy: /api/*, /uploads/*  ──►  Express: http://localhost:5000│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXPRESS + TYPESCRIPT BACKEND (Port 5000)             │
│  • Security: Helmet headers, CORS credentials, Rate limiting           │
│  • Auth: Argon2id/Bcrypt hash, HttpOnly JWT cookies, Session validation│
│  • Validation: Zod schemas for body, query, params                     │
│  • Gateway: Strict host allowlisting (Amazon & Flipkart)               │
│  • Analytics: Non-PII AffiliateClick aggregation                       │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           DATABASE LAYER                               │
│  • ORM: Prisma Client 5.22.0                                           │
│  • Local Dev / CI: SQLite (prisma/schema.prisma -> dev.db)             │
│  • Production: PostgreSQL 16+ (prisma/schema.postgresql.prisma)        │
│  • Models: Product, Category, AdminUser, AffiliateClick                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
.
├── .env.example                     # Environment template (zero real secrets)
├── docker-compose.yml               # Local PostgreSQL 16 container definition
├── package.json                     # Root dependencies and operational scripts
├── prisma/
│   ├── schema.prisma                # SQLite schema for instant local dev & tests
│   └── schema.postgresql.prisma     # Production PostgreSQL schema with exact Decimals
├── public/                          # Static assets and curated product imagery
├── server/
│   └── src/
│       ├── config/env.ts            # Type-safe Zod environment validation
│       ├── controllers/             # Public, Admin, and Redirect route controllers
│       ├── db/
│       │   ├── bootstrapAdmin.ts    # CLI utility to create/rotate admin accounts
│       │   ├── fixtures.ts          # Strongly-typed seed dataset
│       │   ├── prisma.ts            # Prisma client singleton instance
│       │   └── seed.ts              # Idempotent database seeder
│       ├── middleware/              # Auth, Error, Rate limiter, Security, Validation
│       ├── routes/                  # Express router definitions
│       ├── services/                # Business logic (products, categories, clicks, storage)
│       ├── types/                   # TypeScript interfaces and Express augmentations
│       ├── app.ts                   # Express application assembly
│       └── index.ts                 # HTTP server listener and graceful shutdown
├── src/                             # React 18 frontend
│   ├── admin/                       # Protected admin panel & management screens
│   ├── api/client.js                # Unified fetch client with CSRF/credentials support
│   ├── components/                  # Storefront components (Grid, Modal, Drawer, Header)
│   ├── context/StoreContext.jsx     # Live React context consuming backend API
│   ├── data/products.js             # Initial bootstrap catalog reference
│   └── main.jsx                     # Application entry point
└── test/
    └── backend.test.ts              # Comprehensive 30-step automated integration test suite
```

---

## 3. Quick Start & Setup

### Prerequisites
- Node.js `v18.0.0` or later (`v20+` recommended)
- npm or yarn

### Step 1: Clone & Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
Default `.env` values are pre-configured for local development with SQLite (`DATABASE_URL="file:./dev.db"`).

### Step 3: Initialize Database & Seed Fixtures
```bash
# Push database schema
npm run db:push

# Seed categories, initial products, and default administrator
npm run db:seed
```

Default seeded administrator credentials:
- **Email:** `admin@curatedstudio.internal`
- **Password:** `CuratorAdmin2026!`

To create or update a custom administrator account securely via CLI:
```bash
npm run admin:bootstrap admin@yourdomain.com "YourSecurePasswordHere!"
```

### Step 4: Run Development Servers
Open two terminal tabs (or run concurrently):

**Backend Server (Port 5000):**
```bash
npm run server:dev
```

**Frontend Server (Port 5173):**
```bash
npm run dev
```

Visit the storefront at `http://localhost:5173`.
Visit the admin panel at `http://localhost:5173/admin` (or click **Admin** in the storefront header).

---

## 4. Running Tests & Quality Verification

Run the full automated integration test suite:
```bash
npm run test:backend
```
The test suite exercises 30 critical scenarios:
1. Public health, categories, and paginated published catalog retrieval.
2. Published/draft quarantine (drafts never leak to public endpoints).
3. Server-side session authentication, invalid password rejection, and HttpOnly cookies.
4. Product CRUD with price validation and category association.
5. Category CRUD with deletion safety restrictions (prevents deleting categories containing active products unless reassigned).
6. Open-redirect protection (rejects untrusted domains; permits only verified Amazon and Flipkart hosts).
7. Privacy-preserving affiliate click aggregation.
8. Local image upload validation (MIME-type check, size restriction, storage persistence).

---

## 5. API Reference

### Public Storefront Endpoints
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning uptime and database status |
| `GET` | `/api/categories` | Returns all enabled categories sorted by display order |
| `GET` | `/api/products` | Returns published products with category filter, search, sort, and pagination |
| `GET` | `/api/products/:slug` | Retrieves a single published product by slug or ID |
| `GET` | `/api/categories/:slug/products` | Retrieves published products belonging to a category slug |

### Affiliate Redirection Gateway
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/go/:id/amazon` | Validates product, records click analytics, and redirects (302) to verified Amazon URL |
| `GET` | `/api/go/:id/flipkart` | Validates product, records click analytics, and redirects (302) to verified Flipkart URL |

*Security Rule:* Redirect targets are validated against `ALLOWED_REDIRECT_HOSTS` (`amazon.in`, `amzn.to`, `flipkart.com`, `fkrt.it`, etc.) to prevent open-redirect vulnerabilities.

### Admin Authentication
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/auth/login` | Authenticates administrator, issues HttpOnly cookie and Bearer token |
| `GET` | `/api/admin/auth/me` | Validates active session and returns authenticated user details |
| `POST` | `/api/admin/auth/logout` | Clears authentication cookie |

### Admin Management (Protected)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard` | Returns live aggregate statistics (total products, drafts, featured, categories) |
| `GET` | `/api/admin/products` | Returns all products (both published and drafts) with filters and sorting |
| `POST` | `/api/admin/products` | Creates a new product with validated data and slug generation |
| `GET` | `/api/admin/products/:id` | Returns complete details for an individual product |
| `PATCH` | `/api/admin/products/:id` | Updates an existing product |
| `PATCH` | `/api/admin/products/:id/publish` | Toggles publication status (published vs draft) |
| `PATCH` | `/api/admin/products/:id/featured` | Toggles featured status |
| `DELETE` | `/api/admin/products/:id` | Permanently deletes a product and associated click records |
| `GET` | `/api/admin/categories` | Returns all categories including disabled ones |
| `POST` | `/api/admin/categories` | Creates a new category |
| `PATCH` | `/api/admin/categories/:id` | Updates category name, slug, display order, or enabled status |
| `DELETE` | `/api/admin/categories/:id` | Deletes category (fails if populated unless `reassignCategoryId` is provided) |
| `GET` | `/api/admin/affiliate-clicks` | Returns aggregated click statistics by product and platform |
| `POST` | `/api/admin/upload-image` | Accepts `multipart/form-data` image upload (`jpg`, `png`, `webp`, max 5MB) |

---

## 6. Production PostgreSQL Deployment

To deploy with PostgreSQL instead of SQLite:

1. **Start PostgreSQL Database** (locally via Docker or managed provider like Supabase/Neon/AWS RDS):
   ```bash
   docker-compose up -d
   ```
2. **Update `.env`**:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/curated_discovery?schema=public"
   ```
3. **Generate & Migrate with PostgreSQL Schema**:
   ```bash
   npm run db:generate:pg
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   npm run db:seed
   ```
4. **Build Production Assets**:
   ```bash
   # Build frontend SPA
   npm run build

   # Compile backend TypeScript
   npm run server:build

   # Start production Node server
   NODE_ENV=production npm run server:start
   ```

---

## 7. Production Security Checklist

- [x] **Zero Frontend Secrets**: API keys, database URLs, and admin passwords exist exclusively on the server in `.env`.
- [x] **HttpOnly Session Cookies**: JWTs are delivered with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production to mitigate XSS credential theft.
- [x] **Rate Limiting**:
  - Auth login attempts capped at 10 requests per 15 minutes per IP.
  - Public API capped at 300 requests per 15 minutes.
  - Redirect gateway capped at 60 requests per minute.
- [x] **Strict CORS & Helmet**: Headers enforce strict Origin validation and prevent clickjacking via `X-Frame-Options`.
- [x] **Open-Redirect Allowlisting**: Destination URLs must parse to an allowlisted Amazon or Flipkart hostname.
- [x] **Privacy Preservation**: Click tracking records product ID, platform, and timestamp only. IP addresses and user agents are never persisted.
- [x] **Safe Category Deletion**: Categories containing active products cannot be dropped without an explicit reassignment target.

---

## 8. Affiliate Networks & External Integration Notice

- **Amazon Associates**: Affiliate tags (e.g. `?tag=yourtag-21`) should be appended to product URLs in the admin panel or automated via a redirect URL query transformer.
- **Flipkart Affiliate Program**: Flipkart product URLs must contain the verified partner tracking tag (`affid=yourtag`).
- **Live Price Verification**: Product display prices represent curated, verified prices entered via the admin panel. Neither Amazon nor Flipkart permits scraping pricing without explicit Product Advertising API (PA-API) compliance and authorized credentials.

