# CertiDesk Pro
## Production-Ready Multi-Institute Student, Batch, Course, Certificate & Marksheet Management SaaS

CertiDesk Pro is a high-performance, lightweight, production-grade SaaS platform built for computer institutes, coaching centers, and educational institutions.

---

## 🎨 Visual Identity & Design System

The visual design is inspired by the CertiDesk Pro dashboard architecture:
- **Sidebar**: Dark Navy (`#10152B`) with rounded active highlight (`#6529E8`)
- **Primary Accent**: Electric Violet (`#6529E8` / `#8B5CF6`)
- **Background**: Soft Canvas (`#F7F8FC`)
- **Cards**: Pure White (`#FFFFFF`) with subtle borders (`#E2E8F0`)
- **Typography**: Compact, legible typography with numeric monospace accents for IDs and credentials.

---

## ⚡ Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend / DB**: Cloud Firestore & Firebase Authentication + Firebase Admin SDK
- **Billing / Payments**: Razorpay Webhook & Checkout Integration + Immutable Ledger Store
- **PDF & Canvas**: jsPDF + html2canvas + QRCode
- **Deployment**: Vercel (Frontend) & Firebase (Backend / Security Rules)

---

## 🏢 Multi-Tenant Architecture

1. **Institute Admin Panel**:
   - Access only own students, batches, courses, certificates, and transactions.
   - Unique Institute ID format: `SBCI1001`, `INST1002`, etc.
   - Dedicated prepaid wallet with atomic transactions.
2. **Super Admin Platform Control Plane**:
   - Platform overview and global financial analytics.
   - Approve, suspend, or activate centers.
   - Global course catalog assignment.
   - Visual certificate & marksheet template builder.
   - Promotional balance grants with full audit trail.
3. **Public Verification Engine**:
   - `/verify/[certificateNumber]`
   - `/verify-marksheet/[marksheetNumber]`
   - Cryptographically linked QR code verification without exposing private contact info.

---

## 💰 Automated Wallet Billing Rules

- **New Student Admission**: Deducts ₹150 atomically from wallet balance.
- **Meaningful Profile Update**: Deducts ₹100 upon authorized changes (Name, Parentage, Contact) with user confirmation.
- **Certificate Generation**: ₹0 (Free included feature).
- **Marksheet Generation**: ₹0 (Free included feature).
- **Payment Gateway**: Integrated with Razorpay for instant wallet recharges (₹500, ₹1,000, ₹2,000, ₹5,000, Custom).

---

## 🚀 Workflows Implemented

- **Workflow A**: Institute Registration → Unique ID Generation → Auto-Approval → Login → Dashboard
- **Workflow B**: Student Admission → Course & Batch Selection → ₹150 Wallet Deduction → Unique Enrollment Number (`SBCI/ADCA/0268`)
- **Workflow C**: Batch Management → Cohort Timings & Capacity → Student Transfers (preserving history) → Attendance
- **Workflow D**: Certificate Generator → Template Canvas → Live Drag & Drop Editor → High-Res A4 PDF Export → Dynamic QR Verification
- **Workflow E**: Marksheet Generator → Theory & Practical Marks Entry → Automated Percentage, Grade & Result → High-Res PDF Transcript
- **Workflow F**: Wallet System → Razorpay Checkout → Immutable Transaction Ledger & Receipts
- **Workflow G**: Profile Correction → ₹100 Fee Confirmation Dialog → Atomic Wallet Deduction → Audit Log
- **Workflow H**: Tenant Isolation → Strict Firestore Security Rules preventing cross-institute data access

---

## 🛠️ Environment Variables Setup

Create a `.env.local` file with the following keys:

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Service Account (JSON stringified)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"..."}

# Razorpay Payment Gateway Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Public Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev

# 3. Open http://localhost:3000 in your browser
```

## 🔒 Firebase Security Rules Deployment

```bash
# Deploy Firestore & Storage Security Rules
firebase deploy --only firestore:rules,storage
```
