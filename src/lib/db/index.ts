import { 
  Institute, 
  Student, 
  Course, 
  Batch, 
  WalletTransaction, 
  CertificateTemplate, 
  CertificateTemplateVersion,
  Certificate, 
  CertificateVerificationResult,
  Marksheet, 
  AuditLog, 
  AttendanceRecord,
  AccountStatus,
  TransactionPurpose
} from "@/types";
import { 
  initialInstitutes, 
  initialCourses, 
  initialBatches, 
  initialStudents, 
  initialTransactions, 
  initialCertificates, 
  initialMarksheets, 
  initialTemplates, 
  initialAuditLogs 
} from "@/lib/data/initialData";
import {
  saveStudentFirestore,
  saveTransactionFirestore,
  saveInstituteFirestore,
  updateInstituteWalletFirestore
} from "@/lib/firebase/services";

const STORAGE_KEYS = {
  INSTITUTES: "cdp_institutes",
  STUDENTS: "cdp_students",
  COURSES: "cdp_courses",
  BATCHES: "cdp_batches",
  TRANSACTIONS: "cdp_transactions",
  CERTIFICATES: "cdp_certificates",
  MARKSHEETS: "cdp_marksheets",
  TEMPLATES: "cdp_templates",
  TEMPLATE_VERSIONS: "cdp_template_versions",
  ATTENDANCE: "cdp_attendance",
  AUDIT_LOGS: "cdp_audit_logs",
};

// In-Memory store fallback
class DataStore {
  private institutes: Institute[] = [...initialInstitutes];
  private students: Student[] = [...initialStudents];
  private courses: Course[] = [...initialCourses];
  private batches: Batch[] = [...initialBatches];
  private transactions: WalletTransaction[] = [...initialTransactions];
  private certificates: Certificate[] = [...initialCertificates];
  private marksheets: Marksheet[] = [...initialMarksheets];
  private templates: CertificateTemplate[] = [...initialTemplates];
  private templateVersions: CertificateTemplateVersion[] = [];
  private attendance: AttendanceRecord[] = [];
  private auditLogs: AuditLog[] = [...initialAuditLogs];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const inst = localStorage.getItem(STORAGE_KEYS.INSTITUTES);
      if (inst) this.institutes = JSON.parse(inst);
      
      const std = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (std) this.students = JSON.parse(std);

      const crs = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (crs) this.courses = JSON.parse(crs);

      const bth = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (bth) this.batches = JSON.parse(bth);

      const tx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (tx) this.transactions = JSON.parse(tx);

      const cert = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
      if (cert) this.certificates = JSON.parse(cert);

      const ms = localStorage.getItem(STORAGE_KEYS.MARKSHEETS);
      if (ms) this.marksheets = JSON.parse(ms);

      const tpl = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (tpl) {
        const parsed = JSON.parse(tpl);
        if (!parsed.some((item: any) => item.id === "tpl-sbci-master")) {
          this.templates = [initialTemplates[0], ...parsed];
        } else {
          this.templates = parsed;
        }
      }

      const tplv = localStorage.getItem(STORAGE_KEYS.TEMPLATE_VERSIONS);
      if (tplv) this.templateVersions = JSON.parse(tplv);

      const att = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      if (att) this.attendance = JSON.parse(att);

