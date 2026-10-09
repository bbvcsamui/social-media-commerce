"use client";

import { useState } from "react";
import { SaveSimulation } from "@/components/save-simulation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface SlipCase {
  id: number;
  customerName: string;
  orderAmount: number;
  productDesc: string;
  slipBank: string;
  transferTime: string;
  slipAmount: number;
  isFake: boolean;
  reasons: string[];
  visualDetails: {
    fontStatus: "normal" | "distorted" | "mismatch";
    qrStatus: "valid" | "fake_link" | "corrupted";
    timestampStatus: "matches" | "future_date" | "outdated";
    recipientName: string;
  };
}

const CASES: SlipCase[] = [
  {
    id: 1,
    customerName: "สมชาย มีสุข",
    orderAmount: 490,
    productDesc: "เสื้อยืดโอเวอร์ไซส์ สีดำ ไซส์ XL (ยอด 490 บ.)",
    slipBank: "ธนาคารกสิกรไทย",
    transferTime: "10:14 น. วันนี้",
    slipAmount: 490,
    isFake: false,
    reasons: ["สลิปแท้: ข้อมูลถูกต้อง สแกน Mini QR ตรงกับเซิร์ฟเวอร์ธนาคาร"],
    visualDetails: {
      fontStatus: "normal",
      qrStatus: "valid",
      timestampStatus: "matches",
      recipientName: "ร้านค้าออนไลน์ภาวนาโพธิคุณ",
    },
  },
  {
    id: 2,
    customerName: "วิชัย ใจดี",
    orderAmount: 1250,
    productDesc: "เซ็ตครีมบำรุงผิวพรีเมียม (ยอด 1,250 บ.)",
    slipBank: "ธนาคารไทยพาณิชย์",
    transferTime: "11:30 น. วันนี้",
    slipAmount: 1250,
    isFake: true,
    reasons: [
      "ฟอนต์ตัวเลขยอดเงิน 1,250 มีขนาดและเงาไม่กลมกลืนกับข้อความอื่น (ตัดต่อตัวเลข)",
      "สแกน QR Code แล้วไม่พบรายการธุรกรรมในระบบธนาคาร",
    ],
    visualDetails: {
      fontStatus: "distorted",
      qrStatus: "corrupted",
      timestampStatus: "matches",
      recipientName: "ร้านค้าออนไลน์ภาวนาโพธิคุณ",
    },
  },
  {
    id: 3,
    customerName: "กัญญา พรทิพย์",
    orderAmount: 890,
    productDesc: "กระเป๋าสะพายผ้าแคนวาส (ยอด 890 บ.)",
    slipBank: "ธนาคารกรุงไทย",
    transferTime: "14:05 น. เมื่อวานนี้",
    slipAmount: 890,
    isFake: true,
    reasons: [
      "สลิปเก่าวนซ้ำ: เวลาบนสลิปเป็นของเมื่อวานซืน แต่ลูกค้านำมาแจ้งยอดคำสั่งซื้อของวันนี้",
    ],
    visualDetails: {
      fontStatus: "normal",
      qrStatus: "valid",
      timestampStatus: "outdated",
      recipientName: "ร้านค้าออนไลน์ภาวนาโพธิคุณ",
    },
  },
  {
    id: 4,
    customerName: "อนันต์ ทรงศักดิ์",
    orderAmount: 350,
    productDesc: "เคสมือถือกันกระแทก (ยอด 350 บ.)",
    slipBank: "ธนาคารกรุงเทพ",
    transferTime: "15:20 น. วันนี้",
    slipAmount: 350,
    isFake: true,
    reasons: [
      "ชื่อบัญชีปลายทางไม่ถูกต้อง: โอนไปบัญชี 'นายบุญชู อื่นใด' ไม่ใช่บัญชีทางการของร้าน",
    ],
    visualDetails: {
      fontStatus: "normal",
      qrStatus: "valid",
      timestampStatus: "matches",
      recipientName: "นายบุญชู มิจฉาพาณิชย์",
    },
  },
];

