import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Assignment } from "@/lib/course-data";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCourseUnits(client?: SupabaseClient) {
  const admin = client || createAdminClient();
  const [u, l, a, q] = await Promise.all([
    admin.from("units").select("id,number,title,description,objectives").eq("published", true).order("number"),
    admin.from("lessons").select("unit_id,title,content_md,position").order("position"),
    admin.from("assignments").select("id,unit_id,title,instructions_md,max_score,rubric,due_at"),
    admin.from("questions").select("unit_id"),
  ]);
  if (u.error || l.error || a.error || q.error) throw Error("ไม่สามารถโหลดข้อมูลรายวิชาได้");
  return u.data.map(unit => ({ ...unit, objectives: unit.objectives as string[],
    lessons: l.data.filter(lesson => lesson.unit_id === unit.id),
    questionCount: q.data.filter(question => question.unit_id === unit.id).length,
    assignment: a.data.find(assignment => assignment.unit_id === unit.id) as (Assignment & { id: number; due_at: string | null }) | undefined,
  }));
}
export async function getCourseUnit(number: number) {
  return (await getCourseUnits()).find(unit => unit.number === number);
}
