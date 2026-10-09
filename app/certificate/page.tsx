import { Navbar } from "@/components/navbar";
import { CertificateView } from "@/components/certificate-view";
import { requireProfile, navbarUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
export default async function CertificatePage() {
 const profile=await requireProfile("student");const admin=createAdminClient();
 const [tests,attempts,assignments,submissions]=await Promise.all([
 admin.from("assessments").select("id,unit_id").eq("kind","posttest"),
 admin.from("attempts").select("assessment_id,score,max_score,submitted_at").eq("student_id",profile.id).not("submitted_at","is",null),
 admin.from("assignments").select("id"),
 admin.from("submissions").select("assignment_id,submitted_at").eq("student_id",profile.id),
 ]);
 if([tests,attempts,assignments,submissions].some(r=>r.error))throw Error("ตรวจสอบผลการเรียนไม่สำเร็จ");
 const passed=tests.data!.filter(t=>attempts.data!.some(a=>a.assessment_id===t.id&&a.max_score>0&&Number(a.score)/a.max_score>=.6)).length;
 const submitted=assignments.data!.filter(a=>submissions.data!.some(s=>s.assignment_id===a.id)).length;
 if(tests.data!.length!==9||passed!==9||assignments.data!.length!==9||submitted!==9)return <><Navbar user={navbarUser(profile)}/><main className="max-w-3xl mx-auto p-6"><h1 className="text-2xl font-bold">เกียรติบัตร</h1><p>ยังไม่ผ่านเงื่อนไขออกเกียรติบัตร</p><p>ผ่านแบบทดสอบหลังเรียน {passed}/9 หน่วย · ส่งงาน {submitted}/9 ชิ้น</p></main></>;
 const dates=[...attempts.data!.map(a=>Date.parse(a.submitted_at)),...submissions.data!.map(s=>Date.parse(s.submitted_at))];
 const issueDate=new Date(Math.max(...dates)).toLocaleDateString("th-TH",{timeZone:"Asia/Bangkok",day:"numeric",month:"long",year:"numeric"});
 return <CertificateView studentName={profile.full_name} studentId={profile.student_code} issueDate={issueDate}/>;
}
