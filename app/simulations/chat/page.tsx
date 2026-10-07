"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  MessageSquare,
  Send,
  User,
  Bot,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface Scenario {
  id: number;
  title: string;
  customerMood: string;
  initialMessage: string;
  options: {
    text: string;
    score: number; // 0..10
    botReply: string;
    feedback: string;
  }[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    title: "สถานการณ์ที่ 1: พัสดุล่าช้ากว่ากำหนด 3 วัน ลูกค้าเริ่มหงุดหงิด",
    customerMood: "😠 หงุดหงิดและกังวลใจ",
    initialMessage:
      "สั่งของไปตั้งแต่วันจันทร์ จนวันนี้ยังไม่ได้ของเลยค่ะ! ของต้องรีบใช้เสาร์นี้ เลขพัสดุก็ไม่ขยับเลย ร้านจะรับผิดชอบยังไงคะ?!",
    options: [
      {
        text: "ส่งให้แล้วค่ะ ขนส่งช้าเอง ลูกค้าต้องไปตามกับขนส่งเองนะคะ ร้านไม่เกี่ยวค่ะ",
        score: 0,
        botReply: "บริการแย่มากค่ะ โบ้ยให้ลูกค้าแบบนี้ ขอไปรีวิวประจาน 1 ดาวนะคะ!",
        feedback: "❌ ผิดหลัก HEAR: โยนความรับผิดชอบให้ขนส่ง ทำให้ลูกค้าโกรธและทำลายชื่อเสียงแบรนด์",
      },
      {
        text: "สวัสดีค่ะคุณลูกค้า ทางร้านกราบขออภัยในความล่าช้าเป็นอย่างสูงค่ะ ขออนุญาตขอเลขที่ออเดอร์เพื่อประสานงานเร่งด่วนกับผู้จัดการสาขาขนส่งให้ทันทีค่ะ และหากติดปัญหาทางร้านพร้อมส่งสินค้าชุดใหม่สำรองไปให้ด่วนเลยค่ะ",
        score: 10,
        botReply: "ขอบคุณมากค่ะ ออเดอร์ #8492 นะคะ รบกวนช่วยเร่งให้ด้วยนะคะ ต้องใช้จริงๆ ค่ะ",
        feedback: "✅ ยอดเยี่ยมตาม HEAR Model: รับฟัง ขออภัยอย่างจริงใจ และเสนอทางออกชดเชยที่ทำให้ลูกค้าอุ่นใจ",
      },
      {
        text: "รอหน่อยนะคะ ช่วงนี้พัสดุเยอะค่ะ ขนส่งกำลังวิ่งส่งให้อยู่ค่ะ",
        score: 4,
        botReply: "ก็บอกว่าต้องรีบใช้เสาร์นี้ไงคะ ตอบแบบนี้เหมือนไม่ได้อ่านที่พิมพ์ไปเลย!",
        feedback: "⚠️ ขาดความใส่ใจ: ตอบแบบขอไปที ไม่แสดงความช่วยเหลือที่จับต้องได้",
      },
    ],
  },
  {
    id: 2,
    title: "สถานการณ์ที่ 2: สินค้าเสียหายจากการขนส่ง (แก้วแตกในกล่อง)",
    customerMood: "😭 เสียใจและผิดหวัง",
    initialMessage:
      "แอดมินคะ แก้วกาแฟที่สั่งมาเปิดกล่องออกมาหูหักแตกละเอียดเลยค่ะ เสียใจมาก อุตส่าห์รอของตั้งนาน ฮือๆ ทำเรื่องคืนเงินได้ไหมคะ?",
    options: [
      {
        text: "ตอนแกะกล่องลูกค้าได้ถ่ายวิดีโอคลิปไว้ไหมคะ? ถ้าไม่มีคลิปเปิดกล่อง ทางร้านไม่รับเคลมทุกกรณีตามที่แจ้งไว้ในหน้าร้านค่ะ",
        score: 2,
        botReply: "ใครจะไปรู้ล่ะคะว่าต้องถ่ายคลิป สั่งของมาตั้งเยอะไม่เคยเจอร้านใจแคบแบบนี้ เสียความรู้สึกมาก!",
        feedback: "❌ แข็งกระด้างเกินไป: แม้จะมีนโยบาย แต่ควรแสดงความเห็นใจก่อนเป็นอันดับแรก",
      },
      {
        text: "ทางร้านเข้าใจความรู้สึกของคุณลูกค้าเลยค่ะ ต้องขออภัยอย่างยิ่งนะคะ ไม่ต้องกังวลนะคะ รบกวนส่งรูปถ่ายจุดที่เสียหายให้แอดมินสักครู่ ทางร้านยินดีจัดส่งใบใหม่ไปให้ฟรีทันทีวันนี้ หรือหากลูกค้าประสงค์รับเงินคืนก็แจ้งได้เลยค่ะ",
        score: 10,
        botReply: "ขอบคุณแอดมินมากๆ เลยค่ะ ขอรับเป็นแก้วใบใหม่นะคะ ประทับใจการบริการมากค่ะ",
        feedback: "✅ ยอดเยี่ยม: เปลี่ยนวิกฤตเป็นความประทับใจ (Service Recovery Paradox) แสดง Empathy สูง",
      },
      {
        text: "โอเคค่ะ เดี๋ยวโอนเงินคืนให้เลยค่ะ",
        score: 6,
        botReply: "ขอบคุณค่ะ โอนตามบัญชีเดิมนะคะ",
        feedback: "⚠️ พอใช้ได้: แก้ปัญหาได้แต่ขาดการขออภัยและการเชื่อมความสัมพันธ์กับลูกค้าในระยะยาว",
      },
    ],
  },
  {
    id: 3,
    title: "สถานการณ์ที่ 3: ร้านส่งสินค้าผิดไซส์ (สั่ง XL แต่ได้ M)",
    customerMood: "😤 ไม่พอใจในความสะเพร่าของร้าน",
    initialMessage:
      "สั่งเสื้อไซส์ XL ไป แต่ส่งไซส์ M มาให้เนี่ยนะ! คนแพ็กของทำงานยังไงเนี่ย สายตาสั้นเหรอคะ เสียเวลาจริงๆ!",
    options: [
      {
        text: "ขออภัยด้วยค่ะ ทางร้านยอมรับผิดในความไม่รอบคอบของทีมแพ็กค่ะ ไม่ต้องส่งตัวเดิมคืนนะคะ ทางร้านจัดส่งไซส์ XL ตัวใหม่ให้ทันทีแบบด่วนพิเศษ พร้อมมอบโค้ดลด 100 บาทสำหรับการสั่งซื้อครั้งถัดไปเพื่อเป็นการขออภัยค่ะ",
        score: 10,
        botReply: "อ่า... ขอบคุณค่ะ ที่จริงส่งตัวเดิมคืนให้ก็ได้นะคะถ้ามีคนมารับ แต่ขอบคุณที่รับผิดชอบรวดเร็วค่ะ",
        feedback: "✅ ยอดเยี่ยม: ยอมรับความผิดพลาดด้วยความจริงใจ รวดเร็ว และมอบการชดเชยที่เกินความคาดหมาย",
      },
      {
        text: "พูดจาให้สุภาพหน่อยนะคะ คนแพ็กเขาก็เป็นคนเหมือนกัน ผิดพลาดกันได้ค่ะ ถ้าจะเปลี่ยนก็ส่งของกลับมาก่อนค่ะ ลูกค้าออกค่าส่งเองนะคะ",
        score: 0,
        botReply: "ส่งผิดเองแล้วยังมาด่าลูกค้าอีก! เจอกันที่ สคบ. แน่นอนค่ะ แคปไว้หมดแล้ว!",
        feedback: "❌ ห้ามทำเด็ดขาด: โต้เถียงลูกค้า ใช้อารมณ์ และยังผลักภาระค่าส่งกลับ ผิดกฎหมายคุ้มครองผู้บริโภค",
      },
      {
        text: "ส่งตัวเดิมกลับมาตามที่อยู่นี้ก่อนนะคะ ถึงแล้วจะส่ง XL ไปให้ค่ะ",
        score: 5,
        botReply: "ต้องรอของส่งไปถึงก่อนอีกเหรอคะ กว่าจะได้ใส่คงเป็นเดือน...",
        feedback: "⚠️ ช้าเกินไป: ความผิดพลาดของร้านควรมีความยืดหยุ่นในการจัดส่งเปลี่ยนสินค้าให้รวดเร็วกว่านี้",
      },
    ],
  },
];

