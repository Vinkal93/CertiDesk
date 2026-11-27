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
  TransactionPurpose,
  StudentAccount,
  OnboardingState,
  SuperAdminUser
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
  updateInstituteWalletFirestore,
  allocateStudentCodeFirestore
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
  PLATFORM_SETTINGS: "cdp_platform_settings",
  STUDENT_ACCOUNTS: "cdp_student_accounts",
  ONBOARDING_STATES: "cdp_onboarding_states",
  SUPER_ADMINS: "cdp_super_admins",
};

export const ROOT_MASTER_SUPER_ADMIN: SuperAdminUser = {
  id: "su_master_vinkal",
  name: "Vinkal Prajapati",
  email: "vinkalp041@gmail.com",
  password: "Vinkal@890",
  pin: "630649",
  role: "super_admin",
  isMaster: true,
  status: "active",
  permissions: {
    canManageInstitutes: true,
    canManageSuperAdmins: true,
    canManageFinancials: true,
    canManageBranding: true,
    canManageAuditLogs: true,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

export interface PlatformSettings {
  siteTitle: string;
  siteSubtitle: string;
  logoUrl: string;
  primaryColor: string;
  buttonRadius: string;
  themePreset: string;
}

export const initialPlatformSettings: PlatformSettings = {
  siteTitle: "CertiDesk Pro",
  siteSubtitle: "Institute & Certificate Management SaaS",
  logoUrl: "",
  primaryColor: "#0F172A",
  buttonRadius: "12px",
  themePreset: "slate",
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
  private platformSettings: PlatformSettings = { ...initialPlatformSettings };
  private studentAccounts: StudentAccount[] = [];
  private onboardingStates: OnboardingState[] = [];
  private superAdmins: SuperAdminUser[] = [{ ...ROOT_MASTER_SUPER_ADMIN }];

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

      const ps = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      if (ps) this.platformSettings = JSON.parse(ps);

      const sa = localStorage.getItem(STORAGE_KEYS.STUDENT_ACCOUNTS);
      if (sa) this.studentAccounts = JSON.parse(sa);

      const os = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATES);
      if (os) this.onboardingStates = JSON.parse(os);

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

      const su = localStorage.getItem(STORAGE_KEYS.SUPER_ADMINS);
      if (su) {
        const loaded: SuperAdminUser[] = JSON.parse(su);
        if (!loaded.some((a) => a.email.toLowerCase() === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase())) {
          loaded.unshift({ ...ROOT_MASTER_SUPER_ADMIN });
        }
        this.superAdmins = loaded;
      }
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

  generateUniqueInstituteId(prefix = "SBCI", year = new Date().getFullYear()): string {
    const cleanPrefix = (prefix || "SBCI").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "SBCI";
    const pattern = new RegExp(`^${cleanPrefix}-${year}-(\\d+)$`, "i");
    let maxSeq = 0;

    for (const inst of this.institutes) {
      const match = inst.id.match(pattern);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    const nextSeq = maxSeq + 1;
    return `${cleanPrefix}-${year}-${String(nextSeq).padStart(5, "0")}`;
  }

  async createInstitute(data: Omit<Institute, "id" | "registeredAt"> & { id?: string }): Promise<Institute> {
    const id = data.id || this.generateUniqueInstituteId(data.code || "SBCI");

    const newInst: Institute = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
      walletBalance: data.walletBalance || 0,
      onboarding_completed: data.onboarding_completed ?? false,
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
    razorpayPaymentId = `pay_${Date.now()}`,
    customDescription?: string
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
      description: customDescription || `Wallet recharged: ₹${amount.toLocaleString()} (Payment via Razorpay)`,
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
      details: customDescription || `Recharged ₹${amount}. New balance: ₹${inst.walletBalance}`,
    });

    return tx;
  }

  async setExactWalletBalance(instituteId: string, exactBalance: number, note?: string): Promise<WalletTransaction> {
    const inst = this.institutes.find((i) => i.id === instituteId);
    if (!inst) throw new Error("Institute not found");

    const oldBalance = inst.walletBalance;
    const diff = exactBalance - oldBalance;
    inst.walletBalance = exactBalance;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      instituteId,
      amount: Math.abs(diff),
      type: diff >= 0 ? "credit" : "debit",
      purpose: "promo_credit",
      description: `Super Admin Overwrite: Set balance from ₹${oldBalance.toLocaleString()} to ₹${exactBalance.toLocaleString()}${note ? ` (${note})` : ""}`,
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

    this.logAudit({
      instituteId,
      userId: "Super Admin",
      userEmail: "admin@certidesk.pro",
      action: "WALLET_RECHARGE",
      targetType: "wallet",
      targetId: tx.id,
      details: `Super Admin manually overwrote wallet balance to ₹${exactBalance}. Difference: ${diff >= 0 ? "+" : "-"}${Math.abs(diff)}`,
    });

    return tx;
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    return { ...this.platformSettings };
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.platformSettings = {
      ...this.platformSettings,
      ...updates,
    };
    this.saveToStorage(STORAGE_KEYS.PLATFORM_SETTINGS, this.platformSettings);
    return { ...this.platformSettings };
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

  generateStudentCode(instituteId: string): string {
    const institute = this.institutes.find((item) => item.id === instituteId);
    if (!institute) throw new Error("Institute not found");
    const code = (institute.code || "INST").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "INST";
    const pattern = new RegExp(`^STU${code}(\\d{5})import { 
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
  TransactionPurpose,
  StudentAccount,
  OnboardingState,
  SuperAdminUser
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
  PLATFORM_SETTINGS: "cdp_platform_settings",
  STUDENT_ACCOUNTS: "cdp_student_accounts",
  ONBOARDING_STATES: "cdp_onboarding_states",
  SUPER_ADMINS: "cdp_super_admins",
};

export const ROOT_MASTER_SUPER_ADMIN: SuperAdminUser = {
  id: "su_master_vinkal",
  name: "Vinkal Prajapati",
  email: "vinkalp041@gmail.com",
  password: "Vinkal@890",
  pin: "630649",
  role: "super_admin",
  isMaster: true,
  status: "active",
  permissions: {
    canManageInstitutes: true,
    canManageSuperAdmins: true,
    canManageFinancials: true,
    canManageBranding: true,
    canManageAuditLogs: true,
  },
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: new Date().toISOString(),
};

export interface PlatformSettings {
  siteTitle: string;
  siteSubtitle: string;
  logoUrl: string;
  primaryColor: string;
  buttonRadius: string;
  themePreset: string;
}

export const initialPlatformSettings: PlatformSettings = {
  siteTitle: "CertiDesk Pro",
  siteSubtitle: "Institute & Certificate Management SaaS",
  logoUrl: "",
  primaryColor: "#0F172A",
  buttonRadius: "12px",
  themePreset: "slate",
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
  private platformSettings: PlatformSettings = { ...initialPlatformSettings };
  private studentAccounts: StudentAccount[] = [];
  private onboardingStates: OnboardingState[] = [];
  private superAdmins: SuperAdminUser[] = [{ ...ROOT_MASTER_SUPER_ADMIN }];

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

      const ps = localStorage.getItem(STORAGE_KEYS.PLATFORM_SETTINGS);
      if (ps) this.platformSettings = JSON.parse(ps);

      const sa = localStorage.getItem(STORAGE_KEYS.STUDENT_ACCOUNTS);
      if (sa) this.studentAccounts = JSON.parse(sa);

      const os = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATES);
      if (os) this.onboardingStates = JSON.parse(os);

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

      const su = localStorage.getItem(STORAGE_KEYS.SUPER_ADMINS);
      if (su) {
        const loaded: SuperAdminUser[] = JSON.parse(su);
        if (!loaded.some((a) => a.email.toLowerCase() === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase())) {
          loaded.unshift({ ...ROOT_MASTER_SUPER_ADMIN });
        }
        this.superAdmins = loaded;
      }
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

  generateUniqueInstituteId(prefix = "SBCI", year = new Date().getFullYear()): string {
    const cleanPrefix = (prefix || "SBCI").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "SBCI";
    const pattern = new RegExp(`^${cleanPrefix}-${year}-(\\d+)$`, "i");
    let maxSeq = 0;

    for (const inst of this.institutes) {
      const match = inst.id.match(pattern);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    const nextSeq = maxSeq + 1;
    return `${cleanPrefix}-${year}-${String(nextSeq).padStart(5, "0")}`;
  }

  async createInstitute(data: Omit<Institute, "id" | "registeredAt"> & { id?: string }): Promise<Institute> {
    const id = data.id || this.generateUniqueInstituteId(data.code || "SBCI");

    const newInst: Institute = {
      ...data,
      id,
      registeredAt: new Date().toISOString(),
      walletBalance: data.walletBalance || 0,
      onboarding_completed: data.onboarding_completed ?? false,
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
    razorpayPaymentId = `pay_${Date.now()}`,
    customDescription?: string
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
      description: customDescription || `Wallet recharged: ₹${amount.toLocaleString()} (Payment via Razorpay)`,
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
      details: customDescription || `Recharged ₹${amount}. New balance: ₹${inst.walletBalance}`,
    });

    return tx;
  }

  async setExactWalletBalance(instituteId: string, exactBalance: number, note?: string): Promise<WalletTransaction> {
    const inst = this.institutes.find((i) => i.id === instituteId);
    if (!inst) throw new Error("Institute not found");

    const oldBalance = inst.walletBalance;
    const diff = exactBalance - oldBalance;
    inst.walletBalance = exactBalance;

    const tx: WalletTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      instituteId,
      amount: Math.abs(diff),
      type: diff >= 0 ? "credit" : "debit",
      purpose: "promo_credit",
      description: `Super Admin Overwrite: Set balance from ₹${oldBalance.toLocaleString()} to ₹${exactBalance.toLocaleString()}${note ? ` (${note})` : ""}`,
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

    this.logAudit({
      instituteId,
      userId: "Super Admin",
      userEmail: "admin@certidesk.pro",
      action: "WALLET_RECHARGE",
      targetType: "wallet",
      targetId: tx.id,
      details: `Super Admin manually overwrote wallet balance to ₹${exactBalance}. Difference: ${diff >= 0 ? "+" : "-"}${Math.abs(diff)}`,
    });

    return tx;
  }

  async getPlatformSettings(): Promise<PlatformSettings> {
    return { ...this.platformSettings };
  }

  async updatePlatformSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.platformSettings = {
      ...this.platformSettings,
      ...updates,
    };
    this.saveToStorage(STORAGE_KEYS.PLATFORM_SETTINGS, this.platformSettings);
    return { ...this.platformSettings };
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

, "i");
    let maxSequence = 0;
    for (const student of this.students) {
      if (student.instituteId !== instituteId || !student.studentCode) continue;
      const match = student.studentCode.match(pattern);
      if (match) maxSequence = Math.max(maxSequence, Number(match[1]));
    }
    return `STU${code}${String(maxSequence + 1).padStart(5, "0")}`;
  }

  async ensureStudentCode(studentId: string, allocatedCode?: string): Promise<Student | null> {
    const index = this.students.findIndex((item) => item.id === studentId);
    if (index < 0) return null;
    if (!this.students[index].studentCode) {
      this.students[index] = { ...this.students[index], studentCode: allocatedCode || this.generateStudentCode(this.students[index].instituteId), updatedAt: new Date().toISOString() };
      this.saveToStorage(STORAGE_KEYS.STUDENTS, this.students);
      saveStudentFirestore(this.students[index]).catch(console.warn);
    }
    return { ...this.students[index] };
  }

  async createStudent(
    data: Omit<Student, "id" | "studentCode" | "enrollmentNo" | "createdAt" | "updatedAt"> & { studentCode?: string },
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
      studentCode: data.studentCode || (typeof window !== "undefined" ? await allocateStudentCodeFirestore(data.instituteId, inst.code) : this.generateStudentCode(data.instituteId)),
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

  logAudit(entry: Omit<AuditLog, "id" | "timestamp">) {
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

  // --- Student Accounts & Login Access Management ---
  async getStudentAccounts(instituteId: string): Promise<StudentAccount[]> {
    return instituteId ? this.studentAccounts.filter((sa) => sa.instituteId === instituteId) : [...this.studentAccounts];
  }

  async getStudentAccount(uidOrStudentId: string): Promise<StudentAccount | null> {
    const acc = this.studentAccounts.find((sa) => sa.uid === uidOrStudentId || sa.studentId === uidOrStudentId || sa.loginId.toLowerCase() === uidOrStudentId.toLowerCase());
    return acc ? { ...acc } : null;
  }

  async getStudentAccountByLoginId(loginId: string): Promise<StudentAccount | null> {
    const normalized = loginId.trim().toUpperCase();
    const acc = this.studentAccounts.find((item) => item.loginId.trim().toUpperCase() === normalized);
    return acc ? { ...acc } : null;
  }

  async createStudentAccount(data: StudentAccount): Promise<StudentAccount> {
    const existing = this.studentAccounts.find((sa) => sa.uid === data.uid || sa.studentId === data.studentId);
    if (existing) {
      throw new Error("A login account already exists for this student.");
    }
    const acc = { ...data };
    this.studentAccounts.unshift(acc);
    this.saveToStorage(STORAGE_KEYS.STUDENT_ACCOUNTS, this.studentAccounts);
    return acc;
  }

  async updateStudentAccount(uid: string, updates: Partial<StudentAccount>): Promise<StudentAccount> {
    const idx = this.studentAccounts.findIndex((sa) => sa.uid === uid);
    if (idx === -1) throw new Error("Student account not found");
    this.studentAccounts[idx] = {
      ...this.studentAccounts[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToStorage(STORAGE_KEYS.STUDENT_ACCOUNTS, this.studentAccounts);
    return { ...this.studentAccounts[idx] };
  }

  // --- Institute Onboarding State ---
  async getOnboardingState(instituteId: string): Promise<OnboardingState | null> {
    const state = this.onboardingStates.find((os) => os.instituteId === instituteId);
    return state ? { ...state } : null;
  }

  async saveOnboardingState(state: OnboardingState): Promise<OnboardingState> {
    const idx = this.onboardingStates.findIndex((os) => os.instituteId === state.instituteId);
    const updated: OnboardingState = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    if (idx !== -1) {
      this.onboardingStates[idx] = updated;
    } else {
      this.onboardingStates.unshift(updated);
    }
    this.saveToStorage(STORAGE_KEYS.ONBOARDING_STATES, this.onboardingStates);
    return updated;
  }

  // --- Super Admin Operations (Enterprise Access Control) ---
  async getSuperAdmins(): Promise<SuperAdminUser[]> {
    if (!this.superAdmins.some((a) => a.email.toLowerCase() === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase())) {
      this.superAdmins.unshift({ ...ROOT_MASTER_SUPER_ADMIN });
    }
    return [...this.superAdmins];
  }

  async getSuperAdminByEmail(email: string): Promise<SuperAdminUser | null> {
    const norm = email.trim().toLowerCase();
    if (norm === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase()) {
      return { ...ROOT_MASTER_SUPER_ADMIN };
    }
    const admin = this.superAdmins.find((a) => a.email.trim().toLowerCase() === norm);
    return admin ? { ...admin } : null;
  }

  async getSuperAdminById(id: string): Promise<SuperAdminUser | null> {
    const admin = this.superAdmins.find((a) => a.id === id);
    return admin ? { ...admin } : null;
  }

  async isSuperAdminEmail(email: string): Promise<boolean> {
    const norm = email.trim().toLowerCase();
    if (norm === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase()) return true;
    return this.superAdmins.some((a) => a.email.trim().toLowerCase() === norm && a.status === "active");
  }

  async createSuperAdmin(data: Omit<SuperAdminUser, "id" | "createdAt" | "updatedAt">): Promise<SuperAdminUser> {
    const normEmail = data.email.trim().toLowerCase();
    const existing = this.superAdmins.find((a) => a.email.trim().toLowerCase() === normEmail);
    if (existing) {
      throw new Error(`A super admin account with email "${data.email}" already exists.`);
    }

    const newAdmin: SuperAdminUser = {
      ...data,
      id: `su_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      role: "super_admin",
      isMaster: false,
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.superAdmins.push(newAdmin);
    this.saveToStorage(STORAGE_KEYS.SUPER_ADMINS, this.superAdmins);
    return newAdmin;
  }

  async updateSuperAdmin(id: string, updates: Partial<SuperAdminUser>): Promise<SuperAdminUser> {
    const idx = this.superAdmins.findIndex((a) => a.id === id);
    if (idx === -1) {
      if (id === ROOT_MASTER_SUPER_ADMIN.id) {
        return { ...ROOT_MASTER_SUPER_ADMIN, ...updates };
      }
      throw new Error("Super admin account not found.");
    }

    if (this.superAdmins[idx].isMaster && updates.status === "suspended") {
      throw new Error("Root Master Super Admin cannot be suspended.");
    }

    this.superAdmins[idx] = {
      ...this.superAdmins[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveToStorage(STORAGE_KEYS.SUPER_ADMINS, this.superAdmins);
    return { ...this.superAdmins[idx] };
  }

  async deleteSuperAdmin(id: string): Promise<boolean> {
    const admin = this.superAdmins.find((a) => a.id === id);
    if (!admin) throw new Error("Super admin account not found.");
    if (admin.isMaster || admin.email.toLowerCase() === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase()) {
      throw new Error("Root Master Super Admin account cannot be deleted.");
    }

    this.superAdmins = this.superAdmins.filter((a) => a.id !== id);
    this.saveToStorage(STORAGE_KEYS.SUPER_ADMINS, this.superAdmins);
    return true;
  }

  async verifySuperAdmin(
    email: string,
    pass: string,
    pin: string
  ): Promise<{ valid: boolean; user?: SuperAdminUser; error?: string }> {
    const norm = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    // 1. Check Root Master Admin (vinkalp041@gmail.com / Vinkal@890 / 630649)
    if (norm === ROOT_MASTER_SUPER_ADMIN.email.toLowerCase()) {
      if (pass !== ROOT_MASTER_SUPER_ADMIN.password) {
        return { valid: false, error: "Incorrect password for Master Super Admin." };
      }
      if (cleanPin !== ROOT_MASTER_SUPER_ADMIN.pin) {
        return { valid: false, error: "Invalid 6-digit Master Security PIN. Please enter 630649." };
      }
      return { valid: true, user: { ...ROOT_MASTER_SUPER_ADMIN } };
    }

    // 2. Check Other Provisioned Super Admins
    const admin = this.superAdmins.find((a) => a.email.trim().toLowerCase() === norm);
    if (!admin) {
      return { valid: false, error: "No Super Admin account found with this email." };
    }

    if (admin.status !== "active") {
      return { valid: false, error: "This Super Admin account has been suspended." };
    }

    if (admin.password && admin.password !== pass) {
      return { valid: false, error: "Incorrect password." };
    }

    if (admin.pin !== cleanPin) {
      return { valid: false, error: "Invalid 6-digit Security PIN." };
    }

    return { valid: true, user: { ...admin } };
  }
}

// Global singleton instance
export const dataStore = new DataStore();
