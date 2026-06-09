import type { Metadata } from "next";
import { Bell, Check } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/actions/notification";
import { PageHeader } from "@/components/dashboard/page-header";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Notifications"
        description={unread ? `${unread} unread` : "You’re all caught up."}
        action={
          unread > 0 ? (
            <form action={markAllNotificationsRead}>
              <SubmitButton variant="outline" size="sm">
                <Check className="size-4" /> Mark all read
              </SubmitButton>
            </form>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <Bell className="size-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={cn(!n.readAt && "border-primary/30 bg-primary/5")}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="flex gap-3">
                  <span className={cn("mt-1 size-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-primary")} />
                  <div>
                    <p className="font-medium">{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!n.readAt && (
                  <form action={markNotificationRead.bind(null, n.id)}>
                    <SubmitButton variant="ghost" size="sm">Mark read</SubmitButton>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
