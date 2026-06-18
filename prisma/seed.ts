import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { METRIC_REFERENCE, getStatus, METRIC_ORDER } from "../lib/metrics";

const prisma = new PrismaClient();

function qrToken(): string {
  return randomBytes(9).toString("hex").toUpperCase();
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

// Build a metric record from a raw value, computing status from the table.
function metric(key: string, value: number) {
  const ref = METRIC_REFERENCE[key];
  return {
    key,
    label: ref.label,
    value,
    unit: ref.unit,
    refMin: ref.min,
    refMax: ref.max,
    status: getStatus(value, ref.min, ref.max),
  };
}

// A full 6-metric reading from a partial set of values; defaults fill the rest.
function reading(values: Partial<Record<string, number>>) {
  const defaults: Record<string, number> = {
    fbs: 88,
    total_cholesterol: 180,
    hdl: 52,
    ldl: 90,
    triglycerides: 120,
    hemoglobin: 14.0,
  };
  return METRIC_ORDER.map((k) => metric(k, values[k] ?? defaults[k]));
}

interface PatientSpec {
  name: string;
  phone: string;
  scans: { days: number; values: Partial<Record<string, number>> }[];
}

async function createDoctor(
  name: string,
  specialization: string,
  pin: string,
  patients: PatientSpec[]
) {
  const pinHash = await bcrypt.hash(pin, 10);
  const doctor = await prisma.doctor.create({
    data: { name, specialization, pinHash, qrToken: qrToken() },
  });

  for (const p of patients) {
    const patient = await prisma.patient.create({
      data: { doctorId: doctor.id, name: p.name, phone: p.phone, createdAt: daysAgo(180) },
    });

    for (const s of p.scans) {
      await prisma.scan.create({
        data: {
          patientId: patient.id,
          rawText: "Seeded demo scan",
          createdAt: daysAgo(s.days),
          metrics: { create: reading(s.values) },
        },
      });
    }

    // A couple of starter notes on the first patient of each doctor.
    if (patients.indexOf(p) === 0) {
      await prisma.note.create({
        data: {
          patientId: patient.id,
          content: "Initial consult. Advised dietary changes and follow-up lipid panel.",
          createdAt: daysAgo(p.scans[0]?.days ?? 30),
        },
      });
      await prisma.note.create({
        data: {
          patientId: patient.id,
          content: "Patient reports improved adherence to medication. Monitoring FBS.",
          createdAt: daysAgo(7),
        },
      });
    }
  }

  return doctor;
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.note.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();

  console.log("Seeding Dr. Ananya Sharma…");
  await createDoctor("Ananya Sharma", "General Physician", "1234", [
    {
      name: "Rahul Verma",
      phone: "9810012345",
      scans: [
        { days: 150, values: { fbs: 118, triglycerides: 210, hdl: 34 } },
        { days: 90, values: { fbs: 109, triglycerides: 180, hdl: 38 } },
        { days: 30, values: { fbs: 102, triglycerides: 165, hdl: 41 } },
        { days: 4, values: { fbs: 96, triglycerides: 148, hdl: 45 } },
      ],
    },
    {
      name: "Sneha Iyer",
      phone: "9820023456",
      scans: [
        { days: 120, values: { hemoglobin: 10.8, ldl: 130 } },
        { days: 60, values: { hemoglobin: 11.4, ldl: 118 } },
        { days: 10, values: { hemoglobin: 11.9, ldl: 104 } },
      ],
    },
    {
      name: "Arjun Nair",
      phone: "9830034567",
      scans: [
        { days: 100, values: { total_cholesterol: 245, ldl: 162 } },
        { days: 40, values: { total_cholesterol: 220, ldl: 140 } },
      ],
    },
    {
      name: "Pooja Reddy",
      phone: "9840045678",
      scans: [
        { days: 80, values: {} },
        { days: 20, values: { fbs: 94 } },
      ],
    },
    {
      name: "Vikram Singh",
      phone: "9850056789",
      scans: [
        { days: 140, values: { triglycerides: 280, fbs: 132 } },
        { days: 70, values: { triglycerides: 230, fbs: 120 } },
        { days: 15, values: { triglycerides: 195, fbs: 110 } },
      ],
    },
  ]);

  console.log("Seeding Dr. Rohan Mehta…");
  await createDoctor("Rohan Mehta", "Endocrinologist", "5678", [
    {
      name: "Deepa Krishnan",
      phone: "9861067890",
      scans: [
        { days: 160, values: { fbs: 165, hemoglobin: 11.0 } },
        { days: 100, values: { fbs: 142, hemoglobin: 11.6 } },
        { days: 45, values: { fbs: 128, hemoglobin: 12.1 } },
        { days: 5, values: { fbs: 112, hemoglobin: 12.6 } },
      ],
    },
    {
      name: "Manish Gupta",
      phone: "9871078901",
      scans: [
        { days: 90, values: { fbs: 150, ldl: 155 } },
        { days: 30, values: { fbs: 121, ldl: 128 } },
      ],
    },
    {
      name: "Kavya Menon",
      phone: "9881089012",
      scans: [
        { days: 110, values: { fbs: 101, hdl: 39 } },
        { days: 50, values: { fbs: 97, hdl: 44 } },
        { days: 8, values: { fbs: 92, hdl: 49 } },
      ],
    },
    {
      name: "Suresh Pillai",
      phone: "9891090123",
      scans: [
        { days: 70, values: { fbs: 138 } },
        { days: 12, values: { fbs: 119 } },
      ],
    },
    {
      name: "Anita Desai",
      phone: "9901001234",
      scans: [
        { days: 130, values: { triglycerides: 240, fbs: 124 } },
        { days: 60, values: { triglycerides: 200, fbs: 108 } },
        { days: 6, values: { triglycerides: 170, fbs: 99 } },
      ],
    },
  ]);

  console.log("Seeding Dr. Priya Nair…");
  await createDoctor("Priya Nair", "Internal Medicine", "9012", [
    {
      name: "Karthik Raman",
      phone: "9911012345",
      scans: [
        { days: 145, values: { total_cholesterol: 260, ldl: 170, hdl: 33 } },
        { days: 75, values: { total_cholesterol: 228, ldl: 142, hdl: 38 } },
        { days: 9, values: { total_cholesterol: 205, ldl: 112, hdl: 43 } },
      ],
    },
    {
      name: "Meera Joshi",
      phone: "9921023456",
      scans: [
        { days: 100, values: { hemoglobin: 9.8 } },
        { days: 40, values: { hemoglobin: 10.9 } },
        { days: 11, values: { hemoglobin: 11.7 } },
      ],
    },
    {
      name: "Aditya Kapoor",
      phone: "9931034567",
      scans: [
        { days: 85, values: { fbs: 115, triglycerides: 165 } },
        { days: 25, values: { fbs: 103, triglycerides: 150 } },
      ],
    },
    {
      name: "Nisha Agarwal",
      phone: "9941045678",
      scans: [
        { days: 95, values: {} },
        { days: 18, values: { hdl: 58 } },
      ],
    },
    {
      name: "Ramesh Chandra",
      phone: "9951056789",
      scans: [
        { days: 155, values: { fbs: 178, ldl: 168, triglycerides: 290 } },
        { days: 85, values: { fbs: 148, ldl: 138, triglycerides: 230 } },
        { days: 35, values: { fbs: 126, ldl: 118, triglycerides: 185 } },
        { days: 3, values: { fbs: 114, ldl: 105, triglycerides: 160 } },
      ],
    },
  ]);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
