export type AccountStatus = 'active' | 'pending' | 'suspended';

export interface InstituteSettings {
  admissionFee: number;
  profileEditFee: number;
  certificateFee: number;
  marksheetFee: number;
  autoApproveStudents: boolean;
}

export interface Institute {
  id: string; // e.g., 'SBCI1001'
  name: string; // e.g., 'SBCI Computer Institute'
  code: string; // globally unique institute code, e.g. 'SBCI'
  status: AccountStatus;
  ownerName: string; // e.g., 'Vinkal Prajapati'
  email: string;
  password?: string; // Initial or admin-set password
  mobile: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  logoUrl?: string;
  walletBalance: number;
  assignedCourses: string[];
  registeredAt: string;
  onboarding_completed?: boolean;
  institute_type?: string;
  settings: InstituteSettings;
}

export interface StudentAccount {
  uid: string;
  studentId: string;
  instituteId: string;
  loginId: string; // public student ID, e.g. STUSBCI00001
  authEmail?: string; // private Firebase Auth alias; never shown as the student's login ID
  fullName: string;
  enrollmentNo: string;
  accountStatus: 'active' | 'inactive';
  passwordStatus: 'set' | 'pending';
  mustChangePassword?: boolean;
  temporaryPassword?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  instituteId: string;
  step: number;
  isCompleted: boolean;
  isSkipped?: boolean;
  personalInfoCompleted?: boolean;
  instituteInfoCompleted?: boolean;
  academicConfigCompleted?: boolean;
  brandingCompleted?: boolean;
  personalInfo?: {
    ownerName?: string;
    directorName?: string;
    profilePhotoUrl?: string;
    contactNumber?: string;
    email?: string;
    designation?: string;
  };
  instituteInfo?: {
    logoUrl?: string;
    name?: string;
    address?: string;
    website?: string;
    officialEmail?: string;
    establishedYear?: string;
    instituteType?: string;
  };
  academicConfig?: {
    academicSession?: string;
    studentIdPrefix?: string;
    courseCategories?: string[];
    defaultBatchTiming?: string;
  };
  branding?: {
    primaryColor?: string;
    secondaryColor?: string;
    certificateSignatureUrl?: string;
    instituteStampUrl?: string;
  };
  updatedAt: string;
}

export interface SuperAdminPermissions {
  canManageInstitutes: boolean;
  canManageSuperAdmins: boolean;
  canManageFinancials: boolean;
  canManageBranding: boolean;
  canManageAuditLogs: boolean;
}

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  pin: string; // 6-digit security PIN e.g. '630649'
  role: 'super_admin';
  isMaster: boolean; // Master Root Super Admin (vinkalp041@gmail.com)
  status: 'active' | 'suspended';
  permissions: SuperAdminPermissions;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'institute_admin' | 'staff' | 'student';
  instituteId?: string; // empty if super_admin
  studentId?: string; // set if student
  createdAt: string;
}

export type StudentStatus = 'Active' | 'Completed' | 'Archived' | 'Dropped';

export interface Student {
  id: string; // internal immutable database ID
  studentCode?: string; // public login/student ID, e.g. STUSBCI00001
  instituteId: string;
  enrollmentNo: string; // academic enrollment number, e.g. 'SBCI/ADCA/0268'
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  photoUrl?: string;
  mobile: string;
  email: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  qualification: string;
  schoolCollege: string;
  previousEducation?: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  batchId: string;
  batchName: string;
  session: string;
  courseDuration: string;
  courseFee: number;
  status: StudentStatus;
  admissionDate: string;
  createdAt: string;
  updatedAt: string;
  admissionFeeCharged?: number;
}

export interface CourseSubject {
  name: string;
  maxTheory: number;
  maxPractical: number;
  passMarks: number;
}

export interface Course {
  id: string;
  instituteId: string; // 'global' or specific instituteId
  code: string; // 'ADCA', 'DCA', etc.
  name: string;
  category: string;
  description: string;
  duration: string;
  fee: number;
  status: 'Active' | 'Inactive';
  syllabus: string[];
  subjects: CourseSubject[];
  certificateTemplateId?: string;
  marksheetTemplateId?: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  instituteId: string;
  code: string; // 'ADCA-2026-M'
  name: string;
  courseId: string;
  courseName: string;
  startDate: string;
  endDate: string;
  timing: string; // '08:00 AM - 10:00 AM'
  instructor: string;
  maxStudents: number;
  enrolledStudentsCount: number;
  status: 'Upcoming' | 'Active' | 'Completed';
  description: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  instituteId: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  records: {
    studentId: string;
    studentName: string;
    enrollmentNo: string;
    status: 'Present' | 'Absent' | 'Late' | 'Leave';
  }[];
  markedBy: string;
  createdAt: string;
}

export type TransactionType = 'credit' | 'debit';
export type TransactionPurpose = 'admission' | 'profile_update' | 'certificate_gen' | 'marksheet_gen' | 'recharge' | 'promo_credit' | 'refund';
export type TransactionStatus = 'success' | 'failed' | 'pending';

