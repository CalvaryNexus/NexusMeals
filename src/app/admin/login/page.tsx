import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-6">
      <div className="w-full max-w-sm bg-paper rounded-[12px] p-8 shadow-lg">
        <h1 className="font-heading text-navy-text text-2xl mb-1">Nexus Meals</h1>
        <p className="text-ink-soft mb-6">Admin sign in</p>
        <LoginForm />
      </div>
    </div>
  );
}
