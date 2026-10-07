"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import {
  Calculator,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  PieChart,
} from "lucide-react";

export default function PricingSimulationPage() {
  // Inputs
  const [productCost, setProductCost] = useState<number>(100);
  const [packagingCost, setPackagingCost] = useState<number>(15);
  const [shippingCost, setShippingCost] = useState<number>(35);
  const [freeShipping, setFreeShipping] = useState<boolean>(true); // ร้านออกค่าส่งเอง
  const [platformFeePercent, setPlatformFeePercent] = useState<number>(8); // TikTok Shop/Shopee ~8%
  const [marketingPercent, setMarketingPercent] = useState<number>(15); // ยิงแอด ~15%
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(25); // กำไรเป้าหมาย 25%

  // Calculations
  const directCost = productCost + packagingCost + (freeShipping ? shippingCost : 0);
  const totalDeductionPercent = (platformFeePercent + marketingPercent + targetMarginPercent) / 100;

  // Formula: Price = directCost / (1 - totalDeductionPercent)
  let recommendedPrice = 0;
  let isFeasible = true;

  if (totalDeductionPercent >= 1) {
    isFeasible = false;
  } else {
    recommendedPrice = Math.ceil(directCost / (1 - totalDeductionPercent));
  }

  // Breakdown at recommended price
  const platformFeeAmount = Math.round(recommendedPrice * (platformFeePercent / 100));
  const marketingAmount = Math.round(recommendedPrice * (marketingPercent / 100));
  const profitAmount = Math.round(
    recommendedPrice - directCost - platformFeeAmount - marketingAmount
  );
  const actualMarginPercent = recommendedPrice > 0 ? Math.round((profitAmount / recommendedPrice) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6">
          <Link href="/simulations" className="hover:text-orange-600 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>กลับห้องจำลองปฏิบัติการ</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            เครื่องคำนวณต้นทุนและราคาขาย
          </span>
        </div>

        {/* Title */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-500" />
            <h1 className="font-['Prompt'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              เครื่องคำนวณราคาขายจริง & ค่าธรรมเนียมแพลตฟอร์ม (Unit 9)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ป้องกันปัญหา "ยอดขายปัง แต่ขาดทุน" โดยคำนวณค่าธรรมเนียมแฝง ค่าโฆษณา และค่าแพ็กเกจจิ้งอย่างแม่นยำ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Controls */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-['Prompt'] font-bold text-sm sm:text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                1. ต้นทุนตรงของสินค้า (Direct Costs)
              </h2>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>ต้นทุนตัวสินค้า / ผลิต (บาท)</span>
                  <span className="font-bold text-slate-900 dark:text-white">฿{productCost}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={productCost}
                  onChange={(e) => setProductCost(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>ค่ากล่องพัสดุ + บับเบิ้ล + สติกเกอร์ (บาท)</span>
                  <span className="font-bold text-slate-900 dark:text-white">฿{packagingCost}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={packagingCost}
                  onChange={(e) => setPackagingCost(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    ค่าจัดส่งพัสดุ (บาท)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freeShipping}
                      onChange={(e) => setFreeShipping(e.target.checked)}
                      className="rounded text-orange-500"
                    />
                    <span>ร้านส่งฟรี (รวมในราคาขาย)</span>
                  </label>
                </div>
                <input
                  type="number"
                  min="0"
                  disabled={!freeShipping}
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono disabled:opacity-40"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex justify-between font-semibold">
                <span>รวมต้นทุนคงที่ต่อชิ้น:</span>
                <span className="text-orange-600 font-mono font-bold">฿{directCost} บาท</span>
              </div>
            </div>

            {/* Platform & Marketing */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h2 className="font-['Prompt'] font-bold text-sm sm:text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                2. ค่าธรรมเนียมแฝงและกำไรเป้าหมาย (% จากราคาขาย)
              </h2>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>ค่าธรรมเนียมแพลตฟอร์ม + ภาษี VAT (%)</span>
                  <span className="font-bold text-blue-600">{platformFeePercent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={platformFeePercent}
                  onChange={(e) => setPlatformFeePercent(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <span className="text-[10px] text-slate-400">
                  เช่น TikTok Shop, Shopee ประมาณ 6% - 10%
                </span>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>งบประมาณค่าโฆษณาและการตลาด (CAC / Ads %)</span>
                  <span className="font-bold text-purple-600">{marketingPercent}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={marketingPercent}
                  onChange={(e) => setMarketingPercent(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
                <span className="text-[10px] text-slate-400">
                  เผื่อค่ายิงแอด โปรโมชัน หรือค่านายหน้าครีเอเตอร์
                </span>
              </div>

              <div>
                <label className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>อัตรากำไรสุทธิที่ต้องการ (Net Margin %)</span>
                  <span className="font-bold text-emerald-600">{targetMarginPercent}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Right: Results Display */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-6">
              <div>
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider">
                  RECOMMENDED SELLING PRICE
                </span>
                <h3 className="font-['Prompt'] text-lg font-semibold mt-1">
                  ราคาขายแนะนำที่คุ้มทุนและได้กำไรตามเป้า
                </h3>
              </div>

              {isFeasible ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold font-['Prompt'] text-orange-400">
                      ฿{recommendedPrice.toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-sm">บาท/ชิ้น</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">
                    (แนะนำตั้งราคาจิตวิทยาลงท้ายด้วย 9 เช่น ฿{Math.floor(recommendedPrice / 10) * 10 + 9} บาท)
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-rose-900/60 border border-rose-700 text-rose-200 text-xs">
                  ⚠️ เปอร์เซ็นต์รวมของค่าธรรมเนียม งบโฆษณา และกำไร เกิน 100% ไม่สามารถตั้งราคาขายได้
                </div>
              )}

              {/* Breakdown Table */}
              {isFeasible && (
                <div className="space-y-3 pt-4 border-t border-slate-700 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/60">
                    <span className="text-slate-400">ต้นทุนสินค้า + แพ็ก (+ ค่าส่ง):</span>
                    <span className="font-mono font-semibold">฿{directCost} บาท</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/60">
                    <span className="text-slate-400">หักค่าธรรมเนียมแพลตฟอร์ม ({platformFeePercent}%):</span>
                    <span className="font-mono font-semibold text-blue-400">
                      -฿{platformFeeAmount} บาท
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/60">
                    <span className="text-slate-400">หักงบโฆษณา/การตลาด ({marketingPercent}%):</span>
                    <span className="font-mono font-semibold text-purple-400">
                      -฿{marketingAmount} บาท
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-bold bg-white/5 px-3 rounded-xl">
                    <span className="text-emerald-400">กำไรสุทธิเข้ากระเป๋าจริง ({actualMarginPercent}%):</span>
                    <span className="font-mono text-emerald-400">+฿{profitAmount} บาท/ชิ้น</span>
                  </div>
                </div>
              )}
            </div>

            {/* Wisdom card */}
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <strong className="font-bold flex items-center gap-1.5 font-['Prompt'] text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>ข้อคิดความละเอียดรอบคอบสำหรับนักศึกษา ปวส.</span>
              </strong>
              <p className="leading-relaxed">
                ในการทำธุรกิจจริง หากผู้ขายตั้งราคาขายโดยนำต้นทุน 100 บาท มาบวกกำไรดื้อๆ 25 บาท เป็น 125 บาท
                เมื่อนำไปขายบนแพลตฟอร์มที่หักค่าธรรมเนียม 8% (10 บาท) ค่าส่งฟรี 35 บาท และค่าแอด 15% (18 บาท)
                ร้านค้าจะเหลือเงินเพียง 62 บาท ซึ่งหมายถึง <strong>ขาดทุนทันที 38 บาทต่อชิ้น!</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
