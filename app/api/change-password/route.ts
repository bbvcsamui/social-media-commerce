import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (typeof body?.password !== "string" || body.password.length < 8) return NextResponse.json({ error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  const { error } = await supabase.auth.updateUser({ password: body.password });
  if (error) return NextResponse.json({ error: "กรุณาใช้รหัสผ่านที่รัดกุมและต่างจากเดิม" }, { status: 400 });
  const { data: profile, error: profileError } = await createAdminClient().from("profiles")
    .update({ must_change_password: false }).eq("id", user.id).select("role").single();
  if (profileError || !profile) return NextResponse.json({ error: "เปลี่ยนรหัสผ่านแล้ว แต่บันทึกสถานะไม่สำเร็จ กรุณาติดต่ออาจารย์" }, { status: 500 });
  return NextResponse.json({ role: profile.role });
}