export default function SlipSimulationPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userDecisions, setUserDecisions] = useState<{ [id: number]: "approve" | "reject" }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentCase = CASES[currentIdx];

  function handleDecision(decision: "approve" | "reject") {
    setUserDecisions((prev) => ({ ...prev, [currentCase.id]: decision }));
    setShowExplanation(true);
  }

  function handleNext() {
    setShowExplanation(false);
    if (currentIdx < CASES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
    }
  }

  function handleRestart() {
    setCurrentIdx(0);
    setUserDecisions({});
    setShowExplanation(false);
    setIsFinished(false);
  }

  // Calculate score
  let correctCount = 0;
  CASES.forEach((c) => {
    const dec = userDecisions[c.id];
    const isCorrect = (c.isFake && dec === "reject") || (!c.isFake && dec === "approve");
    if (isCorrect) correctCount++;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        {isFinished && <SaveSimulation data={{ key: "slip", answers: userDecisions }} />}
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/simulations" className="hover:text-orange-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>กลับห้องจำลองปฏิบัติการ</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            ภารกิจตรวจสลิปโอนเงิน
          </span>
        </div>

        {/* Title */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h1 className="font-['Prompt'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                ภารกิจ: แอดมินตรวจสลิปโอนเงิน (4 เคสทดสอบ)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              วิเคราะห์ความถูกต้อง จุดสังเกตฟอนต์ คิวอาร์โค้ด และเวลาโอนด้วยความละเอียด รอบคอบ
            </p>
          </div>
          {!isFinished && (
            <span className="text-sm font-['Prompt'] font-bold text-orange-600">
              เคสที่ {currentIdx + 1} / {CASES.length}
            </span>
          )}
        </div>

        {/* Finish Screen */}
        {isFinished ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-md">
            <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="font-['Prompt'] text-2xl font-bold text-slate-900 dark:text-white">
              สรุปผลภารกิจตรวจสลิปโอนเงิน
            </h2>
            <div className="mt-4 text-4xl font-extrabold font-['Prompt'] text-orange-600">
              {correctCount} / {CASES.length} เคส
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {correctCount === CASES.length
                ? "ยอดเยี่ยมมาก! คุณมีความละเอียด รอบคอบ แยกแยะสลิปจริงและสลิปปลอมได้ครบถ้วน"
                : "ยังมีความคลาดเคลื่อนในบางเคส แนะนำให้ทบทวนจุดสังเกตฟอนต์และเวลาโอนอีกครั้ง"}
            </p>

            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-500 text-white font-['Prompt'] text-sm font-semibold shadow-md hover:bg-orange-600"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ทำภารกิจใหม่อีกครั้ง</span>
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left: Simulated Slip Card */}
            <div className="md:col-span-6 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-inner flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-slate-700">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {currentCase.slipBank}
                  </span>
                  <span className="text-[11px] text-slate-500">โอนเงินสำเร็จ</span>
                </div>

                <div className="my-6 text-center">
                  <div className="text-xs text-slate-500">จำนวนเงินที่โอน</div>
                  <div
                    className={`text-3xl font-bold font-mono tracking-tight mt-1 ${
                      currentCase.visualDetails.fontStatus === "distorted"
                        ? "text-orange-600 font-serif italic scale-105"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    ฿{currentCase.slipAmount.toLocaleString()}.00
                  </div>
                  {currentCase.visualDetails.fontStatus === "distorted" && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠️ สังเกต: ฟอนต์ตัวเลขมีเงาเหลื่อมผิดปกติ
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">ผู้โอน:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {currentCase.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">บัญชีปลายทาง:</span>
                    <span
                      className={`font-semibold ${
                        currentCase.visualDetails.recipientName.includes("มิจฉา")
                          ? "text-rose-600 dark:text-rose-400 font-bold"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {currentCase.visualDetails.recipientName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">วัน-เวลาที่ทำรายการ:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {currentCase.transferTime}
                    </span>
                  </div>
                </div>

                {/* QR Code Graphic */}
                <div className="mt-6 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center">
                  <QrCode className="w-16 h-16 mx-auto text-slate-800 dark:text-slate-200" />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    ITMX Mini QR Code (สำหรับแอปธนาคารสแกน)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Order details & Admin Action */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-['Prompt'] font-bold text-base text-slate-900 dark:text-white mb-3">
                  ข้อมูลคำสั่งซื้อในระบบหลังบ้าน
                </h3>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ลูกค้า:</span>
                    <span className="font-semibold">{currentCase.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">สินค้า:</span>
                    <span className="font-semibold">{currentCase.productDesc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ยอดเงินที่ต้องชำระ:</span>
                    <span className="font-bold text-orange-600">
                      ฿{currentCase.orderAmount.toLocaleString()} บาท
                    </span>
                  </div>
                </div>

                {/* Checklist reminder */}
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                  <strong>Checklist ความละเอียดรอบคอบ:</strong>
                  <div>1. ยอดเงินในสลิปตรงกับยอดคำสั่งซื้อหรือไม่?</div>
                  <div>2. ชื่อบัญชีผู้รับคือบัญชีร้านค้าจริงหรือไม่?</div>
                  <div>3. เวลาทำรายการตรงกับเวลาปัจจุบันหรือไม่?</div>
                  <div>4. ฟอนต์ตัวเลขเนียนเรียบ หรือมีรอยตัดต่อ?</div>
                </div>

                {/* Action feedback */}
                {showExplanation && (
                  <div
                    className={`mt-4 p-4 rounded-xl border text-xs ${
                      (currentCase.isFake && userDecisions[currentCase.id] === "reject") ||
                      (!currentCase.isFake && userDecisions[currentCase.id] === "approve")
                        ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200"
                        : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    <div className="font-bold font-['Prompt'] text-sm mb-1 flex items-center gap-1.5">
                      {(currentCase.isFake && userDecisions[currentCase.id] === "reject") ||
                      (!currentCase.isFake && userDecisions[currentCase.id] === "approve") ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>การตัดสินใจถูกต้อง!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>การตัดสินใจยังไม่ถูกต้อง!</span>
                        </>
                      )}
                    </div>
                    <ul className="list-disc list-inside space-y-1 mt-1 text-[11px]">
                      {currentCase.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Decision Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                {!showExplanation ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDecision("approve")}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-['Prompt'] font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>สลิปแท้ (อนุมัติส่งของ)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision("reject")}
                      className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-['Prompt'] font-semibold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>สลิปปลอม/ผิดปกติ (ปฏิเสธ)</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-['Prompt'] font-semibold text-xs sm:text-sm shadow-sm transition-colors"
                  >
                    {currentIdx < CASES.length - 1 ? "ไปยังเคสถัดไป" : "ดูสรุปผลคะแนน"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
