"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
type Attempt = { id: string; expiresAt: string | null; submitted: boolean; score: number | null; maxScore: number; answers: Record<string, number>; questions: { id: number; text: string; choices: string[] }[] };
export function QuizRunner({ assessment, history = [] }: { assessment: { id: number; title: string; kind: string; question_count: number; max_attempts: number; time_limit_minutes: number | null; is_open: boolean }; history?: { id: string; score: number | null; max_score: number; submitted_at: string | null }[] }) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [seconds, setSeconds] = useState<number | null>(null);
  const answersRef = useRef(answers); answersRef.current = answers;
  const submitting = useRef(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const finished = useRef(new Set<string>());
  async function request(url: string, method: string, body?: unknown) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), cache: "no-store" });
    const data = await response.json(); if (!response.ok) throw Error(data.error || "เชื่อมต่อไม่สำเร็จ"); return data;
  }
  async function start() {
    setBusy(true); setError(""); setNotice("");
    try { const data = await request(`/api/assessments/${assessment.id}/attempts`, "POST"); setAttempt(data); setAnswers(data.answers); }
    catch (e) { setError(e instanceof Error ? e.message : "เริ่มสอบไม่สำเร็จ"); }
    finally { setBusy(false); }
  }
  async function submit() {
    if (!attempt || submitting.current || attempt.submitted) return;
    submitting.current = true; setBusy(true); setError("");
    try { const data = await request(`/api/attempts/${attempt.id}`, "POST", { answers: answersRef.current }); finished.current.add(attempt.id); setAttempt(prev => prev ? { ...prev, ...data } : prev); setNotice("ตรวจคำตอบและบันทึกคะแนนในระบบเรียบร้อยแล้ว"); }
    catch (e) { setError(e instanceof Error ? e.message : "บันทึกคะแนนไม่สำเร็จ กรุณาส่งอีกครั้ง"); }
    finally { setBusy(false); submitting.current = false; }
  }
  useEffect(() => {
    if (!attempt || attempt.submitted || !attempt.expiresAt) { setSeconds(null); return; }
    const tick = () => setSeconds(Math.max(0, Math.ceil((Date.parse(attempt.expiresAt!) - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [attempt]);
  useEffect(() => { if (seconds === 0 && attempt && !attempt.submitted && !busy && !error) void submit(); }, [seconds, busy, attempt, error]);
  useEffect(() => {
    if (!attempt || attempt.submitted || !Object.keys(answers).length) return;
    const timer = setTimeout(() => {
      saveQueue.current = saveQueue.current.catch(() => {}).then(async () => {
        if (submitting.current || finished.current.has(attempt.id)) return;
        await request(`/api/attempts/${attempt.id}`, "PATCH", { answers });
        setNotice("บันทึกคำตอบล่าสุดแล้ว");
      }).catch(e => { if (!submitting.current && !finished.current.has(attempt.id)) setError(e.message); });
    }, 600);
    return () => clearTimeout(timer);
  }, [answers, attempt?.id, attempt?.submitted]);
  return <section className="max-w-3xl mx-auto p-6 space-y-6">
    <h1 className="text-2xl font-bold">{assessment.title}</h1>
    <p>{assessment.question_count} ข้อ · ทำได้ {assessment.max_attempts} ครั้ง{assessment.time_limit_minutes ? ` · เวลา ${assessment.time_limit_minutes} นาที` : ""}</p>
    {history.length > 0 && <div className="border rounded-xl p-4"><h2 className="font-bold">ประวัติการสอบ</h2>{history.map((item,index) => <p key={item.id}>ครั้งที่ {index+1}: {item.submitted_at ? `${item.score}/${item.max_score} คะแนน` : "ยังทำไม่เสร็จ กดทำต่อเพื่อเปิดชุดเดิม"}</p>)}</div>}
    {error && <p role="alert" className="text-red-600 whitespace-pre-line">{error}</p>}
    {notice && <p role="status" className="text-emerald-700">{notice}</p>}
    {!attempt && <><p>กดเริ่มเพื่อสุ่มข้อสอบและเริ่มนับสิทธิ์สอบ หากมีการสอบค้าง ระบบจะเปิดชุดเดิมให้ทำต่อ</p><button disabled={busy || !assessment.is_open} onClick={() => void start()} className="bg-orange-600 text-white rounded-xl px-5 py-3">{busy ? "กำลังโหลด..." : assessment.is_open ? "เริ่มสอบ / ทำต่อ" : "ยังไม่เปิดสอบ"}</button></>}
    {attempt?.submitted && <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950"><h2 className="text-xl font-bold">ผลสอบที่บันทึกแล้ว</h2><p className="text-3xl">{attempt.score} / {attempt.maxScore}</p><p>{Math.round((attempt.score || 0) / attempt.maxScore * 100)}% · {(attempt.score || 0) >= Math.ceil(attempt.maxScore * .6) ? "ผ่านเกณฑ์ 60%" : "ยังไม่ผ่านเกณฑ์ 60%"}</p><button disabled={busy} className="underline mt-3" onClick={() => { setAttempt(null); setAnswers({}); setNotice(""); }}>กลับหน้าเริ่มสอบ</button></div>}
    {attempt && !attempt.submitted && <>
      <div className="sticky top-16 p-3 bg-white dark:bg-slate-900 border rounded-xl z-10">ตอบแล้ว {Object.keys(answers).length}/{attempt.questions.length}{seconds !== null && <span className="ml-4">เหลือ {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>}</div>
      {attempt.questions.map((q, index) => <fieldset key={q.id} disabled={busy || seconds === 0} className="p-5 border rounded-xl space-y-3"><legend className="font-bold px-2">{index + 1}. {q.text}</legend>{q.choices.map((choice, c) => <label key={c} className="flex gap-3 p-3 border rounded-lg cursor-pointer"><input type="radio" name={`q-${q.id}`} checked={answers[q.id] === c} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: c }))} />{choice}</label>)}</fieldset>)}
      <button disabled={busy} onClick={() => void submit()} className="bg-orange-600 text-white rounded-xl px-5 py-3">{busy ? "กำลังบันทึก..." : `ส่งคำตอบ (${Object.keys(answers).length}/${attempt.questions.length} ข้อ)`}</button>
    </>}
    <Link href="/learn" className="block underline">กลับหน้าบทเรียน</Link>
  </section>;
}
