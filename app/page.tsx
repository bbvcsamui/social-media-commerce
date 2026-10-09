import Link from "next/link";
import { COURSE } from "@/lib/config";
import { Navbar } from "@/components/navbar";
import { getCourseUnits, getCourseUnit } from "@/lib/course";
import { requireProfile, navbarUser } from "@/lib/auth";
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText,
} from "lucide-react";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const COURSE_UNITS = await getCourseUnits();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-purple-50/30 to-transparent dark:from-orange-950/20 dark:via-purple-950/10 dark:to-transparent py-16 sm:py-24 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Standard Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs sm:text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>มาตรฐานคุณวุฒิวิชาชีพ รหัส 1023 อาชีพนักพาณิชย์อิเล็กทรอนิกส์ ระดับ 5</span>
            </div>

            <h1 className="font-['Prompt'] text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {COURSE.nameTh}
              <span className="block text-xl sm:text-2xl font-normal text-slate-600 dark:text-slate-300 mt-2">
                {COURSE.code} · {COURSE.nameEn}
              </span>
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              บทเรียนออนไลน์ครบวงจรสำหรับนักศึกษา ระดับ ปวส.{" "}
              <strong className="text-slate-800 dark:text-slate-100">{COURSE.college}</strong>{" "}
              มุ่งเน้นการสร้างร้านค้าออนไลน์จริงด้วย{" "}
              <span className="text-orange-600 dark:text-orange-400 font-semibold">
                ความละเอียด รอบคอบ
              </span>
            </p>

            {/* Quick stats pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {COURSE.credits}
              </span>
              <span className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                9 หน่วยการเรียนรู้
              </span>
              <span className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                3 กิจกรรมจำลองปฏิบัติการ
              </span>
              <span className="px-3 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                135 คลังข้อสอบ
              </span>
            </div>

            {/* Call to action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/learn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-['Prompt'] font-semibold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all text-base"
              >
                <span>เข้าสู่บทเรียน 9 หน่วย</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/simulations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-['Prompt'] font-semibold border border-slate-200 dark:border-slate-700 shadow-sm transition-all text-base"
              >
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span>ห้องจำลองปฏิบัติการ</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Outcome & Competencies Banner */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-800/30">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white">
                ผลลัพธ์การเรียนรู้ (Outcome)
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {COURSE.outcome}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/30">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white">
                3 สมรรถนะประจำรายวิชา
              </h3>
              <ul className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                {COURSE.competencies.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white">
                เกณฑ์การวัดและประเมินผล
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                ใบงานและปฏิบัติ 40% · จิตพิสัยความละเอียดรอบคอบ 20% · สอบปลายภาค 20% · แบบทดสอบและกลางภาค 20% (รวม 100 คะแนน ตัดเกรด 8 ระดับ)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Units Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                COURSE MODULES
              </span>
              <h2 className="font-['Prompt'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                โครงสร้าง 9 หน่วยการเรียนรู้
              </h2>
            </div>
            <Link
              href="/learn"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:underline"
            >
              <span>ดูรายละเอียดทุกหน่วย</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSE_UNITS.map((unit) => (
              <Link
                key={unit.number}
                href={`/learn/unit/${unit.number}`}
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-400 dark:hover:border-orange-500 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 font-bold text-sm flex items-center justify-center font-['Prompt']">
                    {unit.number}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {unit.lessons.length} บทเรียน · {unit.questionCount} ข้อสอบ
                  </span>
                </div>

                <h3 className="font-['Prompt'] font-bold text-lg text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                  {unit.title}
                </h3>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1">
                  {unit.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[200px]">
                    {unit.assignment?.title}
                  </span>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {unit.assignment?.max_score} คะแนน
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Simulations Teaser */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              PRACTICAL SIMULATIONS
            </span>
            <h2 className="font-['Prompt'] text-2xl sm:text-4xl font-extrabold leading-tight">
              3 กิจกรรมจำลองปฏิบัติการเสมือนจริง
            </h2>
            <p className="mt-3 text-white/90 text-sm sm:text-base leading-relaxed">
              ฝึกทักษะการตัดสินใจและปลูกฝังความละเอียดรอบคอบด้วยสถานการณ์จำลองที่พบจริงในการทำธุรกิจออนไลน์
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/simulations/slip"
                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all text-left"
              >
                <div className="text-xl font-bold font-['Prompt'] mb-1">🔍 1. ตรวจสลิปโอนเงิน</div>
                <div className="text-xs text-white/80">
                  หน่วยที่ 3: จับสลิปปลอม สแกน QR และป้องกันกลโกง
                </div>
              </Link>

              <Link
                href="/simulations/chat"
                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all text-left"
              >
                <div className="text-xl font-bold font-['Prompt'] mb-1">💬 2. แชทรับมือลูกค้า</div>
                <div className="text-xs text-white/80">
                  หน่วยที่ 5: สถานการณ์ลูกค้าร้องเรียน เคลมสินค้า คืนเงิน
                </div>
              </Link>

              <Link
                href="/simulations/pricing"
                className="p-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all text-left"
              >
                <div className="text-xl font-bold font-['Prompt'] mb-1">🧮 3. คำนวณต้นทุน-ราคา</div>
                <div className="text-xs text-white/80">
                  หน่วยที่ 9: ค่าธรรมเนียมแพลตฟอร์ม ค่าแอด และกำไรสุทธิ
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {COURSE.college}
          </p>
          <p className="mt-1">
            หลักสูตรประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) สาขาวิชาเทคโนโลยีธุรกิจดิจิทัล / การตลาด
          </p>
          <p className="mt-1">
            รายวิชา 31910-2028 การพาณิชย์บนสื่อสังคมออนไลน์ (Social Media for Commerce)
          </p>
        </div>
      </footer>
    </div>
  );
}
