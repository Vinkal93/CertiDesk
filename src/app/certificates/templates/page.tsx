"use client";

import React, { useState, useRef } from "react";
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
  ArrowLeft 
} from "lucide-react";
import { CertificateTemplate, TemplateElement } from "@/types";
import { dataStore } from "@/lib/db";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";

export default function CertificateTemplateBuilder() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
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

  const handleAddElement = (field: string, label: string, type: "text" | "qr" = "text") => {
    if (!selectedTemplate) return;
    const newEl: TemplateElement = {
      id: `el_${Date.now()}`,
      type,
      field,
      label,
      x: 50,
      y: 50,
      fontSize: 16,
      fontFamily: "sans",
      fontWeight: "bold",
      color: "#10152B",
      textAlign: "center",
      width: type === "qr" ? 75 : undefined,
      height: type === "qr" ? 75 : undefined,
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
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTemplate) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedTemplate({
        ...selectedTemplate,
        backgroundImage: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const placeholders = [
    { field: "student_name", label: "Student Full Name" },
    { field: "father_name", label: "Father Name" },
    { field: "mother_name", label: "Mother Name" },
    { field: "enrollment_number", label: "Enrollment Number" },
    { field: "course_name", label: "Course Name" },
    { field: "institute_name", label: "Institute Name" },
    { field: "certificate_number", label: "Certificate Number" },
    { field: "issue_date", label: "Issue Date" },
    { field: "grade", label: "Grade" },
    { field: "percentage", label: "Percentage" },
    { field: "typing_speed", label: "Typing Speed" },
    { field: "signature", label: "Authorized Signatory" },
    { field: "qr_code", label: "QR Code", isQR: true },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Certificate Visual Template Builder
          </h2>
          <p className="text-xs text-slate-500">
            Upload custom background designs, position dynamic text placeholders, and configure fonts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            onClick={handleSaveTemplate}
            className="px-5 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        </div>
      </div>

      {/* Editor Grid: Left Placeholders, Center Canvas, Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Toolbar: Add Placeholders & Settings (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Template Select & Orientation */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Template Profile</h3>
            <div>
              <label className="text-slate-500 font-semibold block mb-1">Select Template</label>
              <select
                value={selectedTemplate?.id || ""}
                onChange={(e) => {
                  const t = templates.find((item) => item.id === e.target.value);
                  if (t) setSelectedTemplate(t);
                }}
                className="w-full p-2 bg-slate-50 border rounded-xl font-semibold"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Orientation</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    selectedTemplate &&
                    setSelectedTemplate({ ...selectedTemplate, orientation: "landscape" })
                  }
                  className={`py-1.5 rounded-lg font-bold border ${
                    selectedTemplate?.orientation === "landscape"
                      ? "bg-brand-50 border-brand-600 text-brand-600"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  Landscape (A4)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    selectedTemplate &&
                    setSelectedTemplate({ ...selectedTemplate, orientation: "portrait" })
                  }
                  className={`py-1.5 rounded-lg font-bold border ${
                    selectedTemplate?.orientation === "portrait"
                      ? "bg-brand-50 border-brand-600 text-brand-600"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  Portrait (A4)
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-500 font-semibold block mb-1">Upload Background Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBgUpload}
                className="text-[11px] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:font-semibold file:bg-brand-50 file:text-brand-700"
              />
            </div>
          </div>

          {/* Placeholders List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Available Dynamic Tags
            </h3>
            <p className="text-[10px] text-slate-400">Click to add layer on certificate:</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {placeholders.map((p) => (
                <button
                  key={p.field}
                  type="button"
                  onClick={() => handleAddElement(p.field, p.label, p.isQR ? "qr" : "text")}
                  className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-100 flex items-center justify-between text-xs font-semibold transition-colors"
                >
                  <span>{`{{${p.field}}}`}</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Live Interactive Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-card flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Canvas Zoom: {Math.round(zoomScale * 100)}%</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.1))}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <ZoomOut className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => setZoomScale((z) => Math.min(1.2, z + 0.1))}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <ZoomIn className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200 flex items-center justify-center overflow-auto max-h-[750px]">
            {selectedTemplate && (
              <CertificateCanvas
                template={selectedTemplate}
                scale={zoomScale}
                data={{
                  student_name: "Khushbu Sharma",
                  father_name: "Rameshwar Prasad",
                  mother_name: "Sunita Devi",
                  enrollment_number: "SBCI/ADCA/0268",
                  course_name: "Advanced Diploma in Computer Application",
                  institute_name: "SBCI Computer Institute",
                  issue_date: "2026-10-04",
                  certificate_number: "CDP-2026-0268",
                  grade: "A+",
                  percentage: 88.5,
                  typing_speed: 48,
                  typing_accuracy: 98,
                }}
              />
            )}
          </div>
        </div>

        {/* Right: Layer Inspector (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b pb-2">
              Active Layers ({selectedTemplate?.elements.length || 0})
            </h3>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {selectedTemplate?.elements.map((el) => (
                <div
                  key={el.id}
                  onClick={() => setSelectedElementId(el.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedElementId === el.id
                      ? "bg-brand-50 border-brand-500 font-bold text-brand-700"
                      : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{el.label || el.field}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteElement(el.id);
                    }}
                    className="p-1 hover:text-rose-600 text-slate-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Selected Element Property Inspector */}
            {currentElement ? (
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-bold text-slate-800 text-xs">Inspect: {currentElement.label}</h4>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">X Position (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentElement.x}
                      onChange={(e) => handleUpdateElement({ x: Number(e.target.value) })}
                      className="w-full px-2 py-1 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-1">Y Position (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentElement.y}
                      onChange={(e) => handleUpdateElement({ y: Number(e.target.value) })}
                      className="w-full px-2 py-1 border rounded-lg"
                    />
                  </div>
                </div>

                {currentElement.type !== "qr" && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Font Size (pt)</label>
                        <input
                          type="number"
                          value={currentElement.fontSize}
                          onChange={(e) => handleUpdateElement({ fontSize: Number(e.target.value) })}
                          className="w-full px-2 py-1 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-1">Color</label>
                        <input
                          type="color"
                          value={currentElement.color}
                          onChange={(e) => handleUpdateElement({ color: e.target.value })}
                          className="w-full h-8 border rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 font-bold block mb-1">Font Family</label>
                      <select
                        value={currentElement.fontFamily}
                        onChange={(e) => handleUpdateElement({ fontFamily: e.target.value })}
                        className="w-full px-2 py-1 border rounded-lg"
                      >
                        <option value="sans">Modern Sans (Inter / Arial)</option>
                        <option value="serif">Formal Serif (Times New Roman)</option>
                        <option value="monospace">Security Monospace</option>
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
                                ? "bg-brand-600 text-white"
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
              <p className="text-[11px] text-slate-400 text-center py-4">
                Click any layer above to adjust position, color, and font attributes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
