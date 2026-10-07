import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { COURSE_UNITS } from "@/lib/course-data";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function LearnIndexPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 font-semibold mb-2">
            <BookOpen className="w-4 h-4" />
            <span>หลักสูตรรายวิชา 31910-2028</span>
          </div>
          <h1 className="font-['Prompt'] text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            หน่วยการเรียนรู้ทั้งหมด (9 หน่วย)
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            แต่ละหน่วยประกอบด้วย: จุดประสงค์เชิงพฤติกรรม → แบบทดสอบก่อนเรียน → เนื้อหาบทเรียน → กิจกรรมจำลอง (ถ้ามี) → ใบงานปฏิบัติ → แบบทดสอบหลังเรียน
          </p>
        </div>

        {/* Midterm & Final Banner */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300 dark:border-amber-800/60 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                EXAM 1 · สัดส่วน 10%
              </span>
              <h3 className="font-['Prompt'] text-lg font-bold text-slate-900 dark:text-white mt-1">
                การสอบวัดผลกลางภาค (หน่วยที่ 1 - 4)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                สุ่ม 30 ข้อจากคลังข้อสอบหน่วย 1–4 · เวลา 45 นาที · สอบได้ 1 ครั้ง
              </p>
            </div>
            <Link
              href="/exam/midterm"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-['Prompt'] text-xs font-semibold shadow-sm transition-all whitespace-nowrap ml-4"
            >
              เข้าห้องสอบ
            </Link>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-300 dark:border-purple-800/60 flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                EXAM 2 · สัดส่วน 20%
              </span>
              <h3 className="font-['Prompt'] text-lg font-bold text-slate-900 dark:text-white mt-1">
                การสอบวัดผลปลายภาค (หน่วยที่ 1 - 9)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                สุ่ม 40 ข้อจากทุกหน่วยการเรียนรู้ · เวลา 60 นาที · สอบได้ 1 ครั้ง
              </p>
            </div>
            <Link
              href="/exam/final"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-['Prompt'] text-xs font-semibold shadow-sm transition-all whitespace-nowrap ml-4"
            >
              เข้าห้องสอบ
            </Link>
          </div>
        </div>

        {/* Units List */}
        <div className="space-y-4">
          {COURSE_UNITS.map((unit) => (
            <div
              key={unit.number}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500/50 shadow-sm transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-['Prompt'] font-bold text-lg flex items-center justify-center shrink-0">
                    {unit.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        หน่วยที่ {unit.number}
                      </span>
                      {unit.number === 9 && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                          โครงงานหลัก 15%
                        </span>
                      )}
                    </div>
                    <h2 className="font-['Prompt'] text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      {unit.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {unit.description}
                    </p>

                    {/* Quick lesson pills */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {unit.lessons.map((lesson, idx) => (
                        <Link
                          key={idx}
                          href={`/learn/unit/${unit.number}?lesson=${idx + 1}`}
                          className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-600 text-slate-700 dark:text-slate-300 text-xs transition-colors"
                        >
                          {idx + 1}. {lesson.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap lg:flex-col items-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/learn/unit/${unit.number}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-['Prompt'] text-xs sm:text-sm font-semibold shadow-sm transition-all"
                  >
                    <span>เข้าสู่หน่วยเรียน</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Link
                      href={`/quiz/${unit.number}/pretest`}
                      className="hover:text-orange-600 hover:underline"
                    >
                      ก่อนเรียน
                    </Link>
                    <span>·</span>
                    <Link
                      href={`/quiz/${unit.number}/posttest`}
                      className="hover:text-orange-600 hover:underline"
                    >
                      หลังเรียน (10 ข้อ)
                    </Link>
                    <span>·</span>
                    <Link
                      href={`/assignment/${unit.number}`}
                      className="hover:text-orange-600 hover:underline"
                    >
                      ใบงาน ({unit.assignment.max_score} คะแนน)
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
