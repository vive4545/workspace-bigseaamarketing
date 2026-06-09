import { createHmac, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { loginSchema } from "@/lib/validations/auth";

/** HMAC used to authorize admin impersonation (only the server can mint it). */
export function impersonationToken(userId: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`impersonate:${userId}`)
    .digest("hex");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user?.passwordHash || user.status === "BLOCKED") return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          activeMode: user.activeMode,
          status: user.status,
        };
      },
    }),
    Credentials({
      id: "impersonate",
      name: "Impersonate",
      credentials: { userId: {}, token: {} },
      async authorize(credentials) {
        const userId = String(credentials?.userId ?? "");
        const token = String(credentials?.token ?? "");
        if (!userId || !token || !process.env.AUTH_SECRET) return null;

        const expected = impersonationToken(userId);
        const a = Buffer.from(token);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          activeMode: user.activeMode,
          status: user.status,
        };
      },
    }),
  ],
  events: {
    // Provision related records for users created via OAuth (Google).
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { status: "ACTIVE", role: "BUYER", activeMode: "BUYER" },
        }),
        prisma.creditAccount.create({ data: { userId: user.id, balance: 5 } }),
        prisma.notificationSettings.create({ data: { userId: user.id } }),
      ]);
    },
  },
});
