import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const pin: string = (body?.pin ?? "").toString().trim();
  if (!/^\d{4,6}$/.test(pin)) {
    return NextResponse.json(
      { error: "Enter your 4–6 digit PIN." },
      { status: 400 }
    );
  }

  // Find the doctor whose pinHash matches. PINs are unique among seeded demo doctors.
  const doctors = await prisma.doctor.findMany();
  let matched = null;
  for (const d of doctors) {
    if (await bcrypt.compare(pin, d.pinHash)) {
      matched = d;
      break;
    }
  }

  if (!matched) {
    return NextResponse.json(
      { error: "That PIN didn't match any doctor. Please try again." },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.doctorId = matched.id;
  await session.save();

  return NextResponse.json(
    { ok: true, doctor: { id: matched.id, name: matched.name } },
    { status: 200 }
  );
}
