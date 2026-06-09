import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free BigSeaa buyer or supplier account.",
  robots: { index: false },
};

export default async function RegisterPage() {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { code: true, name: true },
  });
  return <RegisterForm countries={countries} />;
}
