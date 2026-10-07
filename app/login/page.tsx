"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COURSE } from "@/lib/config";
import {
  GraduationCap,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [studentCode, setStudentCode] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // In preview / standalone mode:
    // If teacher: redirect to /teacher
    // If student: redirect to /learn
    setTimeout(() => {
      if (role === "teacher") {
        router.push("/teacher");
      } else {
        router.push("/learn");
      }
    }, 500);
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-orange-50/50 via-slate-50 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <GraduationCap className="w-7 h-7" />
            </div>
          </Link>
          <h1 className="font-['Prompt'] text-2xl font-bold text-slate-900 dark:text-white">
            เข้าสู่ระบบ e-Learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            วิชา {COURSE.code} {COURSE.nameTh}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {COURSE.college}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Role Selector Tabs */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setStudentCode("");
              }}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                role === "student"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-orange-600 dark:text-orange-400 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              นักศึกษา (Student)
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("teacher");
                setStudentCode("teacher@bvc.ac.th");
              }}
              className={`flex-1 py-2.5 rounded-lg transition-all ${
                role === "teacher"
                  ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600 dark:text-purple-400 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              อาจารย์ผู้สอน (Teacher)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {role === "student" ? "รหัสประจำตัวนักศึกษา" : "อีเมลอาจารย์ผู้สอน"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={role === "student" ? "text" : "email"}
                  required
                  placeholder={role === "student" ? "เช่น 673191001" : "teacher@bvc.ac.th"}
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Note for first-time login */}
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/50 text-[11px] text-orange-800 dark:text-orange-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>
                {role === "student"
                  ? "เข้าใช้งานครั้งแรก: ใช้รหัสนักศึกษา และรหัสผ่านเริ่มต้นที่ได้รับจากอาจารย์ (ระบบจะให้เปลี่ยนรหัสผ่านทันที)"
                  : "บัญชีผู้ดูแลระบบสำหรับจัดการคลังข้อสอบ ตรวจชิ้นงาน และตัดเกรด"}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-['Prompt'] font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบการเรียน"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              ← กลับสู่หน้าหลักของรายวิชา
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
