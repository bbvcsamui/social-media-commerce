"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  AlertTriangle,
} from "lucide-react";

interface QuestionItem {
  text: string;
  choices: string[];
  answer: number;
  explanation: string;
}

interface Props {
  unitNumber: number;
  unitTitle: string;
  kind: "pretest" | "posttest";
  questions: QuestionItem[];
}

export function QuizRunner({ unitNumber, unitTitle, kind, questions }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const totalQuestions = questions.length;
  const isPosttest = kind === "posttest";
  const passThreshold = Math.ceil(totalQuestions * 0.6); // 60%

  function handleSelect(qIdx: number, choiceIdx: number) {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: choiceIdx }));
  }

  function handleSubmit() {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correct++;
      }
    });
    setScore(correct);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const percent = Math.round((score / totalQuestions) * 100);
  const isPassed = score >= passThreshold;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold font-['Prompt'] ${
                kind === "pretest"
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300"
              }`}
            >
              {kind === "pretest" ? "แบบทดสอบก่อนเรียน" : "แบบทดสอบหลังเรียน (เก็บคะแนน)"}
            </span>
            <h1 className="font-['Prompt'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-2">
              หน่วยที่ {unitNumber}: {unitTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {kind === "pretest"
                ? "เพื่อวัดความรู้พื้นฐานก่อนเริ่มเรียน (ไม่เก็บคะแนนในเกรด)"
                : `เกณฑ์ผ่าน 60% (${passThreshold}/${totalQuestions} ข้อ) เพื่อบันทึกผลและปลดล็อก`}
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold font-['Prompt'] text-slate-800 dark:text-slate-100">
              {answeredCount}/{totalQuestions}
            </span>
            <div className="text-[11px] text-slate-500">ตอบแล้ว</div>
          </div>
        </div>
      </div>

      {/* Result Card (shown after submission) */}
      {submitted && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border shadow-md mb-8 transition-all ${
            isPassed || kind === "pretest"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="text-center">
            {isPassed || kind === "pretest" ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
            )}

            <h2 className="font-['Prompt'] text-2xl font-bold text-slate-900 dark:text-white">
              {kind === "pretest"
                ? "บันทึกผลก่อนเรียนเรียบร้อย"
                : isPassed
                ? "ยินดีด้วย! คุณผ่านเกณฑ์การทดสอบ"
                : "ยังไม่ผ่านเกณฑ์ 60% กรุณาทบทวนบทเรียน"}
            </h2>

            <div className="mt-4 flex items-center justify-center gap-6">
              <div>
                <div className="text-3xl font-extrabold font-['Prompt'] text-slate-900 dark:text-white">
                  {score} / {totalQuestions}
                </div>
                <div className="text-xs text-slate-500">คะแนนที่ได้</div>
              </div>
              <div className="h-8 w-px bg-slate-300 dark:bg-slate-700" />
              <div>
                <div className="text-3xl font-extrabold font-['Prompt'] text-slate-900 dark:text-white">
                  {percent}%
                </div>
                <div className="text-xs text-slate-500">คิดเป็นร้อยละ</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {isPosttest && !isPassed && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold shadow-sm hover:bg-orange-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>ลองทำใหม่อีกครั้ง</span>
                </button>
              )}
              <Link
                href={`/learn/unit/${unitNumber}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
              >
                <span>กลับสู่เนื้อหาบทเรียน</span>
              </Link>
              {isPosttest && isPassed && unitNumber < 9 && (
                <Link
                  href={`/learn/unit/${unitNumber + 1}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold shadow-sm hover:bg-purple-700"
                >
                  <span>ไปหน่วยที่ {unitNumber + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const selectedChoice = selectedAnswers[qIdx];
          const isCorrect = selectedChoice === q.answer;

          return (
            <div
              key={qIdx}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                submitted
                  ? isCorrect
                    ? "border-emerald-300 dark:border-emerald-800"
                    : "border-rose-300 dark:border-rose-800"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center shrink-0">
                  {qIdx + 1}
                </span>
                <h3 className="font-['Prompt'] font-semibold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                  {q.text}
                </h3>
              </div>

              {/* Choices */}
              <div className="space-y-2 pl-10">
                {q.choices.map((choice, cIdx) => {
                  const isThisSelected = selectedChoice === cIdx;
                  const isThisAnswer = q.answer === cIdx;

                  let style = "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800";
                  if (submitted) {
                    if (isThisAnswer) {
                      style = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold";
                    } else if (isThisSelected && !isThisAnswer) {
                      style = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 line-through";
                    }
                  } else if (isThisSelected) {
                    style = "bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-900 dark:text-orange-200 font-semibold";
                  }

                  const choiceLetters = ["ก", "ข", "ค", "ง"];

                  return (
                    <button
                      key={cIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelect(qIdx, cIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-3 transition-colors ${style}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {choiceLetters[cIdx]}
                      </span>
                      <span className="flex-1">{choice}</span>
                      {submitted && isThisAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {submitted && isThisSelected && !isThisAnswer && (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {submitted && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 pl-10 text-xs text-slate-600 dark:text-slate-400">
                  <strong className="text-slate-800 dark:text-slate-200">คำอธิบาย:</strong>{" "}
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="mt-8 text-center sticky bottom-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="flex items-center justify-between max-w-xl mx-auto gap-4">
            <span className="text-xs text-slate-500">
              ตอบแล้ว {answeredCount} จาก {totalQuestions} ข้อ
            </span>
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 text-white font-['Prompt'] font-semibold text-sm shadow-md hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              ส่งคำตอบและตรวจผล
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
