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
  RotateCw,
  Image as ImageIcon,
  Check,
  FileCheck,
  Award,
  Copy,
  Undo2,
  Redo2,
  Grid,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  EyeOff,
  Sliders,
  Palette,
  Brackets,
  History,
  Download,
  X,
  AlertCircle,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ShieldCheck,
  ChevronRight,
  Settings
} from "lucide-react";
import { CertificateTemplate, TemplateElement, CertificateTemplateVersion, Student } from "@/types";
import { dataStore } from "@/lib/db";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";
import { AlertModal } from "@/components/ui/FeedbackModal";

interface VariableItem {
  token: string;
  label: string;
  field: string;
  sample: string;
  type?: "text" | "qr" | "seal" | "shape" | "line" | "image";
  isCursive?: boolean;
  isBold?: boolean;
  isMono?: boolean;
  isBadge?: boolean;
}

// Predefined Dynamic Variables Library categorized
const VARIABLE_CATEGORIES: { category: string; variables: VariableItem[] }[] = [
  {
    category: "Student Information",
    variables: [
      { token: "{{name}}", label: "Student Full Name", field: "student_name", sample: "Khushbu", isCursive: true },
      { token: "{{father_name}}", label: "Father's Name", field: "father_name", sample: "Mr. Ram Pratap" },
      { token: "{{mother_name}}", label: "Mother's Name", field: "mother_name", sample: "Mrs. Sita Devi" },
      { token: "{{enrollment_number}}", label: "Enrollment / Roll No", field: "enrollment_number", sample: "SBCI/ADCA/0268" },
      { token: "{{date_of_birth}}", label: "Date of Birth", field: "date_of_birth", sample: "15 Jan 2005" },
    ],
  },
  {
    category: "Course & Academic Details",
    variables: [
      { token: "{{course}}", label: "Course Full Title", field: "course_name", sample: "Advanced Diploma in Computer Application (ADCA)", isBold: true },
      { token: "{{course_duration}}", label: "Course Duration", field: "course_duration", sample: "12 Months" },
      { token: "{{session}}", label: "Session / Period", field: "completion_period", sample: "01 July 2026 – 30 December 2026" },
      { token: "{{grade}}", label: "Academic Grade", field: "grade", sample: "A+", isBadge: true },
      { token: "{{percentage}}", label: "Percentage Score", field: "percentage", sample: "89.5%" },
    ],
  },
  {
    category: "Institute & Verification",
    variables: [
      { token: "{{certificate_number}}", label: "Certificate Number", field: "certificate_number", sample: "SBCI/ADCA/2026/0145", isMono: true },
      { token: "{{institute_name}}", label: "Institute Name", field: "institute_name", sample: "SBCI Computer Institute" },
      { token: "{{director_name}}", label: "Director / Signatory", field: "director_name", sample: "Vinkal Prajapati" },
      { token: "{{issue_date}}", label: "Date of Issue", field: "issue_date", sample: "2026-11-16" },
      { token: "{{completion_date}}", label: "Date of Completion", field: "completion_date", sample: "2026-10-30" },
      { token: "{{qr_code}}", label: "Dynamic Verification QR", field: "qr_code", type: "qr", sample: "QR" },
    ],
  },
];

