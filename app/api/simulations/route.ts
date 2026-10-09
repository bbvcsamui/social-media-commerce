import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request: Request) {
  const profile = await apiProfile(request, "student");
  if (!profile) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบนักศึกษา" }, { status: 403 });
  const body = await request.json().catch(() => null);
  let score = 0;
  if (body?.key === "slip") {
    const expected = ["approve", "reject", "reject", "reject"];
    if (!body.answers || !expected.every((_,i) => ["approve","reject"].includes(body.answers[i+1]))) return NextResponse.json({ error: "กรุณาทำภารกิจให้ครบ" }, { status: 400 });
    score = expected.filter((answer,i) => body.answers[i+1] === answer).length * 25;
  } else if (body?.key === "chat") {
    const scores = [[0,10,4],[2,10,6],[10,0,5]];
    if (!body.answers || !scores.every((_,i) => Number.isInteger(body.answers[i+1]) && body.answers[i+1] >= 0 && body.answers[i+1] <= 2)) return NextResponse.json({ error: "กรุณาทำภารกิจให้ครบ" }, { status: 400 });
    score = Math.round(scores.reduce((sum,s,i) => sum + s[body.answers[i+1]],0) / 30 * 100);
  } else if (body?.key === "pricing") {
    const p = body.inputs;
    const keys = ["productCost","packagingCost","shippingCost","platformFeePercent","marketingPercent","targetMarginPercent","answer"];
    if (!p || !keys.every(k => typeof p[k] === "number" && Number.isFinite(p[k]) && p[k] >= 0 && p[k] <= 1e7) || typeof p.freeShipping !== "boolean") return NextResponse.json({ error: "ข้อมูลการคำนวณไม่ถูกต้อง" }, { status: 400 });
    const deduction = (p.platformFeePercent + p.marketingPercent + p.targetMarginPercent) / 100;
    const cost = p.productCost + p.packagingCost + (p.freeShipping ? p.shippingCost : 0);
    if (deduction >= 1 || cost <= 0) return NextResponse.json({ error: "ต้นทุนต้องมากกว่า 0 และสัดส่วนรวมต้องน้อยกว่า 100%" }, { status: 400 });
    score = Math.abs(p.answer - Math.ceil(cost / (1 - deduction))) < 1 ? 100 : 0;
  } else return NextResponse.json({ error: "ไม่พบกิจกรรม" }, { status: 400 });
  const admin = createAdminClient();
  // Compare-and-swap avoids losing a better score or play count on concurrent saves.
  for (let retry = 0; retry < 5; retry++) {
    const { data: previous, error } = await admin.from("simulation_results").select("best_score,plays,updated_at").eq("student_id",profile.id).eq("sim_key",body.key).maybeSingle();
    if (error) break;
    const values = { student_id: profile.id, sim_key: body.key, best_score: Math.max(score,previous?.best_score || 0), last_score: score, plays: (previous?.plays || 0)+1, updated_at: new Date().toISOString() };
    if (!previous) {
      const { error: insertError } = await admin.from("simulation_results").insert(values);
      if (!insertError) return NextResponse.json({ score });
      if (insertError.code === "23505") continue;
      break;
    }
    const { data, error: updateError } = await admin.from("simulation_results").update(values).eq("student_id",profile.id).eq("sim_key",body.key).eq("updated_at",previous.updated_at).select("student_id").maybeSingle();
    if (updateError) break;
    if (data) return NextResponse.json({ score });
  }
  return NextResponse.json({ error: "บันทึกผลไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
}
