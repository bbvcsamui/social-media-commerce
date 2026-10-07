"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { COURSE } from "@/lib/config";
import { COURSE_UNITS } from "@/lib/course-data";
import {
  ShieldCheck,
  Users,
  Upload,
  Download,
  BookOpen,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Filter,
} from "lucide-react";

interface StudentScore {
  studentId: string;
  name: string;
  worksheets: number; // max 20
  simulations: number; // max 5
  project: number; // max 15
  posttests: number; // max 10
  midterm: number; // max 10
  final: number; // max 20
  affective: number; // max 20
}

const INITIAL_STUDENTS: StudentScore[] = [
  {
    studentId: "673191001",
    name: "นายธนากร มีสุข",
    worksheets: 18.5,
    simulations: 5.0,
    project: 14.0,
    posttests: 9.0,
    midterm: 8.5,
    final: 17.0,
    affective: 19.0,
  },
  {
    studentId: "673191002",
    name: "นางสาวศิริพร บุญยืน",
    worksheets: 19.0,
    simulations: 4.5,
    project: 14.5,
    posttests: 8.5,
    midterm: 9.0,
    final: 18.0,
    affective: 20.0,
  },
  {
    studentId: "673191003",
    name: "นายกิตติศักดิ์ พัฒนา",
    worksheets: 15.0,
    simulations: 4.0,
    project: 12.0,
    posttests: 7.0,
    midterm: 7.0,
    final: 14.0,
    affective: 16.0,
  },
  {
    studentId: "673191004",
    name: "นางสาวณัฐวดี รุ่งเรือง",
    worksheets: 17.0,
    simulations: 5.0,
    project: 13.5,
    posttests: 8.0,
    midterm: 8.0,
    final: 16.5,
    affective: 18.5,
  },
];

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<StudentScore[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [csvUploaded, setCsvUploaded] = useState(false);

  function calculateTotal(s: StudentScore) {
    return (
      s.worksheets +
      s.simulations +
      s.project +
      s.posttests +
      s.midterm +
      s.final +
      s.affective
    );
  }

  function getGrade(total: number): string {
    if (total >= 80) return "4.0";
    if (total >= 75) return "3.5";
    if (total >= 70) return "3.0";
    if (total >= 65) return "2.5";
    if (total >= 60) return "2.0";
    if (total >= 55) return "1.5";
    if (total >= 50) return "1.0";
    return "0.0";
  }

  function handleExportCsv() {
    let csv = "รหัสนักศึกษา,ชื่อ-นามสกุล,ใบงาน(20),จำลอง(5),โครงงาน(15),หลังเรียน(10),กลางภาค(10),ปลายภาค(20),จิตพิสัย(20),รวม(100),เกรด\n";
    students.forEach((s) => {
      const tot = calculateTotal(s);
      const gr = getGrade(tot);
      csv += `${s.studentId},"${s.name}",${s.worksheets},${s.simulations},${s.project},${s.posttests},${s.midterm},${s.final},${s.affective},${tot.toFixed(1)},${gr}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gradebook-${COURSE.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredStudents = students.filter(
    (s) => s.studentId.includes(searchQuery) || s.name.includes(searchQuery)
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar user={{ role: "teacher", name: "อาจารย์ผู้ดูแลรายวิชา" }} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Title */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
              <h1 className="font-['Prompt'] text-2xl font-bold text-slate-900 dark:text-white">
                แดชบอร์ดอาจารย์ผู้สอน (Teacher Management)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              วิชา {COURSE.code} {COURSE.nameTh} · {COURSE.college}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Prompt'] text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออกสมุดคะแนน (CSV)</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">นักศึกษาในระบบ</div>
            <div className="text-2xl font-bold font-['Prompt'] text-slate-900 dark:text-white mt-1">
              {students.length} คน
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">หน่วยการเรียนรู้</div>
            <div className="text-2xl font-bold font-['Prompt'] text-orange-600 mt-1">
              9 หน่วย (27 ตอน)
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">คลังข้อสอบทั้งหมด</div>
            <div className="text-2xl font-bold font-['Prompt'] text-purple-600 mt-1">
              135 ข้อ
            </div>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">คะแนนเฉลี่ยรวม</div>
            <div className="text-2xl font-bold font-['Prompt text-emerald-600 mt-1">
              {(
                students.reduce((acc, s) => acc + calculateTotal(s), 0) /
                students.length
              ).toFixed(1)}{" "}
              / 100
            </div>
          </div>
        </div>

        {/* CSV Import Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-transparent border border-orange-200 dark:border-orange-800/60 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="w-8 h-8 text-orange-500 shrink-0" />
            <div>
              <h3 className="font-['Prompt'] font-bold text-sm text-slate-900 dark:text-white">
                นำเข้ารายชื่อนักศึกษาผ่านไฟล์ CSV
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                จัดเตรียมคอลัมน์: <code>student_code, full_name</code> เพื่อเปิดบัญชีให้นักศึกษาทั้งห้องเรียนอัตโนมัติ
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer shrink-0">
            <Upload className="w-4 h-4 text-orange-500" />
            <span>เลือกไฟล์ CSV นักศึกษา</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={() => alert("ระบบรองรับการอ่านและบันทึกข้อมูลนักศึกษาผ่าน Supabase Service Role")}
            />
          </label>
        </div>

        {/* Gradebook Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white">
              สมุดคะแนนและตัดเกรด (สัดส่วน 80 : 20 รวม 100 คะแนน)
            </h2>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="ค้นหารหัสหรือชื่อ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3">รหัสนักศึกษา</th>
                  <th className="p-3">ชื่อ-สกุล</th>
                  <th className="p-3 text-center">ใบงาน (20)</th>
                  <th className="p-3 text-center">จำลอง (5)</th>
                  <th className="p-3 text-center">โครงงาน (15)</th>
                  <th className="p-3 text-center">หลังเรียน (10)</th>
                  <th className="p-3 text-center">กลางภาค (10)</th>
                  <th className="p-3 text-center">ปลายภาค (20)</th>
                  <th className="p-3 text-center">จิตพิสัย (20)</th>
                  <th className="p-3 text-center font-bold text-orange-600">รวม (100)</th>
                  <th className="p-3 text-center font-bold text-purple-600">เกรด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((s) => {
                  const total = calculateTotal(s);
                  const grade = getGrade(total);

                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-medium">{s.studentId}</td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                      <td className="p-3 text-center">{s.worksheets.toFixed(1)}</td>
                      <td className="p-3 text-center">{s.simulations.toFixed(1)}</td>
                      <td className="p-3 text-center">{s.project.toFixed(1)}</td>
                      <td className="p-3 text-center">{s.posttests.toFixed(1)}</td>
                      <td className="p-3 text-center">{s.midterm.toFixed(1)}</td>
                      <td className="p-3 text-center">{s.final.toFixed(1)}</td>
                      <td className="p-3 text-center">{s.affective.toFixed(1)}</td>
                      <td className="p-3 text-center font-bold text-orange-600 font-mono">
                        {total.toFixed(1)}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold font-mono">
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
