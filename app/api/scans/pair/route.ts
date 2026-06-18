import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { emitScanCreated } from "@/lib/socket";
import { getStatus, METRIC_REFERENCE } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface IncomingMetric {
  key: string;
  value: number;
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const doctorToken: string = (body?.doctorToken ?? "").toString().trim().toUpperCase();
  const patientName: string = (body?.patient?.name ?? "").toString().trim();
  const patientPhone: string = (body?.patient?.phone ?? "").toString().trim();
  const metrics: IncomingMetric[] = Array.isArray(body?.metrics) ? body.metrics : [];

  if (!doctorToken) {
    return NextResponse.json(
      { error: "No doctor code provided. Scan the QR code or type the pairing code." },
      { status: 400 }
    );
  }
  if (!patientName || !patientPhone) {
    return NextResponse.json(
      { error: "Please enter your name and phone number." },
      { status: 400 }
    );
  }
  if (metrics.length === 0) {
    return NextResponse.json(
      { error: "No metrics to send. Please go back and review your report." },
      { status: 400 }
    );
  }

  const doctor = await prisma.doctor.findUnique({ where: { qrToken: doctorToken } });
  if (!doctor) {
    return NextResponse.json(
      { error: "That doctor code wasn't recognized. Double-check the code and try again." },
      { status: 404 }
    );
  }

  // Find-or-create the patient under this doctor (keyed by doctor + phone),
  // so repeat visits build one trend history.
  let patient = await prisma.patient.findUnique({
    where: { doctorId_phone: { doctorId: doctor.id, phone: patientPhone } },
  });
  if (!patient) {
    patient = await prisma.patient.create({
      data: { doctorId: doctor.id, name: patientName, phone: patientPhone },
    });
  }

  // Build validated metric rows from the canonical table (server recomputes status).
  const metricRows = metrics
    .filter((m) => METRIC_REFERENCE[m.key] && Number.isFinite(Number(m.value)))
    .map((m) => {
      const ref = METRIC_REFERENCE[m.key];
      const value = Number(m.value);
      return {
        key: m.key,
        label: ref.label,
        value,
        unit: ref.unit,
        refMin: ref.min,
        refMax: ref.max,
        status: getStatus(value, ref.min, ref.max),
      };
    });

  if (metricRows.length === 0) {
    return NextResponse.json({ error: "No valid metrics to record." }, { status: 400 });
  }

  const scan = await prisma.scan.create({
    data: {
      patientId: patient.id,
      rawText: typeof body?.rawText === "string" ? body.rawText : null,
      metrics: { create: metricRows },
    },
    include: { metrics: true },
  });

  const hasCritical = scan.metrics.some((m) => m.status === "critical");

  const payload = {
    patient: { id: patient.id, name: patient.name, phone: patient.phone },
    scan: { id: scan.id, createdAt: scan.createdAt, metrics: scan.metrics },
    hasCritical,
  };

  // Real-time push to the doctor's dashboard.
  emitScanCreated(doctor.id, payload);

  return NextResponse.json(
    { ok: true, doctorName: doctor.name, patientId: patient.id },
    { status: 200 }
  );
}
