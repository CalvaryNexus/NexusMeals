import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/session";
import { seedOwnerIfNeeded } from "@/lib/auth";
import { LogoutButton } from "./LogoutButton";

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
    { href: "/admin", label: "Dashboard" },
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
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy">
        <div className="mx-auto max-w-[1140px] px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <span className="font-heading text-white">Nexus Meals Admin</span>
            <nav className="flex flex-wrap gap-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-white/90 hover:text-white text-sm font-semibold"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm">
              {admin.email} ({admin.role})
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-[1140px] w-full px-6 py-8">
        {children}
      </main>
    </div>
  );
}