export default function ChatSimulationPage() {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [history, setHistory] = useState<{ [id: number]: number }>({});
  const [isFinished, setIsFinished] = useState(false);

  const scenario = SCENARIOS[currentScenarioIdx];

  function handleSelect(idx: number) {
    if (selectedOptionIdx !== null) return;
    setSelectedOptionIdx(idx);
    setHistory((prev) => ({ ...prev, [scenario.id]: idx }));
  }

  function handleNext() {
    setSelectedOptionIdx(null);
    if (currentScenarioIdx < SCENARIOS.length - 1) {
      setCurrentScenarioIdx(currentScenarioIdx + 1);
    } else {
      setIsFinished(true);
    }
  }

  function handleRestart() {
    setCurrentScenarioIdx(0);
    setSelectedOptionIdx(null);
    setHistory({});
    setIsFinished(false);
  }

  const totalScore = Object.entries(history).reduce((acc, [scId, optIdx]) => {
    const sc = SCENARIOS.find((s) => s.id === parseInt(scId, 10));
    return acc + (sc ? sc.options[optIdx].score : 0);
  }, 0);
  const maxPossible = SCENARIOS.length * 10;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/simulations" className="hover:text-orange-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>กลับห้องจำลองปฏิบัติการ</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            ภารกิจแชทบริการลูกค้า
          </span>
        </div>

        {/* Title */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <h1 className="font-['Prompt'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ภารกิจ: แชทบริการลูกค้า & รับมือข้อร้องเรียน (HEAR Model)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              เลือกคำตอบที่สุภาพ ถูกต้องตามหลักจิตวิทยาบริการ และรักษาน้ำใจลูกค้า
            </p>
          </div>
          {!isFinished && (
            <span className="text-sm font-['Prompt'] font-bold text-purple-600">
              ข้อ {currentScenarioIdx + 1} / {SCENARIOS.length}
            </span>
          )}
        </div>

        {/* Finished Screen */}
        {isFinished ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-md">
            <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h2 className="font-['Prompt'] text-2xl font-bold text-slate-900 dark:text-white">
              สรุปคะแนนภารกิจบริการลูกค้า
            </h2>
            <div className="mt-4 text-4xl font-extrabold font-['Prompt'] text-purple-600">
              {totalScore} / {maxPossible} คะแนน
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {totalScore >= 25
                ? "ยอดเยี่ยมระดับมืออาชีพ! คุณสามารถควบคุมอารมณ์และใช้หลัก HEAR Model แก้ไขปัญหาได้ดีเยี่ยม"
                : "แนะนำให้ระมัดระวังการใช้อารมณ์และการผลักภาระให้ลูกค้าในช่องแชทสาธารณะ"}
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-['Prompt'] text-sm font-semibold shadow-md hover:bg-purple-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นใหม่อีกครั้ง</span>
              </button>
              <Link
                href="/simulations"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-['Prompt'] text-sm font-semibold hover:bg-slate-200"
              >
                <span>กลับหน้ารวมภารกิจ</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Scenario Header Box */}
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-purple-900 dark:text-purple-200">
                {scenario.title}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border">
                อารมณ์ลูกค้า: {scenario.customerMood}
              </span>
            </div>

            {/* Simulated Chat Interface */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              {/* Customer Bubble */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm max-w-[85%] leading-relaxed">
                  {scenario.initialMessage}
                </div>
              </div>

              {/* Admin reply (if chosen) */}
              {selectedOptionIdx !== null && (
                <>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="p-3.5 rounded-2xl rounded-tr-none bg-purple-600 text-white text-xs sm:text-sm max-w-[85%] leading-relaxed">
                      {scenario.options[selectedOptionIdx].text}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Customer second reply */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm max-w-[85%] leading-relaxed font-medium">
                      {scenario.options[selectedOptionIdx].botReply}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Response Options */}
            <div className="space-y-3">
              <h3 className="font-['Prompt'] font-semibold text-xs sm:text-sm text-slate-500 uppercase tracking-wider">
                เลือกคำตอบของแอดมิน:
              </h3>
              {scenario.options.map((opt, idx) => {
                const isSelected = selectedOptionIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={selectedOptionIdx !== null}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all ${
                      isSelected
                        ? opt.score === 10
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold"
                          : "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-400"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{opt.text}</span>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 text-xs font-normal">
                        {opt.feedback}
                        <div className="mt-1 font-bold">
                          คะแนนที่ได้: {opt.score} / 10 คะแนน
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            {selectedOptionIdx !== null && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-['Prompt'] font-semibold text-xs sm:text-sm shadow-md transition-all"
                >
                  {currentScenarioIdx < SCENARIOS.length - 1 ? "ไปยังสถานการณ์ถัดไป" : "ดูผลสรุปคะแนน"}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
