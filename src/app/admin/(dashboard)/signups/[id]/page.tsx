import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getSignup } from "@/lib/signups";
import { formatDateLong } from "@/lib/schedule";
import { ArrowLeftIcon } from "@/components/Icons";
import { ManualSignupForm } from "../ManualSignupForm";
import { PageHeader } from "../../PageHeader";

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
      <Link
        href="/admin"
        className="link-underline mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to the dashboard
      </Link>
      <PageHeader
        title="Edit signup"
        description={formatDateLong(signup.date)}
      />
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
