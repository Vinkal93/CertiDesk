import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  runTransaction
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { db, auth } from "./client";
import { Institute, Student, Course, Batch, WalletTransaction, Certificate, Marksheet } from "@/types";
import { 
  initialInstitutes, 
  initialCourses, 
  initialBatches, 
  initialStudents, 
  initialTransactions, 
  initialCertificates 
} from "@/lib/data/initialData";

// --- Seed Initial Data to Firebase Firestore if Collections are Empty ---
let isSeeded = false;

export async function seedFirestoreIfEmpty() {
  if (isSeeded || typeof window === "undefined") return;
  isSeeded = true;

  try {
    const instCol = collection(db, "institutes");
    const snap = await getDocs(instCol);

    if (snap.empty) {
      console.log("Seeding initial CertiDesk Pro data to Firestore...");

      // Seed Institutes
      for (const inst of initialInstitutes) {
        await setDoc(doc(db, "institutes", inst.id), inst, { merge: true });
      }

      // Seed Courses
      for (const crs of initialCourses) {
        await setDoc(doc(db, "courses", crs.id), crs, { merge: true });
      }

      // Seed Batches
      for (const b of initialBatches) {
        await setDoc(doc(db, "batches", b.id), b, { merge: true });
      }

      // Seed Students
      for (const st of initialStudents) {
        await setDoc(doc(db, "students", st.id), st, { merge: true });
      }

      // Seed Transactions
      for (const tx of initialTransactions) {
        await setDoc(doc(db, "walletTransactions", tx.id), tx, { merge: true });
      }

      // Seed Certificates
      for (const c of initialCertificates) {
        await setDoc(doc(db, "certificates", c.id), c, { merge: true });
      }

      // Seed Users
      await setDoc(doc(db, "users", "usr_super_admin"), {
        uid: "usr_super_admin",
        email: "admin@certidesk.pro",
        role: "super_admin",
        displayName: "Super Administrator",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      await setDoc(doc(db, "users", "usr_sbci_admin"), {
        uid: "usr_sbci_admin",
        email: "sbci.institute@gmail.com",
        role: "institute_admin",
        instituteId: "SBCI1001",
        displayName: "Vinkal Prajapati",
        createdAt: new Date().toISOString(),
      }, { merge: true });

      console.log("Firestore seeding complete for CertiDesk Pro!");
    }
  } catch (err) {
    console.warn("Firestore auto-seed notice (offline or permission):", err);
  }
}

// Allocate a per-institute public Student ID using a Firestore transaction.
// This counter is shared across browsers and server instances, preventing duplicate IDs.
export async function allocateStudentCodeFirestore(instituteId: string, instituteCode: string): Promise<string> {
  const counterRef = doc(db, "institutes", instituteId, "counters", "student_ids");
  const cleanCode = (instituteCode || "INST").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "INST";
  const sequence = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const current = snapshot.exists() ? Number(snapshot.data().lastSequence) || 0 : 0;
    const next = current + 1;
    transaction.set(counterRef, { lastSequence: next, updatedAt: new Date().toISOString() }, { merge: true });
    return next;
  });
  return `STU${cleanCode}${String(sequence).padStart(5, "0")}`;
}

// --- Realtime Firestore Subscriptions ---

export function subscribeRealtimeStudents(
  instituteId: string, 
  callback: (students: Student[]) => void
) {
  try {
    const q = query(
      collection(db, "students"), 
      where("instituteId", "==", instituteId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: Student[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Student);
        });
        if (items.length > 0) {
          callback(items);
        }
      },
      (error) => {
        console.warn("Realtime students subscription error:", error);
      }
    );
  } catch (e) {
    console.warn("Realtime listener init error:", e);
    return () => {};
  }
}

export function subscribeRealtimeInstitute(
  instituteId: string,
  callback: (institute: Institute | null) => void
) {
  try {
    const d = doc(db, "institutes", instituteId);
    return onSnapshot(
      d,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as Institute);
        } else {
          callback(null);
        }
      },
      (err) => console.warn("Realtime institute subscription error:", err)
    );
  } catch (e) {
    return () => {};
  }
}

