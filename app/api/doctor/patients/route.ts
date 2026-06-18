import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentDoctor } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const doctor = await currentDoctor();
  if (!doctor) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const patients = await prisma.patient.findMany({
    where: { doctorId: doctor.id },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        include: { metrics: true },
      },
    },
  });

  // Map to sidebar shape: most-recent-scan first, with a critical flag.
  const list = patients
    .map((p) => {
      const latest = p.scans[0];
      const lastScanAt = latest ? latest.createdAt : p.createdAt;
      const hasCritical = latest
        ? latest.metrics.some((m) => m.status === "critical")
        : false;
      return {
        id: p.id,
        name: p.name,
        phone: p.phone,
        scanCount: p.scans.length,
        lastScanAt,
        hasCritical,
      };
    })
    .sort((a, b) => new Date(b.lastScanAt).getTime() - new Date(a.lastScanAt).getTime());

  return NextResponse.json({ patients: list });
}
