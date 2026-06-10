import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Detects transient connection failures that are safe to retry. Covers Prisma
 * P-codes (P1017/P1001), pg SQLSTATEs for connection loss, node socket errors,
 * and the bare "Connection terminated…" messages the pg driver throws when a
 * pooled socket was closed server-side (the local `prisma dev` DB does this).
 */
function isTransientDbError(err: unknown): boolean {
  const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  const code = e?.code ?? e?.cause?.code;
  if (code) {
    const transientCodes = new Set([
      "P1017", "P1001", "P1002", // Prisma: connection closed / unreachable / timed out
      "57P01", "08006", "08003", "08001", "08004", // pg SQLSTATE: connection loss
      "ECONNRESET", "ETIMEDOUT", "EPIPE", "ECONNREFUSED", // node socket errors
    ]);
    if (transientCodes.has(code)) return true;
  }
  const msg = `${e?.message ?? ""} ${e?.cause?.message ?? ""}`.toLowerCase();
  return (
    msg.includes("connection terminated") ||
    msg.includes("connection timeout") ||
    msg.includes("connection reset") ||
    msg.includes("socket hang up") ||
    msg.includes("server closed the connection") ||
    msg.includes("terminating connection")
  );
}

function createClient() {
  // Finite pool timeouts so a wedged/exhausted pool fails fast instead of
  // hanging forever (the local dev DB URL sets pool_timeout=0 = infinite).
  // Short idle timeout so the client retires connections before the flaky
  // dev DB kills them server-side (avoids reusing an already-dead socket).
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });

  const base = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Transparently retry transient connection drops. Keeps the app resilient
  // and survives the local dev DB closing sockets (those throw a bare
  // "Connection terminated unexpectedly" with no Prisma P-code, so detection
  // sniffs the message/SQLSTATE too — see isTransientDbError).
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        const maxAttempts = 5;
        for (let attempt = 1; ; attempt++) {
          try {
            return await query(args);
          } catch (err: unknown) {
            if (isTransientDbError(err) && attempt < maxAttempts) {
              await new Promise((r) => setTimeout(r, 150 * attempt));
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
