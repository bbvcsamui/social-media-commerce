import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { gradebook } from "@/lib/gradebook";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  if (!await apiProfile(request, "teacher")) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  try { return NextResponse.json(await gradebook(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "โหลดคะแนนไม่สำเร็จ" }, { status: 500 }); }
}
export async function PATCH(request: Request) {
  if (!await apiProfile(request, "teacher")) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const admin = createAdminClient();
  if (body?.type === "affective") {
    const { data: student } = await admin.from("profiles").select("id").eq("id", body.student_id).eq("role", "student").single();
    if (!student || !Number.isInteger(body.score) || body.score < 0 || body.score > 20) return NextResponse.json({ error: "คะแนนต้องอยู่ในช่วง 0–20" }, { status: 400 });
    const scores = { total: body.score };
    const { error } = await admin.from("affective_scores").upsert({ student_id: student.id, scores, updated_at: new Date().toISOString() });
    return NextResponse.json(error ? { error: "บันทึกไม่สำเร็จ" } : { ok: true }, { status: error ? 500 : 200 });
  }
  if (body?.type !== "submission" || typeof body.id !== "string" || typeof body.feedback !== "string" || body.feedback.length > 5000 || typeof body.score !== "number" || !Number.isFinite(body.score)) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { data: submission } = await admin.from("submissions").select("assignment_id").eq("id", body.id).single();
  const { data: assignment } = submission ? await admin.from("assignments").select("max_score").eq("id", submission.assignment_id).single() : { data: null };
  if (!assignment || body.score < 0 || body.score > Number(assignment.max_score)) return NextResponse.json({ error: "คะแนนเกินช่วงที่กำหนด" }, { status: 400 });
  const { error } = await admin.from("submissions").update({ score: body.score, feedback: body.feedback, graded_at: new Date().toISOString() }).eq("id", body.id);
  return NextResponse.json(error ? { error: "บันทึกไม่สำเร็จ" } : { ok: true }, { status: error ? 500 : 200 });
}
