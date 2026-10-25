# Zevyor — Luxury Lifestyle Ecommerce Platform

> **Commanding Elegance. Authentic Craft.**  
> A modern, production-oriented ecommerce platform for **Zevyor** tailored for the Pakistan market, featuring luxury timepieces (Watches) and artisanal cashmere wraps (Shawls), full dynamic category architecture, multi-passcode Role-Based Access Control (RBAC), and server-validated Cash on Delivery (COD) commerce.

---

## Architecture Overview

```mermaid
graph TD
    Client[Storefront & Admin Web App] --> NextApp[Next.js 14 App Router]
    
    subgraph Frontend Layer
        Storefront[Storefront: Home, Catalog, PDP, Bag, Checkout, Lookbook]
        AdminUI[Admin Console: Products, Orders, Passcodes, Permissions, Settings]
        DesignSystem[Design Tokens: Burgundy #6B1F32, Cream #F5F0E8, Black #171717]
    end

    subgraph Server Layer [Node.js Server Actions & API Routes]
        AuthGuard[Passcode & Session Guard + Granular 15-Module Authorization]
        CheckoutEngine[Server-side Recalculation & Atomic COD Engine]
        PromoEngine[Coupons & Bundle Validation Engine]
        AuditEngine[Immutable Forensic Audit Logger]
        EmailService[Resend Transactional Email Dispatcher]
    end

    subgraph Persistence Layer
        Prisma[Prisma ORM / Typed Database Client]
        Database[(Relational Database: SQLite dev/test & Supabase PostgreSQL prod)]
    end

    NextApp --> Server Layer
    Server Layer --> Prisma
    Prisma --> Database
    EmailService -.-> ResendAPI[Resend API]
```

---

## Key Features

### Storefront & Client Experience
- **Official Brand Design System**: Tailored brand color tokens:
  - Burgundy: `#6B1F32`
  - Cream: `#F5F0E8`
  - Black: `#171717`
  - White: `#FFFFFF`
  - Muted Grey: `#777777`
- **Official Logo**: Preserved official logo proportions in header, footer, and admin (`/assets/zevyor-official-logo.png`).
- **Dynamic Homepage**: Configurable hero banner, brand introduction narrative, category cards, featured watches and shawls, new arrivals, promotional bundle offers, editorial lookbook preview, and approved customer reviews.
- **Catalogue & Search**: Multi-attribute search across title, description, SKU, and tags. Dynamic category filtering, stock availability toggle, and sorting (`newest`, `popular`, `price_asc`, `price_desc`).
- **Product Detail Page (PDP)**:
  - Multi-image zoom gallery with thumbnail switcher.
  - Variant selectors (colors, materials, strap/bracelet) with real-time stock and price adjustments.
  - Pre-filled **WhatsApp Order Inquiry** pre-formatting product name, selected variant, price, and current URL reference.
  - JSON-LD structured schema for search engine optimization.
- **Shopping Bag & Slide-Out Drawer**:
  - Live subtotal recalculation and free delivery progress threshold meter.
  - Direct WhatsApp shopping bag order inquiry button.
- **Express Cash on Delivery (COD) Checkout**:
  - Fast guest checkout collecting full name, mobile number, province, city, and street address.
  - Real-time coupon application with server-side validation.
  - City delivery rules (Karachi/Lahore/Islamabad priority vs nationwide rates).
  - Atomic database transaction: decrements variant stock and generates non-guessable order references (`ZVR-YYYYMM-XXXXX`).
- **Secure Order Tracking**: Dual verification requiring both Order Reference and Customer Phone Number to protect customer privacy.
- **Editorial Campaign Lookbook**: High-fashion photography exhibits and captions.
- **Client Care Policies**: About Heritage, Shipping & Delivery, Returns & Exchanges (7 Days), Privacy Policy, Terms of Service, and Contact Concierge.

---

