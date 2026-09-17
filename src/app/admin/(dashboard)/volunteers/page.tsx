import { requireOwner } from "@/lib/session";
import { listPastSignups } from "@/lib/signups";
import { chicagoTodayYMD, formatDateShort } from "@/lib/schedule";

export default async function VolunteersPage() {
  await requireOwner();
  const past = await listPastSignups(chicagoTodayYMD());
  const nonPurged = past
    .filter((s) => !s.purged)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="font-heading text-navy-text text-2xl">
          Past volunteers
        </h1>
        <a
          href="/api/admin/export"
          className="tap-target inline-flex items-center justify-center rounded-[8px] bg-navy px-5 py-2.5 text-white font-semibold hover:bg-navy-text transition-colors"
        >
          Export CSV
        </a>
      </div>
      <p className="text-ink-soft text-sm mb-4">
        Names, emails, and phone numbers are wiped 30 days after the Sunday.
        Export before then for last-minute coverage, recruiting, or retreats.
      </p>
      {nonPurged.length === 0 ? (
        <p className="text-ink-soft">No past volunteers yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-rule">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Meal</th>
              </tr>
            </thead>
            <tbody>
              {nonPurged.map((s) => (
                <tr key={s.id} className="border-b border-rule">
                  <td className="py-2 pr-4">{formatDateShort(s.date)}</td>
                  <td className="py-2 pr-4">{s.name}</td>
                  <td className="py-2 pr-4">{s.email}</td>
                  <td className="py-2 pr-4">{s.phone}</td>
                  <td className="py-2 pr-4">{s.meal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
