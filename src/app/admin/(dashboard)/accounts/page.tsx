import { requireOwner } from "@/lib/session";
import { listAdmins } from "@/lib/auth";
import { AccountsPanel } from "./AccountsPanel";

export default async function AdminAccountsPage() {
  const admin = await requireOwner();
  const admins = await listAdmins();

  return (
    <div>
      <h1 className="font-heading text-navy-text text-2xl mb-4">Accounts</h1>
      <AccountsPanel admins={admins} currentAdminId={admin.id} />
    </div>
  );
}