export default function CertificateTemplateBuilder() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.85);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"presets" | "variables" | "text" | "elements" | "uploads" | "layers" | "versions">("variables");
  
  // History Stacks for Undo / Redo
  const [undoStack, setUndoStack] = useState<CertificateTemplate[]>([]);
  const [redoStack, setRedoStack] = useState<CertificateTemplate[]>([]);

  // Toggles & Modal States
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(null);
  
  // Database records for real live preview
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedPreviewStudentId, setSelectedPreviewStudentId] = useState<string>("");
  const [versions, setVersions] = useState<CertificateTemplateVersion[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      const list = await dataStore.getTemplates();
      setTemplates(list);
      if (list.length > 0) {
        setSelectedTemplate(list[0]);
        loadVersions(list[0].id);
      }
      const stList = await dataStore.getAllStudents();
      setStudents(stList);
      if (stList.length > 0) setSelectedPreviewStudentId(stList[0].id);
    }
    loadData();
  }, []);

  const loadVersions = async (templateId: string) => {
    const vList = await dataStore.getTemplateVersions(templateId);
    setVersions(vList);
  };

  // Push state to undo stack before mutation
  const pushStateToUndo = (current: CertificateTemplate) => {
    setUndoStack((prev) => [...prev.slice(-15), JSON.parse(JSON.stringify(current))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !selectedTemplate) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(selectedTemplate))]);
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setSelectedTemplate(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !selectedTemplate) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, JSON.parse(JSON.stringify(selectedTemplate))]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setSelectedTemplate(next);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if (((e.ctrlKey || e.metaKey) && e.key === "y") || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z")) {
        e.preventDefault();
        handleRedo();
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault();
        handleDeleteElement(selectedElementId);
      }
      if (e.key === "Escape") {
        setSelectedElementId(null);
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) && selectedElementId && selectedTemplate) {
        e.preventDefault();
        const step = e.shiftKey ? 2 : 0.5;
        const current = selectedTemplate.elements.find((el) => el.id === selectedElementId);
        if (current) {
          let newX = current.x;
          let newY = current.y;
          if (e.key === "ArrowUp") newY = Math.max(0, current.y - step);
          if (e.key === "ArrowDown") newY = Math.min(100, current.y + step);
          if (e.key === "ArrowLeft") newX = Math.max(0, current.x - step);
          if (e.key === "ArrowRight") newX = Math.min(100, current.x + step);
          handleUpdateElement({ x: Number(newX.toFixed(1)), y: Number(newY.toFixed(1)) });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId, selectedTemplate, undoStack, redoStack]);

  const currentElement = selectedTemplate?.elements.find((el) => el.id === selectedElementId);

  const handleUpdateElement = (updates: Partial<TemplateElement>) => {
    if (!selectedTemplate || !selectedElementId) return;
    pushStateToUndo(selectedTemplate);
    const updatedElements = selectedTemplate.elements.map((el) =>
      el.id === selectedElementId ? { ...el, ...updates } : el
    );
    setSelectedTemplate({
      ...selectedTemplate,
      elements: updatedElements,
    });
  };

  const handleAddElement = (
    field: string,
    label: string,
    type: "text" | "qr" | "seal" | "shape" | "line" | "image" = "text",
    defaults: Partial<TemplateElement> = {}
  ) => {
    if (!selectedTemplate) return;
    pushStateToUndo(selectedTemplate);

    const isVar = field.startsWith("{{") || field === "student_name" || field === "course_name";
    const newEl: TemplateElement = {
      id: `el_${Date.now()}`,
      type,
      field,
      label,
      isVariable: isVar,
      variableToken: isVar ? (field.startsWith("{{") ? field : `{{${field}}}`) : undefined,
      x: 50,
      y: 50,
      fontSize: field === "student_name" || field === "{{name}}" ? 44 : 16,
      fontFamily: field === "student_name" || field === "{{name}}" ? "cursive" : "sans",
      fontWeight: field === "course_name" || field === "{{course}}" ? "bold" : "normal",
      color: "#10152B",
      textAlign: "center",
      width: type === "qr" ? 65 : type === "seal" ? 90 : type === "line" ? 220 : type === "shape" ? 140 : undefined,
      height: type === "qr" ? 65 : type === "seal" ? 90 : type === "line" ? 2 : type === "shape" ? 44 : undefined,
      opacity: 1,
      rotation: 0,
      ...defaults,
    };

    setSelectedTemplate({
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, newEl],
    });
    setSelectedElementId(newEl.id);
  };

  const handleDeleteElement = (id: string) => {
    if (!selectedTemplate) return;
    pushStateToUndo(selectedTemplate);
    setSelectedTemplate({
      ...selectedTemplate,
      elements: selectedTemplate.elements.filter((el) => el.id !== id),
    });
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDuplicateElement = (id: string) => {
    if (!selectedTemplate) return;
    const target = selectedTemplate.elements.find((el) => el.id === id);
    if (!target) return;
    pushStateToUndo(selectedTemplate);
    const cloned: TemplateElement = {
      ...target,
      id: `el_${Date.now()}`,
      label: `${target.label} (Copy)`,
      x: Math.min(95, target.x + 3),
      y: Math.min(95, target.y + 3),
    };
    setSelectedTemplate({
      ...selectedTemplate,
      elements: [...selectedTemplate.elements, cloned],
    });
    setSelectedElementId(cloned.id);
  };

  const handleSaveTemplate = async (isPublish = false) => {
    if (!selectedTemplate) return;
    const updated = {
      ...selectedTemplate,
      status: isPublish ? "published" as const : "draft" as const,
    };

    const saved = await dataStore.saveTemplate(updated);
    setSelectedTemplate(saved);
    setSavedSuccess(true);
    await loadVersions(saved.id);

    setFeedbackAlert({
      title: isPublish ? "Template Published" : "Template Draft Saved",
      message: `"${saved.title}" (Version ${saved.version || 1}) has been saved to the permanent ledger. All dynamic variables are mapped.`,
      type: "success",
    });
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate) return;
    const cloned = await dataStore.duplicateTemplate(selectedTemplate.id, `${selectedTemplate.title} (Clone)`);
    const list = await dataStore.getTemplates();
    setTemplates(list);
    setSelectedTemplate(cloned);
    setFeedbackAlert({
      title: "Template Cloned",
      message: `Created duplicate template "${cloned.title}". You can now customize it independently.`,
      type: "info",
    });
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplate) return;
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        pushStateToUndo(selectedTemplate);
        setSelectedTemplate({
          ...selectedTemplate,
          backgroundImage: dataUrl,
        });
        setFeedbackAlert({
          title: "Custom Certificate Image Uploaded",
          message: "The background certificate template has been loaded onto the canvas.",
          type: "success",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Real Database Student selection for preview
  const currentPreviewStudent = students.find((s) => s.id === selectedPreviewStudentId) || students[0];
  const livePreviewData = {
    student_name: currentPreviewStudent?.fullName || "Khushbu",
    father_name: currentPreviewStudent?.fatherName || "Mr. Ram Pratap",
    mother_name: currentPreviewStudent?.motherName || "Mrs. Sita Devi",
    enrollment_number: currentPreviewStudent?.enrollmentNo || "SBCI/ADCA/0268",
    course_name: currentPreviewStudent?.courseName || "Advanced Diploma in Computer Application (ADCA)",
    course_duration: currentPreviewStudent?.courseDuration || "12 Months",
    institute_name: "SBCI Computer Institute",
    issue_date: new Date().toISOString().split("T")[0],
    completion_date: "2026-10-30",
    session: "01 July 2026 – 30 December 2026",
    certificate_number: "SBCI/ADCA/2026/0145",
    grade: "A+",
    percentage: 88.5,
    director_name: "Vinkal Prajapati",
  };

  return (
    <div className={`space-y-4 pb-16 ${isFullscreen ? "fixed inset-0 z-50 bg-[#F7F8FC] p-4 overflow-y-auto" : ""}`}>
      {/* 1. TOP HEADER & STUDIO CONTROLS TOOLBAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/certificates/history"
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
              title="Return to Certificates History"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedTemplate?.title || "Certificate Template"}
                  onChange={(e) => {
                    if (selectedTemplate) {
                      setSelectedTemplate({ ...selectedTemplate, title: e.target.value });
                    }
                  }}
                  className="font-extrabold text-slate-900 text-base border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-hidden px-1 py-0.5 rounded transition-all"
                />
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-[#6529E8] uppercase tracking-wide">
                  {selectedTemplate?.status || "Published"}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  v{selectedTemplate?.version || 1}.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Canva-grade Certificate Studio • A4 Landscape (1024 × 724 px) • Tamper-evident Ledger Linked
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Undo & Redo */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className="p-1.5 hover:bg-white text-slate-600 disabled:opacity-30 rounded-lg transition-all cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className="p-1.5 hover:bg-white text-slate-600 disabled:opacity-30 rounded-lg transition-all cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Grid & Margin Guides */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                showGrid ? "bg-purple-50 border-purple-300 text-brand-700" : "bg-white border-slate-200 text-slate-600"
              }`}
              title="Toggle Alignment Grid"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>

            {/* Live Student Preview Modal Button */}
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-brand-600" />
              <span>Test Preview</span>
            </button>

            {/* Duplicate Template */}
            <button
              onClick={handleDuplicateTemplate}
              className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              title="Clone this template"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clone</span>
            </button>

            {/* Save Draft */}
            <button
              onClick={() => handleSaveTemplate(false)}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-600" />
              <span>Save Draft</span>
            </button>

            {/* Publish Template */}
            <button
              onClick={() => handleSaveTemplate(true)}
              className="px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-black rounded-xl shadow-brand transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Template</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Studio"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Studio Sub-bar: Zoom & Presets */}
        <div className="flex flex-wrap items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Canvas Dimensions:</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-800">
              1024 × 724 px (A4 Landscape)
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-400">Orientation: Landscape</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Zoom:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomScale(Math.max(0.4, Number((zoomScale - 0.1).toFixed(2))))}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                -
              </button>
              <span className="w-12 text-center font-mono text-xs font-bold text-slate-800">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(Math.min(1.5, Number((zoomScale + 0.1).toFixed(2))))}
                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => setZoomScale(0.85)}
                className="ml-1 text-[11px] font-semibold text-brand-600 hover:underline cursor-pointer"
              >
                Fit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE: 3-COLUMN LAYOUT (Left Tools, Center Canvas, Right Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ELEMENTS & TOOLBAR PANEL (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-card p-4 space-y-4">
          {/* Tool Tabs Header */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab("variables")}
              className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === "variables" ? "bg-white text-[#6529E8] shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Brackets className="w-3.5 h-3.5" />
              <span className="text-[10px]">Variables</span>
            </button>

            <button
              onClick={() => setActiveTab("text")}
              className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === "text" ? "bg-white text-[#6529E8] shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span className="text-[10px]">Text</span>
            </button>

            <button
              onClick={() => setActiveTab("elements")}
              className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === "elements" ? "bg-white text-[#6529E8] shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px]">Elements</span>
            </button>

            <button
              onClick={() => setActiveTab("layers")}
              className={`py-2 rounded-lg transition-all flex flex-col items-center gap-1 cursor-pointer ${
                activeTab === "layers" ? "bg-white text-[#6529E8] shadow-xs" : "hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px]">Layers</span>
            </button>
          </div>

          {/* TAB 1: DYNAMIC VARIABLES LIBRARY */}
          {activeTab === "variables" && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900">
                <p className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Dynamic Variable Tags
                </p>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Click any variable to place it directly on the certificate. The engine replaces these tags with actual student data upon issuance.
                </p>
              </div>

              {VARIABLE_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {cat.category}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {cat.variables.map((v) => (
                      <button
                        key={v.token}
                        onClick={() =>
                          handleAddElement(v.token, v.label, v.type || "text", {
                            fontFamily: v.isCursive ? "cursive" : v.isMono ? "monospace" : "sans",
                            fontWeight: v.isBold ? "bold" : "normal",
                            fontSize: v.isCursive ? 44 : 16,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 hover:bg-purple-50/60 border border-slate-200/80 hover:border-purple-300 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#6529E8] bg-purple-100/70 px-1.5 py-0.5 rounded">
                              {v.token}
                            </span>
                            <span className="font-bold text-xs text-slate-800">{v.label}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">Sample: {v.sample}</p>
                        </div>
                        <Plus className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: TEXT & TYPOGRAPHY TOOLS */}
          {activeTab === "text" && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Standard Text Styles
              </span>

              <button
                onClick={() =>
                  handleAddElement("certificate_heading", "Certificate Title", "text", {
                    customText: "Certificate OF COMPLETION",
                    fontSize: 32,
                    fontWeight: "bold",
                    fontFamily: "serif",
                  })
                }
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all block cursor-pointer"
              >
                <span className="font-serif text-lg font-bold text-slate-900 block">Certificate Heading</span>
                <span className="text-[10px] text-slate-400">Formal serif title heading</span>
              </button>

              <button
                onClick={() =>
                  handleAddElement("student_name", "Calligraphy Cursive Name", "text", {
                    fontSize: 46,
                    fontFamily: "cursive",
                    color: "#10152B",
                  })
                }
                className="w-full p-3 bg-purple-50/50 hover:bg-purple-50 border border-purple-200 rounded-xl text-left transition-all block cursor-pointer"
              >
                <span className="font-normal text-2xl text-[#10152B] block" style={{ fontFamily: "Great Vibes, cursive" }}>
                  Calligraphy Cursive Name
                </span>
                <span className="text-[10px] text-purple-600">Great Vibes / Alex Brush calligraphy script</span>
              </button>

              <button
                onClick={() =>
                  handleAddElement("custom_body", "Body Certification Text", "text", {
                    customText: "has successfully completed the prescribed course of study and examinations.",
                    fontSize: 14,
                    fontFamily: "sans",
                  })
                }
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all block cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-800 block">Body Explanatory Text</span>
                <span className="text-[10px] text-slate-400">Standard descriptive sentence</span>
              </button>
            </div>
          )}

          {/* TAB 3: ELEMENTS & GRAPHICS */}
          {activeTab === "elements" && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Ornate Elements & Badges
              </span>

              {/* SBCI Certified Gold Medal */}
              <button
                onClick={() => handleAddElement("certified_seal", "SBCI Certified Medal Seal", "seal", { x: 12.3, y: 48.5 })}
                className="w-full p-3 bg-amber-50/60 hover:bg-amber-100/60 border border-amber-200 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer"
              >
                <Award className="w-6 h-6 text-amber-500" />
                <div>
                  <span className="text-xs font-bold text-amber-900 block">SBCI Gold Certified Medal</span>
                  <span className="text-[10px] text-amber-700">Official golden medal with 3 stars & hanging navy ribbons</span>
                </div>
              </button>

              {/* QR Code */}
              <button
                onClick={() => handleAddElement("qr_code", "Verification QR Code", "qr", { x: 11, y: 83.2 })}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer"
              >
                <ShieldCheck className="w-6 h-6 text-brand-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Tamper-Proof QR Code</span>
                  <span className="text-[10px] text-slate-500">Live scanning QR linking to /verify/[number]</span>
                </div>
              </button>

              {/* Director Signature Block */}
              <button
                onClick={() => handleAddElement("director_signature", "Director Signature Block", "text", { x: 81, y: 85 })}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer"
              >
                <FileCheck className="w-6 h-6 text-slate-700" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Director Signature Block</span>
                  <span className="text-[10px] text-slate-500">Cursive signature, underline, name, and designation</span>
                </div>
              </button>

              {/* Divider Line */}
              <button
                onClick={() => handleAddElement("divider_line", "Divider Line", "line", { x: 50, y: 50, width: 300, height: 2, color: "#D1D5DB" })}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer"
              >
                <div className="w-6 h-0.5 bg-slate-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Horizontal Divider Line</span>
                  <span className="text-[10px] text-slate-500">Subtle border separator line</span>
                </div>
              </button>

              {/* Grade Pill Box */}
              <button
                onClick={() => handleAddElement("grade_box", "Grade Pill Box", "text", { x: 37.8, y: 84.8 })}
                className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all flex items-center gap-3 cursor-pointer"
              >
                <span className="px-2 py-0.5 bg-[#0F172A] text-white text-[10px] font-bold rounded">A+</span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Grade Capsule Box</span>
                  <span className="text-[10px] text-slate-500">Dark navy pill badge for academic grade</span>
                </div>
              </button>
            </div>
          )}

          {/* TAB 4: LAYERS MANAGER */}
          {activeTab === "layers" && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Canvas Layers ({selectedTemplate?.elements.length || 0})
              </span>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {selectedTemplate?.elements.map((el, idx) => (
                  <div
                    key={el.id}
                    onClick={() => setSelectedElementId(el.id)}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                      selectedElementId === el.id
                        ? "bg-purple-50 border-purple-300 font-bold text-brand-900"
                        : "bg-slate-50 border-slate-200/80 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                      <span className="truncate">{el.label || el.field}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Hide / Show */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateElement({ hidden: !el.hidden });
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={el.hidden ? "Unhide" : "Hide"}
                      >
                        {el.hidden ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      {/* Duplicate */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateElement(el.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(el.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BACKGROUND IMAGE UPLOADER AT BOTTOM */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Certificate Background Template
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleBgUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Upload Custom Certificate Image</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Recommended: 1024 × 724 px or standard A4 Landscape image
            </p>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE INTERACTIVE DESIGN CANVAS (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/5 p-4 rounded-3xl border border-slate-200/90 shadow-card flex flex-col items-center justify-center overflow-x-auto min-h-[580px] relative">
            {/* Alignment Grid Overlay if enabled */}
            {showGrid && (
              <div
                className="absolute inset-0 pointer-events-none z-20 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #6529E8 1px, transparent 1px), linear-gradient(to bottom, #6529E8 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
            )}

            {/* The Real Canvas Rendered with Interactive Selection */}
            {selectedTemplate && (
              <CertificateCanvas
                template={selectedTemplate}
                data={livePreviewData}
                scale={zoomScale}
                interactive={true}
                selectedElementId={selectedElementId}
                onSelectElement={(id) => setSelectedElementId(id)}
              />
            )}
          </div>

          {/* INSPECTOR PANEL FOR SELECTED ELEMENT */}
          {currentElement ? (
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#6529E8]" />
                  <span className="font-bold text-xs text-slate-900">
                    Element Properties: <span className="text-brand-600">{currentElement.label || currentElement.field}</span>
                  </span>
                </div>
                <button
                  onClick={() => setSelectedElementId(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Position Controls: X%, Y%, Rotation, Opacity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Position X (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={currentElement.x}
                    onChange={(e) => handleUpdateElement({ x: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Position Y (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={currentElement.y}
                    onChange={(e) => handleUpdateElement({ y: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Rotation (°)</label>
                  <input
                    type="number"
                    min="-180"
                    max="180"
                    value={currentElement.rotation || 0}
                    onChange={(e) => handleUpdateElement({ rotation: parseInt(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Opacity</label>
                  <input
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={currentElement.opacity ?? 1}
                    onChange={(e) => handleUpdateElement({ opacity: parseFloat(e.target.value) || 1 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Typography Controls (if applicable) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Font Family</label>
                  <select
                    value={currentElement.fontFamily}
                    onChange={(e) => handleUpdateElement({ fontFamily: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="sans">Montserrat Sans</option>
                    <option value="cursive">Great Vibes (Cursive Calligraphy)</option>
                    <option value="serif">Times / Georgia Serif</option>
                    <option value="monospace">Courier Monospace</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    min="8"
                    max="96"
                    value={currentElement.fontSize}
                    onChange={(e) => handleUpdateElement({ fontSize: parseInt(e.target.value) || 16 })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Font Weight</label>
                  <select
                    value={currentElement.fontWeight}
                    onChange={(e) => handleUpdateElement({ fontWeight: e.target.value as any })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="normal">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="bold">Bold (700)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentElement.color || "#10152B"}
                      onChange={(e) => handleUpdateElement({ color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-700">{currentElement.color || "#10152B"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for element */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleDuplicateElement(currentElement.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate Element</span>
                </button>

                <button
                  onClick={() => handleDeleteElement(currentElement.id)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Element</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/90 text-center text-xs text-slate-400">
              Click any element or variable on the canvas above to inspect and edit its position, typography, and styling.
            </div>
          )}
        </div>
      </div>

      {/* 3. REAL DATABASE CANDIDATE PREVIEW MODAL */}
      {previewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Live Certificate Preview with Database Records
                </h3>
                <p className="text-xs text-slate-500">
                  Verify dynamic variables, font styling, and QR positioning before issuance.
                </p>
              </div>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Candidate Selector */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Select Enrolled Student:</span>
              <select
                value={selectedPreviewStudentId}
                onChange={(e) => setSelectedPreviewStudentId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.fullName} ({st.courseCode} - {st.enrollmentNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Render Certificate in Modal */}
            {selectedTemplate && (
              <div className="bg-slate-100 p-4 rounded-2xl flex justify-center overflow-x-auto">
                <CertificateCanvas
                  template={selectedTemplate}
                  data={livePreviewData}
                  scale={0.75}
                />
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert Modal */}
      {feedbackAlert && (
        <AlertModal
          isOpen={true}
          onClose={() => setFeedbackAlert(null)}
          title={feedbackAlert.title}
          message={feedbackAlert.message}
          type={feedbackAlert.type}
        />
      )}
    </div>
  );
}
