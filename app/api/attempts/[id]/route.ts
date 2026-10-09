import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { AssessmentError, publicAttempt, saveAnswers, submitAttempt } from "@/lib/assessment";
type Context = { params: Promise<{ id: string }> };
export const maxDuration = 30;
async function handle(request: Request, context: Context) {
  const profile = await apiProfile(request, "student");
  if (!profile) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบนักศึกษา" }, { status: 403 });
  try {
    const { id } = await context.params;
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw new AssessmentError("ไม่พบการสอบ", 404);
    if (request.method === "GET") return NextResponse.json(await publicAttempt(id, profile.id), { headers: { "Cache-Control": "no-store" } });
    const body = await request.json().catch(() => null);
    if (!body || JSON.stringify(body).length > 20000) throw new AssessmentError("คำตอบไม่ถูกต้อง");
    if (request.method === "PATCH") { await saveAnswers(id, profile.id, body.answers); return NextResponse.json({ saved: true }); }
    return NextResponse.json(await submitAttempt(id, profile.id, body.answers));
  } catch (e) { return NextResponse.json({ error: e instanceof AssessmentError ? e.message : "บันทึกการสอบไม่สำเร็จ" }, { status: e instanceof AssessmentError ? e.status : 500 }); }
}
export const GET = handle;
export const PATCH = handle;
export const POST = handle;
