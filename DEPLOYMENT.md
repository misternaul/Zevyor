# Zevyor Ecommerce — Production Deployment & Administration Guide

## 1. System Architecture Overview

Zevyor is architected as a high-performance, full-stack lifestyle ecommerce platform built with:
- **Framework**: Next.js 14 (App Router) with TypeScript & React Server Components.
- **Styling & Design Tokens**: Tailwind CSS adhering to Zevyor brand tokens:
  - Burgundy: `#6B1F32`
  - Cream: `#F5F0E8`
  - Black: `#171717`
  - White: `#FFFFFF`
  - Muted Grey: `#777777`
- **Database & Data Modeling**: Prisma ORM with 21 relational models.
  - Zero-friction local development & automated testing: SQLite (`file:./prisma/dev.db`).
  - Production cloud deployment: PostgreSQL on Supabase or Neon via connection pooling.
- **Authentication**: Custom cryptographic passcode authentication with salted bcrypt hashing, httpOnly session cookies, brute-force rate-limiting (lockout after 5 failed attempts), and granular Role-Based Access Control (RBAC).
- **Commerce Engine**: Server-side cart recalculation, stock reservation inside database transactions, non-guessable order references (`ZVR-YYYYMM-XXXXX`), Cash on Delivery (COD) workflows, city-based delivery tariff priorities, and coupon/bundle engines.
- **Communications**: Resend transactional email API with graceful fallback (orders never fail if emails fail) + integrated WhatsApp commerce concierge.

---

## 2. Environment Variables Reference

Create a `.env` file locally or configure these variables in the **Vercel Project Settings > Environment Variables**:

| Variable Name | Environment | Required | Description |
|---|---|---|---|
| `DATABASE_URL` | All | Yes | Database connection string. `file:./dev.db` for local dev or `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true` for Supabase in production. |
| `DIRECT_URL` | Prod | Yes (Supabase) | Direct PostgreSQL connection string for Prisma migrations on Supabase (port 5432 without pgbouncer). |
| `SESSION_SECRET` | All | Yes | 32+ character random string for cryptographic session signing. |
| `OWNER_BOOTSTRAP_PASSCODE` | All | Yes | Initial secret passcode used by `npm run admin:bootstrap` to initialize the primary owner account. |
| `NEXT_PUBLIC_STORE_NAME` | All | Yes | Brand display name (`Zevyor`). |
| `NEXT_PUBLIC_STORE_CURRENCY` | All | Yes | Default currency (`PKR`). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | All | Yes | Store WhatsApp concierge mobile number with country code (e.g., `923000000000`). |
| `NEXT_PUBLIC_APP_URL` | Prod | Yes | Production URL (e.g., `https://zevyor.com`). |
| `RESEND_API_KEY` | Prod | Optional | Resend API key (`re_...`) for transactional customer confirmation and admin alert emails. |
| `RESEND_FROM_EMAIL` | Prod | Optional | Sending email address verified in Resend (e.g. `orders@zevyor.com`). |
| `ADMIN_NOTIFICATION_EMAIL` | Prod | Optional | Store administrator recipient for new order alerts. |

---

## 3. Database Migration & Cloud Setup (Supabase / PostgreSQL)

### Option A: Direct PostgreSQL / Supabase Migration
1. Create a free PostgreSQL project on [Supabase](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Open `supabase/migrations/01_init.sql` from this repository.
4. Paste and execute the SQL script. This creates all 21 tables, foreign key constraints, indexes, and cascades.
5. In your Supabase Project Settings > Database, copy the **Transaction Connection Pooler string** (port 6543) and set it as `DATABASE_URL`, and copy the **Direct Connection string** (port 5432) as `DIRECT_URL`.

### Option B: Local SQLite (Ready out of the box)
1. Run `npx prisma db push`
2. Run `npm run admin:bootstrap` to initialize the Owner passcode.
3. Run `npm run db:seed` to seed initial Watches, Shawls, and Delivery rules.

---

## 4. Initial Owner Passcode Setup & Recovery

### Initial Owner Bootstrap
To initialize or reset the Primary Owner passcode without exposing secrets:
```bash
# Using .env OWNER_BOOTSTRAP_PASSCODE:
npm run admin:bootstrap

# Or supplying a custom passcode directly via command line:
node scripts/bootstrap-owner.mjs "YourUniqueSecurePasscode2026!"
```
The script hashes the passcode with bcrypt (cost factor 12), grants full owner authority across all 15 administrative modules, and logs the action to `AuditLog`.

### Emergency Owner Recovery
If the owner forgets their passcode or locks themselves out:
1. Access the hosting server or run the bootstrap script with a new secret:
   ```bash
   node scripts/bootstrap-owner.mjs "NewSecureOwnerPasscode2026!"
   ```
2. The script resets `failedAttempts` to 0, clears any `lockedUntil` timestamp, and sets the new hashed passcode.
3. Log in at `/admin/login` using the new passcode.

---

## 5. Multi-Passcode RBAC Management

The Primary Owner can manage team access from `/admin/passcodes`:
- **Create Staff Passcode**: Assign a human-readable identifier (e.g., "Karachi Order Dispatcher", "Inventory Associate").
- **Independent Module Permissions**: For each of the 15 modules, choose:
  - **No Access**: Module is hidden in navigation; API and server actions reject any call.
  - **View-Only Access**: Staff can view records, orders, or products, but all modification and deletion buttons/endpoints are strictly disabled.
  - **Editor Access**: Full read and write capabilities for that specific module.
- **Deactivation & Revocation**:
  - Toggling a passcode to "Deactivated" instantly terminates and deletes all active session tokens for that credential.
  - Deleting a passcode removes the record and invalidates sessions.

---

## 6. Transactional Email Setup (Resend)

1. Sign up at [Resend](https://resend.com) and create an API Key.
2. In your domain DNS (e.g. Cloudflare, Namecheap, GoDaddy), add the DKIM and SPF TXT records provided by Resend.
3. Add the following to your deployment environment variables:
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxxx"
   RESEND_FROM_EMAIL="orders@zevyor.com"
   ADMIN_NOTIFICATION_EMAIL="owner@zevyor.com"
   ```
4. Verify email status in the Admin Panel under **Store Settings > Resend Transactional Email**.
5. **Non-blocking Resilience**: If the Resend API is unreachable or returns an error, the order is safely saved to the database, and the error is logged in `EmailLog` without interrupting the customer checkout.

---

## 7. Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the `Zevyor` repository.
4. Set the **Framework Preset** to **Next.js**.
5. Under **Environment Variables**, add the variables detailed in Section 2.
6. Click **Deploy**.
7. Once deployed, run `npm run admin:bootstrap` and `npm run db:seed` on your production database.
8. Connect your custom domain (e.g. `zevyor.com`) in **Vercel Settings > Domains**.
