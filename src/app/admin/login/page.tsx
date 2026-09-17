import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import { Logo } from "@/components/Logo";
import { ArrowLeftIcon } from "@/components/Icons";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="hero flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto h-9 text-white" />

        <div className="mt-8 rounded-[18px] bg-paper p-7 shadow-[var(--shadow-3)] enter-up">
          <h1 className="display text-xl text-navy-text">Team sign in</h1>
          <p className="mt-1 mb-6 text-sm text-ink-soft">
            Manage the schedule, signups, and volunteer details.
          </p>
          <LoginForm />
        </div>

        <Link
          href="/schedule"
          className="mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to the public schedule
        </Link>
      </div>
    </div>
  );
}