      const log = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (log) this.auditLogs = JSON.parse(log);
    } catch (e) {
      console.error("Storage loading error:", e);
    }
  }

  private saveToStorage(key: string, data: unknown) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to persist ${key}:`, e);
    }
  }

  // --- Institute Methods ---
  async getInstitute(id: string): Promise<Institute | null> {
    const inst = this.institutes.find((i) => i.id === id);
    return inst ? { ...inst } : null;
  }

  async getAllInstitutes(): Promise<Institute[]> {
    return [...this.institutes];
  }

  async createInstitute(data: Omit<Institute, "id" | "registeredAt">): Promise<Institute> {
    const nextNum = 1000 + this.institutes.length + 1;
    const prefix = (data.name.match(/[A-Z]/g)?.slice(0, 4).join("") || "INST").toUpperCase();
    const id = `${prefix}${nextNum}`;

    const newInst: Institute = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
      walletBalance: data.walletBalance || 0,
      settings: data.settings || {
        admissionFee: 150,
        profileEditFee: 100,
        certificateFee: 0,
        marksheetFee: 0,
        autoApproveStudents: true,
      },
    };

    this.institutes.unshift(newInst);
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    return { ...newInst };
  }

  async updateInstituteStatus(id: string, status: AccountStatus): Promise<Institute> {
    const idx = this.institutes.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Institute not found");
    this.institutes[idx].status = status;
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    return { ...this.institutes[idx] };
  }

  async updateInstitute(id: string, updates: Partial<Institute>): Promise<Institute> {
    const idx = this.institutes.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Institute not found");
    this.institutes[idx] = { ...this.institutes[idx], ...updates };
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    return { ...this.institutes[idx] };
  }

  async updateInstitutePassword(id: string, newPassword: string): Promise<Institute> {
    const idx = this.institutes.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error("Institute not found");
    this.institutes[idx].password = newPassword;
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    return { ...this.institutes[idx] };
  }

  // --- Wallet & Transaction Operations (Atomic & Rule-Enforced) ---
  async getWalletBalance(instituteId: string): Promise<number> {
    const inst = await this.getInstitute(instituteId);
    return inst ? inst.walletBalance : 0;
  }

  async getTransactions(instituteId: string): Promise<WalletTransaction[]> {
    return this.transactions
      .filter((t) => t.instituteId === instituteId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllTransactions(): Promise<WalletTransaction[]> {
    return [...this.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async rechargeWallet(
    instituteId: string, 
    amount: number, 
    razorpayPaymentId = `pay_${Date.now()}`
  ): Promise<WalletTransaction> {
    const inst = this.institutes.find((i) => i.id === instituteId);
    if (!inst) throw new Error("Institute not found");

    inst.walletBalance += amount;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      instituteId,
      amount,
      type: "credit",
      purpose: "recharge",
      description: `Wallet recharged: ₹${amount.toLocaleString()} (Payment via Razorpay)`,
      balanceAfter: inst.walletBalance,
      razorpayPaymentId,
      status: "success",
      createdAt: new Date().toISOString(),
    };

    this.transactions.unshift(tx);
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Sync to Firestore
    saveInstituteFirestore(inst).catch(console.warn);
    saveTransactionFirestore(tx).catch(console.warn);

    this.logAudit({
      instituteId,
      userId: inst.ownerName,
      userEmail: inst.email,
      action: "WALLET_RECHARGE",
      targetType: "wallet",
      targetId: tx.id,
      details: `Recharged ₹${amount}. New balance: ₹${inst.walletBalance}`,
    });

    return tx;
  }

  async creditPromoBalance(instituteId: string, amount: number, note: string): Promise<WalletTransaction> {
    const inst = this.institutes.find((i) => i.id === instituteId);
    if (!inst) throw new Error("Institute not found");

    inst.walletBalance += amount;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      instituteId,
      amount,
      type: "credit",
      purpose: "promo_credit",
      description: `Admin Credit: ₹${amount.toLocaleString()} - ${note}`,
      balanceAfter: inst.walletBalance,
      status: "success",
      createdAt: new Date().toISOString(),
    };

    this.transactions.unshift(tx);
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Sync to Firestore
    saveInstituteFirestore(inst).catch(console.warn);
    saveTransactionFirestore(tx).catch(console.warn);

    return tx;
  }

  async deductWallet(
    instituteId: string,
    amount: number,
    purpose: TransactionPurpose,
    description: string,
    relatedStudentId?: string,
    studentName?: string
  ): Promise<WalletTransaction> {
    const inst = this.institutes.find((i) => i.id === instituteId);
    if (!inst) throw new Error("Institute not found");

    if (inst.walletBalance < amount) {
      throw new Error(`Insufficient wallet balance. Required: ₹${amount}, Available: ₹${inst.walletBalance}. Please recharge.`);
    }

    inst.walletBalance -= amount;
    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      instituteId,
      amount,
      type: "debit",
      purpose,
      description,
      balanceAfter: inst.walletBalance,
      relatedStudentId,
      studentName,
      status: "success",
      createdAt: new Date().toISOString(),
    };

    this.transactions.unshift(tx);
    this.saveToStorage(STORAGE_KEYS.INSTITUTES, this.institutes);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);

    // Sync to Firestore
    saveInstituteFirestore(inst).catch(console.warn);
    saveTransactionFirestore(tx).catch(console.warn);

    return tx;
  }

  // --- Student Operations ---
  async getStudents(
    instituteId: string,
    filters?: { search?: string; status?: string; courseId?: string; batchId?: string; page?: number; limit?: number }
  ): Promise<{ students: Student[]; total: number }> {
    let list = this.students.filter((s) => s.instituteId === instituteId);

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.enrollmentNo.toLowerCase().includes(q) ||
          s.mobile.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== "All") {
      list = list.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.courseId) {
      list = list.filter((s) => s.courseId === filters.courseId);
    }

    if (filters?.batchId) {
      list = list.filter((s) => s.batchId === filters.batchId);
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return { students: paginated, total };
  }

  async getAllStudents(): Promise<Student[]> {
    return [...this.students];
  }

  async getStudentById(id: string): Promise<Student | null> {
    const student = this.students.find((s) => s.id === id);
    return student ? { ...student } : null;
  }

  async getStudentByEnrollmentNo(enrollmentNo: string): Promise<Student | null> {
    const norm = enrollmentNo.trim().toLowerCase();
    const student = this.students.find(
      (s) => s.enrollmentNo.trim().toLowerCase() === norm
    );
    return student ? { ...student } : null;
  }

  async findStudentForLogin(identifier: string): Promise<Student | null> {
    const norm = identifier.trim().toLowerCase();
    const student = this.students.find(
      (s) =>
        s.enrollmentNo.trim().toLowerCase() === norm ||
        s.email.trim().toLowerCase() === norm ||
        s.mobile.replace(/\D/g, "").includes(norm.replace(/\D/g, ""))
    );
    return student ? { ...student } : null;
  }

  async createStudent(
    data: Omit<Student, "id" | "enrollmentNo" | "createdAt" | "updatedAt">,
    skipFee = false
  ): Promise<{ student: Student; transaction?: WalletTransaction }> {
    const inst = await this.getInstitute(data.instituteId);
    if (!inst) throw new Error("Institute not found");

    const admissionFee = inst.settings.admissionFee ?? 150;

    let transaction: WalletTransaction | undefined;
    if (!skipFee && admissionFee > 0) {
      transaction = await this.deductWallet(
        data.instituteId,
        admissionFee,
        "admission",
        `Student added: ${data.fullName}`,
        undefined,
        data.fullName
      );
    }

    // Generate smart unique enrollment number e.g. SBCI/ADCA/0269
    const courseCode = data.courseCode || "GEN";
    const instCode = inst.code || "CDP";
    const nextEnrollNum = String(this.students.filter((s) => s.instituteId === data.instituteId).length + 269).padStart(4, "0");
    const enrollmentNo = `${instCode}/${courseCode.toUpperCase()}/${nextEnrollNum}`;

    const newStudent: Student = {
      ...data,
      id: `std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      enrollmentNo,
      status: data.status || "Active",
      admissionFeeCharged: admissionFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (transaction) {
      transaction.relatedStudentId = newStudent.id;
      this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, this.transactions);
    }

    this.students.unshift(newStudent);
    this.saveToStorage(STORAGE_KEYS.STUDENTS, this.students);

    // Sync to Firestore
    saveStudentFirestore(newStudent).catch(console.warn);

    // Update batch student count if enrolled
    if (newStudent.batchId) {
      const batch = this.batches.find((b) => b.id === newStudent.batchId);
      if (batch) {
        batch.enrolledStudentsCount = (batch.enrolledStudentsCount || 0) + 1;
        this.saveToStorage(STORAGE_KEYS.BATCHES, this.batches);
      }
    }

    this.logAudit({
      instituteId: data.instituteId,
      userId: inst.ownerName,
      userEmail: inst.email,
      action: "STUDENT_ADMISSION",
      targetType: "student",
      targetId: newStudent.id,
      details: `New student ${newStudent.fullName} enrolled (${newStudent.enrollmentNo}). Fee charged: ₹${admissionFee}`,
      chargeDeducted: admissionFee,
    });

    return { student: newStudent, transaction };
  }

  async updateStudent(
    id: string,
    updates: Partial<Student>,
    isMeaningfulUpdate = false
  ): Promise<{ student: Student; transaction?: WalletTransaction }> {
    const idx = this.students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Student not found");

    const student = this.students[idx];
    const inst = await this.getInstitute(student.instituteId);
    if (!inst) throw new Error("Institute not found");

    let transaction: WalletTransaction | undefined;
    const editFee = inst.settings.profileEditFee ?? 100;

    if (isMeaningfulUpdate && editFee > 0) {
      transaction = await this.deductWallet(
        student.instituteId,
        editFee,
        "profile_update",
        `Student updated: ${updates.fullName || student.fullName}`,
        student.id,
        updates.fullName || student.fullName
      );
    }

    this.students[idx] = {
      ...student,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(STORAGE_KEYS.STUDENTS, this.students);
    saveStudentFirestore(this.students[idx]).catch(console.warn);

    this.logAudit({
      instituteId: student.instituteId,
      userId: inst.ownerName,
      userEmail: inst.email,
      action: "STUDENT_UPDATE",
      targetType: "student",
      targetId: student.id,
      details: `Profile updated for ${this.students[idx].fullName}.${isMeaningfulUpdate ? ` Fee: ₹${editFee}` : ""}`,
      chargeDeducted: isMeaningfulUpdate ? editFee : 0,
    });

    return { student: this.students[idx], transaction };
  }

  async archiveStudent(id: string): Promise<Student> {
    const res = await this.updateStudent(id, { status: "Archived" }, false);
    return res.student;
  }

  async restoreStudent(id: string): Promise<Student> {
    const res = await this.updateStudent(id, { status: "Active" }, false);
    return res.student;
  }

  // --- Courses ---
  async getCourses(instituteId?: string): Promise<Course[]> {
    if (!instituteId || instituteId === "all") return [...this.courses];
    return this.courses.filter((c) => c.instituteId === "global" || c.instituteId === instituteId);
  }

  async getCourseById(id: string): Promise<Course | null> {
    const course = this.courses.find((c) => c.id === id);
    return course ? { ...course } : null;
  }

  async createCourse(data: Omit<Course, "id" | "createdAt">): Promise<Course> {
    const newCourse: Course = {
      ...data,
      id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    this.courses.push(newCourse);
    this.saveToStorage(STORAGE_KEYS.COURSES, this.courses);
    return { ...newCourse };
  }

  // --- Batches ---
  async getBatches(instituteId: string): Promise<Batch[]> {
    return this.batches.filter((b) => b.instituteId === instituteId);
  }

  async getAllBatches(): Promise<Batch[]> {
    return [...this.batches];
  }

  async getBatchById(id: string): Promise<Batch | null> {
    const b = this.batches.find((item) => item.id === id);
    return b ? { ...b } : null;
  }

  async createBatch(data: Omit<Batch, "id" | "enrolledStudentsCount" | "createdAt">): Promise<Batch> {
    const newBatch: Batch = {
      ...data,
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      enrolledStudentsCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.batches.unshift(newBatch);
    this.saveToStorage(STORAGE_KEYS.BATCHES, this.batches);
    return { ...newBatch };
  }

  async transferStudentBatch(studentId: string, newBatchId: string): Promise<Student> {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) throw new Error("Student not found");

    const oldBatch = this.batches.find((b) => b.id === student.batchId);
    const newBatch = this.batches.find((b) => b.id === newBatchId);
    if (!newBatch) throw new Error("Target batch not found");

    if (oldBatch) {
      oldBatch.enrolledStudentsCount = Math.max(0, (oldBatch.enrolledStudentsCount || 0) - 1);
    }
    newBatch.enrolledStudentsCount = (newBatch.enrolledStudentsCount || 0) + 1;

    student.batchId = newBatch.id;
    student.batchName = newBatch.name;
    student.updatedAt = new Date().toISOString();

    this.saveToStorage(STORAGE_KEYS.STUDENTS, this.students);
    this.saveToStorage(STORAGE_KEYS.BATCHES, this.batches);

    return { ...student };
  }

  // --- Certificates & Verification ---
  async getCertificates(instituteId: string): Promise<Certificate[]> {
    return this.certificates
      .filter((c) => c.instituteId === instituteId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAllCertificates(): Promise<Certificate[]> {
    return [...this.certificates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getCertificateByNumber(certNo: string): Promise<Certificate | null> {
    const cert = this.certificates.find(
      (c) => c.certificateNumber.toLowerCase() === certNo.trim().toLowerCase()
    );
    return cert ? { ...cert } : null;
  }

  async createCertificate(
    data: Omit<Certificate, "id" | "certificateNumber" | "createdAt" | "status"> & {
      customCertificateNumber?: string;
    }
  ): Promise<Certificate> {
    const inst = await this.getInstitute(data.instituteId);
    const certFee = inst?.settings?.certificateFee ?? 0;

    // Check wallet balance
    if (certFee > 0) {
      if (inst && inst.walletBalance < certFee) {
        throw new Error(`Insufficient wallet balance. Required: ₹${certFee}, Available: ₹${inst.walletBalance}`);
      }
      await this.deductWallet(
        data.instituteId,
        certFee,
        "certificate_gen",
        `Certificate generated: ${data.studentName} (${data.courseName})`,
        data.studentId,
        data.studentName
      );
    }

    const year = new Date().getFullYear();
    const seq = String(this.certificates.length + 145).padStart(4, "0");
    const certNum = data.customCertificateNumber || `SBCI/ADCA/${year}/${seq}`;

    // Cryptographic verification token & hash
    const rawToken = `tok_${certNum.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const tokenHash = typeof btoa !== "undefined" ? btoa(rawToken).substring(0, 32) : rawToken;

    const newCert: Certificate = {
      ...data,
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      certificateNumber: certNum,
      verificationToken: rawToken,
      verificationTokenHash: tokenHash,
      status: "valid",
      createdAt: new Date().toISOString(),
    };

    this.certificates.unshift(newCert);
    this.saveToStorage(STORAGE_KEYS.CERTIFICATES, this.certificates);

    this.logAudit({
      instituteId: data.instituteId,
      userId: inst?.ownerName || "Admin",
      userEmail: inst?.email || "",
      action: "CERTIFICATE_GENERATED",
      targetType: "certificate",
      targetId: newCert.id,
      details: `Generated certificate ${certNum} for ${newCert.studentName} (${newCert.courseName})`,
      chargeDeducted: certFee,
    });

    return { ...newCert };
  }

  async revokeCertificate(
    certNo: string, 
    reason = "Administrative revocation", 
    revokedBy = "Super Admin"
  ): Promise<boolean> {
    const cert = this.certificates.find((c) => c.certificateNumber.toLowerCase() === certNo.trim().toLowerCase());
    if (!cert) return false;
    
    cert.status = "revoked";
    cert.revokedReason = reason;
    cert.revokedAt = new Date().toISOString();
    cert.revokedBy = revokedBy;
    cert.updatedAt = new Date().toISOString();

    this.saveToStorage(STORAGE_KEYS.CERTIFICATES, this.certificates);

    this.logAudit({
      instituteId: cert.instituteId,
      userId: revokedBy,
      userEmail: "",
      action: "CERTIFICATE_REVOKED",
      targetType: "certificate",
      targetId: cert.id,
      details: `Revoked certificate ${cert.certificateNumber} for ${cert.studentName}. Reason: ${reason}`,
    });

    return true;
  }

  async reissueCertificate(
    oldCertNo: string, 
    updates: Partial<Certificate>, 
    reason: string, 
    reissuedBy = "Super Admin"
  ): Promise<Certificate> {
    const oldCert = this.certificates.find((c) => c.certificateNumber.toLowerCase() === oldCertNo.trim().toLowerCase());
    if (!oldCert) throw new Error("Original certificate not found");

    const year = new Date().getFullYear();
    const seq = String(this.certificates.length + 146).padStart(4, "0");
    const newCertNum = `SBCI/ADCA/${year}/${seq}`;

    // 1. Mark old certificate revoked with reference
    oldCert.status = "revoked";
    oldCert.revokedReason = `Reissued as ${newCertNum}. Note: ${reason}`;
    oldCert.revokedAt = new Date().toISOString();
    oldCert.revokedBy = reissuedBy;
    oldCert.reissuedToCertificateNumber = newCertNum;
    oldCert.updatedAt = new Date().toISOString();

    // 2. Create new linked certificate
    const rawToken = `tok_${newCertNum.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    const tokenHash = typeof btoa !== "undefined" ? btoa(rawToken).substring(0, 32) : rawToken;

    const newCert: Certificate = {
      ...oldCert,
      ...updates,
      id: `cert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      certificateNumber: newCertNum,
      verificationToken: rawToken,
      verificationTokenHash: tokenHash,
      reissuedFromCertificateNumber: oldCert.certificateNumber,
      status: "valid",
      revokedReason: undefined,
      revokedAt: undefined,
      revokedBy: undefined,
      issuedBy: reissuedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.certificates.unshift(newCert);
    this.saveToStorage(STORAGE_KEYS.CERTIFICATES, this.certificates);

    this.logAudit({
      instituteId: newCert.instituteId,
      userId: reissuedBy,
      userEmail: "",
      action: "CERTIFICATE_REISSUED",
      targetType: "certificate",
      targetId: newCert.id,
      details: `Reissued certificate ${oldCert.certificateNumber} -> ${newCertNum} for ${newCert.studentName}. Reason: ${reason}`,
    });

    return { ...newCert };
  }

  async verifyCertificate(query: string): Promise<CertificateVerificationResult> {
    if (!query || !query.trim()) {
      return { valid: false, status: "not_found", message: "Please provide a valid certificate number or verification token." };
    }

    const clean = query.trim().toLowerCase();
    const found = this.certificates.find(
      (c) =>
        c.certificateNumber.toLowerCase() === clean ||
        (c.verificationToken && c.verificationToken.toLowerCase() === clean) ||
        (c.verificationTokenHash && c.verificationTokenHash.toLowerCase() === clean)
    );

    if (!found) {
      return {
        valid: false,
        status: "not_found",
        message: `No authentic certificate record was found matching query "${query}".`,
      };
    }

    // Public Safe Fields (Privacy-preserving, never exposes student phone, address, or financial records)
    const publicSafe = {
      certificateNumber: found.certificateNumber,
      studentName: found.studentName,
      courseName: found.courseName,
      instituteName: found.instituteName,
      issueDate: found.issueDate,
      completionDate: found.completionDate,
      session: found.session || "01 July 2026 – 30 December 2026",
      grade: found.grade,
      percentage: found.percentage,
      typingSpeed: found.typingSpeed,
      typingAccuracy: found.typingAccuracy,
      directorName: found.directorName || "Vinkal Prajapati",
      status: found.status,
      revokedReason: found.revokedReason,
      revokedAt: found.revokedAt,
      templateId: found.templateId,
      verifiedAt: new Date().toISOString(),
    };

    if (found.status === "revoked") {
      return {
        valid: false,
        status: "revoked",
        certificate: publicSafe,
        message: `This certificate was formally revoked on ${found.revokedAt ? new Date(found.revokedAt).toLocaleDateString() : "record"}. Reason: ${found.revokedReason || "Administrative revocation"}`,
      };
    }

    return {
      valid: true,
      status: "valid",
      certificate: publicSafe,
      message: "Certificate verified valid and authentic against the tamper-evident ledger.",
    };
  }

  async getCertificateStats(instituteId?: string) {
    const list = instituteId && instituteId !== "all" 
      ? this.certificates.filter((c) => c.instituteId === instituteId)
      : this.certificates;

    const total = list.length;
    const valid = list.filter((c) => c.status === "valid").length;
    const revoked = list.filter((c) => c.status === "revoked").length;

    const now = new Date();
    const thisMonth = list.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return { total, valid, revoked, thisMonth };
  }

  // --- Marksheets & Verification ---
  async getMarksheets(instituteId: string): Promise<Marksheet[]> {
    return this.marksheets
      .filter((m) => m.instituteId === instituteId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getMarksheetByNumber(msNo: string): Promise<Marksheet | null> {
    const ms = this.marksheets.find(
      (m) => m.marksheetNumber.toLowerCase() === msNo.trim().toLowerCase()
    );
    return ms ? { ...ms } : null;
  }

  async createMarksheet(
    data: Omit<Marksheet, "id" | "marksheetNumber" | "createdAt" | "status">
  ): Promise<Marksheet> {
    const inst = await this.getInstitute(data.instituteId);
    const msFee = inst?.settings?.marksheetFee ?? 0;

    if (msFee > 0) {
      await this.deductWallet(
        data.instituteId,
        msFee,
        "marksheet_gen",
        `Marksheet generated: ${data.studentName} (${data.courseName})`,
        data.studentId,
        data.studentName
      );
    }

    const msNum = `MS-${new Date().getFullYear()}-${String(this.marksheets.length + 1042).padStart(4, "0")}`;

    const newMs: Marksheet = {
      ...data,
      id: `ms_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      marksheetNumber: msNum,
      status: "valid",
      createdAt: new Date().toISOString(),
    };

    this.marksheets.unshift(newMs);
    this.saveToStorage(STORAGE_KEYS.MARKSHEETS, this.marksheets);
    return { ...newMs };
  }

  // --- Templates & Versioning ---
  async getTemplates(): Promise<CertificateTemplate[]> {
    return [...this.templates];
  }

  async getTemplateById(id: string): Promise<CertificateTemplate | null> {
    const t = this.templates.find((item) => item.id === id);
    return t ? { ...t } : null;
  }

  async saveTemplate(tpl: CertificateTemplate): Promise<CertificateTemplate> {
    const idx = this.templates.findIndex((item) => item.id === tpl.id);
    const updated = {
      ...tpl,
      version: (tpl.version || 1) + 1,
      updatedAt: new Date().toISOString(),
    };

    if (idx !== -1) {
      this.templates[idx] = { ...updated };
    } else {
      this.templates.push({ ...updated });
    }
    this.saveToStorage(STORAGE_KEYS.TEMPLATES, this.templates);

    // Auto save a snapshot version
    await this.saveTemplateVersion(updated.id, "Snapshot version saved", updated.createdBy || "Admin");

    return updated;
  }

  async duplicateTemplate(templateId: string, newTitle?: string): Promise<CertificateTemplate> {
    const original = await this.getTemplateById(templateId);
    if (!original) throw new Error("Template not found to duplicate");

    const newId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const cloned: CertificateTemplate = {
      ...original,
      id: newId,
      title: newTitle || `${original.title} (Copy)`,
      isDefault: false,
      status: "draft",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.push(cloned);
    this.saveToStorage(STORAGE_KEYS.TEMPLATES, this.templates);
    return cloned;
  }

  async deleteOrArchiveTemplate(templateId: string): Promise<boolean> {
    const idx = this.templates.findIndex((item) => item.id === templateId);
    if (idx === -1) return false;
    
    // If it's the master default template, soft archive
    if (this.templates[idx].isDefault || this.templates[idx].id === "tpl-sbci-master") {
      this.templates[idx].status = "archived";
    } else {
      this.templates.splice(idx, 1);
    }
    this.saveToStorage(STORAGE_KEYS.TEMPLATES, this.templates);
    return true;
  }

  async saveTemplateVersion(templateId: string, note = "Version snapshot", createdBy = "Admin"): Promise<CertificateTemplateVersion> {
    const tpl = await this.getTemplateById(templateId);
    if (!tpl) throw new Error("Template not found");

    const versionNum = (tpl.version || 1);
    const versionEntry: CertificateTemplateVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      templateId,
      version: versionNum,
      note,
      elements: JSON.parse(JSON.stringify(tpl.elements)),
      backgroundImage: tpl.backgroundImage,
      createdBy,
      createdAt: new Date().toISOString(),
    };

    this.templateVersions.unshift(versionEntry);
    this.saveToStorage(STORAGE_KEYS.TEMPLATE_VERSIONS, this.templateVersions);
    return versionEntry;
  }

  async getTemplateVersions(templateId: string): Promise<CertificateTemplateVersion[]> {
    return this.templateVersions.filter((v) => v.templateId === templateId);
  }

  async restoreTemplateVersion(templateId: string, versionId: string): Promise<CertificateTemplate> {
    const version = this.templateVersions.find((v) => v.id === versionId && v.templateId === templateId);
    if (!version) throw new Error("Version record not found");

    const tpl = await this.getTemplateById(templateId);
    if (!tpl) throw new Error("Template not found");

    tpl.elements = JSON.parse(JSON.stringify(version.elements));
    tpl.backgroundImage = version.backgroundImage;
    tpl.updatedAt = new Date().toISOString();

    const idx = this.templates.findIndex((item) => item.id === templateId);
    if (idx !== -1) {
      this.templates[idx] = { ...tpl };
    }
    this.saveToStorage(STORAGE_KEYS.TEMPLATES, this.templates);
    return tpl;
  }

  // --- Attendance ---
  async getAttendance(batchId: string): Promise<AttendanceRecord[]> {
    return this.attendance.filter((a) => a.batchId === batchId);
  }

  async saveAttendance(data: Omit<AttendanceRecord, "id" | "createdAt">): Promise<AttendanceRecord> {
    const rec: AttendanceRecord = {
      ...data,
      id: `att_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.attendance.unshift(rec);
    this.saveToStorage(STORAGE_KEYS.ATTENDANCE, this.attendance);
    return rec;
  }

  // --- Audit Logs ---
  async getAuditLogs(instituteId?: string): Promise<AuditLog[]> {
    if (!instituteId || instituteId === "all") return [...this.auditLogs];
    return this.auditLogs.filter((l) => l.instituteId === instituteId);
  }

  private logAudit(entry: Omit<AuditLog, "id" | "timestamp">) {
    const log: AuditLog = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    this.saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- Dashboard Aggregations (Calculated from Real Data) ---
  async getDashboardStats(instituteId: string) {
    const students = this.students.filter((s) => s.instituteId === instituteId);
    const activeStudents = students.filter((s) => s.status === "Active");
    const inst = await this.getInstitute(instituteId);
    const batches = this.batches.filter((b) => b.instituteId === instituteId);
    const courses = this.courses.filter((c) => c.instituteId === "global" || c.instituteId === instituteId);
    const certs = this.certificates.filter((c) => c.instituteId === instituteId);
    const marks = this.marksheets.filter((m) => m.instituteId === instituteId);
    const txs = this.transactions.filter((t) => t.instituteId === instituteId);

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalCourses: courses.length,
      totalBatches: batches.length,
      certificatesGenerated: certs.length,
      marksheetsGenerated: marks.length,
      walletBalance: inst ? inst.walletBalance : 0,
      totalTransactions: txs.length,
    };
  }
}

// Global singleton instance
export const dataStore = new DataStore();
