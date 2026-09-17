import { requireOwner } from "@/lib/session";
import { getOverview } from "@/lib/settings";
import { OverviewForm } from "./OverviewForm";

export default async function AdminOverviewPage() {
  await requireOwner();
  const overview = await getOverview();

  return (
    <div>
      <h1 className="font-heading text-navy-text text-2xl mb-4">Overview</h1>
      <OverviewForm initial={overview} />
    </div>
  );
}
