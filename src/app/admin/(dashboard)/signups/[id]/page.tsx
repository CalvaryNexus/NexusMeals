import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getSignup } from "@/lib/signups";
import { formatDateLong } from "@/lib/schedule";
import { ManualSignupForm } from "../ManualSignupForm";

export default async function EditSignupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const signup = await getSignup(id);
  if (!signup) notFound();

  return (
    <div>
      <h1 className="font-heading text-navy-text text-2xl mb-1">
        Edit signup
      </h1>
      <p className="text-ink-soft mb-4">{formatDateLong(signup.date)}</p>
      <ManualSignupForm
        mode="edit"
        signupId={signup.id}
        initial={{
          name: signup.name ?? "",
          email: signup.email ?? "",
          phone: signup.phone ?? "",
          meal: signup.meal,
        }}
      />
    </div>
  );
}