export function subscribeRealtimeTransactions(
  instituteId: string,
  callback: (transactions: WalletTransaction[]) => void
) {
  try {
    const q = query(
      collection(db, "walletTransactions"),
      where("instituteId", "==", instituteId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: WalletTransaction[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as WalletTransaction);
        });
        if (items.length > 0) {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(items);
        }
      },
      (err) => console.warn("Realtime transactions subscription error:", err)
    );
  } catch (e) {
    return () => {};
  }
}

export function subscribeRealtimeAllInstitutes(
  callback: (institutes: Institute[]) => void
) {
  try {
    const col = collection(db, "institutes");
    return onSnapshot(
      col,
      (snapshot) => {
        const items: Institute[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Institute);
        });
        if (items.length > 0) {
          callback(items);
        }
      },
      (err) => console.warn("Realtime all institutes subscription error:", err)
    );
  } catch (e) {
    return () => {};
  }
}

export function subscribeRealtimeAllStudents(
  callback: (students: Student[]) => void
) {
  try {
    const col = collection(db, "students");
    return onSnapshot(
      col,
      (snapshot) => {
        const items: Student[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Student);
        });
        if (items.length > 0) {
          callback(items);
        }
      },
      (err) => console.warn("Realtime all students subscription error:", err)
    );
  } catch (e) {
    return () => {};
  }
}

export function subscribeRealtimeAllTransactions(
  callback: (transactions: WalletTransaction[]) => void
) {
  try {
    const col = collection(db, "walletTransactions");
    return onSnapshot(
      col,
      (snapshot) => {
        const items: WalletTransaction[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as WalletTransaction);
        });
        if (items.length > 0) {
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          callback(items);
        }
      },
      (err) => console.warn("Realtime all transactions error:", err)
    );
  } catch (e) {
    return () => {};
  }
}

// --- Write Operations to Firestore ---

export async function saveStudentFirestore(student: Student) {
  try {
    await setDoc(doc(db, "students", student.id), student, { merge: true });
  } catch (err) {
    console.warn("Firestore student sync notice:", err);
  }
}

export async function saveTransactionFirestore(tx: WalletTransaction) {
  try {
    await setDoc(doc(db, "walletTransactions", tx.id), tx, { merge: true });
  } catch (err) {
    console.warn("Firestore transaction sync notice:", err);
  }
}

export async function saveInstituteFirestore(inst: Institute) {
  try {
    await setDoc(doc(db, "institutes", inst.id), inst, { merge: true });
  } catch (err) {
    console.warn("Firestore institute sync notice:", err);
  }
}

export async function updateInstituteWalletFirestore(instituteId: string, newBalance: number) {
  try {
    await updateDoc(doc(db, "institutes", instituteId), {
      walletBalance: newBalance,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Firestore wallet sync notice:", err);
  }
}

export async function saveBatchFirestore(batch: Batch) {
  try {
    await setDoc(doc(db, "batches", batch.id), batch, { merge: true });
  } catch (err) {
    console.warn("Firestore batch sync notice:", err);
  }
}

export async function saveCourseFirestore(course: Course) {
  try {
    await setDoc(doc(db, "courses", course.id), course, { merge: true });
  } catch (err) {
    console.warn("Firestore course sync notice:", err);
  }
}

export async function saveCertificateFirestore(cert: Certificate) {
  try {
    await setDoc(doc(db, "certificates", cert.id), cert, { merge: true });
  } catch (err) {
    console.warn("Firestore cert sync notice:", err);
  }
}

// --- Firebase Authentication Methods ---

export async function signInFirebase(email: string, pass: string) {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

export async function signUpFirebase(email: string, pass: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const role = email.toLowerCase().includes("admin@certidesk.pro") || email.toLowerCase().includes("super")
    ? "super_admin"
    : "institute_admin";
  
  await setDoc(doc(db, "users", cred.user.uid), {
    uid: cred.user.uid,
    email: cred.user.email,
    role,
    createdAt: serverTimestamp(),
  }, { merge: true });

  return cred;
}

export async function signOutFirebase() {
  return await signOut(auth);
}

export async function sendPasswordReset(email: string) {
  return await sendPasswordResetEmail(auth, email);
}

export function onFirebaseAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
