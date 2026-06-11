---
marp: true
title: BigSeaa — B2B Marketplace Platform
description: Technical presentation for client walkthrough
paginate: true
---

# BigSeaa
## B2B Marketplace Platform

A production-grade, SEO-first B2B marketplace — a **verified-supplier directory** with an
**RFQ / quotation engine** and a **credit-based monetization model**.

**At a glance:** 42 page routes · 28 data models s · 44 React components
Fully type-safe, end-to-end · production-build verified.

> *Talking point:* "What you're looking at is not a prototype — it's the full platform, every
> screen built and wired to a real database. Today I'll walk you through what it does, then how
> it's built, then how it scales."

---

# 1. The problem we're solving

Global B2B trade is fragmented:

- **Buyers** can't easily find *verified* suppliers, compare them, or get competitive pricing.
- **Suppliers** struggle to reach qualified, intent-driven buyers.
- Existing directories are either un-curated spam or expensive walled gardens.

**BigSeaa connects verified suppliers with serious buyers** — discovery is free and SEO-driven;
revenue comes from buyers spending **credits** to unlock contacts and from premium supplier tiers.

> *Talking point:* "Think Kompass / ThomasNet / IndiaMART — but built mobile-first, SEO-first,
> with a clean credit economy instead of clunky annual contracts."

---


# 2. Three surfaces, one codebase

| Surface | Who | Purpose |
|---|---|---|
| **Public site** | Anyone / search engines | SEO-optimized discovery — suppliers, products, categories |
| **Dashboards** | Buyers & Suppliers | Separate authenticated workspaces |
| **Admin panel** | Operators | Moderation, verification, content, monetization |

All three ship from a **single Next.js application** — shared design system, shared data layer,
one deployment.

> *Talking point:* "One codebase means one team, one deploy, no syncing a separate frontend and
> backend. That's faster to build and far cheaper to maintain."

---

# 3. The business model — credit economy


1. Discovery is **free and public** (great for SEO and top-of-funnel).
2. To **unlock a supplier's contact details**, a buyer spends **credits**.
3. Credits are bought in **packs** via **Stripe checkout**.
4. Every spend/purchase is an **atomic transaction** with a full ledger.

Revenue levers already in the platform: credit packs, supplier verification, and admin-granted
credits. Premium tiers and subscriptions are a natural next step on the same rails.

> *Talking point:* "The monetization isn't bolted on later — the credit ledger, Stripe, and the
> unlock flow are already in the product and tested."

---

# 4. Live demo flow (the script)

