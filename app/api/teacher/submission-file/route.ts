import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  if (!await apiProfile(request, "teacher")) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const admin = createAdminClient();
  const { data } = await admin.from("submissions").select("file_path").eq("id", new URL(request.url).searchParams.get("id")).single();
  if (!data?.file_path) return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 404 });
  const { data: link, error } = await admin.storage.from("submissions").createSignedUrl(data.file_path, 60);
  if (error) return NextResponse.json({ error: "เปิดไฟล์ไม่สำเร็จ" }, { status: 500 });
  return NextResponse.redirect(link.signedUrl);
}
