# B2B Marketplace Platform — Implementation Plan

> Kompass-style B2B supplier directory + RFQ/quotation marketplace.
> Built on **Next.js (full-stack)** + **PostgreSQL/Prisma**. Production-grade, SEO-first, scalable.

---

## 1. Product Summary

A B2B marketplace connecting **Buyers** and **Suppliers**:

- Buyers discover suppliers/products, post **RFQs** (Request For Quotation), receive **Quotations**, and unlock supplier contacts using **credits/tokens**.
- Suppliers list products, browse and respond to RFQs, manage a verified company profile.
- Admins moderate users, verify suppliers, manage categories/CMS/FAQs, and run the credit economy.

Three personas, one codebase: **Public site (SEO)**, **Authenticated dashboards (Buyer/Supplier)**, **Admin panel**.

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 15 (App Router)                    │
│                                                                │
│  Public (SSR/SSG/ISR)  │  Dashboards (RSC + Client)  │  Admin  │
│  ─ SEO-optimized       │  ─ Buyer / Supplier         │  ─ RBAC │
│                                                                │
│  ── Route Handlers (/api/*)  +  Server Actions  ──             │
│        (this is the "Node.js backend")                         │
│                                                                │
│  Service Layer (business logic)  │  Auth.js  │  Zod validation │
└───────────────┬──────────────────────────────┬────────────────┘
                │ Prisma ORM                    │ Integrations
        ┌───────▼────────┐          ┌───────────▼─────────────┐
        │  PostgreSQL    │          │ Stripe · Resend · Twilio │
        │  (Neon/Supa)   │          │ S3/R2 · Exchange-rate API│
        └────────────────┘          └──────────────────────────┘
```

**Why Next.js full-stack here:** Route Handlers + Server Actions run on Node.js — same runtime, one deploy, shared types end-to-end (no API client drift). The **service layer** keeps business logic framework-agnostic, so it can be extracted into a standalone NestJS service later if scale demands it, without rewriting logic.

---

## 3. Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15** (App Router, React 19, TypeScript) | SSR/SSG/ISR for SEO; RSC for fast dashboards |
| Styling | **Tailwind CSS v4 + shadcn/ui** (Radix primitives) | Modern, accessible, fully custom design (not a template look) |
| DB | **PostgreSQL 16** | Relational integrity for RFQs/quotations/credits/transactions |
| ORM | **Prisma** | Type-safe schema, migrations, great DX |
| Auth | **Auth.js (NextAuth v5)** | Email/password, Google SSO, phone (Twilio Verify), RBAC sessions |
| Validation | **Zod** | Shared client/server schemas |
| Server state | **TanStack Query** | Client caching for dashboard interactivity |
| Forms | **React Hook Form + Zod** | Robust complex forms (multi-step supplier reg) |
| Payments | **Stripe** | Credit/token purchases, transaction ledger |
| Email | **Resend** (React Email templates) | Transactional notifications |
| SMS/WhatsApp/Phone OTP | **Twilio** | Multi-channel notifications + phone verification |
| Telegram | **Telegram Bot API** | Opt-in notifications |
| File storage | **Cloudflare R2 / S3** (presigned uploads) | Company docs, product images, verification files |
| Currency | **exchangerate API** (cached daily) | Country-based pricing + conversion |
| Geo | **IP geolocation** (Vercel headers / ipapi) | Auto currency by visitor country |
| Search/Filter | Postgres indexes + full-text (pgvector/Typesense later) | Country/MOQ/budget filters at scale |
| Background jobs | **Inngest** (or BullMQ + Redis) | Emails, rate refresh, exchange-rate sync |
| Testing | **Vitest + Playwright** | Unit + E2E on core flows |
| Observability | **Sentry + Vercel Analytics** | Errors + Web Vitals |
| Deployment | **Vercel** + **Neon Postgres** + **R2** | Zero-config SSR, preview deploys for pitch |

---

## 4. Repository Structure

```
/
├─ src/
│  ├─ app/
│  │  ├─ (public)/                # SEO pages — SSG/ISR
│  │  │  ├─ page.tsx              # Home
│  │  │  ├─ about/ contact/ faqs/
│  │  │  ├─ suppliers/            # listing + [slug] details
│  │  │  ├─ products/             # listing + [slug] details
│  │  │  ├─ categories/[...slug]/ # dynamic parent/child category pages
│  │  │  └─ legal/[slug]/         # CMS: privacy, terms, cookie
│  │  ├─ (auth)/                  # login, register, reset
│  │  ├─ (buyer)/dashboard/...    # RFQs, quotations, saved, credits
│  │  ├─ (supplier)/dashboard/... # RFQ feed, products, company, verification
│  │  ├─ (admin)/admin/...        # users, verification, CMS, credits, RBAC
│  │  ├─ api/                     # Route Handlers (webhooks, uploads, cron)
│  │  ├─ sitemap.ts  robots.ts    # SEO
│  │  └─ layout.tsx
│  ├─ server/
│  │  ├─ services/                # business logic (rfq, quotation, credit, supplier…)
│  │  ├─ actions/                 # Server Actions (mutations)
│  │  ├─ auth/                    # Auth.js config, RBAC guards
│  │  └─ integrations/            # stripe, resend, twilio, r2, fx
│  ├─ components/ ui/ (shadcn)  +  feature components
│  ├─ lib/                        # utils, zod schemas, currency, constants
│  └─ emails/                     # React Email templates
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts                     # demo data for the pitch
├─ public/
└─ tests/  (vitest, playwright)
```

---

## 5. Data Model (Prisma — key entities)

```
User            id, email, passwordHash?, googleId?, phone?, phoneVerified,
                role(BUYER|SUPPLIER|ADMIN), activeMode(BUYER|SUPPLIER),
                status(PENDING|ACTIVE|BLOCKED), createdAt
BuyerProfile    userId, company, country, ...
SupplierProfile userId, companyName, slug, about, strength, country, portId,
                verificationStatus(UNVERIFIED|PENDING|VERIFIED|REJECTED),
                verifiedBadge, paymentTerms, shippingTerms
CompanyDocument supplierId, type, fileUrl, status
Product         supplierId, slug, title, description, categoryId, moq,
                basePrice, baseCurrency, images[], status
ProductPrice    productId, country, currency, price   # country-based pricing
Category        id, name, slug, parentId (self-relation)  # parent/child tree
RFQ             buyerId, title, description, categoryId, country, budget,
                quantity, moq, status(OPEN|CLOSED|FLAGGED), expiresAt
Quotation       rfqId, supplierId, price, currency, leadTime, message, status
SupplierUnlock  buyerId, supplierId, creditCost, unlockedAt  # contact reveal
CreditAccount   userId, balance
Transaction     userId, type(PURCHASE|SPEND|ADMIN_ADJUST), amount, ref, stripeId
SavedItem       userId, type(SUPPLIER|RFQ|PRODUCT), targetId
Notification    userId, channel, type, payload, readAt
NotifSettings   userId, email, telegram, sms, whatsapp (per-channel toggles)
CMSPage         slug, title, body, published      # privacy/terms/cookie/etc
FAQ             question, answer, category, order, published
Country         code, name, currency, dialCode
Port            countryId, name, code
Role / Permission / RolePermission   # admin internal RBAC
AuditLog        actorId, action, entity, meta      # impersonation, approvals
```

Indexes on: `Product(categoryId, country, moq)`, `RFQ(status, categoryId, country)`, `SupplierProfile(slug, verificationStatus)`, `Category(parentId, slug)`.

---

## 6. Feature → Build Mapping (from the MVP spec)

| Spec area | Implementation |
|---|---|
| Supplier/Product listings + advanced filters | ISR pages, server-side filtering (country/MOQ/budget), pagination, currency conversion via `ProductPrice` + FX cache |
| Category system (parent/child, dynamic pages) | Self-relational `Category`, `/categories/[...slug]` catch-all with ISR + breadcrumb schema |
| Auth (email, Google SSO, phone OTP) | Auth.js providers; multi-step supplier registration wizard (RHF) |
| RFQ + Quotation lifecycle | Service layer + Server Actions; status machine; supplier RFQ feed with filters |
| Unlock supplier contact | `SupplierUnlock` spends credits atomically (Prisma transaction) |
| Credits/Tokens + payments | Stripe Checkout → webhook → `Transaction` ledger → `CreditAccount` |
| Country-based pricing | Geo-detect country → currency; `ProductPrice` overrides + live FX fallback |
| Notifications (email/SMS/WhatsApp/Telegram) | Channel adapters behind one `notify()` service; `NotifSettings` toggles; queued via Inngest |
| Saved data | `SavedItem` polymorphic table |
| Buyer/Supplier mode switch | `User.activeMode` toggle; same account, scoped dashboards |
| Admin: users/verification/RBAC/impersonation | Admin panel, `AuditLog`, approve/reject/block, Role/Permission management, impersonate via signed session |
| Admin: CMS + FAQ | `CMSPage`/`FAQ` CRUD rendered on public ISR pages |
| Trust & safety | Manual verified badge, report/flag, RFQ rate-limit (spam protection) |
| Country/Port management | Admin CRUD (DB-seeded initially) |

---

## 7. SEO Strategy (the core reason for Next.js)

1. **Rendering:** Public pages use **SSG + ISR** (revalidate on content change); dashboards are non-indexed CSR/RSC.
2. **Dynamic metadata:** Per-page `generateMetadata()` — titles, descriptions, OpenGraph/Twitter cards for every supplier, product, and category.
3. **Structured data (JSON-LD):** `Organization`, `Product` (with `offers`/price/currency), `BreadcrumbList`, `FAQPage` → rich results.
4. **Sitemaps:** Dynamic `sitemap.ts` (suppliers, products, categories) + `robots.ts`; submit to Search Console.
5. **URLs:** Clean, keyword-rich slugs (`/suppliers/acme-textiles`, `/categories/industrial/pumps`).
6. **Performance / Core Web Vitals:** `next/image`, font optimization, RSC streaming, edge caching → strong LCP/CLS.
7. **i18n-ready:** `hreflang` + currency/country signals; locale routing scaffolded for future expansion.
8. **Internal linking:** Category ↔ product ↔ supplier cross-links to spread crawl equity.

---

## 8. Design / UX Direction (distinct from Kompass)

- **Custom design system** built on shadcn/ui + Tailwind tokens — *not* a stock template.
- Define brand tokens (color, type scale, radius, spacing, motion) → light/dark themes.
- Modern marketplace patterns: prominent search-first hero, faceted filter rails, supplier trust cards (verified badges), clean RFQ wizard, data-dense but breathable dashboards.
- Micro-interactions (Framer Motion), skeleton loaders, empty states, toasts.
- Fully responsive + accessible (WCAG AA, keyboard nav, focus states).
- A short **design pass / style tile** delivered first so the pitch looks polished.

---

## 9. Security & Quality

- Auth.js sessions + middleware route guards per role; RBAC permission checks in service layer.
- Zod validation on every mutation; rate limiting (Upstash) on auth + RFQ posting.
- Prisma parameterized queries; presigned uploads with type/size limits + virus-scan hook.
- Stripe webhook signature verification; credit spends in DB transactions (no double-spend).
- Audit logging for admin actions + impersonation; CSRF protection on actions; security headers/CSP.
- Secrets via env; least-privilege DB role.

---

## 10. Deployment

| Concern | Approach |
|---|---|
| Hosting | **Vercel** — auto SSR/ISR, per-PR **preview URLs** (ideal for client review) |
| Database | **Neon** (serverless Postgres, branching) or Supabase |
| Files | **Cloudflare R2** (S3-compatible, cheap egress) |
| Jobs/cron | Vercel Cron + Inngest (FX refresh, digest emails) |
| Env/Secrets | Vercel project envs (dev/preview/prod) |
| CI/CD | GitHub → Vercel; lint + typecheck + Vitest + Playwright smoke on PR |
| Migrations | `prisma migrate deploy` in build step |
| Monitoring | Sentry (errors) + Vercel Analytics (Web Vitals) |
| Domains | Custom domain + SSL; staging subdomain for the pitch |

---

## 11. Phased Build Roadmap

**Phase 0 — Foundation (scaffold)**
Next.js + TS + Tailwind + shadcn, Prisma + Neon, Auth.js skeleton, design tokens, CI, base layout, seed script.

**Phase 1 — Public site + SEO**
Home, About, Contact, FAQs, supplier/product listings + details, category system, filters, currency, sitemap/robots/JSON-LD. *(This is the demo-able, indexable surface.)*

**Phase 2 — Auth & onboarding**
Email/password, Google SSO, multi-step supplier registration, phone OTP, password reset, role/mode model.

**Phase 3 — Buyer dashboard**
Post/manage RFQs, view quotations, saved items, profile settings, notifications.

**Phase 4 — Supplier dashboard**
RFQ feed + responses, product CRUD, company profile/documents, verification submission.

**Phase 5 — Credits & payments**
Stripe checkout, credit ledger, unlock-supplier flow, transaction history.

**Phase 6 — Admin panel**
User mgmt + approve/block + impersonate, verification queue, category/CMS/FAQ mgmt, credit mgmt, RBAC, trust & safety, country/port mgmt.

**Phase 7 — Notifications & polish**
Multi-channel notifications + settings, audit logs, rate limits, E2E tests, perf/SEO audit, deploy hardening.

---

## 12. Immediate Next Step

Scaffold **Phase 0** + start **Phase 1** (public SEO site with seeded demo data) so there's a live, impressive, indexable surface to show the client fast — then iterate phase by phase.
