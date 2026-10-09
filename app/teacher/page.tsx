import { Navbar } from "@/components/navbar";
import { StudentManagement } from "@/components/student-management";
import { Gradebook } from "@/components/gradebook";
import { requireProfile, navbarUser } from "@/lib/auth";
import { gradebook } from "@/lib/gradebook";
import { getCourseUnits } from "@/lib/course";
export default async function TeacherPage() {
 const profile=await requireProfile("teacher");
 const [data,units]=await Promise.all([gradebook(),getCourseUnits()]);
 return <><Navbar user={navbarUser(profile)}/><main className="max-w-7xl mx-auto p-6 space-y-6"><h1 className="text-2xl font-bold">แดชบอร์ดอาจารย์ผู้สอน</h1><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[['นักศึกษา',`${data.rows.length} คน`],['หน่วยเรียน',`${units.length} หน่วย (${units.reduce((s,u)=>s+u.lessons.length,0)} ตอน)`],['คลังข้อสอบ',`${units.reduce((s,u)=>s+u.questionCount,0)} ข้อ`],['คะแนนเฉลี่ย',data.rows.length?(data.rows.reduce((s,r)=>s+r.total,0)/data.rows.length).toFixed(2):'0.00']].map(([title,value])=><div key={title} className="border rounded-xl p-4"><p>{title}</p><strong className="text-xl">{value}</strong></div>)}</div><StudentManagement/><Gradebook rows={data.rows} submissions={data.submissions}/></main></>;
}
