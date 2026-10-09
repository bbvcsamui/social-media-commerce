import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
export async function gradebook() {
  const admin = createAdminClient();
  const [profiles, attempts, assessments, assignments, submissions, simulations, affective] = await Promise.all([
    admin.from("profiles").select("id,student_code,full_name").eq("role", "student").order("student_code"),
    admin.from("attempts").select("student_id,assessment_id,score,max_score,submitted_at").not("submitted_at", "is", null),
    admin.from("assessments").select("id,kind,unit_id"),
    admin.from("assignments").select("id,kind,max_score,title"),
    admin.from("submissions").select("id,student_id,assignment_id,score,link_url,file_path,file_name,note,feedback,submitted_at"),
    admin.from("simulation_results").select("student_id,sim_key,best_score"),
    admin.from("affective_scores").select("student_id,scores,note"),
  ]);
  if ([profiles, attempts, assessments, assignments, submissions, simulations, affective].some(r => r.error)) throw Error("โหลดสมุดคะแนนไม่สำเร็จ");
  const rows = profiles.data!.map(p => {
    const mine = attempts.data!.filter(a => a.student_id === p.id);
    const best = (id: number) => Math.max(0, ...mine.filter(a => a.assessment_id === id && a.max_score > 0).map(a => Number(a.score) / a.max_score));
    const testScore = (kind: string, weight: number, denominator?: number) => {
      const tests = assessments.data!.filter(a => a.kind === kind);
      return tests.reduce((sum, a) => sum + best(a.id), 0) / Math.max(1, denominator || tests.length) * weight;
    };
    const assignmentScore = (kind: string, weight: number) => {
      const items = assignments.data!.filter(a => a.kind === kind);
      return items.reduce((sum,a) => sum + Math.max(0, Number(submissions.data!.find(s => s.student_id === p.id && s.assignment_id === a.id)?.score || 0)) / Number(a.max_score), 0) / Math.max(1, items.length) * weight;
    };
    const affectiveRow = affective.data!.find(a => a.student_id === p.id);
    const scores = affectiveRow?.scores as Record<string, number> | undefined;
    const row = { ...p,
      worksheets: assignmentScore("worksheet", 20), project: assignmentScore("project", 15),
      simulations: simulations.data!.filter(s => s.student_id === p.id).reduce((sum,s) => sum + Math.max(0, Math.min(100, s.best_score)), 0) / 300 * 5,
      posttests: testScore("posttest", 10, 9), midterm: testScore("midterm", 10), final: testScore("final", 20),
      affective: scores ? (typeof scores.total === "number" ? Math.max(0, Math.min(20, scores.total)) : Math.min(20, Object.values(scores).reduce((sum,v) => sum + (Number.isFinite(v) ? Math.max(0, Math.min(4,v)) : 0), 0))) : 0,
    };
    const total = row.worksheets + row.project + row.simulations + row.posttests + row.midterm + row.final + row.affective;
    const grade = total >= 80 ? "4.0" : total >= 75 ? "3.5" : total >= 70 ? "3.0" : total >= 65 ? "2.5" : total >= 60 ? "2.0" : total >= 55 ? "1.5" : total >= 50 ? "1.0" : "0.0";
    return { ...row, total, grade };
  });
  return { rows, submissions: submissions.data!.map(s => ({ ...s, student: profiles.data!.find(p => p.id === s.student_id), assignment: assignments.data!.find(a => a.id === s.assignment_id) })) };
}
