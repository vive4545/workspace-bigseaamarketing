import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/server/auth-helpers";
import { updateNotificationSettings } from "@/server/actions/notification";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PasswordForm } from "@/components/dashboard/password-form";
import { SubmitButton } from "@/components/dashboard/action-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Profile & settings", robots: { index: false } };

const CHANNELS = [
  { name: "email", label: "Email" },
  { name: "sms", label: "SMS" },
  { name: "whatsapp", label: "WhatsApp" },
  { name: "telegram", label: "Telegram" },
] as const;

export default async function ProfilePage() {
  const sessionUser = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { buyerProfile: true, supplierProfile: true, notifSettings: true },
  });
  if (!user) return null;

  const settings = user.notifSettings ?? {
    email: true,
    sms: false,
    whatsapp: false,
    telegram: false,
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile & settings" description="Manage your account details and preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              role={user.role}
              defaults={{
                name: user.name ?? "",
                phone: user.phone ?? "",
                company: user.buyerProfile?.company ?? "",
                about: user.supplierProfile?.about ?? user.buyerProfile?.about ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification channels</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={updateNotificationSettings} className="space-y-3">
              {CHANNELS.map((c) => (
                <label key={c.name} className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm font-medium">{c.label}</span>
                  <input
                    type="checkbox"
                    name={c.name}
                    defaultChecked={Boolean(settings[c.name])}
                    className="size-4 accent-[var(--primary)]"
                  />
                </label>
              ))}
              <SubmitButton variant="outline" size="sm">Save preferences</SubmitButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
