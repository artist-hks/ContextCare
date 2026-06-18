import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentDoctor } from "@/lib/auth";
import { buildPdf } from "@/lib/pdf";
import { METRIC_ORDER } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return new Date(d).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

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
      scans: { orderBy: { createdAt: "desc" }, include: { metrics: true }, take: 1 },
      notes: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const latest = patient.scans[0];
  const metricsByKey = new Map(latest?.metrics.map((m) => [m.key, m]) ?? []);
  const orderedMetrics = METRIC_ORDER.map((k) => metricsByKey.get(k)).filter(
    (m): m is NonNullable<typeof m> => Boolean(m)
  );

  const pdf = await buildPdf({
    doctorName: doctor.name,
    specialization: doctor.specialization,
    patientName: patient.name,
    reportDate: latest ? fmtDate(latest.createdAt) : "No scans",
    metrics: orderedMetrics.map((m) => ({
      label: m.label,
      value: m.value,
      unit: m.unit,
      refMin: m.refMin,
      refMax: m.refMax,
      status: m.status,
    })),
    notes: patient.notes.map((n) => ({
      content: n.content,
      createdAt: fmtDate(n.createdAt),
    })),
  });

  const safeName = patient.name.replace(/[^a-z0-9]+/gi, "_");
  return new NextResponse(pdf as any, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ContextCare_${safeName}.pdf"`,
    },
  });
}
