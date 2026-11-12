import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireAdminApi } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  // A blank or localhost value (e.g. copied from .env.example) would print a
  // QR code that goes nowhere, so only trust a real https URL.
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  const baseUrl = configured?.startsWith("https://")
    ? configured.replace(/\/+$/, "")
    : req.nextUrl.origin;
  const url = `${baseUrl}/schedule`;
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
