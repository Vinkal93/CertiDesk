"use client";

import React, { forwardRef } from "react";
import { CertificateTemplate, TemplateElement } from "@/types";

interface CertificateCanvasProps {
  template: CertificateTemplate;
  data: {
    student_name: string;
    father_name: string;
    mother_name?: string;
    enrollment_number: string;
    course_name: string;
    course_duration?: string;
    institute_name: string;
    issue_date: string;
    completion_date?: string;
    session?: string;
    certificate_number: string;
    grade?: string;
    percentage?: number | string;
    typing_speed?: number | string;
    typing_accuracy?: number | string;
    qr_code?: string; // Data URL
    photo?: string;
    director_name?: string;
  };
  scale?: number;
  interactive?: boolean;
  selectedElementId?: string | null;
  onSelectElement?: (id: string) => void;
}

export const CertificateCanvas = forwardRef<HTMLDivElement, CertificateCanvasProps>(
  ({ template, data, scale = 1, interactive = false, selectedElementId = null, onSelectElement }, ref) => {
    // 1024 x 724 matches the exact pixel dimensions of the SBCI Master Template image
    const baseWidth = template.orientation === "portrait" ? 724 : 1024;
    const baseHeight = template.orientation === "portrait" ? 1024 : 724;

    const studentName = data.student_name || "Khushbu";
    const courseTitle = data.course_name 
      ? (data.course_name.includes("(") ? data.course_name : `${data.course_name} (${data.course_name.toUpperCase()})`)
      : "Advanced Diploma in Computer Application (ADCA)";
    const gradeVal = data.grade || "A+";
    const instituteName = data.institute_name || "SBCI Computer Institute";
    const periodText = data.session || (data.completion_date && data.issue_date ? `${data.completion_date} – ${data.issue_date}` : "01 July 2026 – 30 December 2026");
    const certNumber = data.certificate_number || "SBCI/ADCA/2026/0145";
    const directorName = data.director_name || "Vinkal Prajapati";

    const resolveFieldValue = (field: string, customText?: string): string => {
      // 1. If customText is provided, replace mustache variables: {{name}}, {{course}}, etc.
      let text = customText || "";
      if (!text) {
        switch (field) {
          case "certified_to":
            text = "This is to certify that";
            break;
          case "student_name":
          case "{{name}}":
            text = studentName;
            break;
          case "completed_prefix":
            text = "has successfully completed the";
            break;
          case "course_name":
          case "{{course}}":
            text = courseTitle;
            break;
          case "institute_grade_period":
            text = `from ${instituteName} with Grade ${gradeVal} during the period`;
            break;
          case "completion_period":
          case "{{session}}":
            text = periodText;
            break;
          case "certificate_number":
          case "cert_number_box":
          case "{{certificate_number}}":
            text = certNumber;
            break;
          case "grade":
          case "grade_box":
          case "{{grade}}":
            text = gradeVal;
            break;
          case "percentage":
          case "{{percentage}}":
            text = `${data.percentage || "88.5"}%`;
            break;
          case "father_name":
          case "{{father_name}}":
            text = data.father_name || "Mr. Ram Pratap";
            break;
          case "mother_name":
          case "{{mother_name}}":
            text = data.mother_name || "Mrs. Sita Devi";
            break;
          case "enrollment_number":
          case "{{enrollment_number}}":
            text = data.enrollment_number || "SBCI/ADCA/0268";
            break;
          case "institute_name":
          case "{{institute_name}}":
            text = instituteName;
            break;
          case "issue_date":
          case "{{issue_date}}":
            text = data.issue_date || new Date().toISOString().split("T")[0];
            break;
          case "completion_date":
          case "{{completion_date}}":
            text = data.completion_date || new Date().toISOString().split("T")[0];
            break;
          case "director_signature":
          case "{{director_name}}":
            text = directorName;
            break;
          case "verification_url":
          case "{{verification_url}}":
            return `https://certidesk.pro/verify/${certNumber}`;
          default:
            text = field;
            break;
        }
      }

      // 2. Perform mustache interpolation for any embedded tokens in string
      return text
        .replace(/{{\s*name\s*}}/gi, studentName)
        .replace(/{{\s*father_name\s*}}/gi, data.father_name || "Mr. Ram Pratap")
        .replace(/{{\s*mother_name\s*}}/gi, data.mother_name || "Mrs. Sita Devi")
        .replace(/{{\s*course\s*}}/gi, courseTitle)
        .replace(/{{\s*course_duration\s*}}/gi, data.course_duration || "12 Months")
        .replace(/{{\s*session\s*}}/gi, periodText)
        .replace(/{{\s*grade\s*}}/gi, gradeVal)
        .replace(/{{\s*percentage\s*}}/gi, `${data.percentage || "88.5"}%`)
        .replace(/{{\s*certificate_number\s*}}/gi, certNumber)
        .replace(/{{\s*enrollment_number\s*}}/gi, data.enrollment_number || "SBCI/ADCA/0268")
        .replace(/{{\s*institute_name\s*}}/gi, instituteName)
        .replace(/{{\s*director_name\s*}}/gi, directorName)
        .replace(/{{\s*issue_date\s*}}/gi, data.issue_date || new Date().toISOString().split("T")[0])
        .replace(/{{\s*completion_date\s*}}/gi, data.completion_date || new Date().toISOString().split("T")[0]);
    };

    return (
      <div
        ref={ref}
        style={{
          width: `${baseWidth * scale}px`,
          height: `${baseHeight * scale}px`,
        }}
        className="relative overflow-hidden bg-white shadow-2xl mx-auto select-none print-area"
      >
        {/* 1. Base Certificate Template Image / Frame */}
        {template.backgroundImage ? (
          <img
            src={template.backgroundImage}
            alt="Certificate Background"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none"
            crossOrigin="anonymous"
          />
        ) : (
          /* Fallback ornate border if no background image is set */
          <div className="absolute inset-0 border-[16px] border-[#0F172A] p-2 bg-[#FDFCFA]">
            <div className="w-full h-full border-2 border-amber-600/60 p-4 relative" />
          </div>
        )}

        {/* 2. Dynamic Overlaid Elements */}
        {template.elements.map((el) => {
          if (el.hidden) return null;

          const xPos = `${el.x}%`;
          const yPos = `${el.y}%`;
          const isSelected = selectedElementId === el.id;
          const rotation = el.rotation || 0;
          const opacity = el.opacity ?? 1;

          // SPECIAL COMPONENT: Image / Logo / Stamp
          if (el.type === "image" && el.imageUrl) {
            const w = (el.width || 80) * scale;
            const h = (el.height || 80) * scale;
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  opacity,
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`select-none ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded" : ""}`}
              >
                <img
                  src={el.imageUrl}
                  alt={el.label}
                  style={{ width: `${w}px`, height: `${h}px` }}
                  className="object-contain"
                  crossOrigin="anonymous"
                />
              </div>
            );
          }

          // SPECIAL COMPONENT: Decorative Divider Line
          if (el.type === "line") {
            const lineWidth = (el.width || 200) * scale;
            const lineHeight = (el.height || 2) * scale;
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  width: `${lineWidth}px`,
                  height: `${lineHeight}px`,
                  backgroundColor: el.color || "#0F172A",
                  opacity,
                  cursor: interactive ? "pointer" : "default",
                }}
                className={isSelected ? "ring-2 ring-purple-600 ring-offset-2" : ""}
              />
            );
          }

          // SPECIAL COMPONENT: Shape / Box
          if (el.type === "shape") {
            const shapeW = (el.width || 120) * scale;
            const shapeH = (el.height || 40) * scale;
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                  width: `${shapeW}px`,
                  height: `${shapeH}px`,
                  backgroundColor: el.backgroundColor || "transparent",
                  borderWidth: `${(el.borderWidth || 1) * scale}px`,
                  borderColor: el.borderColor || "#0F172A",
                  borderRadius: `${(el.borderRadius || 4) * scale}px`,
                  opacity,
                  cursor: interactive ? "pointer" : "default",
                }}
                className={isSelected ? "ring-2 ring-purple-600 ring-offset-2" : ""}
              />
            );
          }

          // SPECIAL COMPONENT: Certified Gold Medal Seal on the left ribbon
          if (el.type === "seal" || el.field === "certified_seal") {
            const sealSize = (el.width || 90) * scale;
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: "translate(-50%, -50%)",
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`relative flex flex-col items-center select-none ${isSelected ? "ring-2 ring-purple-600 ring-offset-2" : ""}`}
              >
                {/* Hanging Ribbons below seal */}
                <div className="absolute top-[82%] flex justify-center gap-1 w-full pointer-events-none">
                  <div
                    style={{ width: `${20 * scale}px`, height: `${36 * scale}px` }}
                    className="bg-[#0B1528] border-r border-amber-400/60 shadow-md transform -rotate-12 clip-ribbon-tail"
                  />
                  <div
                    style={{ width: `${20 * scale}px`, height: `${36 * scale}px` }}
                    className="bg-[#0B1528] border-l border-amber-400/60 shadow-md transform rotate-12 clip-ribbon-tail"
                  />
                </div>

                {/* Round Seal Body */}
                <div
                  style={{
                    width: `${sealSize}px`,
                    height: `${sealSize}px`,
                  }}
                  className="rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-[3px] shadow-xl relative z-10 flex items-center justify-center"
                >
                  {/* Scalloped / Ribbed Outer Ring */}
                  <div className="w-full h-full rounded-full bg-[#0E172E] border-2 border-amber-400/80 p-1 flex flex-col items-center justify-center text-center">
                    <span
                      style={{ fontSize: `${8.5 * scale}px`, letterSpacing: "1px" }}
                      className="font-black text-amber-300 uppercase leading-none block"
                    >
                      SBCI
                    </span>

                    {/* Mini Monitor Icon */}
                    <div
                      style={{ width: `${14 * scale}px`, height: `${10 * scale}px` }}
                      className="border border-amber-300 rounded-[2px] flex items-center justify-center my-0.5"
                    >
                      <div
                        style={{ width: `${6 * scale}px`, height: `${4 * scale}px` }}
                        className="bg-amber-300 rounded-[1px]"
                      />
                    </div>

                    <span
                      style={{ fontSize: `${6.5 * scale}px`, letterSpacing: "0.5px" }}
                      className="font-extrabold text-amber-200 uppercase leading-none block"
                    >
                      CERTIFIED
                    </span>

                    {/* 3 Gold Stars */}
                    <div className="flex items-center gap-0.5 text-amber-300 text-[6px] mt-0.5">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // SPECIAL COMPONENT: QR Code with "Verify Certificate" label
          if (el.type === "qr" || el.field === "qr_code") {
            const qrSize = (el.width || 65) * scale;
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: "translate(-50%, -50%)",
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`flex flex-col items-center text-center ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded" : ""}`}
              >
                {data.qr_code ? (
                  <img
                    src={data.qr_code}
                    alt="QR Verification"
                    style={{
                      width: `${qrSize}px`,
                      height: `${qrSize}px`,
                    }}
                    className="p-1 bg-white border border-slate-300 shadow-xs"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div
                    style={{
                      width: `${qrSize}px`,
                      height: `${qrSize}px`,
                    }}
                    className="bg-white border border-slate-300 flex items-center justify-center text-[8px] font-mono"
                  >
                    QR Code
                  </div>
                )}
                <span
                  style={{ fontSize: `${8.5 * scale}px` }}
                  className="font-bold text-slate-800 leading-tight mt-1"
                >
                  Verify Certificate
                </span>
                <span
                  style={{ fontSize: `${7 * scale}px` }}
                  className="text-slate-500 font-mono"
                >
                  sbci.online/verify
                </span>
              </div>
            );
          }

          // SPECIAL COMPONENT: Student Name in Fluid Elegant Cursive Font
          if (el.field === "student_name") {
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${(el.fontSize || 46) * scale}px`,
                  fontFamily: "'Great Vibes', 'Playball', 'Alex Brush', cursive, serif",
                  fontWeight: el.fontWeight || "normal",
                  color: el.color || "#10152B",
                  whiteSpace: "nowrap",
                  lineHeight: 1.1,
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`tracking-wide text-center drop-shadow-xs ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded px-2" : ""}`}
              >
                {studentName}
              </div>
            );
          }

          // SPECIAL COMPONENT: Grade Box Pill
          if (el.field === "grade_box" || el.field === "grade") {
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: "translate(-50%, -50%)",
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`flex flex-col items-center ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded" : ""}`}
              >
                <span
                  style={{ fontSize: `${10 * scale}px` }}
                  className="font-bold text-slate-700 leading-none mb-1"
                >
                  Grade
                </span>
                <div
                  style={{
                    padding: `${4 * scale}px ${16 * scale}px`,
                    fontSize: `${16 * scale}px`,
                  }}
                  className="bg-[#0F172A] text-white font-black rounded-lg shadow-xs flex items-center justify-center font-mono"
                >
                  {gradeVal}
                </div>
              </div>
            );
          }

          // SPECIAL COMPONENT: Certificate Number Box Pill
          if (el.field === "cert_number_box" || el.field === "certificate_number") {
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: "translate(-50%, -50%)",
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`flex flex-col items-center ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded" : ""}`}
              >
                <span
                  style={{ fontSize: `${10 * scale}px` }}
                  className="font-bold text-slate-700 leading-none mb-1"
                >
                  Certificate No.
                </span>
                <div
                  style={{
                    padding: `${4 * scale}px ${14 * scale}px`,
                    fontSize: `${11.5 * scale}px`,
                  }}
                  className="bg-white border border-slate-300 text-slate-900 font-bold rounded-lg shadow-xs flex items-center justify-center font-mono tracking-tight"
                >
                  {certNumber}
                </div>
              </div>
            );
          }

          // SPECIAL COMPONENT: Director Signature Block
          if (el.field === "director_signature" || el.field === "signature") {
            return (
              <div
                key={el.id}
                onClick={() => interactive && onSelectElement?.(el.id)}
                style={{
                  position: "absolute",
                  left: xPos,
                  top: yPos,
                  transform: "translate(-50%, -50%)",
                  cursor: interactive ? "pointer" : "default",
                }}
                className={`flex flex-col items-center text-center ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded px-2" : ""}`}
              >
                {/* Cursive Signature Graphic */}
                <div
                  style={{
                    fontSize: `${24 * scale}px`,
                    fontFamily: "'Great Vibes', 'Playball', cursive, serif",
                  }}
                  className="text-slate-900 font-normal leading-none transform -rotate-3 mb-1"
                >
                  Vinkal
                </div>

                {/* Horizontal divider line */}
                <div
                  style={{ width: `${130 * scale}px`, height: "1px" }}
                  className="bg-slate-800 my-1"
                />

                <span
                  style={{ fontSize: `${11 * scale}px` }}
                  className="font-black text-slate-900 leading-tight block"
                >
                  {directorName}
                </span>
                <span
                  style={{ fontSize: `${9 * scale}px` }}
                  className="font-medium text-slate-600 block leading-tight"
                >
                  Director
                </span>
                <span
                  style={{ fontSize: `${8.5 * scale}px` }}
                  className="font-semibold text-slate-700 block leading-tight"
                >
                  {instituteName}
                </span>
              </div>
            );
          }

          // STANDARD TEXT ELEMENT (Course name, This is to certify that, period, etc.)
          const renderedText = resolveFieldValue(el.field, el.customText);

          return (
            <div
              key={el.id}
              onClick={() => interactive && onSelectElement?.(el.id)}
              style={{
                position: "absolute",
                left: xPos,
                top: yPos,
                transform: `${
                  el.textAlign === "center"
                    ? "translate(-50%, -50%)"
                    : el.textAlign === "right"
                    ? "translate(-100%, -50%)"
                    : "translate(0, -50%)"
                } rotate(${rotation}deg)`,
                opacity,
                fontSize: `${(el.fontSize || 14) * scale}px`,
                fontFamily:
                  el.fontFamily === "serif"
                    ? "'Times New Roman', Georgia, serif"
                    : el.fontFamily === "cursive"
                    ? "'Great Vibes', 'Playball', cursive, serif"
                    : el.fontFamily === "monospace"
                    ? "Courier New, monospace"
                    : "'Montserrat', 'Plus Jakarta Sans', sans-serif",
                fontWeight: el.fontWeight || "normal",
                fontStyle: el.fontStyle || "normal",
                textDecoration: el.textDecoration || "none",
                textTransform: el.textTransform || "none",
                color: el.color || "#10152B",
                letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : "normal",
                textAlign: el.textAlign || "center",
                whiteSpace: "nowrap",
                cursor: interactive ? "pointer" : "default",
              }}
              className={`leading-tight relative group ${isSelected ? "ring-2 ring-purple-600 ring-offset-2 rounded px-1.5" : ""}`}
            >
              {interactive && (el.isVariable || el.field.startsWith("{{")) && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#6529E8] text-[8px] font-mono font-bold text-white px-1.5 py-0.5 rounded-full pointer-events-none shadow-xs whitespace-nowrap z-30">
                  {el.variableToken || el.field}
                </span>
              )}
              {renderedText}
            </div>
          );
        })}
      </div>
    );
  }
);

CertificateCanvas.displayName = "CertificateCanvas";
