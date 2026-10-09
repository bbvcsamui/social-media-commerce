"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Award,
} from "lucide-react";
import type { Assignment } from "@/lib/course-data";

interface Props {
  unitNumber: number;
  assignment: Assignment & { id: number };
  studentId: string;
  initialSubmission?: { file_name: string | null; link_url: string | null; note: string | null; score: number | null; feedback: string | null } | null;
}

export function AssignmentClient({ unitNumber, assignment, studentId, initialSubmission }: Props) {
  const [submissionType, setSubmissionType] = useState<"file" | "link">("file");
  const [fileName, setFileName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [studentNote, setStudentNote] = useState("");
  const [submitted, setSubmitted] = useState(Boolean(initialSubmission));
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert("ขนาดไฟล์เกิน 10 MB กรุณาเลือกไฟล์ใหม่");
        return;
      }
      setFileName(file.name);
      setFile(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      let path: string | null = null;
      if (submissionType === "file") {
        if (!file) throw Error("กรุณาเลือกไฟล์งาน (PDF หรือภาพ ขนาดไม่เกิน 10 MB)");
        if (!["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) throw Error("รองรับไฟล์ PDF และภาพ PNG/JPEG/WebP/GIF");
        path = studentId + "/" + crypto.randomUUID() + "." + (file.name.split(".").pop() || "bin");
        const { error: uploadError } = await createClient().storage.from("submissions").upload(path, file, { contentType: file.type });
        if (uploadError) throw Error("อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่");
      }
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignment_id: assignment.id, note: studentNote, file_path: path, file_name: file?.name, link_url: submissionType === "link" ? linkUrl : null }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) { setError(e instanceof Error ? e.message : "ส่งงานไม่สำเร็จ"); }
    finally { setBusy(false); }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
      {initialSubmission && <p className="mb-4">งานล่าสุด: {initialSubmission.file_name || initialSubmission.link_url} · คะแนน: {initialSubmission.score ?? "รอตรวจ"} {initialSubmission.feedback}</p>}
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
        <Link href={`/learn/unit/${unitNumber}`} className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          <span>กลับหน่วยที่ {unitNumber}</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-semibold">
          {assignment.title}
        </span>
      </div>

      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-['Prompt'] font-bold text-xs">
              {unitNumber === 9 ? "โครงงานประยุกต์ใช้จริง 15%" : `ใบงานปฏิบัติการ หน่วยที่ ${unitNumber}`}
            </span>
            <h1 className="font-['Prompt'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {assignment.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              คะแนนเต็ม: <strong className="text-orange-600">{assignment.max_score} คะแนน</strong> · สัดส่วนคะแนนเก็บภาคปฏิบัติ
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>ส่งได้ตลอดภาคเรียน (มีป้ายตรวจนับเวลาส่ง)</span>
          </div>
        </div>
      </div>

      {/* Submission Success Banner */}
      {submitted && (
        <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 mb-8 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-['Prompt'] font-bold text-emerald-900 dark:text-emerald-200 text-lg">
              บันทึกการส่งชิ้นงานเรียบร้อยแล้ว!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 mt-1">
              {submissionType === "file" ? `ไฟล์: ${fileName}` : `ลิงก์: ${linkUrl}`}
              {studentNote && ` · บันทึกเพิ่มเติม: "${studentNote}"`}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              อาจารย์ผู้สอนจะดำเนินการตรวจให้คะแนนตามเกณฑ์ Rubric ต่อไป
            </p>
          </div>
        </div>
      )}

      {/* Instructions & Rubric */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Instructions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              <span>คำชี้แจงการปฏิบัติงาน</span>
            </h2>

            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed prose-headings:font-['Prompt']">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {assignment.instructions_md}
              </ReactMarkdown>
            </div>
          </div>

          {/* Rubric Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              <span>เกณฑ์การประเมิน (Rubric) เต็ม {assignment.max_score} คะแนน</span>
            </h2>

            <div className="space-y-3">
              {assignment.rubric.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-4"
                >
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      {idx + 1}. {r.criterion}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.description}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 font-bold text-xs shrink-0">
                    เต็ม {r.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Form Sidebar */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="sticky top-20 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
          >
            <h2 className="font-['Prompt'] font-bold text-base sm:text-lg text-slate-900 dark:text-white">
              ส่งชิ้นงาน (Submission)
            </h2>

            {/* Toggle File or Link */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSubmissionType("file")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  submissionType === "file"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500"
                }`}
              >
                อัปโหลดไฟล์ (PDF/รูปภาพ)
              </button>
              <button
                type="button"
                onClick={() => setSubmissionType("link")}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  submissionType === "link"
                    ? "bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white"
                    : "text-slate-500"
                }`}
              >
                แนบลิงก์ (URL)
              </button>
            </div>

            {submissionType === "file" ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  เลือกไฟล์จากอุปกรณ์ (ขนาดไม่เกิน 10 MB)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-orange-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {fileName ? (
                      <strong className="text-orange-600">{fileName}</strong>
                    ) : (
                      "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่"
                    )}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">รองรับ PDF, PNG, JPG</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  ลิงก์ชิ้นงาน (เช่น ลิงก์ร้านค้า, Canva, หรือ Google Drive)
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                ข้อความบันทึกถึงอาจารย์ (ถ้ามี)
              </label>
              <textarea
                rows={3}
                placeholder="ระบุข้อความหรือคำอธิบายเพิ่มเติม..."
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-['Prompt'] font-semibold text-xs sm:text-sm shadow-md hover:opacity-95 transition-opacity"
            >
              {busy ? "กำลังส่ง..." : submitted ? "ส่งชิ้นงานซ้ำ (รอตรวจใหม่)" : "ยืนยันการส่งชิ้นงาน"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
