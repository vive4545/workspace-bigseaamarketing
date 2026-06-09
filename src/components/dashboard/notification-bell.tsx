import Link from "next/link";
import { Bell } from "lucide-react";
import { prisma } from "@/lib/prisma";

/** Header bell with an unread-notification count badge. */
export async function NotificationBell({ userId }: { userId: string }) {
  const unread = await prisma.notification.count({
    where: { userId, readAt: null },
  });

  return (
    <Link
      href="/dashboard/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className="relative grid size-10 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
