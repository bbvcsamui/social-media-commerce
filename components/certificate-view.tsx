"use client";


import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { COURSE } from "@/lib/config";
import { Award, Printer, CheckCircle2, ShieldCheck, ArrowLeft } from "lucide-react";

export function CertificateView({ studentName, studentId, issueDate }: { studentName: string; studentId: string; issueDate: string }) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Print Control Bar (Hidden on print) */}
        <div className="print:hidden p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <h1 className="font-['Prompt'] text-xl font-bold text-slate-900 dark:text-white">
                เกียรติบัตรสำเร็จการศึกษาประจำรายวิชา
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              ออกให้นักศึกษาที่ผ่านเกณฑ์แบบทดสอบหลังเรียนครบ 9 หน่วย และส่งใบงานครบถ้วน
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-['Prompt'] text-sm font-semibold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เกียรติบัตร (PDF)</span>
            </button>
          </div>
        </div>

        {/* Certificate Canvas (A4 landscape style) */}
        <div className="p-8 sm:p-14 rounded-3xl bg-white text-slate-900 border-8 border-double border-amber-300 shadow-2xl relative overflow-hidden print:border-4 print:shadow-none print:m-0 print:p-8">
          {/* Subtle Background Seal */}
          <div className="absolute right-10 bottom-10 opacity-5 pointer-events-none">
            <Award className="w-96 h-96 text-amber-900" />
          </div>

          <div className="text-center relative z-10 max-w-2xl mx-auto space-y-4">
            {/* Header Emblems */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-purple-600 text-white shadow-md mx-auto mb-2">
              <Award className="w-9 h-9" />
            </div>

            <h2 className="font-['Prompt'] text-xl sm:text-2xl font-bold tracking-wide text-slate-800">
              {COURSE.college}
            </h2>
            <div className="text-xs sm:text-sm text-slate-500 uppercase tracking-widest font-medium">
              Bhavanabodhikhun Vocational College
            </div>

            <div className="py-2">
              <span className="inline-block px-4 py-1 text-xs font-semibold tracking-wider text-amber-800 bg-amber-100/80 rounded-full font-['Prompt']">
                เกียรติบัตรฉบับนี้ให้ไว้เพื่อแสดงว่า
              </span>
            </div>

            {/* Student Name */}
            <div className="font-['Prompt'] text-2xl sm:text-4xl font-extrabold text-orange-600 py-1 border-b-2 border-dotted border-amber-300 max-w-md mx-auto">
              {studentName}
            </div>
            <div className="text-xs sm:text-sm text-slate-500 font-mono">
              รหัสประจำตัวนักศึกษา: {studentId}
            </div>

            {/* Statement */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-2">
              ได้ผ่านแบบทดสอบหลังเรียนครบ 9 หน่วยและส่งใบงานครบถ้วนในรายวิชา
            </p>

            <div className="font-['Prompt'] text-base sm:text-xl font-bold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {COURSE.code} {COURSE.nameTh} ({COURSE.nameEn})
              <div className="text-xs text-slate-500 font-normal mt-0.5">
                จำนวน 3 หน่วยกิต · ทฤษฎี 2 ชม. ปฏิบัติ 2 ชม.
              </div>
            </div>

            <p className="text-xs text-slate-600 italic">
              "ด้วยความละเอียด รอบคอบ และมีเจตคติที่ดีในการปฏิบัติงานพาณิชย์บนสื่อสังคมออนไลน์"
            </p>

            {/* Signatures */}
            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 w-40 mx-auto mb-2" />
                <div className="font-bold text-slate-800">( อาจารย์ผู้สอนประจำรายวิชา )</div>
                <div className="text-[11px] text-slate-500">หัวหน้าสาขาวิชาเทคโนโลยีธุรกิจดิจิทัล</div>
              </div>
              <div>
                <div className="border-b border-slate-400 w-40 mx-auto mb-2" />
                <div className="font-bold text-slate-800">( ผู้อำนวยการวิทยาลัย )</div>
                <div className="text-[11px] text-slate-500">{COURSE.college}</div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-4">
              ออกให้ ณ วันที่ {issueDate} · รหัสตรวจสอบ: BVC-SMC-{studentId}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