**Public →** Home (animated 3D hero) → Suppliers directory → filter by country / verified →
Supplier detail (price shown in *visitor's local currency*).

**Buyer →** Log in → Post an RFQ → see it on the dashboard → buy a credit pack → unlock a
supplier → receive a quotation → accept/reject it.

**Supplier →** Log in → browse the RFQ feed → submit a quotation → manage products → submit
verification documents.

**Admin →** Approve a supplier → moderate an RFQ → adjust credits → view the audit log →
*impersonate* a user to reproduce an issue.

> *Demo accounts (password `Password123!`):* `admin@bigseaa.com`, `buyer@bigseaa.com`,
> `acme@bigseaa.com`.

---

# 5. Technology stack — and why

| Layer | Technology | Why it was chosen |
|---|---|---|
| **Framework** | Next.js 16 (App Router, React 19) | SSR/SSG/ISR for SEO; one codebase for front + back |
| **Language** | TypeScript | Type-safe end to end — fewer runtime bugs |
| **Database** | PostgreSQL | Relational integrity for RFQs, quotes, credit ledger |
| **ORM** | Prisma 7 | Type-safe queries & migrations |
| **Auth** | Auth.js v5 | Email/password + Google SSO + admin impersonation |
| **Validation** | Zod 4 | Same schema validates client *and* server |
| **Styling** | Tailwind v4 + shadcn/ui | Custom ocean/teal design system |
| **Payments** | Stripe | Checkout + signed webhooks |
| **Hosting** | Vercel + Neon Postgres | Zero-config SSR, per-PR previews, serverless DB |


> *Talking point:* "Every choice is mainstream, well-supported, and hireable-for — no exotic
> dependencies that lock you in or make staffing hard."

---

# 6. Why Next.js full-stack (not a separate backend)

- **Route Handlers + Server Actions are the Node.js backend** — no separate API service to host,
  secure, and version.
- **React Server Components** keep data-fetching on the server: less JavaScript shipped, faster pages.
- **One deployment, one repo** → lower cost, faster iteration.
- Still cleanly layered: a **server/actions** layer holds business logic, so it could be split into
  microservices later *without rewriting the UI*.

> *Talking point:* "This is a deliberate architecture decision — full-stack now for speed and cost,
> with clean seams so you're never trapped if you outgrow it."

---

# 7. Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)                    │
│  (public)  SSR/ISR   │  (dashboard) Buyer/Supplier │ (admin)   │
│  ─ SEO, JSON-LD      │  ─ RSC + client islands     │ ─ RBAC    │
│                                                                │
│  Route Handlers (/api/*)  +  Server Actions  ← the backend     │
│  Auth.js (proxy.ts route protection) · Zod validation          │
│  Service/actions layer (src/server/*)                          │
└───────────────┬──────────────────────────────┬────────────────┘
                │ Prisma 7 (+ pg adapter)       │ Integrations
        ┌───────▼────────┐          ┌───────────▼─────────────┐
        │  PostgreSQL    │          │ Stripe · Resend · Twilio │
        └────────────────┘          │ R2 · Exchange-rate API   │
                                     └──────────────────────────┘
```

> *Talking point:* "Three route groups, one shared data and auth layer, integrations isolated
> behind the actions layer so any provider can be swapped without touching pages."

---

# 8. Rendering & SEO strategy

- **Public pages are server-rendered and fully crawlable** — no "blank page until JS loads."
- **JSON-LD structured data**: Product + Offer, Organization, FAQPage, BreadcrumbList, CollectionPage
  → rich results in Google.
- Dynamic **sitemap.xml** (suppliers, products, categories, content) + **robots.txt**.
- Per-page metadata, canonicals, OpenGraph/Twitter cards, clean keyword-rich slugs.
- Detail pages personalize by **visitor country** (local currency) yet stay fast and indexable.
- Dashboards & admin are explicitly **noindex** — private by design.

> *Talking point:* "Discovery is the growth engine. Every public page is built to rank — that's
> free, compounding traffic instead of paid acquisition."

---

# 9. Data model — 28 models

- **Identity:** User (role, activeMode, status), BuyerProfile, SupplierProfile, CompanyDocument
- **Catalog:** Category (self-referential tree), Product, ProductPrice (per-country overrides)
- **Marketplace:** Rfq, Quotation
- **Money:** CreditAccount, Transaction (ledger), SupplierUnlock
- **Engagement:** SavedItem, Notification, NotificationSettings
- **Content (CMS):** CmsPage, Faq
- **Geo:** Country, Port
- **RBAC & audit:** RoleDef, Permission, RolePermission, UserRole, AuditLog
- **Auth.js:** Account, Session, VerificationToken, PasswordResetToken

> *Talking point:* "It's a relational model — the credit ledger and RFQ/quote relationships need
> guarantees a document store can't give you cleanly. That's why PostgreSQL."

---

# 10. Feature deep-dive — Marketplace & discovery

**Public site:**
- Supplier directory + supplier detail pages
- Product catalog + product detail (with localized pricing)
- Category system — parent/child tree, dynamic routes
- Filters: country / MOQ / budget / verified-only
- Currency conversion driven by visitor geolocation
- About, Contact, dynamic FAQs, legal/CMS pages

> *Talking point:* "A buyer in Germany sees euros; a buyer in India sees rupees — automatically,
> on the same URL, while staying SEO-friendly."

---

# 11. Feature deep-dive — RFQ / quotation engine

**Buyer side:** post an RFQ → it appears in the supplier feed → quotations come back → buyer
**accepts or rejects** (supplier is notified instantly).

**Supplier side:** browse the **RFQ feed** → submit a quotation (one per RFQ, enforced) →
withdraw if needed.

This two-sided loop is the heart of the marketplace — it's what makes it a *marketplace* and not
just a directory.

> *Talking point:* "This is the engagement engine. Every RFQ creates supplier activity, every
> quote creates buyer activity, and every unlock creates revenue."

---

# 12. Feature deep-dive — Credits & payments

- Buyers **buy credit packs** via **Stripe Checkout**.
- Credits are spent to **unlock supplier contacts** — an **atomic Prisma transaction** so there's
  *no double-spend* and *no double-credit*.
- Full **transaction ledger** per account.
- Stripe **webhook with signature verification + idempotency** confirms purchases.
- **Dev-simulation fallback** lets the whole flow be demoed without live Stripe keys.

> *Talking point:* "The money path is the part you can't get wrong — so it's transactional,
> idempotent, and signature-verified. It also demos end-to-end today without real charges."

---

# 13. Feature deep-dive — Admin panel

- **Dashboard** with platform stats + a live **audit trail**
- **User management** — approve / block / **impersonate**
- **Supplier verification queue** — approve/reject per document
- **RFQ moderation** — flag / remove
- **CMS** page CRUD · **FAQ** CRUD · **Category** CRUD
- **Credit adjustment**
- **Every admin action is audit-logged**

> *Talking point:* "Impersonation lets support reproduce any user's issue safely — and because
> it's audit-logged and HMAC-token-gated, it can't be abused."

---

# 14. Security

- **Auth.js** JWT sessions; route protection via `proxy.ts` + server-side `auth()` re-checks
- **Role-based access control** — `/admin` requires ADMIN; every mutation re-verifies ownership
- **Zod validation** on every server action (never trust the client)
- **Atomic credit operations** in DB transactions — no race conditions on money
- **Stripe webhook signature verification** + idempotency
- **Admin impersonation** gated by an HMAC token only the server can mint
- **Audit log** on all admin actions
- **bcrypt** password hashing · **parameterized queries** via Prisma (no SQL injection)

> *Talking point:* "Security is layered — at the route, at the action, at the database. Authorization
> is re-checked server-side on every single mutation, not just at login."

---

# 15. Experience & performance

- **Server Components + streaming** → fast first paint, minimal JavaScript shipped
- **ISR caching** on listing/content pages
- `next/image`, font optimization → Core Web Vitals friendly
- Premium feel: **3D animated hero** (Three.js), **scroll reveals** (GSAP), **smooth scroll** (Lenis)
- Custom **ocean/teal design system** (oklch color tokens) — consistent across all 42 routes
- Loading skeletons and a polished empty/error-state pass throughout

> *Talking point:* "It's fast *and* it feels premium — the kind of polish that signals
> trustworthiness to a buyer deciding whether to transact."

---

# 16. Scalability & deployment

- **Vercel** hosting — zero-config SSR, automatic per-PR preview URLs, global edge
- **Neon** serverless PostgreSQL — scales with load, no DB ops burden
- **Stateless app + serverless DB** → horizontal scale out of the box
- The clean **actions/service layer** means hot paths can be extracted to dedicated services later
  without touching the UI
- **CI**: typecheck + production build on every PR before merge

> *Talking point:* "It scales by deployment config, not by rewrite. Start small on Vercel + Neon,
> grow without re-architecting."

---

# 17. Status & production-hardening seams

**Status:** All 8 build phases complete and **production-build verified**. Running locally for the
demo; production deploy is documented and ready when you give the go-ahead.

**Clearly-marked seams to flip on for production:**
- Live exchange-rate feed (currently a static FX table)
- Cloudflare R2 file uploads (currently document-by-URL)
- Real email / SMS / WhatsApp sending (wired: Resend, Twilio, Telegram)
- Phone-OTP verification
- Granular RBAC management UI

> *Talking point:* "Every external dependency that needs *your* accounts and keys is built behind
> a clean seam and simulated for the demo — go-live is configuration, not construction."

---

# 18. Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Foundation (framework, DB, design system, auth skeleton) | ✅ |
| 1 | Public SEO site (listings, details, categories, filters, currency) | ✅ |
| 2 | Auth & onboarding (email/Google, supplier wizard) | ✅ |
| 3 | Buyer dashboard (RFQs, quotations, saved, profile) | ✅ |
| 4 | Supplier dashboard (RFQ feed, quotes, products, verification) | ✅ |
| 5 | Credits & payments (unlock flow, Stripe) | ✅ |
| 6 | Admin panel (users, verification, CMS, credits, impersonation) | ✅ |
| 7 | Notifications, polish, docs | ✅ |

**Next:** production deploy → activate integrations → premium supplier tiers → analytics.

---

# 19. Why this build, summarized

- ✅ **Complete** — every persona, every screen, real data, build-verified
- ✅ **SEO-first** — discovery is the free growth engine
- ✅ **Monetization built in** — credit economy + Stripe, not an afterthought
- ✅ **Secure & auditable** — layered authz, transactional money, full audit log
- ✅ **Cost-efficient** — one codebase, serverless hosting, mainstream stack
- ✅ **Scalable without rewrite** — clean seams, swappable integrations

---

# Thank you

**BigSeaa — B2B Marketplace Platform**

Questions?

*Deeper detail in:* `README.md`, `docs/TECH_STACK.md`, `docs/IMPLEMENTATION_PLAN.md`.
