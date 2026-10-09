import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { apiProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!await apiProfile(request, "teacher")) return NextResponse.json({ error: "เฉพาะอาจารย์ที่เข้าสู่ระบบเท่านั้น" }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "ตั้งรหัสใหม่" || !Array.isArray(body.student_codes) || !body.student_codes.length || body.student_codes.length > 25 || !body.student_codes.every((code: unknown) => typeof code === "string" && /^\d{5,20}$/.test(code))) {
    return NextResponse.json({ error: "กรุณายืนยันการตั้งรหัสผ่านใหม่ และเลือกไม่เกิน 25 คนต่อชุด" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: students, error } = await admin.from("profiles").select("id,student_code,full_name,must_change_password").eq("role", "student").in("student_code", [...new Set(body.student_codes)]);
  if (error || !students?.length) return NextResponse.json({ error: "ไม่พบรายชื่อนักศึกษา" }, { status: 400 });
  const results = [];
  for (const student of students) {
    const { data: account, error: accountError } = await admin.auth.admin.getUserById(student.id);
    if (accountError || account.user.email !== `${student.student_code}@student.local`) {
      results.push({ student_code: student.student_code, full_name: student.full_name, status: "failed", error: "ข้อมูลบัญชีเข้าสู่ระบบไม่ตรงกับรหัสนักศึกษา" });
      continue;
    }
    const password = randomBytes(12).toString("base64url");
    const { error: flagError } = await admin.from("profiles").update({ must_change_password: true }).eq("id", student.id).eq("role", "student");
    if (flagError) { results.push({ student_code: student.student_code, full_name: student.full_name, status: "failed", error: "บันทึกเงื่อนไขเปลี่ยนรหัสผ่านไม่สำเร็จ" }); continue; }
    const { error: passwordError } = await admin.auth.admin.updateUserById(student.id, { password });
    if (passwordError) {
      await admin.from("profiles").update({ must_change_password: student.must_change_password }).eq("id", student.id);
      results.push({ student_code: student.student_code, full_name: student.full_name, status: "failed", error: "ตั้งรหัสผ่านไม่สำเร็จ" });
      continue;
    }
    results.push({ student_code: student.student_code, full_name: student.full_name, status: "reset", password });
  }
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
