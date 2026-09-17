import { NextResponse } from "next/server";
import { requireOwnerApi } from "@/lib/apiAuth";
import { listPastSignups } from "@/lib/signups";
import { chicagoTodayYMD } from "@/lib/schedule";
import { signupsToCsv } from "@/lib/csv";
import { redis } from "@/lib/redis";

export async function GET() {
  const auth = await requireOwnerApi();
  if (!auth.ok) return auth.response;

  const past = await listPastSignups(chicagoTodayYMD());
  const nonPurged = past.filter((s) => !s.purged);
  const csv = signupsToCsv(nonPurged);

  await redis.lpush(
    "export-log",
    JSON.stringify({
      adminId: auth.admin.id,
      adminEmail: auth.admin.email,
      at: new Date().toISOString(),
      count: nonPurged.length,
    }),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="nexus-past-volunteers.csv"',
    },
  });
}
