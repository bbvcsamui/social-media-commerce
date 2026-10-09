import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { addStudents, parseStudents } from "@/lib/students";
export const maxDuration = 60;

async function authorize(request: Request, write = false) {
  if (write && request.headers.get("origin") !== new URL(request.url).origin) return false;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;
  const { data } = await client.from("profiles").select("role,must_change_password").eq("id", user.id).single();
  return data?.role === "teacher" && !data.must_change_password;
}
const forbidden = () => NextResponse.json({ error: "เฉพาะอาจารย์ที่เข้าสู่ระบบเท่านั้น" }, { status: 403 });

export async function GET(request: Request) {
  if (!await authorize(request)) return forbidden();
  const { data, error } = await (await createClient()).from("profiles").select("id,student_code,full_name,must_change_password,created_at").eq("role", "student").order("student_code").limit(10000);
  if (error) return NextResponse.json({ error: "โหลดรายชื่อไม่สำเร็จ" }, { status: 500 });
  return NextResponse.json({ students: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!await authorize(request, true)) return forbidden();
  const raw = await request.text();
  if (raw.length > 1_000_000) return NextResponse.json({ error: "ไฟล์ใหญ่เกินกำหนด" }, { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 }); }
  if (typeof body.csv !== "string") return NextResponse.json({ error: "ไม่พบข้อมูล CSV" }, { status: 400 });
  if (body.password !== undefined && (typeof body.password !== "string" || body.password.length < 8 || body.password.length > 72)) return NextResponse.json({ error: "รหัสผ่านเริ่มต้นต้องมี 8–72 ตัวอักษร" }, { status: 400 });
  const parsed = parseStudents(body.csv);
  if (parsed.errors.length) return NextResponse.json({ error: "กรุณาแก้ไขไฟล์ก่อนนำเข้า", errors: parsed.errors }, { status: 400 });
  if (parsed.students.length > 25) return NextResponse.json({ error: "กรุณาส่งรายชื่อเป็นชุดไม่เกิน 25 คน" }, { status: 400 });
  const results = await addStudents(createAdminClient(), parsed.students, body.password);
  return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  if (!await authorize(request, true)) return forbidden();
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string" || typeof body.full_name !== "string" || !body.full_name.trim() || body.full_name.length > 200) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const { data, error } = await createAdminClient().from("profiles").update({ full_name: body.full_name.trim() }).eq("id", body.id).eq("role", "student").select("id").single();
  if (error || !data) return NextResponse.json({ error: "บันทึกชื่อไม่สำเร็จ" }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!await authorize(request, true)) return forbidden();
  const body = await request.json().catch(() => null);
  if (typeof body?.id !== "string" || typeof body.student_code !== "string") return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("id").eq("id", body.id).eq("student_code", body.student_code).eq("role", "student").single();
  if (!data) return NextResponse.json({ error: "ไม่พบนักศึกษา" }, { status: 404 });
  const { error } = await admin.auth.admin.deleteUser(data.id);
  if (error) return NextResponse.json({ error: "ลบบัญชีไม่สำเร็จ" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
