import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentDoctor } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Notes are append-only by construction: only a create operation exists here.
// There is intentionally no PATCH/PUT/DELETE handler anywhere for notes.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const doctor = await currentDoctor();
  if (!doctor) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const content: string = (body?.content ?? "").toString().trim();
  if (!content) {
    return NextResponse.json({ error: "Note cannot be empty." }, { status: 400 });
  }

  // Ensure the patient belongs to this doctor.
  const patient = await prisma.patient.findFirst({
    where: { id: params.id, doctorId: doctor.id },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const note = await prisma.note.create({
    data: { patientId: patient.id, content },
  });

  return NextResponse.json({ note }, { status: 201 });
}
