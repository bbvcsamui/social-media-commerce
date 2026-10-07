import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { QuizRunner } from "@/components/quiz-runner";
import { getUnitByNumber } from "@/lib/course-data";

interface Props {
  params: Promise<{ number: string; kind: string }>;
}

export default async function QuizPage({ params }: Props) {
  const { number, kind } = await params;
  const unitNum = parseInt(number, 10);
  const unit = getUnitByNumber(unitNum);

  if (!unit || (kind !== "pretest" && kind !== "posttest")) {
    notFound();
  }

  // Pretest takes 10 questions, posttest takes 10 questions (from the 15 in the bank)
  const questionsSubset = unit.questions.slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <QuizRunner
          unitNumber={unit.number}
          unitTitle={unit.title}
          kind={kind as "pretest" | "posttest"}
          questions={questionsSubset}
        />
      </main>
    </div>
  );
}
