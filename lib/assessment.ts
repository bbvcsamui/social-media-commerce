import "server-only";
import { createHash, randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export class AssessmentError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function shuffle<T>(items: T[]) {
  const output = [...items];
  for (let i = output.length - 1; i > 0; i--) { const j = randomInt(i + 1); [output[i], output[j]] = [output[j], output[i]]; }
  return output;
}
function slotId(student: string, assessment: number, slot: number) {
  const hex = createHash("sha256").update(`course-attempt-v1:${student}:${assessment}:${slot}`).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-8${hex.slice(17,20)}-${hex.slice(20,32)}`;
}
export async function getAssessment(kind: string, unitNumber?: number) {
  if (!["pretest", "posttest", "midterm", "final"].includes(kind)) throw new AssessmentError("ไม่พบแบบทดสอบ", 404);
  const admin = createAdminClient();
  let query = admin.from("assessments").select("*").eq("kind", kind);
  if (kind === "pretest" || kind === "posttest") {
    const { data: unit } = await admin.from("units").select("id").eq("number", unitNumber).eq("published", true).single();
    if (!unit) throw new AssessmentError("ไม่พบหน่วยเรียน", 404);
    query = query.eq("unit_id", unit.id);
  } else query = query.is("unit_id", null);
  const { data, error } = await query.single();
  if (error || !data) throw new AssessmentError("ไม่พบแบบทดสอบ", 404);
  return data;
}
export async function attemptHistory(studentId: string, assessmentId: number) {
  const { data, error } = await createAdminClient().from("attempts").select("id,score,max_score,submitted_at,started_at").eq("student_id", studentId).eq("assessment_id", assessmentId).order("started_at");
  if (error) throw new AssessmentError("โหลดประวัติการสอบไม่สำเร็จ", 500);
  return data;
}
async function ownAttempt(id: string, studentId: string) {
  const { data, error } = await createAdminClient().from("attempts").select("*").eq("id", id).eq("student_id", studentId).single();
  if (error || !data) throw new AssessmentError("ไม่พบการสอบของคุณ", 404);
  return data;
}
export async function startAttempt(studentId: string, assessmentId: number) {
  const admin = createAdminClient();
  const { data: assessment } = await admin.from("assessments").select("*").eq("id", assessmentId).single();
  if (!assessment?.is_open) throw new AssessmentError("แบบทดสอบยังไม่เปิด", 403);
  if (assessment.unit_id) {
    const { data: unit } = await admin.from("units").select("published").eq("id", assessment.unit_id).single();
    if (!unit?.published) throw new AssessmentError("หน่วยเรียนยังไม่เปิด", 403);
  }
  const { data: existing, error } = await admin.from("attempts").select("*").eq("student_id", studentId).eq("assessment_id", assessmentId).order("started_at");
  if (error) throw new AssessmentError("โหลดประวัติการสอบไม่สำเร็จ", 500);
  const active = existing.find(attempt => !attempt.submitted_at);
  if (active) return publicAttempt(active.id, studentId);
  if (existing.length >= assessment.max_attempts) throw new AssessmentError("ใช้สิทธิ์สอบครบแล้ว", 409);
  const { data: units, error: unitsError } = await admin.from("units").select("id,number").eq("published", true);
  if (unitsError) throw new AssessmentError("โหลดหน่วยเรียนไม่สำเร็จ", 500);
  const ids = assessment.unit_id ? [assessment.unit_id] : units.filter(u => assessment.unit_numbers.includes(u.number)).map(u => u.id);
  const { data: bank, error: bankError } = await admin.from("questions").select("id,choices").in("unit_id", ids);
  if (bankError || !bank || bank.length < assessment.question_count) throw new AssessmentError("คลังข้อสอบไม่เพียงพอ", 503);
  const selected = shuffle(bank).slice(0, assessment.question_count);
  const id = slotId(studentId, assessmentId, existing.length);
  const now = new Date();
  const { error: insertError } = await admin.from("attempts").insert({
    id, student_id: studentId, assessment_id: assessmentId,
    question_ids: selected.map(q => q.id), choice_orders: Object.fromEntries(selected.map(q => [q.id, shuffle(q.choices.map((_: string, i: number) => i))])),
    answers: {}, max_score: selected.length, started_at: now.toISOString(),
    expires_at: assessment.time_limit_minutes ? new Date(now.getTime() + assessment.time_limit_minutes * 60000).toISOString() : null,
  });
  // The deterministic slot primary key makes concurrent starts share one attempt.
  if (insertError && insertError.code !== "23505") throw new AssessmentError("เริ่มสอบไม่สำเร็จ", 500);
  return publicAttempt(id, studentId);
}
export async function publicAttempt(id: string, studentId: string) {
  let attempt = await ownAttempt(id, studentId);
  if (!attempt.submitted_at && attempt.expires_at && Date.parse(attempt.expires_at) <= Date.now()) {
    await submitAttempt(id, studentId);
    attempt = await ownAttempt(id, studentId);
  }
  const admin = createAdminClient();
  const { data: bank, error } = await admin.from("questions").select("id,text,choices").in("id", attempt.question_ids);
  if (error || !bank || bank.length !== attempt.question_ids.length) throw new AssessmentError("โหลดข้อสอบไม่สำเร็จ", 500);
  return {
    id: attempt.id, expiresAt: attempt.expires_at, submitted: Boolean(attempt.submitted_at), score: attempt.score, maxScore: attempt.max_score,
    answers: attempt.answers,
    questions: attempt.question_ids.map((qid: number) => {
      const q = bank.find(q => q.id === qid)!;
      return { id: q.id, text: q.text, choices: attempt.choice_orders[qid].map((index: number) => q.choices[index]) };
    }),
  };
}
function validateAnswers(answers: unknown, attempt: { question_ids: number[]; choice_orders: Record<string, number[]> }) {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) throw new AssessmentError("คำตอบไม่ถูกต้อง");
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(answers)) {
    if (!attempt.question_ids.includes(Number(key)) || typeof value !== "number" || !Number.isInteger(value) || value < 0 || value >= attempt.choice_orders[key]?.length) throw new AssessmentError("ตัวเลือกไม่ถูกต้อง");
    result[key] = value;
  }
  return result;
}
export async function saveAnswers(id: string, studentId: string, answers: unknown) {
  const attempt = await ownAttempt(id, studentId);
  if (attempt.submitted_at) throw new AssessmentError("ส่งข้อสอบแล้ว", 409);
  if (attempt.expires_at && Date.parse(attempt.expires_at) <= Date.now()) { await submitAttempt(id, studentId); throw new AssessmentError("หมดเวลาสอบแล้ว", 409); }
  const validated = validateAnswers(answers, attempt);
  const { data, error } = await createAdminClient().from("attempts").update({ answers: validated }).eq("id", id).eq("student_id", studentId).is("submitted_at", null).select("id").maybeSingle();
  if (error) throw new AssessmentError("บันทึกคำตอบไม่สำเร็จ", 500);
  if (!data) throw new AssessmentError("ส่งข้อสอบแล้ว", 409);
}
export async function submitAttempt(id: string, studentId: string, answers?: unknown) {
  const attempt = await ownAttempt(id, studentId);
  if (attempt.submitted_at) return { score: attempt.score, maxScore: attempt.max_score, submitted: true };
  const expired = attempt.expires_at && Date.parse(attempt.expires_at) <= Date.now();
  const finalAnswers = answers === undefined || expired ? attempt.answers : validateAnswers(answers, attempt);
  const admin = createAdminClient();
  const { data: bank, error } = await admin.from("questions").select("id,answer_index").in("id", attempt.question_ids);
  if (error || !bank || bank.length !== attempt.question_ids.length) throw new AssessmentError("ตรวจคำตอบไม่สำเร็จ", 500);
  const score = bank.filter(q => finalAnswers[q.id] !== undefined && attempt.choice_orders[q.id][finalAnswers[q.id]] === q.answer_index).length;
  const { data: saved, error: saveError } = await admin.from("attempts").update({ answers: finalAnswers, score, submitted_at: new Date().toISOString() }).eq("id", id).eq("student_id", studentId).is("submitted_at", null).select("score,max_score").maybeSingle();
  if (saveError) throw new AssessmentError("บันทึกคะแนนไม่สำเร็จ กรุณาส่งอีกครั้ง", 500);
  const result = saved || await ownAttempt(id, studentId);
  return { score: result.score, maxScore: result.max_score, submitted: true };
}
