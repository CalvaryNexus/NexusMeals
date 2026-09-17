import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import { seedOwnerIfNeeded } from "@/lib/auth";
import { ToastProvider } from "@/components/Toast";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await seedOwnerIfNeeded();
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const links = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/schedule", label: "Schedule" },
    { href: "/admin/signups/new", label: "Add signup" },
  ];
  if (admin.role === "owner") {
    links.push(
      { href: "/admin/overview", label: "Overview" },
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/volunteers", label: "Volunteers" },
      { href: "/admin/accounts", label: "Accounts" },
    );
  }

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-paper-sunk">
        <AdminNav links={links} email={admin.email} role={admin.role} />
        <main className="mx-auto w-full max-w-[1140px] flex-1 px-6 py-8">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
