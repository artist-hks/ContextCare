import { NextResponse } from "next/server";
import { currentDoctor } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const doctor = await currentDoctor();
  if (!doctor) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  return NextResponse.json({
    id: doctor.id,
    name: doctor.name,
    specialization: doctor.specialization,
  });
}
