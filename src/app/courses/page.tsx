"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Clock, IndianRupee, Layers, CheckCircle2, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Course } from "@/types";

export default function CoursesPage() {
  const { institute } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Course Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Diploma");
  const [duration, setDuration] = useState("12 Months");
  const [fee, setFee] = useState<number>(12000);
  const [description, setDescription] = useState("");

  const loadCourses = async () => {
    if (!institute) return;
    const list = await dataStore.getCourses(institute.id);
    setCourses(list);
  };

  useEffect(() => {
    loadCourses();
  }, [institute]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;

    await dataStore.createCourse({
      instituteId: institute.id,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      duration,
      fee: Number(fee),
      description: description.trim() || "Institute certified vocational computer curriculum.",
      status: "Active",
      syllabus: ["Fundamentals", "Module 1", "Module 2", "Project"],
      subjects: [
        { name: "Theory Assessment", maxTheory: 70, maxPractical: 0, passMarks: 40 },
        { name: "Practical Lab Examination", maxTheory: 0, maxPractical: 30, passMarks: 15 },
      ],
    });

    setShowAddModal(false);
    setCode("");
    setName("");
    setDescription("");
    loadCourses();
  };

  const filtered = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Course Management</h2>
          <p className="text-xs text-slate-500">
            Assigned global curriculums and custom institute courses.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Course</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4 hover:shadow-soft transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-brand-50 text-brand-700 border border-brand-100">
                {course.code}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {course.status}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-snug">{course.name}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{course.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 font-bold justify-end">
                <span>Fee: ₹{course.fee?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-1 text-[11px]">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Exam Subjects ({course.subjects?.length || 0})
              </span>
              <ul className="text-slate-600 list-disc list-inside space-y-0.5 truncate">
                {course.subjects?.slice(0, 2).map((s, idx) => (
                  <li key={idx} className="truncate">{s.name}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Add Custom Course</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. WEB-DEV"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Certificate in Web Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fee (₹)</label>
                  <input
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 text-white rounded-xl font-bold shadow-brand"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
