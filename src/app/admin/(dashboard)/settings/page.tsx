import { requireOwner } from "@/lib/session";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";
import { PageHeader } from "../PageHeader";

export default async function AdminSettingsPage() {
  await requireOwner();
  const settings = await getSettings();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Location, contact details, and the rules the schedule runs on."
      />
      <SettingsForm initial={settings} />
    </div>
  );
}
