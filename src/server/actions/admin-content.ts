"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth-helpers";
import { logAudit } from "@/server/audit";
import { slugify } from "@/lib/utils";

type State = { error?: string; success?: string } | undefined;

// ----------------------------- Categories ----------------------------------
const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  parentId: z.string().optional().or(z.literal("")),
});

export async function saveCategory(id: string | null, _prev: State, formData: FormData): Promise<State> {
  const admin = await requireRole("ADMIN");
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { name, parentId } = parsed.data;

  if (id) {
    await prisma.category.update({ where: { id }, data: { name, parentId: parentId || null } });
  } else {
    await prisma.category.create({
      data: { name, slug: slugify(name), parentId: parentId || null },
    });
  }
  await logAudit({ actorId: admin.id, action: id ? "category.update" : "category.create", entity: "Category", entityId: id ?? undefined });
  revalidatePath("/admin/categories");
  return { success: "Saved." };
}

export async function deleteCategory(id: string) {
  const admin = await requireRole("ADMIN");
  await prisma.category.deleteMany({ where: { id } });
  await logAudit({ actorId: admin.id, action: "category.delete", entity: "Category", entityId: id });
  revalidatePath("/admin/categories");
}

// ------------------------------- CMS pages ----------------------------------
const cmsSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  body: z.string().min(1, "Body is required"),
  published: z.string().optional(),
});

export async function saveCmsPage(id: string | null, _prev: State, formData: FormData): Promise<State> {
  const admin = await requireRole("ADMIN");
  const parsed = cmsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  const data = {
    title: d.title,
    slug: slugify(d.slug),
    body: d.body,
    published: d.published === "on",
  };

  if (id) await prisma.cmsPage.update({ where: { id }, data });
  else await prisma.cmsPage.create({ data });

  await logAudit({ actorId: admin.id, action: id ? "cms.update" : "cms.create", entity: "CmsPage", entityId: id ?? undefined });
  revalidatePath("/admin/cms");
  return { success: "Saved." };
}

export async function deleteCmsPage(id: string) {
  const admin = await requireRole("ADMIN");
  await prisma.cmsPage.delete({ where: { id } });
  await logAudit({ actorId: admin.id, action: "cms.delete", entity: "CmsPage", entityId: id });
  revalidatePath("/admin/cms");
}

// --------------------------------- FAQs -------------------------------------
const faqSchema = z.object({
  question: z.string().min(4, "Question is required"),
  answer: z.string().min(2, "Answer is required"),
  category: z.string().optional().or(z.literal("")),
  published: z.string().optional(),
});

export async function saveFaq(id: string | null, _prev: State, formData: FormData): Promise<State> {
  const admin = await requireRole("ADMIN");
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;
  const data = {
    question: d.question,
    answer: d.answer,
    category: d.category || null,
    published: d.published === "on",
  };

  if (id) await prisma.faq.update({ where: { id }, data });
  else await prisma.faq.create({ data });

  await logAudit({ actorId: admin.id, action: id ? "faq.update" : "faq.create", entity: "Faq", entityId: id ?? undefined });
  revalidatePath("/admin/faqs");
  return { success: "Saved." };
}

export async function deleteFaq(id: string) {
  const admin = await requireRole("ADMIN");
  await prisma.faq.delete({ where: { id } });
  await logAudit({ actorId: admin.id, action: "faq.delete", entity: "Faq", entityId: id });
  revalidatePath("/admin/faqs");
}

// ------------------------------ Moderation ----------------------------------
export async function adminDeleteRfq(id: string) {
  const admin = await requireRole("ADMIN");
  await prisma.rfq.delete({ where: { id } });
  await logAudit({ actorId: admin.id, action: "rfq.delete", entity: "Rfq", entityId: id });
  revalidatePath("/admin/rfqs");
}

export async function adminFlagRfq(id: string) {
  const admin = await requireRole("ADMIN");
  await prisma.rfq.update({ where: { id }, data: { status: "FLAGGED" } });
  await logAudit({ actorId: admin.id, action: "rfq.flag", entity: "Rfq", entityId: id });
  revalidatePath("/admin/rfqs");
}
