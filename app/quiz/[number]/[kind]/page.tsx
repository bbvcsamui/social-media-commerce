import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { QuizRunner } from "@/components/quiz-runner";
import { requireProfile, navbarUser } from "@/lib/auth";
import { getAssessment, AssessmentError, attemptHistory } from "@/lib/assessment";
export default async function QuizPage({ params }: { params: Promise<{ number: string; kind: string }> }) {
  const profile = await requireProfile("student");
  const { number, kind } = await params;
  if (!/^[1-9]$/.test(number) || !["pretest", "posttest"].includes(kind)) notFound();
  let assessment;
  try { assessment = await getAssessment(kind, Number(number)); } catch (e) { if (e instanceof AssessmentError && e.status === 404) notFound(); throw e; }
  const history = await attemptHistory(profile.id, assessment.id);
  return <><Navbar user={navbarUser(profile)} /><QuizRunner assessment={assessment} history={history} /></>;
}
