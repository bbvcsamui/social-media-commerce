import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { getUnitByNumber, COURSE_UNITS } from "@/lib/course-data";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ListOrdered,
  Award,
} from "lucide-react";

interface Props {
  params: Promise<{ number: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

export default async function UnitDetailPage({ params, searchParams }: Props) {
  const { number } = await params;
  const { lesson: lessonQuery } = await searchParams;
  const unitNum = parseInt(number, 10);
  const unit = getUnitByNumber(unitNum);

  if (!unit) {
    notFound();
  }

  const currentLessonIndex = lessonQuery ? Math.max(0, parseInt(lessonQuery, 10) - 1) : 0;
  const currentLesson = unit.lessons[currentLessonIndex] || unit.lessons[0];

  const prevUnit = unitNum > 1 ? unitNum - 1 : null;
  const nextUnit = unitNum < 9 ? unitNum + 1 : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/learn" className="hover:text-orange-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>กลับหน้ารายการหน่วย</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            หน่วยที่ {unit.number}
          </span>
        </div>

        {/* Unit Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-['Prompt'] font-bold text-xs">
                  หน่วยการเรียนรู้ที่ {unit.number}
                </span>
                <span className="text-xs text-slate-500">
                  {unit.lessons.length} บทเรียนย่อย · 15 ข้อในคลัง
                </span>
              </div>
              <h1 className="font-['Prompt'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {unit.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                {unit.description}
              </p>
            </div>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <Link
                href={`/quiz/${unit.number}/pretest`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 text-slate-700 dark:text-slate-200 text-xs font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
                <span>แบบทดสอบก่อนเรียน</span>
              </Link>
              <Link
                href={`/assignment/${unit.number}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 text-slate-700 dark:text-slate-200 text-xs font-medium"
              >
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>ใบงาน ({unit.assignment.max_score} คะแนน)</span>
              </Link>
              <Link
                href={`/quiz/${unit.number}/posttest`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm"
              >
                <Award className="w-3.5 h-3.5" />
                <span>แบบทดสอบหลังเรียน (เก็บคะแนน)</span>
              </Link>
            </div>
          </div>

          {/* Objectives Box */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              จุดประสงค์เชิงพฤติกรรมประจำหน่วย (Behavioral Objectives)
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {unit.objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Layout: Sidebar Lessons + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Lessons Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="font-['Prompt'] font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-orange-500" />
                <span>หัวข้อย่อยในหน่วยนี้</span>
              </h3>
              <nav className="space-y-1">
                {unit.lessons.map((lesson, idx) => {
                  const isActive = idx === currentLessonIndex;
                  return (
                    <Link
                      key={idx}
                      href={`/learn/unit/${unit.number}?lesson=${idx + 1}`}
                      className={`block px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                        isActive
                          ? "bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-semibold border-l-4 border-orange-500"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="text-[11px] text-slate-500 mb-0.5">ตอนที่ {idx + 1}</div>
                      <div className="line-clamp-2">{lesson.title}</div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Related Simulation Callout (for units 3, 5, 9) */}
            {unit.number === 3 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 border border-amber-300 dark:border-amber-800">
                <span className="text-[10px] font-bold text-amber-600 uppercase">SIMULATION</span>
                <h4 className="font-['Prompt'] font-bold text-sm text-slate-900 dark:text-white mt-1">
                  ภารกิจจำลอง: ตรวจสลิปโอนเงิน
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  ฝึกทักษะความละเอียดรอบคอบในการจับสลิปปลอมและตรวจยอด
                </p>
                <Link
                  href="/simulations/slip"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:underline"
                >
                  <span>เริ่มทำภารกิจจำลอง</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {unit.number === 5 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-300 dark:border-purple-800">
                <span className="text-[10px] font-bold text-purple-600 uppercase">SIMULATION</span>
                <h4 className="font-['Prompt'] font-bold text-sm text-slate-900 dark:text-white mt-1">
                  ภารกิจจำลอง: แชทตอบลูกค้า
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  ฝึกแก้ปัญหาเฉพาะหน้าและตอบรับข้อร้องเรียนตาม HEAR Model
                </p>
                <Link
                  href="/simulations/chat"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline"
                >
                  <span>เริ่มทำภารกิจจำลอง</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {unit.number === 9 && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 to-indigo-500/15 border border-blue-300 dark:border-blue-800">
                <span className="text-[10px] font-bold text-blue-600 uppercase">SIMULATION</span>
                <h4 className="font-['Prompt'] font-bold text-sm text-slate-900 dark:text-white mt-1">
                  ภารกิจจำลอง: คำนวณต้นทุนและราคา
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  เครื่องคำนวณราคาขายพร้อมค่าธรรมเนียมและงบการตลาด
                </p>
                <Link
                  href="/simulations/pricing"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <span>เปิดเครื่องคำนวณ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </aside>

          {/* Main Lesson Content */}
          <article className="lg:col-span-8 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                ตอนที่ {currentLessonIndex + 1} จาก {unit.lessons.length}
              </span>
              <h2 className="font-['Prompt'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {currentLesson.title}
              </h2>
            </div>

            {/* Markdown Body */}
            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed prose-headings:font-['Prompt'] prose-h2:text-xl prose-h3:text-lg prose-table:text-xs sm:prose-table:text-sm prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-td:border prose-th:border prose-td:p-2 prose-th:p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentLesson.content_md}
              </ReactMarkdown>
            </div>

            {/* Lesson Navigation Footer */}
            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {currentLessonIndex > 0 ? (
                <Link
                  href={`/learn/unit/${unit.number}?lesson=${currentLessonIndex}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>ตอนก่อนหน้า</span>
                </Link>
              ) : (
                <div />
              )}

              {currentLessonIndex < unit.lessons.length - 1 ? (
                <Link
                  href={`/learn/unit/${unit.number}?lesson=${currentLessonIndex + 2}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-semibold shadow-sm"
                >
                  <span>ตอนถัดไป</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href={`/assignment/${unit.number}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold shadow-sm"
                >
                  <span>ไปทำใบงานประจำหน่วย</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
