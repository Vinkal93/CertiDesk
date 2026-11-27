import "server-only";
import { adminDb } from "@/lib/firebase/admin";

/**
 * Allocates the next institute-scoped public Student ID using a Firestore
 * transaction. The counter is authoritative across concurrent server instances.
 */
export async function allocateStudentCodeForInstitute(instituteId: string): Promise<string | null> {
  if (!adminDb) return null;

  const instituteRef = adminDb.collection("institutes").doc(instituteId);
  const instituteSnapshot = await instituteRef.get();
  if (!instituteSnapshot.exists) throw new Error("Institute not found.");
  const instituteCode = String(instituteSnapshot.data()?.code || "INST")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8) || "INST";

  const counterRef = instituteRef.collection("counters").doc("student_ids");
  const sequence = await adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.exists ? Number(snapshot.data()?.lastSequence) || 0 : 0;
    const next = current + 1;
    transaction.set(counterRef, { lastSequence: next, updatedAt: new Date().toISOString() }, { merge: true });
    return next;
  });

  return `STU${instituteCode}${String(sequence).padStart(5, "0")}`;
}
