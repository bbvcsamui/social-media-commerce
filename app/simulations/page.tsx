import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Sparkles, ShieldCheck, MessageSquare, Calculator, ArrowRight, Award } from "lucide-react";

export default function SimulationsIndexPage() {
  const sims = [
    {
      key: "slip",
      title: "ภารกิจที่ 1: ตรวจสลิปโอนเงิน & ป้องกันสลิปปลอม",
      unit: "หน่วยที่ 3 ระบบการชำระเงิน",
      description:
        "สวมบทบาทเป็นแอดมินร้านค้าออนไลน์ ตรวจสอบสลิปโอนเงินของลูกค้า วิเคราะห์จุดสังเกต 5 จุด สแกน Mini QR Code และแยกแยะสลิปตัดต่อด้วยความละเอียดรอบคอบ",
      icon: ShieldCheck,
      color: "from-amber-500 to-orange-500",
      skills: ["การตรวจสอบ ITMX QR", "การดูฟอนต์/เงาตัดต่อ", "การกระทบยอดเวลาโอน"],
      href: "/simulations/slip",
    },
    {
      key: "chat",
      title: "ภารกิจที่ 2: แชทบริการลูกค้า & รับมือข้อร้องเรียน",
      unit: "หน่วยที่ 5 บริการหลังการขายและ CRM",
      description:
        "รับมือกับลูกค้า 3 สถานการณ์ที่มีอารมณ์แตกต่างกัน (สินค้าแตกหักล่าช้า, ขอคืนเงิน, สินค้าส่งผิดไซส์) เลือกเส้นทางตอบกลับตามหลัก HEAR Model อย่างมืออาชีพ",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
      skills: ["HEAR Model", "จิตวิทยาการบริการ", "การรักษาลูกค้าและการชดเชย"],
      href: "/simulations/chat",
    },
    {
      key: "pricing",
      title: "ภารกิจที่ 3: เครื่องคำนวณต้นทุน ค่าธรรมเนียม และตั้งราคาขาย",
      unit: "หน่วยที่ 9 การวางแผนและประยุกต์ใช้ทำธุรกิจจริง",
      description:
        "ทดลองกรอกต้นทุนจริง ค่ากล่อง ค่าธรรมเนียมแพลตฟอร์ม งบการตลาด และคำนวณราคาขายสุทธิไม่ให้ขาดทุน พร้อมวิเคราะห์จุดคุ้มทุน (BEP) และกำไรสุทธิ",
      icon: Calculator,
      color: "from-blue-500 to-indigo-500",
      skills: ["สูตรคำนวณราคาขาย", "โครงสร้าง Platform Fees", "การคำนวณ Break-even"],
      href: "/simulations/pricing",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PRACTICAL SIMULATIONS · สัดส่วน 5%</span>
          </div>
          <h1 className="font-['Prompt'] text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            ห้องจำลองปฏิบัติการพาณิชย์บนสื่อสังคมออนไลน์
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            ฝึกทักษะการตัดสินใจในสถานการณ์จริงที่ต้องอาศัย <strong>ความละเอียด รอบคอบ</strong>{" "}
            คะแนนการทดลองปฏิบัติการในห้องนี้จะถูกนำไปรวมในสัดส่วนคะแนนเก็บภาคปฏิบัติ
          </p>
        </div>

        {/* 3 Simulation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sims.map((sim) => {
            const Icon = sim.icon;
            return (
              <div
                key={sim.key}
                className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className={`p-6 bg-gradient-to-tr ${sim.color} text-white`}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-white/80 block">{sim.unit}</span>
                  <h2 className="font-['Prompt'] text-lg font-bold leading-tight mt-1">
                    {sim.title}
                  </h2>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {sim.description}
                  </p>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      ทักษะที่ฝึกฝน:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sim.skills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={sim.href}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-orange-500 dark:bg-slate-800 dark:hover:bg-orange-600 text-white font-['Prompt'] text-xs sm:text-sm font-semibold transition-colors mt-2"
                  >
                    <span>เข้าทำภารกิจจำลอง</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
