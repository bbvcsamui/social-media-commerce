import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { QuizRunner } from "@/components/quiz-runner";
import { requireProfile, navbarUser } from "@/lib/auth";
import { getAssessment, attemptHistory } from "@/lib/assessment";
export default async function ExamPage({ params }: { params: Promise<{ type: string }> }) {
  const profile = await requireProfile("student");
  const { type } = await params;
  if (!["midterm", "final"].includes(type)) notFound();
  const assessment = await getAssessment(type);
  const history = await attemptHistory(profile.id, assessment.id);
  return <><Navbar user={navbarUser(profile)} /><QuizRunner assessment={assessment} history={history} /></>;
}
