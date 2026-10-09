import { NextResponse } from "next/server";
import { apiProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export async function GET(request: Request) {
  if (!await apiProfile(request, "teacher")) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const report: Record<string, unknown> = {
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "local",
    node: process.version,
    urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    publicKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    serverKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  if (report.serverKeyConfigured) {
    try {
      const admin = createAdminClient();
      const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      report.serverAuth = error ? `ERROR_${error.status}` : "OK";
      const { count, error: readError } = await admin.from("questions").select("id", { count: "exact", head: true });
      report.questionCount = count;
      report.databaseRead = readError ? readError.code : "OK";
    } catch { report.serverAuth = "CONFIGURATION_ERROR"; }
  }
  return NextResponse.json(report, { headers: { "Cache-Control": "no-store" } });
}
