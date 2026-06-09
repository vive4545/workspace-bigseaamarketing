# BigSeaa — B2B Marketplace Platform

> A production-grade, SEO-first **B2B marketplace** (Kompass-style supplier directory + RFQ/quotation engine) connecting verified suppliers with buyers worldwide.

Built with **Next.js 16** (full-stack) and **PostgreSQL + Prisma**. Three personas — **Buyer**, **Supplier**, **Admin** — with a credit-based monetization model.

- **42** page routes · **28** Prisma models · **13** server-action modules · **44** React components
- Fully type-safe end-to-end · production-build verified

**Created & developed by [Vivek Joshi](https://github.com/vive4545).**

---

## Table of contents

1. [What it does](#what-it-does)
2. [Technology stack](#technology-stack)
3. [Architecture](#architecture)
4. [Feature map](#feature-map)
5. [Data model](#data-model)
6. [Project structure](#project-structure)
7. [Getting started](#getting-started)
8. [Demo accounts](#demo-accounts)
9. [Scripts](#scripts)
10. [SEO](#seo)
11. [Security](#security)
12. [Deployment](#deployment)
13. [Roadmap & status](#roadmap--status)

---

## What it does

BigSeaa is a global B2B trade platform. Buyers discover verified suppliers and products
(with localized currency), post **RFQs** (Requests For Quotation), and receive competitive
**quotations**. They spend **credits** to unlock supplier contact details. Suppliers list
products, browse the RFQ feed and submit quotes, and get **verified** by admins. Admins
moderate the whole platform.

**Three surfaces, one codebase:**
- **Public site** (SEO-optimized, server-rendered) — home, suppliers, products, categories, content
- **Authenticated dashboards** — separate Buyer and Supplier workspaces
- **Admin panel** — RBAC-gated moderation & content management

---

## Technology stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | **Next.js 16** (App Router, React 19, TypeScript) | SSR/SSG/ISR for SEO; React Server Components; Route Handlers + Server Actions are the Node.js backend |
| **Database** | **PostgreSQL** | Relational integrity for RFQs, quotations, credits, transactions |
| **ORM** | **Prisma 7** (`prisma-client` generator + `@prisma/adapter-pg` driver adapter) | Type-safe queries & migrations; transparent P1017 retry layer |
| **Auth** | **Auth.js v5 (NextAuth)** | Email/password + Google SSO + admin impersonation; JWT sessions with role/mode/status |
| **Validation** | **Zod 4** | Shared client/server schemas on every mutation |
| **Styling** | **Tailwind CSS v4 + shadcn/ui** (Radix) | Custom ocean/teal design system (oklch tokens), light/dark |
| **Animation** | **GSAP** (ScrollTrigger), **Three.js / React Three Fiber**, **Lenis** | Premium, bespoke feel — 3D hero, scroll reveals, smooth scroll |
| **Payments** | **Stripe** | Credit-pack checkout + webhook (dev-simulation fallback when no keys) |
| **Email / SMS / WhatsApp** | **Resend**, **Twilio**, **Telegram Bot API** | Multi-channel notifications (per-user toggles) — seams wired |
| **Storage** | **Cloudflare R2 / S3** | Company documents & images (presigned uploads — seam wired) |
| **Currency / Geo** | Exchange-rate API + IP geolocation | Country-based pricing & conversion |
| **Hosting** | **Vercel** + **Neon** (Postgres) | Zero-config SSR, per-PR previews; serverless Postgres |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)                    │
│                                                                │
│  (public)  SSR/ISR     │  (dashboard) Buyer/Supplier │ (admin) │
│  ─ SEO, JSON-LD        │  ─ RSC + client islands     │ ─ RBAC  │
│                                                                │
│  Route Handlers (/api/*)  +  Server Actions  ← the backend     │
│  Auth.js (proxy.ts route protection)  ·  Zod validation        │
│  Service/actions layer (src/server/*)                          │
└───────────────┬──────────────────────────────┬────────────────┘
                │ Prisma 7 (+ pg adapter)       │ Integrations
        ┌───────▼────────┐          ┌───────────▼─────────────┐
        │  PostgreSQL    │          │ Stripe · Resend · Twilio │
        └────────────────┘          │ R2 · Exchange-rate API   │
                                     └──────────────────────────┘
```

**Rendering strategy**
- Public pages are server-rendered (SSR/ISR) and fully crawlable. Detail pages personalize
  by visitor country (currency), so they render on demand; listing/content pages cache via ISR.
- Auth-aware header reads the session (cookies), so layouts render per request.
- Dashboards & admin are dynamic, non-indexed (`robots: noindex`), protected by `proxy.ts`
  (Next 16's middleware convention) + server-side `auth()` checks.

**Auth split (edge-safe)**
- `src/auth.config.ts` — edge-safe config (providers, `authorized` route guard, JWT/session callbacks). Used by `proxy.ts`.
- `src/auth.ts` — full Node config (Prisma adapter, Credentials+bcrypt, Google, impersonation provider).

---

## Feature map

### Public site (SEO)
Home (animated 3D hero) · About · Contact · FAQs (dynamic) · Supplier directory + detail ·
Product catalog + detail (localized pricing) · Category system (parent/child, dynamic) ·
Filters (country / MOQ / budget / verified) · Legal/CMS pages · sitemap.xml · robots.txt · JSON-LD.

### Authentication
Email/password · Google SSO · multi-step **supplier registration** wizard · password reset ·
role + active-mode model · route protection.

### Buyer dashboard
Overview · Post / manage / edit / close / delete **RFQs** · view & **accept/reject quotations** ·
**credits** (buy packs, transaction history) · **unlock supplier contacts** · saved items
(suppliers / products / RFQs) · notifications · profile + password + notification channels.

### Supplier dashboard
Overview · **RFQ feed** → submit / withdraw **quotations** · **product CRUD** ·
**company profile** (terms, strength, contacts) · **verification** (document submission + status).

### Admin panel
Dashboard stats + audit trail · **user management** (approve / block / **impersonate**) ·
**supplier verification** queue (approve/reject + per-document) · **RFQ moderation** (flag/delete) ·
**category** CRUD · **CMS page** CRUD · **FAQ** CRUD · **credit** adjustment. All actions audit-logged.

---

## Data model

28 Prisma models (`prisma/schema.prisma`). Key entities:

- **Identity:** `User` (role, activeMode, status), `BuyerProfile`, `SupplierProfile`, `CompanyDocument`
- **Catalog:** `Category` (self-relational tree), `Product`, `ProductPrice` (country overrides)
- **Marketplace:** `Rfq`, `Quotation`
- **Money:** `CreditAccount`, `Transaction`, `SupplierUnlock`
- **Engagement:** `SavedItem`, `Notification`, `NotificationSettings`
- **Content:** `CmsPage`, `Faq`
- **Geo:** `Country`, `Port`
- **Admin/RBAC/audit:** `RoleDef`, `Permission`, `RolePermission`, `UserRole`, `AuditLog`
- **Auth.js:** `Account`, `Session`, `VerificationToken`, `PasswordResetToken`

---

## Project structure

```
src/
├─ app/
│  ├─ (public)/         # SEO pages: home, suppliers, products, categories, about, contact, faqs, legal
│  ├─ (auth)/           # login, register, forgot/reset password
│  ├─ (dashboard)/      # buyer + supplier workspaces (protected)
│  ├─ (admin)/          # admin panel (ADMIN-gated)
│  ├─ api/              # auth handler, stripe webhook
│  ├─ sitemap.ts · robots.ts · not-found.tsx · layout.tsx · globals.css
├─ auth.ts · auth.config.ts · proxy.ts        # authentication
├─ components/
│  ├─ ui/               # shadcn-style primitives (button, card, input, …)
│  ├─ anim/             # GSAP/Three.js/Lenis (hero-3d, reveal, hero-section)
│  ├─ marketplace/ dashboard/ admin/ layout/ brand/ seo/
├─ server/
│  ├─ actions/          # 13 server-action modules (rfq, quotation, product, credits, admin-*, …)
│  ├─ auth-helpers.ts · audit.ts
├─ lib/                 # prisma, currency, stripe, credit-packs, site config, validations/
├─ generated/prisma/    # generated Prisma client (gitignored)
└─ types/               # next-auth augmentation
prisma/  schema.prisma · seed.ts
docs/    IMPLEMENTATION_PLAN.md · TECH_STACK.md · (original MVP spec)
```

---

## Getting started

### Prerequisites
- Node.js ≥ 20 (built on 24)
- A PostgreSQL database. For local dev, this project uses Prisma's bundled dev server — **no Docker needed**.

### 1. Install
```bash
npm install
```

### 2. Environment
```bash
cp .env.example .env
```
Generate an auth secret: `npx auth secret`. Stripe/Resend/Twilio/R2 keys are optional in
dev (payments simulate, emails log to console).

### 3. Database
Start the local Postgres dev server (keep it running in its own terminal):
```bash
npm run db:dev          # prints a DATABASE_URL — paste it into .env
npm run db:push         # apply the schema
npm run db:seed         # load demo data
```
> Using a cloud DB (Neon/Supabase) instead? Just set `DATABASE_URL` and run `db:push` + `db:seed`.

### 4. Run
```bash
npm run dev             # http://localhost:3000
```

---

## Demo accounts

All use password **`Password123!`**:

| Role | Email | Lands on |
|---|---|---|
| Admin | `admin@bigseaa.com` | `/admin` |
| Buyer | `buyer@bigseaa.com` | `/dashboard` (25 credits, RFQs, saved items) |
| Supplier | `acme@bigseaa.com` | `/dashboard` (products, RFQ feed) |

Other seeded suppliers: `lotus@`, `voltedge@` (pending verification), `saffron@`, `titan@`.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (type-check + static generation) |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:dev` | Start the local Prisma Postgres dev server |
| `npm run db:push` | Push the schema to the database |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## SEO

- Per-page `generateMetadata` (titles, descriptions, canonicals, OpenGraph/Twitter)
- **JSON-LD** structured data: `Product` + `Offer`, `Organization`, `FAQPage`, `BreadcrumbList`, `CollectionPage`
- Dynamic `sitemap.xml` (suppliers, products, categories, CMS) + `robots.txt`
- Clean keyword-rich slugs; breadcrumbs; internal linking
- SSR/ISR for fast, crawlable pages; Core Web Vitals friendly (`next/image`, font optimization, RSC streaming)

---

## Security

- Auth.js JWT sessions; route protection via `proxy.ts` `authorized` callback + server-side `auth()`
- **Role-based access** (`/admin` requires `ADMIN`); every mutation re-checks ownership via `requireUser` / `requireSupplierProfile` / `requireRole`
- **Zod** validation on all server actions
- Atomic credit operations in Prisma **transactions** (no double-spend / double-credit)
- Stripe **webhook signature** verification + idempotency
- Admin **impersonation** authorized by an HMAC token only the server can mint
- **Audit log** for all admin actions
- bcrypt password hashing; parameterized queries via Prisma

---

## Deployment

> The app runs entirely locally for the demo. Production deployment is documented below and **not yet performed**.

1. **Database** — provision **Neon** (or any Postgres). Set `DATABASE_URL`. Run `prisma migrate deploy` (generate migrations from the schema for production) or `prisma db push`.
2. **Host** — deploy to **Vercel** (auto-detects Next.js). Set all env vars from `.env.example`.
3. **Stripe** — add `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; register the webhook endpoint `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`. (Without keys, the app simulates purchases.)
4. **Email/SMS** — add `RESEND_API_KEY`, Twilio creds, `TELEGRAM_BOT_TOKEN` to activate channels.
5. **Storage** — add R2 credentials and swap the document-URL field for presigned uploads.
6. **Google SSO** — set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

CI suggestion: typecheck + `next build` on every PR; Vercel preview URLs for review.

---

## Roadmap & status

All 8 build phases are complete and production-build verified:

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundation (Next.js, Prisma, design system, auth skeleton) | ✅ |
| 1 | Public SEO site (listings, details, categories, filters, currency) | ✅ |
| 2 | Auth & onboarding (email/Google/OTP, supplier wizard) | ✅ |
| 3 | Buyer dashboard (RFQs, quotations, saved, profile) | ✅ |
| 4 | Supplier dashboard (RFQ feed, quotes, products, company, verification) | ✅ |
| 5 | Credits & payments (unlock flow, Stripe, packs) | ✅ |
| 6 | Admin panel (users, verification, CMS, FAQ, categories, credits, impersonation) | ✅ |
| 7 | Notifications, polish, docs | ✅ |

**Production hardening seams** (clearly marked in code): live exchange-rate feed, R2 file
uploads, real email/SMS sending, phone-OTP verification, granular RBAC UI.

---

## Notes for local development

- The bundled `prisma dev` server is SQLite-backed and can drop connections under heavy
  concurrent load (e.g. `next build` prerendering). This is handled by a **retry layer** in
  `src/lib/prisma.ts` and capped build concurrency in `next.config.ts`. A real Postgres
  (Neon) has neither limitation — those accommodations are safe to relax in production.
- `next build` may log `prisma:error` lines during static generation; these are the retry
  layer recovering and do not fail the build.

---

Built as a client pitch/demo. See `docs/IMPLEMENTATION_PLAN.md` and `docs/TECH_STACK.md` for deeper detail.

---

## Author

**Vivek Joshi** — design, architecture & development.
GitHub: [@vive4545](https://github.com/vive4545)

© 2026 Vivek Joshi. All rights reserved.
