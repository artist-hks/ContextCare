import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// Returns the logged-in doctor or null. Used by all protected doctor APIs.
export async function currentDoctor() {
  const session = await getSession();
  if (!session.doctorId) return null;
  const doctor = await prisma.doctor.findUnique({ where: { id: session.doctorId } });
  return doctor;
}
