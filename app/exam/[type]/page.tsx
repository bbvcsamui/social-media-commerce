import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { QuizRunner } from "@/components/quiz-runner";
import { COURSE_UNITS } from "@/lib/course-data";

interface Props {
  params: Promise<{ type: string }>;
}

export default async function ExamPage({ params }: Props) {
  const { type } = await params;

  if (type !== "midterm" && type !== "final") {
    notFound();
  }

  const isMidterm = type === "midterm";

  // Midterm: Units 1-4 (take questions from units 1..4)
  // Final: Units 1-9 (take questions from all units)
  let pool = isMidterm
    ? COURSE_UNITS.filter((u) => u.number <= 4).flatMap((u) => u.questions)
    : COURSE_UNITS.flatMap((u) => u.questions);

  // Take 30 for midterm, 40 for final
  const examQuestions = pool.slice(0, isMidterm ? 30 : 40);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <QuizRunner
          unitNumber={isMidterm ? 4 : 9}
          unitTitle={
            isMidterm
              ? "การสอบวัดผลกลางภาค (หน่วยที่ 1 - 4)"
              : "การสอบวัดผลปลายภาค (หน่วยที่ 1 - 9)"
          }
          kind="posttest"
          questions={examQuestions}
        />
      </main>
    </div>
  );
}
