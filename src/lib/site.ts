/**
 * Central site/brand configuration. Change the brand here and it
 * propagates through metadata, header, footer, and SEO.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "BigSeaa",
  tagline: "The B2B marketplace that connects verified suppliers with serious buyers.",
  description:
    "BigSeaa is a global B2B marketplace. Discover verified suppliers, browse products with live currency conversion, post RFQs, and receive competitive quotations — all in one place.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og.png",
  locale: "en_US",
  links: {
    twitter: "https://twitter.com/bigseaa",
    linkedin: "https://linkedin.com/company/bigseaa",
  },
  nav: [
    { label: "Suppliers", href: "/suppliers" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "How it works", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
