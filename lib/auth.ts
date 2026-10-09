import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function currentProfile() {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await client.from("profiles").select("id,role,student_code,full_name,must_change_password").eq("id", user.id).single();
  return data;
}
export async function requireProfile(role?: "student" | "teacher") {
  const profile = await currentProfile();
  if (!profile) redirect("/login");
  if (profile.must_change_password) redirect("/change-password");
  if (role && profile.role !== role) redirect(profile.role === "teacher" ? "/teacher" : "/learn");
  return profile;
}
export async function apiProfile(request: Request, role?: "student" | "teacher") {
  if (request.method !== "GET" && request.headers.get("origin") !== new URL(request.url).origin) return null;
  const profile = await currentProfile();
  if (!profile || profile.must_change_password || (role && profile.role !== role)) return null;
  return profile;
}
export function navbarUser(profile: NonNullable<Awaited<ReturnType<typeof currentProfile>>>) {
  return { role: profile.role as "teacher" | "student", name: profile.full_name, studentCode: profile.student_code };
}
