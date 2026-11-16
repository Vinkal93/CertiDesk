"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Layers, 
  Upload, 
  Plus, 
  Save, 
  Trash2, 
  Move, 
  Eye, 
  Type, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Image as ImageIcon,
  Check,
  FileCheck,
  Award
} from "lucide-react";
import { CertificateTemplate, TemplateElement } from "@/types";
import { dataStore } from "@/lib/db";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { AlertModal } from "@/components/ui/FeedbackModal";

export default function CertificateTemplateBuilder() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(null);
  const [previewStudent, setPreviewStudent] = useState({
    name: "Khushbu",
    course: "Advanced Diploma in Computer Application (ADCA)",
    period: "01 July 2026 – 30 December 2026",
    grade: "A+",
    certNumber: "SBCI/ADCA/2026/0145"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const list = await dataStore.getTemplates();
      setTemplates(list);
      if (list.length > 0) setSelectedTemplate(list[0]);
    }
    load();
  }, []);

  const currentElement = selectedTemplate?.elements.find((el) => el.id === selectedElementId);

  const handleUpdateElement = (updates: Partial<TemplateElement>) => {
    if (!selectedTemplate || !selectedElementId) return;
    const updatedElements = selectedTemplate.elements.map((el) =>
      el.id === selectedElementId ? { ...el, ...updates } : el
    );
    setSelectedTemplate({
      ...selectedTemplate,
      elements: updatedElements,
    });
  };

  const handleAddElement = (field: string, label: string, type: "text" | "qr" | "seal" = "text") => {
    if (!selectedTemplate) return;
    const newEl: TemplateElement = {
      id: `el_${Date.now()}`,
      type,
      field,
      label,
      x: 50,
      y: 50,
      fontSize: field === "student_name" ? 46 : 16,
      fontFamily: field === "student_name" ? "cursive" : "sans",
      fontWeight: field === "course_name" ? "bold" : "normal",
      color: "#10152B",
      textAlign: "center",
      width: type === "qr" ? 65 : type === "seal" ? 90 : undefined,
      height: type === "qr" ? 65 : type === "seal" ? 90 : undefined,
    };
    setSelectedTemplate({
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newEl],
    });
    setSelectedElementId(newEl.id);
  };

  const handleDeleteElement = (id: string) => {
    if (!selectedTemplate) return;
    setSelectedTemplate({
      ...selectedTemplate,
      elements: selectedTemplate.elements.filter((el) => el.id !== id),
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;
    await dataStore.saveTemplate(selectedTemplate);
    setSavedSuccess(true);
    setFeedbackAlert({
      title: "Template Saved Successfully",
      message: `"${selectedTemplate.title}" has been saved. Any newly generated certificates will automatically use this layout and background image.`,
      type: "success"
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplate) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setSelectedTemplate({
        ...selectedTemplate,
        backgroundImage: dataUrl,
      });
      setFeedbackAlert({
        title: "Certificate Background Uploaded",
        message: "Your custom certificate template background has been loaded into the workspace. The dynamic student fields will overwrite directly on top of this image.",
        type: "info"
      });
    };
    reader.readAsDataURL(file);
  };

  const handleApplySbciMasterLayout = () => {
    if (!selectedTemplate) return;
    
    const sbciElements: TemplateElement[] = [
      { id: "el-seal", type: "seal", field: "certified_seal", label: "SBCI Certified Medal Seal", x: 12.3, y: 48.5, fontSize: 12, fontFamily: "sans", fontWeight: "bold", color: "#FBBF24", textAlign: "center", width: 90, height: 90 },
      { id: "el-cert-to", type: "text", field: "certified_to", label: "This is to certify that", x: 50, y: 41.5, fontSize: 16, fontFamily: "serif", fontWeight: "normal", color: "#1E293B", textAlign: "center" },
      { id: "el-name", type: "text", field: "student_name", label: "Student Name (Cursive)", x: 50, y: 49.3, fontSize: 46, fontFamily: "cursive", fontWeight: "normal", color: "#10152B", textAlign: "center" },
      { id: "el-completed", type: "text", field: "completed_prefix", label: "has successfully completed the", x: 50, y: 58.0, fontSize: 15, fontFamily: "sans", fontWeight: "normal", color: "#334155", textAlign: "center" },
      { id: "el-course", type: "text", field: "course_name", label: "Course Title (Bold)", x: 50, y: 62.6, fontSize: 18, fontFamily: "sans", fontWeight: "bold", color: "#0F172A", textAlign: "center" },
      { id: "el-from-inst", type: "text", field: "institute_grade_period", label: "from Institute with Grade during period", x: 50, y: 66.8, fontSize: 13.5, fontFamily: "sans", fontWeight: "500", color: "#334155", textAlign: "center" },
      { id: "el-period", type: "text", field: "completion_period", label: "Course Duration Period", x: 50, y: 72.8, fontSize: 13, fontFamily: "sans", fontWeight: "600", color: "#1E293B", textAlign: "center" },
      { id: "el-qr", type: "qr", field: "qr_code", label: "Verification QR Code", x: 11.0, y: 83.2, fontSize: 10, fontFamily: "sans", fontWeight: "normal", color: "#000000", textAlign: "center", width: 65, height: 65 },
      { id: "el-grade", type: "text", field: "grade_box", label: "Grade Pill Box", x: 37.8, y: 84.8, fontSize: 18, fontFamily: "sans", fontWeight: "bold", color: "#FFFFFF", textAlign: "center" },
      { id: "el-no", type: "text", field: "cert_number_box", label: "Certificate No. Pill Box", x: 56.5, y: 84.8, fontSize: 12.5, fontFamily: "monospace", fontWeight: "bold", color: "#0F172A", textAlign: "center" },
      { id: "el-sig", type: "text", field: "director_signature", label: "Director Signature & Name", x: 81.0, y: 85.0, fontSize: 12.5, fontFamily: "sans", fontWeight: "bold", color: "#0F172A", textAlign: "center" },
    ];

    setSelectedTemplate({
      ...selectedTemplate,
      backgroundImage: selectedTemplate.backgroundImage || "/templates/sbci-certificate-template.jpg",
      elements: sbciElements,
    });

    setFeedbackAlert({
      title: "Master Layout Applied",
      message: "The official SBCI certificate alignment coordinates have been applied to this template.",
      type: "success"
    });
  };

  const placeholders = [
    { field: "student_name", label: "Student Full Name (Cursive)", isCursive: true },
    { field: "certified_to", label: "This is to certify that" },
    { field: "completed_prefix", label: "has successfully completed the" },
    { field: "course_name", label: "Course Name & Code" },
    { field: "institute_grade_period", label: "Institute & Grade Description" },
    { field: "completion_period", label: "Course Duration Period" },
    { field: "qr_code", label: "Verification QR Code", isQR: true },
    { field: "grade_box", label: "Grade Pill Box" },
    { field: "cert_number_box", label: "Certificate Number Box" },
    { field: "director_signature", label: "Director Signature & Name" },
    { field: "certified_seal", label: "SBCI Certified Medal Seal", isSeal: true },
  ];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/certificates/history" className="hover:text-slate-800">Certificates</Link>
            <span>›</span>
            <span className="text-slate-900 font-bold">Template Builder</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Certificate Visual Template Builder
          </h2>
          <p className="text-xs text-slate-500">
            Upload custom certificate background images, position dynamic student text tags, and configure cursive typography.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleApplySbciMasterLayout}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
            title="Auto-align all placeholders to the SBCI Master Template"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Apply Master Layout</span>
          </button>

          <button
            type="button"
            onClick={handleSaveTemplate}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (3 cols): Upload Template & Tags */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* 1. Upload & Template Selection Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3.5 text-xs">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
              <ImageIcon className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Certificate Template Image
              </h3>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Template Preset</label>
              <select
                value={selectedTemplate?.id || ""}
                onChange={(e) => {
                  const t = templates.find((item) => item.id === e.target.value);
                  if (t) setSelectedTemplate(t);
                }}
                className="w-full p-2 bg-slate-50 border rounded-xl font-semibold text-slate-800"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Upload Button */}
            <div className="pt-1">
              <label className="text-slate-700 font-bold block mb-1.5">
                Upload Background Image (.jpg, .png)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBgUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Certificate Background</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                Upload your institute certificate design. Student name, course, QR and marks will overwrite automatically over it.
              </p>
            </div>
          </div>

          {/* 2. Available Dynamic Tags */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Available Overwrite Tags
              </h3>
              <span className="text-[10px] text-slate-400">Click to add layer</span>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {placeholders.map((p) => (
                <button
                  key={p.field}
                  type="button"
                  onClick={() => handleAddElement(p.field, p.label, p.isQR ? "qr" : p.isSeal ? "seal" : "text")}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-100 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer group"
                >
                  <span className="group-hover:text-purple-700">{p.label}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Column (6 cols): Live Interactive Canvas */}
        <div className="lg:col-span-6 space-y-3">
          {/* Zoom and Preview Toolbar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Zoom: {Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.1))}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
              </button>
              <button
                onClick={() => setZoomScale((z) => Math.min(1.2, z + 0.1))}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Overwrite Preview</span>
            </div>
          </div>

          {/* Canvas Scrollport */}
          <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200 flex items-center justify-center overflow-auto max-h-[750px]">
            {selectedTemplate && (
              <CertificateCanvas
                template={selectedTemplate}
                scale={zoomScale}
                interactive={true}
                selectedElementId={selectedElementId}
                onSelectElement={(id) => setSelectedElementId(id)}
                data={{
                  student_name: previewStudent.name,
                  father_name: "Mr. Ram Pratap",
                  mother_name: "Mrs. Sunita Devi",
                  enrollment_number: "SBCI/ADCA/0268",
                  course_name: previewStudent.course,
                  institute_name: "SBCI Computer Institute",
                  issue_date: "2026-10-04",
                  completion_date: "01 July 2026",
                  session: previewStudent.period,
                  certificate_number: previewStudent.certNumber,
                  grade: previewStudent.grade,
                  percentage: 89.0,
                  director_name: "Vinkal Prajapati",
                }}
              />
            )}
          </div>
        </div>

        {/* Right Column (3 cols): Layer Inspector */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-2 flex items-center justify-between">
              <span>Active Overwrite Layers</span>
              <span className="font-mono text-slate-400">{selectedTemplate?.elements.length || 0}</span>
            </h3>

            {/* Layer List */}
            <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
              {selectedTemplate?.elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElementId(el.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElementId === el.id
                      ? "bg-purple-50 border-purple-400 font-bold text-purple-900 shadow-xs"
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{el.label || el.field}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteElement(el.id);
                    }}
                    className="p-1 hover:text-rose-600 text-slate-400 transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Selected Element Property Inspector */}
            {currentElement ? (
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    Editing: {currentElement.label}
                  </h4>
                  <span className="text-[10px] text-purple-600 font-mono font-bold uppercase">
                    {currentElement.type}
                  </span>
                </div>

                {/* X and Y coordinates */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">X Position (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={currentElement.x}
                      onChange={(e) => handleUpdateElement({ x: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Y Position (%)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={currentElement.y}
                      onChange={(e) => handleUpdateElement({ y: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {currentElement.type === "text" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Font Size (pt)</label>
                        <input
                          type="number"
                          value={currentElement.fontSize}
                          onChange={(e) => handleUpdateElement({ fontSize: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Color</label>
                        <input
                          type="color"
                          value={currentElement.color}
                          onChange={(e) => handleUpdateElement({ color: e.target.value })}
                          className="w-full h-8 border rounded-lg cursor-pointer bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Font Style</label>
                      <select
                        value={currentElement.fontFamily}
                        onChange={(e) => handleUpdateElement({ fontFamily: e.target.value })}
                        className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg font-medium text-slate-900"
                      >
                        <option value="cursive">Great Vibes (Cursive Script Calligraphy)</option>
                        <option value="sans">Montserrat / Modern Clean Sans</option>
                        <option value="serif">Times New Roman / Formal Serif</option>
                        <option value="monospace">Courier New / Security Monospace</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Alignment</label>
                      <div className="grid grid-cols-3 gap-1">
                        {(["left", "center", "right"] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => handleUpdateElement({ textAlign: align })}
                            className={`py-1 rounded-md text-[10px] font-bold capitalize border ${
                              currentElement.textAlign === align
                                ? "bg-slate-900 text-white"
                                : "bg-slate-50 text-slate-700"
                            }`}
                          >
                            {align}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2 border-t border-slate-100">
                <Move className="w-5 h-5 mx-auto opacity-50" />
                <p className="text-[11px] leading-relaxed">
                  Click any layer above or on the canvas to fine-tune its position and typography.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {feedbackAlert && (
        <AlertModal
          isOpen={Boolean(feedbackAlert)}
          title={feedbackAlert.title}
          message={feedbackAlert.message}
          type={feedbackAlert.type}
          buttonText="Understood"
          onClose={() => setFeedbackAlert(null)}
        />
      )}
    </div>
  );
}
