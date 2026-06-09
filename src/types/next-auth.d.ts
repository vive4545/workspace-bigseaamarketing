import type { DefaultSession } from "next-auth";
import type { Role, AccountMode, UserStatus } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      activeMode: AccountMode;
      status: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    activeMode?: AccountMode;
    status?: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    activeMode?: AccountMode;
    status?: UserStatus;
  }
}
