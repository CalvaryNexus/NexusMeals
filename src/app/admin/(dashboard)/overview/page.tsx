import { requireOwner } from "@/lib/session";
import { getOverview } from "@/lib/settings";
import { OverviewForm } from "./OverviewForm";
import { PageHeader } from "../PageHeader";

export default async function AdminOverviewPage() {
  await requireOwner();
  const overview = await getOverview();

  return (
    <div>
      <PageHeader
        title="Overview"
        description={"Everything on the public \u201cWhat to know\u201d page."}
      />
      <OverviewForm initial={overview} />
    </div>
  );
}
