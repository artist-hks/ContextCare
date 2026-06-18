import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { currentDoctor } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const doctor = await currentDoctor();
  if (!doctor) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // The QR payload is simply the stable pairing code. The patient scanner
  // reads this string and posts it back as doctorToken.
  const code = doctor.qrToken;
  const dataUrl = await QRCode.toDataURL(code, {
    margin: 1,
    width: 320,
    color: { dark: "#102A3D", light: "#FFFFFF" },
  });

  return NextResponse.json({ code, qrDataUrl: dataUrl });
}