export interface WalletTransaction {
  id: string;
  instituteId: string;
  amount: number;
  type: TransactionType;
  purpose: TransactionPurpose;
  description: string;
  balanceAfter: number;
  relatedStudentId?: string;
  studentName?: string;
  paymentOrderId?: string;
  razorpayPaymentId?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'qr' | 'seal' | 'shape' | 'line' | 'signature' | 'badge';
  field: string; // e.g. 'student_name', 'course_name', 'qr_code', 'custom_text'
  label: string;
  customText?: string;
  x: number; // percentage (0 - 100) or px
  y: number; // percentage (0 - 100) or px
  fontSize: number; // in pt/px
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: number;
  lineHeight?: number;
  opacity?: number;
  rotation?: number;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  backgroundColor?: string;
  padding?: number;
  width?: number; // percentage or px
  height?: number;
  imageUrl?: string;
  zIndex?: number;
  locked?: boolean;
  hidden?: boolean;
  isVariable?: boolean;
  variableToken?: string;
  fallbackValue?: string;
}

export interface CertificateTemplate {
  id: string;
  instituteId?: string; // 'global' or instituteId
  title: string;
  description?: string;
  category: 'ADCA' | 'DCA' | 'Typing' | 'CCC' | 'Completion' | 'Diploma' | 'Participation' | 'Achievement' | 'Internship' | 'Training' | 'Custom';
  orientation: 'landscape' | 'portrait';
  dimensionPreset?: 'A4' | 'A5' | 'Custom';
  width?: number;
  height?: number;
  backgroundImage: string; // base64 or URL
  elements: TemplateElement[];
  isDefault: boolean;
  status?: 'draft' | 'published' | 'archived';
  version?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CertificateTemplateVersion {
  id: string;
  templateId: string;
  version: number;
  note?: string;
  elements: TemplateElement[];
  backgroundImage: string;
  createdBy: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // e.g. 'SBCI/ADCA/2026/0145' or 'CDP-2026-0268'
  verificationToken?: string; // Cryptographic verification token
  verificationTokenHash?: string; // SHA-256 hash
  instituteId: string;
  instituteName: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  motherName?: string;
  dateOfBirth?: string;
  enrollmentNo: string;
  courseId: string;
  courseName: string;
  courseDuration: string;
  session?: string;
  grade: string;
  percentage: number;
  typingSpeed?: number; // WPM
  typingAccuracy?: number; // %
  issueDate: string;
  completionDate: string;
  templateId: string;
  directorName?: string;
  status: 'valid' | 'revoked' | 'expired';
  revokedReason?: string;
  revokedAt?: string;
  revokedBy?: string;
  reissuedFromCertificateNumber?: string;
  reissuedToCertificateNumber?: string;
  qrCodeDataUrl?: string;
  pdfUrl?: string;
  issuedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CertificateVerificationResult {
  valid: boolean;
  status: 'valid' | 'revoked' | 'expired' | 'not_found';
  certificate?: {
    certificateNumber: string;
    studentName: string;
    courseName: string;
    instituteName: string;
    issueDate: string;
    completionDate: string;
    session?: string;
    grade?: string;
    percentage?: number;
    typingSpeed?: number;
    typingAccuracy?: number;
    directorName?: string;
    status: 'valid' | 'revoked' | 'expired';
    revokedReason?: string;
    revokedAt?: string;
    templateId?: string;
    verifiedAt: string;
  };
  message: string;
}

export interface Examination {
  id: string;
  instituteId: string;
  examName: string;
  courseId: string;
  courseName: string;
  batchId: string;
  batchName: string;
  examDate: string;
  status: 'Scheduled' | 'Completed' | 'Results Published';
  subjects: CourseSubject[];
  createdAt: string;
}

export interface SubjectResult {
  subjectName: string;
  maxTheory: number;
  maxPractical: number;
  obtainedTheory: number;
  obtainedPractical: number;
  totalMax: number;
  totalObtained: number;
  grade: string;
}

export interface StudentResult {
  id: string;
  instituteId: string;
  examId: string;
  studentId: string;
  studentName: string;
  enrollmentNo: string;
  courseName: string;
  batchName: string;
  subjects: SubjectResult[];
  grandTotalMax: number;
  grandTotalObtained: number;
  percentage: number;
  grade: string;
  result: 'PASS' | 'FAIL';
  publishedAt: string;
}

export interface Marksheet {
  id: string;
  marksheetNumber: string; // e.g. 'MS-2026-0268'
  instituteId: string;
  instituteName: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  enrollmentNo: string;
  courseId: string;
  courseName: string;
  batchName: string;
  examDate: string;
  subjects: SubjectResult[];
  grandTotalMax: number;
  grandTotalObtained: number;
  percentage: number;
  grade: string;
  result: 'PASS' | 'FAIL';
  issueDate: string;
  status: 'valid' | 'revoked';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  instituteId: string;
  userId: string;
  userEmail: string;
  action: string;
  targetType: 'student' | 'certificate' | 'marksheet' | 'batch' | 'wallet' | 'course' | 'institute' | 'security' | 'user';
  targetId: string;
  details: string;
  chargeDeducted?: number;
  timestamp: string;
}
