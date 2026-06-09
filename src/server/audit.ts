import { prisma } from "@/lib/prisma";

/** Record an admin/system action for the audit trail. */
export async function logAudit(input: {
  actorId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entityId: input.entityId ?? null,
      meta: input.meta ? (input.meta as object) : undefined,
    },
  });
}
