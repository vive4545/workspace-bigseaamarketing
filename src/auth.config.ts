import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { Role, AccountMode, UserStatus } from "@/generated/prisma/enums";

type AppToken = {
  id?: string;
  role?: Role;
  activeMode?: AccountMode;
  status?: UserStatus;
};

/**
 * Edge-safe Auth.js config (no Prisma / bcrypt). Shared by middleware and the
 * full Node config. Route protection lives in `authorized`.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      const isProtected =
        path.startsWith("/dashboard") || path.startsWith("/admin");
      const isAdminArea = path.startsWith("/admin");

      if (isProtected && !isLoggedIn) return false;
      // Authenticated but wrong role: send them to their own dashboard rather
      // than the login page (which is confusing for an already-signed-in user).
      if (isAdminArea && auth?.user?.role !== "ADMIN") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    jwt({ token, user, trigger, session }) {
      const t = token as AppToken;
      if (user) {
        t.id = user.id;
        t.role = user.role;
        t.activeMode = user.activeMode;
        t.status = user.status;
      }
      // Allow updating activeMode via session.update() (buyer/supplier switch).
      if (trigger === "update" && session?.activeMode) {
        t.activeMode = session.activeMode as AccountMode;
      }
      return token;
    },
    session({ session, token }) {
      const t = token as AppToken;
      if (session.user) {
        if (t.id) session.user.id = t.id;
        if (t.role) session.user.role = t.role;
        if (t.activeMode) session.user.activeMode = t.activeMode;
        if (t.status) session.user.status = t.status;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
