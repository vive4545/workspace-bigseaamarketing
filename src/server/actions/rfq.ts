"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { rfqSchema } from "@/lib/validations/rfq";

type State = { error?: string } | undefined;

function num(v: unknown): number | undefined {
  return v === "" || v === undefined || v === null ? undefined : Number(v);
}

export async function createRfq(_prev: State, formData: FormData): Promise<State> {
  const user = await requireUser();
  const parsed = rfqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  const country = d.countryCode
    ? await prisma.country.findUnique({ where: { code: String(d.countryCode) } })
    : null;

  const rfq = await prisma.rfq.create({
    data: {
      buyerId: user.id,
      title: d.title,
      description: d.description,
      categoryId: d.categoryId || null,
      countryId: country?.id ?? null,
      budget: num(d.budget),
      currency: d.currency || "USD",
      quantity: num(d.quantity),
      moq: num(d.moq),
      status: "OPEN",
    },
  });

  revalidatePath("/dashboard/rfqs");
  redirect(`/dashboard/rfqs/${rfq.id}`);
}

export async function updateRfq(id: string, _prev: State, formData: FormData): Promise<State> {
  const user = await requireUser();
  const existing = await prisma.rfq.findUnique({ where: { id } });
  if (!existing || existing.buyerId !== user.id) return { error: "Not found" };

  const parsed = rfqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const country = d.countryCode
    ? await prisma.country.findUnique({ where: { code: String(d.countryCode) } })
    : null;

  await prisma.rfq.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description,
      categoryId: d.categoryId || null,
      countryId: country?.id ?? null,
      budget: num(d.budget),
      currency: d.currency || "USD",
      quantity: num(d.quantity),
      moq: num(d.moq),
    },
  });

  revalidatePath(`/dashboard/rfqs/${id}`);
  redirect(`/dashboard/rfqs/${id}`);
}

export async function closeRfq(id: string) {
  const user = await requireUser();
  const rfq = await prisma.rfq.findUnique({ where: { id } });
  if (!rfq || rfq.buyerId !== user.id) return;
  await prisma.rfq.update({ where: { id }, data: { status: "CLOSED" } });
  revalidatePath(`/dashboard/rfqs/${id}`);
  revalidatePath("/dashboard/rfqs");
}

export async function reopenRfq(id: string) {
  const user = await requireUser();
  const rfq = await prisma.rfq.findUnique({ where: { id } });
  if (!rfq || rfq.buyerId !== user.id) return;
  await prisma.rfq.update({ where: { id }, data: { status: "OPEN" } });
  revalidatePath(`/dashboard/rfqs/${id}`);
  revalidatePath("/dashboard/rfqs");
}

export async function deleteRfq(id: string) {
  const user = await requireUser();
  const rfq = await prisma.rfq.findUnique({ where: { id } });
  if (!rfq || rfq.buyerId !== user.id) return;
  await prisma.rfq.delete({ where: { id } });
  revalidatePath("/dashboard/rfqs");
  redirect("/dashboard/rfqs");
}
