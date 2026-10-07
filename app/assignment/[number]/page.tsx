import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AssignmentClient } from "@/components/assignment-client";
import { getUnitByNumber } from "@/lib/course-data";

interface Props {
  params: Promise<{ number: string }>;
}

export default async function AssignmentPage({ params }: Props) {
  const { number } = await params;
  const unitNum = parseInt(number, 10);
  const unit = getUnitByNumber(unitNum);

  if (!unit) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="flex-1">
        <AssignmentClient
          unitNumber={unit.number}
          assignment={unit.assignment}
        />
      </main>
    </div>
  );
}
