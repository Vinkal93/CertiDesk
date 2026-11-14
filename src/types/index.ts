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
  code: string; // e.g., 'SBCI'
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
  settings: InstituteSettings;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'institute_admin' | 'staff';
  instituteId?: string; // empty if super_admin
  createdAt: string;
}

export type StudentStatus = 'Active' | 'Completed' | 'Archived' | 'Dropped';

export interface Student {
  id: string;
  instituteId: string;
  enrollmentNo: string; // e.g. 'SBCI/ADCA/0268'
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
  type: 'text' | 'image' | 'qr';
  field: string; // e.g. 'student_name', 'course_name', 'qr_code'
  label: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  fontSize: number; // in pt/px
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '500' | '600' | '700';
  color: string;
  textAlign: 'left' | 'center' | 'right';
  letterSpacing?: number;
  width?: number; // percentage or px
  height?: number;
}

export interface CertificateTemplate {
  id: string;
  title: string;
  category: 'ADCA' | 'DCA' | 'Typing' | 'CCC' | 'Custom';
  orientation: 'landscape' | 'portrait';
  backgroundImage: string; // base64 or URL
  elements: TemplateElement[];
  isDefault: boolean;
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string; // e.g. 'CDP-2026-0268'
  instituteId: string;
  instituteName: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  motherName?: string;
  enrollmentNo: string;
  courseId: string;
  courseName: string;
  courseDuration: string;
  grade: string;
  percentage: number;
  typingSpeed?: number; // WPM
  typingAccuracy?: number; // %
  issueDate: string;
  completionDate: string;
  templateId: string;
  status: 'valid' | 'revoked';
  qrCodeDataUrl?: string;
  createdAt: string;
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
  targetType: 'student' | 'certificate' | 'marksheet' | 'batch' | 'wallet' | 'course';
  targetId: string;
  details: string;
  chargeDeducted?: number;
  timestamp: string;
}
