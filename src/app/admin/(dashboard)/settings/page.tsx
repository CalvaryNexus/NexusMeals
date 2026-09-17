import { requireOwner } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  await requireOwner();
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-heading text-navy-text text-2xl mb-4">Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
