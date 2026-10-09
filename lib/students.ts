import type { SupabaseClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import Papa from "papaparse";

export function parseStudents(csv: string) {
  const parsed = Papa.parse<Record<string, string>>(csv.replace(/^\uFEFF/, ""), { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim().toLowerCase() });
  const errors: string[] = parsed.errors.map(e => `แถว ${(e.row ?? 0) + 2}: ${e.message}`);
  if (!parsed.meta.fields?.includes("student_code") || !parsed.meta.fields?.includes("full_name")) errors.push("ต้องมีหัวคอลัมน์ student_code,full_name");
  if (!parsed.data.length || parsed.data.length > 500) errors.push("ไฟล์ต้องมีรายชื่อ 1–500 คน");
  const seen = new Set<string>();
  const students = parsed.data.map((row, i) => {
    const student_code = (row.student_code || "").trim();
    const full_name = (row.full_name || "").trim();
    if (!/^\d{5,20}$/.test(student_code)) errors.push(`แถว ${i + 2}: รหัสนักศึกษาต้องเป็นตัวเลข 5–20 หลัก`);
    if (!full_name || full_name.length > 200) errors.push(`แถว ${i + 2}: กรุณาระบุชื่อไม่เกิน 200 ตัวอักษร`);
    if (seen.has(student_code)) errors.push(`แถว ${i + 2}: รหัส ${student_code} ซ้ำในไฟล์`);
    seen.add(student_code);
    return { student_code, full_name };
  });
  return { students, errors };
}

export async function addStudents(admin: SupabaseClient, students: { student_code: string; full_name: string }[], initialPassword?: string) {
  const results: { student_code: string; full_name: string; status: "created" | "skipped" | "failed"; password?: string; error?: string }[] = [];
  for (const student of students) {
    const { data: existing, error: lookupError } = await admin.from("profiles").select("id").eq("student_code", student.student_code).maybeSingle();
    if (lookupError) { results.push({ ...student, status: "failed", error: "ตรวจสอบบัญชีเดิมไม่สำเร็จ" }); continue; }
    if (existing) { results.push({ ...student, status: "skipped" }); continue; }
    const password = initialPassword || randomBytes(12).toString("base64url");
    const { data, error } = await admin.auth.admin.createUser({ email: `${student.student_code}@student.local`, password, email_confirm: true, user_metadata: { full_name: student.full_name } });
    if (error || !data.user) { results.push({ ...student, status: "failed", error: "สร้างบัญชีไม่สำเร็จ อาจมีอีเมลนี้อยู่แล้ว" }); continue; }
    const { error: profileError } = await admin.from("profiles").insert({ id: data.user.id, role: "student", ...student, must_change_password: true });
    if (profileError) {
      const { error: rollbackError } = await admin.auth.admin.deleteUser(data.user.id);
      results.push({ ...student, status: "failed", error: rollbackError ? "บันทึกรายชื่อไม่สำเร็จ กรุณาติดต่อผู้ดูแลเพื่อตรวจบัญชีค้าง" : "บันทึกรายชื่อไม่สำเร็จ กรุณาลองใหม่" });
      continue;
    }
    results.push({ ...student, status: "created", password });
  }
  return results;
}
