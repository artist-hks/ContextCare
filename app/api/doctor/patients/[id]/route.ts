import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentDoctor } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doctor = await currentDoctor();
  if (!doctor) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const patient = await prisma.patient.findFirst({
    where: { id: params.id, doctorId: doctor.id },
    include: {
      scans: {
        orderBy: { createdAt: "asc" },
        include: { metrics: true },
      },
      notes: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  return NextResponse.json({ patient });
}
