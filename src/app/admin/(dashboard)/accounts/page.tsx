import { requireOwner } from "@/lib/session";
import { listAdmins } from "@/lib/auth";
import { AccountsPanel } from "./AccountsPanel";
import { PageHeader } from "../PageHeader";

export default async function AdminAccountsPage() {
  const admin = await requireOwner();
  const admins = await listAdmins();

  return (
    <div>
      <PageHeader
        title="Accounts"
        description="Who can sign in to the Nexus Meals admin."
      />
      <AccountsPanel admins={admins} currentAdminId={admin.id} />
    </div>
  );
}
