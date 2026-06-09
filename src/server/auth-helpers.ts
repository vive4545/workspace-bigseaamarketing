import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Returns the authenticated session user, or redirects to login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Returns the authenticated user only if they have the given role. */
export async function requireRole(role: "BUYER" | "SUPPLIER" | "ADMIN") {
  const user = await requireUser();
  if (user.role !== role && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

/** Current user's supplier profile, or redirect to dashboard if none. */
export async function requireSupplierProfile() {
  const user = await requireUser();
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/dashboard");
  return { user, profile };
}
