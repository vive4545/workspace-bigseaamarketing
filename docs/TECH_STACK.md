# BigSeaa — Technology Stack & Rationale

The original spec suggested **MERN** (MongoDB, Express, React, Node). We kept the parts of that vision that serve the business and upgraded the parts that don't. The result is a **Next.js full-stack + PostgreSQL** architecture: still all-JavaScript/TypeScript end-to-end (the MERN promise of one language), but better suited to SEO, relational marketplace data, and a credible "scalable" pitch.

> One-line summary: **Next.js 16 (TypeScript) · PostgreSQL + Prisma · Auth.js · Tailwind/shadcn · Stripe/Resend/Twilio · Vercel.**

---

## Why we changed two things from MERN

| Spec (MERN) | We use | Business reason |
|---|---|---|
| **React (CRA/SPA)** | **Next.js (SSR/SSG)** | A B2B marketplace lives or dies on **SEO** — buyers find suppliers via Google. A client-rendered SPA is nearly invisible to search engines. Next.js renders supplier/product/category pages on the server so every listing is indexable. This was your explicit requirement. |
| **MongoDB** | **PostgreSQL** | The core data is **deeply relational and financial**: RFQs → quotations, buyers ↔ suppliers, credits → transactions, categories (parent/child trees), roles/permissions. Postgres guarantees integrity (no double-spent credits, no orphaned quotes) and makes reporting easy — exactly what a marketplace needs. |

Express and Node are still here — Next.js's server runtime **is** Node, and its Route Handlers/Server Actions replace a separate Express layer.

---

## The stack, layer by layer

### 1. Frontend & Backend — **Next.js 16 (App Router, React 19, TypeScript)**
- **Why:** One framework renders SEO pages (server-side), powers interactive dashboards (React Server Components + client islands), and hosts the API (Route Handlers + Server Actions) — all in Node.js.
- **Business need:** SEO-driven discovery, fast page loads (better conversion), and a single codebase/one deployment (lower cost, faster delivery for the pitch). TypeScript end-to-end means fewer production bugs.

### 2. Database — **PostgreSQL**
- **Why:** Battle-tested relational database with transactions, constraints, and rich querying.
- **Business need:** Trustworthy money/credit handling, accurate RFQ–quotation relationships, and analytics the client will eventually want (top suppliers, conversion funnels).

### 3. ORM / data layer — **Prisma 7**
- **Why:** Type-safe database access generated from a single schema; handles migrations and protects against SQL injection.
- **Business need:** Faster, safer development and a schema that doubles as living documentation — easy to evolve as features are added phase by phase.

### 4. Authentication — **Auth.js (NextAuth v5)**
- **Why:** Native to Next.js; supports email/password, **Google SSO**, and phone OTP, with role-based sessions (Buyer / Supplier / Admin) and an account "mode switch."
- **Business need:** The spec requires multiple sign-up methods, supplier multi-step registration, and strict role separation including admin impersonation — all standard in Auth.js.

### 5. UI / design system — **Tailwind CSS v4 + shadcn/ui (Radix)**
- **Why:** A fully **custom**, token-driven design system (we chose an ocean/teal brand) — not a stock template — that's accessible (WCAG) and ships light/dark themes.
- **Business need:** The pitch must look distinctly *not* like Kompass and feel premium. Tailwind + shadcn gives a modern, bespoke look quickly.

### 6. Validation — **Zod**
- **Why:** One schema validates data on both client and server.
- **Business need:** Clean forms (e.g. the supplier registration wizard) and a secure API — every input is checked before it touches the database.

### 7. Payments — **Stripe**
- **Why:** Industry standard for the credit/token economy (buyers purchase credits to unlock supplier contacts).
- **Business need:** The spec's monetization model. Stripe's webhooks + our transaction ledger ensure credits are never double-counted.

### 8. Communications — **Resend (email), Twilio (SMS/WhatsApp/phone OTP), Telegram Bot API**
- **Why:** Best-in-class providers behind a single notification service with per-channel user toggles.
- **Business need:** The spec calls for multi-channel notifications and phone verification. Abstracting them lets the admin enable/disable channels without code changes.

### 9. File storage — **Cloudflare R2 / S3 (presigned uploads)**
- **Why:** Cheap, S3-compatible object storage for company documents, verification files, and product images.
- **Business need:** Supplier verification and product catalogs require secure, scalable file handling separate from the app server.

### 10. Currency & geo — **Exchange-rate API + IP geolocation**
- **Why:** Detect the visitor's country, show localized currency, and convert prices.
- **Business need:** The spec's "country-based pricing / currency conversion" — critical for a global B2B audience.

### 11. Background jobs — **Inngest (or BullMQ + Redis)**
- **Why:** Reliable async processing for emails, digest notifications, and daily exchange-rate refresh.
- **Business need:** Keeps the app responsive and notifications dependable as volume grows.

### 12. Deployment & ops — **Vercel + managed Postgres (Neon) + Sentry**
- **Why:** Zero-config hosting for Next.js with per-pull-request **preview URLs**, serverless Postgres, and error monitoring.
- **Business need:** You can show the client a live staging link at every step; the platform scales automatically and is observable in production.

---

## How this maps to the "scalable architecture" promise

- **Separation of concerns:** business logic lives in a framework-agnostic **service layer**, so it can be extracted into a standalone Node/NestJS microservice later — without rewriting logic — if traffic demands it.
- **Stateless app + managed data services** (Postgres, R2, Redis): scale horizontally behind Vercel's edge.
- **TypeScript + Prisma + Zod** give compile-time and runtime safety, reducing regressions as the team adds features.

In short: **all-TypeScript like MERN, but SEO-first and built on a relational core** — the right trade-offs for a B2B marketplace you're pitching as production-ready and scalable.
