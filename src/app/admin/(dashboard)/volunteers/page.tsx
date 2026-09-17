import { requireOwner } from "@/lib/session";
import { listPastSignups } from "@/lib/signups";
import { getSettings } from "@/lib/settings";
import { chicagoTodayYMD, formatDateShort } from "@/lib/schedule";
import { DownloadIcon } from "@/components/Icons";
import { VolunteersTable, type VolunteerRow } from "./VolunteersTable";
import { PageHeader } from "../PageHeader";

export default async function VolunteersPage() {
  await requireOwner();
  const [past, settings] = await Promise.all([
    listPastSignups(chicagoTodayYMD()),
    getSettings(),
  ]);

  const rows: VolunteerRow[] = past
    .filter((s) => !s.purged)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((s) => ({
      id: s.id,
      dateLabel: formatDateShort(s.date),
      name: s.name ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      meal: s.meal,
    }));

  return (
    <div>
      <PageHeader
        title="Past volunteers"
        description={`Names, emails, and phone numbers are wiped ${settings.retentionDays} days after the Sunday. Export before then for last-minute coverage, recruiting, or retreats.`}
      >
        <a href="/api/admin/export" className="btn btn-sm btn-primary">
          <DownloadIcon className="h-4 w-4" />
          Export CSV
        </a>
      </PageHeader>

      <VolunteersTable rows={rows} />
    </div>
  );
}
