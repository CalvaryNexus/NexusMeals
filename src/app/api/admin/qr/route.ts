import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireAdminApi } from "@/lib/apiAuth";
import { getBaseOrigin } from "@/lib/baseUrl";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const url = `${getBaseOrigin()}/schedule`;
  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="nexus-meals-qr.png"',
    },
  });
}
