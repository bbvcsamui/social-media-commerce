import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export async function POST(request: Request) {
  const profile = await apiProfile(request, "student");
  if (!profile) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบนักศึกษา" }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (!body || !Number.isInteger(body.assignment_id) || typeof body.note !== "string" || body.note.length > 5000) return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  const admin = createAdminClient();
  const { data: assignment } = await admin.from("assignments").select("id,unit_id,due_at").eq("id", body.assignment_id).single();
  const { data: unit } = assignment ? await admin.from("units").select("published").eq("id", assignment.unit_id).single() : { data: null };
  if (!assignment || !unit?.published) return NextResponse.json({ error: "ไม่พบใบงานที่เปิดใช้งาน" }, { status: 404 });
  let link: string | null = null;
  let path: string | null = null;
  if (body.link_url) {
    try { const parsed = new URL(body.link_url); if (!["https:","http:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.href.length > 2000) throw Error(); link = parsed.href; }
    catch { return NextResponse.json({ error: "ลิงก์ต้องเป็น http หรือ https" }, { status: 400 }); }
  } else if (typeof body.file_path === "string" && body.file_path.startsWith(profile.id + "/") && /^[a-zA-Z0-9/._-]+$/.test(body.file_path) && !body.file_path.includes("..")) {
    const parts = body.file_path.split("/");
    const filename = parts.pop()!;
    const { data, error } = await admin.storage.from("submissions").list(parts.join("/"), { search: filename });
    const file = data?.find(f => f.name === filename);
    if (error || !file || !file.metadata || Number(file.metadata.size) > 10485760) return NextResponse.json({ error: "ไม่พบไฟล์ที่อัปโหลด หรือไฟล์ใหญ่เกิน 10 MB" }, { status: 400 });
    path = body.file_path;
  } else return NextResponse.json({ error: "กรุณาส่งไฟล์หรือลิงก์งาน" }, { status: 400 });
  const { error } = await admin.from("submissions").upsert({ assignment_id: assignment.id, student_id: profile.id, file_path: path,
    file_name: path && typeof body.file_name === "string" ? body.file_name.slice(0,200) : null,
    link_url: link, note: body.note, submitted_at: new Date().toISOString(), is_late: assignment.due_at ? Date.parse(assignment.due_at) < Date.now() : false,
    score: null, rubric_scores: null, feedback: null, graded_at: null,
  }, { onConflict: "assignment_id,student_id" });
  if (error) return NextResponse.json({ error: "บันทึกงานไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  return NextResponse.json({ saved: true });
}
