import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { AssessmentError, startAttempt } from "@/lib/assessment";
export const maxDuration = 30;
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await apiProfile(request, "student");
  if (!profile) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบนักศึกษา" }, { status: 403 });
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) throw new AssessmentError("ไม่พบแบบทดสอบ", 404);
    return NextResponse.json(await startAttempt(profile.id, id), { headers: { "Cache-Control": "no-store" } });
  } catch (e) { return NextResponse.json({ error: e instanceof AssessmentError ? e.message : "เริ่มสอบไม่สำเร็จ", code: e instanceof AssessmentError ? e.code : e instanceof Error ? e.name : "UNKNOWN" }, { status: e instanceof AssessmentError ? e.status : 500 }); }
}