### Administrative Control Console (`/admin`)
- **Secure Passcode Authentication**:
  - Multi-passcode access with salted bcrypt hashing.
  - Brute-force rate-limiting: 5 consecutive failed attempts locks credentials for 15 minutes.
  - Secure httpOnly session cookie with automatic expiration.
- **Granular Role-Based Access Control (RBAC)**:
  - Primary Owner can create team passcodes with independent `No Access`, `View-Only`, or `Editor` permissions across 15 distinct modules:
    `DASHBOARD`, `PRODUCTS`, `CATEGORIES`, `INVENTORY`, `ORDERS`, `CUSTOMERS`, `COUPONS`, `BUNDLES`, `DELIVERY`, `HOMEPAGE`, `LOOKBOOK`, `REVIEWS`, `SETTINGS`, `PASSCODES`, `AUDIT_LOGS`.
  - One-click deactivation instantly terminates and revokes active sessions.
- **Operations Dashboard**: Realized collected revenue from delivered orders vs pending COD pipeline value, orders awaiting action counter, low inventory watchlist (≤ 5 units), and recent order activity.
- **Product Management**: Full CRUD, image gallery manager, dynamic variants manager, and confidential cost price (owner-only). Safe archival to `DRAFT` if historical orders reference the product.
- **Dynamic Category Architecture**: Category manager with slug uniqueness validation and safe product reassignment/unpublishing upon deletion.
- **Variant Stock & Inventory**: Quick-save stock adjustor with low-stock alerts.
- **Order Fulfillment & COD**: Status transitions (`PENDING`, `CONFIRMED`, `PROCESSING`, `DISPATCHED`, `DELIVERED`, `CANCELLED`). Automated stock restoration upon order cancellation. COD payment collection status toggles, courier partner assignment with tracking number and URL, and internal staff notes.
- **Store Configuration & Content**: Live hero section editor, top announcement bar, policy texts, and Resend email status checker.
- **Promotions & Delivery**: Promotional discount coupons with caps, bundle deals, and regional delivery rules.
- **Forensic Audit Log**: Immutable log of administrative modifications, acting staff member, IP address, and change summaries.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, PostCSS, Lucide Icons
- **Database & ORM**: Prisma ORM with 21 relational models
  - SQLite (`prisma/dev.db`) for zero-friction local development & automated test execution
  - PostgreSQL on Supabase or Neon for production deployment
- **Authentication**: Custom cryptographic passcode system with bcrypt
- **Transactional Email**: Resend API (`@resend/node` / REST API)
- **Validation**: Zod schema validation

---

## Getting Started

### 1. Prerequisites
- Node.js 18.17+ or 20+
- npm or pnpm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/misternaul/Zevyor.git
cd Zevyor

# Install dependencies
npm install

# Push local database schema
npx prisma generate
npx prisma db push

# Bootstrap primary owner passcode
npm run admin:bootstrap

# Seed initial categories, products, delivery rules, and settings
npm run db:seed
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-32-character-session-secret"
OWNER_BOOTSTRAP_PASSCODE="ZevyorOwner2026!"
NEXT_PUBLIC_STORE_NAME="Zevyor"
NEXT_PUBLIC_STORE_CURRENCY="PKR"
NEXT_PUBLIC_WHATSAPP_NUMBER="923000000000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
RESEND_API_KEY=""
RESEND_FROM_EMAIL="onboarding@resend.dev"
ADMIN_NOTIFICATION_EMAIL="zevyorlifestyle@gmail.com"
```

### 4. Running Locally
```bash
npm run dev
```
Storefront: `http://localhost:3000`  
Admin Console: `http://localhost:3000/admin/login`

---

## Automated Test Suite

Run the full automated test suite covering authentication, RBAC, commerce calculations, stock reservations, and cancellation restoration:

```bash
npm test
```

Test Results:
```bash
ℹ tests 12 | pass 12 | fail 0 | duration_ms 987.05ms
```

---

## Production Deployment (Vercel & Supabase)

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for complete step-by-step instructions for Supabase PostgreSQL database migration and Vercel cloud deployment.
