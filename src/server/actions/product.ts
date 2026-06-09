"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSupplierProfile } from "@/server/auth-helpers";
import { slugify } from "@/lib/utils";
import { productSchema } from "@/lib/validations/supplier";

type State = { error?: string } | undefined;

async function uniqueProductSlug(title: string): Promise<string> {
  const root = slugify(title) || "product";
  let slug = root;
  let n = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${root}-${n++}`;
  }
  return slug;
}

export async function createProduct(_prev: State, formData: FormData): Promise<State> {
  const { profile } = await requireSupplierProfile();
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  await prisma.product.create({
    data: {
      supplierId: profile.id,
      title: d.title,
      slug: await uniqueProductSlug(d.title),
      description: d.description || null,
      categoryId: d.categoryId || null,
      moq: d.moq,
      basePrice: d.basePrice,
      baseCurrency: d.baseCurrency || "USD",
      status: d.status,
    },
  });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function updateProduct(id: string, _prev: State, formData: FormData): Promise<State> {
  const { profile } = await requireSupplierProfile();
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing || existing.supplierId !== profile.id) return { error: "Not found" };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;

  await prisma.product.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description || null,
      categoryId: d.categoryId || null,
      moq: d.moq,
      basePrice: d.basePrice,
      baseCurrency: d.baseCurrency || "USD",
      status: d.status,
    },
  });

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const { profile } = await requireSupplierProfile();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.supplierId !== profile.id) return;
  await prisma.product.delete({ where: { id } });
  revalidatePath("/dashboard/products");
}
