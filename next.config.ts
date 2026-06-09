import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Local dev DB (`prisma dev`, SQLite-backed) drops connections under highly
  // concurrent build-time prerendering. Cap concurrency so static generation
  // is gentle on it. A real Postgres (Neon) handles full parallelism — raising
  // or removing these in production is safe.
  experimental: {
    cpus: 1,
    workerThreads: false,
    staticGenerationMaxConcurrency: 1,
    staticGenerationRetryCount: 3,
  },
};

export default nextConfig;
