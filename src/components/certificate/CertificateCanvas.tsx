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
    certificate_number: string;
    grade?: string;
    percentage?: number | string;
    typing_speed?: number | string;
    typing_accuracy?: number | string;
    qr_code?: string; // Data URL
    photo?: string;
  };
  scale?: number;
}

export const CertificateCanvas = forwardRef<HTMLDivElement, CertificateCanvasProps>(
  ({ template, data, scale = 1 }, ref) => {
    const isLandscape = template.orientation === "landscape";
    const baseWidth = isLandscape ? 842 : 595; // A4 standard pt: 842x595
    const baseHeight = isLandscape ? 595 : 842;

    const resolveFieldValue = (field: string): string => {
      switch (field) {
        case "student_name":
          return data.student_name || "Khushbu";
        case "father_name":
          return data.father_name || "Rameshwar Prasad";
        case "mother_name":
          return data.mother_name || "Sunita Devi";
        case "parentage":
          return `Son / Daughter of Shri ${data.father_name || "Father Name"} & Smt. ${data.mother_name || "Mother Name"}`;
        case "enrollment_number":
          return data.enrollment_number || "SBCI/ADCA/0268";
        case "course_name":
          return data.course_name || "Advanced Diploma in Computer Application";
        case "course_details":
          return `has successfully completed the prescribed course of study with Grade ${data.grade || "A+"} (${data.percentage || "88.5"}%)`;
        case "institute_name":
          return data.institute_name || "SBCI Computer Institute";
        case "issue_date":
          return `Date of Issue: ${data.issue_date || new Date().toISOString().split("T")[0]}`;
        case "completion_date":
          return data.completion_date || data.issue_date;
        case "certificate_number":
          return `Certificate No: ${data.certificate_number || "CDP-2026-0268"}`;
        case "grade":
          return `Grade: ${data.grade || "A+"}`;
        case "percentage":
          return `${data.percentage || 85}%`;
        case "typing_speed":
          return `Speed: ${data.typing_speed || 48} WPM | Accuracy: ${data.typing_accuracy || 98}%`;
        case "title":
          return "CERTIFICATE OF EXCELLENCE";
        case "certified_to":
          return "This is to certify that";
        case "signature":
          return "Authorized Signatory";
        default:
          return field;
      }
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
        {/* Certificate Frame & Background Graphic */}
        <div className="absolute inset-0 border-[16px] border-[#10152B] p-2 bg-[#FDFCFA]">
          <div className="w-full h-full border-2 border-amber-600/60 p-4 relative flex flex-col justify-between">
            {/* Corner Ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

            {/* Background Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <div className="w-96 h-96 rounded-full border-16 border-[#10152B] flex items-center justify-center font-serif text-8xl font-black">
                CDP
              </div>
            </div>

            {/* Dynamic Template Elements */}
            {template.elements.map((el) => {
              const xPos = `${el.x}%`;
              const yPos = `${el.y}%`;

              if (el.type === "qr") {
                return (
                  <div
                    key={el.id}
                    style={{
                      position: "absolute",
                      left: xPos,
                      top: yPos,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="flex flex-col items-center"
                  >
                    {data.qr_code ? (
                      <img
                        src={data.qr_code}
                        alt="QR Verification"
                        style={{
                          width: `${(el.width || 70) * scale}px`,
                          height: `${(el.height || 70) * scale}px`,
                        }}
                        className="p-1 bg-white border border-slate-200 shadow-xs"
                      />
                    ) : (
                      <div
                        style={{
                          width: `${(el.width || 70) * scale}px`,
                          height: `${(el.height || 70) * scale}px`,
                        }}
                        className="bg-slate-100 border border-slate-300 flex items-center justify-center text-[8px] font-mono"
                      >
                        QR Code
                      </div>
                    )}
                    <span
                      style={{ fontSize: `${8 * scale}px` }}
                      className="text-slate-600 font-mono mt-0.5 tracking-tighter"
                    >
                      Scan to Verify
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={el.id}
                  style={{
                    position: "absolute",
                    left: xPos,
                    top: yPos,
                    transform:
                      el.textAlign === "center"
                        ? "translate(-50%, -50%)"
                        : el.textAlign === "right"
                        ? "translate(-100%, -50%)"
                        : "translate(0, -50%)",
                    fontSize: `${el.fontSize * scale}px`,
                    fontFamily:
                      el.fontFamily === "serif"
                        ? "'Times New Roman', Times, serif"
                        : el.fontFamily === "monospace"
                        ? "Courier New, monospace"
                        : "sans-serif",
                    fontWeight: el.fontWeight,
                    color: el.color,
                    letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : "normal",
                    textAlign: el.textAlign,
                    whiteSpace: "nowrap",
                  }}
                >
                  {resolveFieldValue(el.field)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

CertificateCanvas.displayName = "CertificateCanvas";
