import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

function createClient() {
  // Finite pool timeouts so a wedged/exhausted pool fails fast instead of
  // hanging forever (the local dev DB URL sets pool_timeout=0 = infinite).
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Transparently retry transient connection drops (P1017 / P1001). Keeps the
  // app resilient under load and survives the local dev DB closing sockets
  // during concurrent build-time prerendering.
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const maxAttempts = 4;
        for (let attempt = 1; ; attempt++) {
          try {
            return await query(args);
          } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            const transient = code === "P1017" || code === "P1001";
            if (transient && attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, 120 * attempt));
              continue;
            }
            throw err;
          }
        }
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

/** Singleton Prisma client (avoids exhausting connections in dev HMR). */
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
