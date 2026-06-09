import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 "proxy" convention (formerly middleware). Edge-safe auth instance
// drives route protection via the `authorized` callback in authConfig.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
