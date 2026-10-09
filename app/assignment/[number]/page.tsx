import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { AssignmentClient } from "@/components/assignment-client";
import { getCourseUnits, getCourseUnit } from "@/lib/course";
import { requireProfile, navbarUser } from "@/lib/auth";

import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ number: string }>;
}

export default async function AssignmentPage({ params }: Props) {
  const { number } = await params;
  const unitNum = parseInt(number, 10);
  const profile = await requireProfile("student");
  const unit = await getCourseUnit(unitNum);

  if (!unit || !unit.assignment || !unit.lessons.length) {
    notFound();
  }

  const { data: initialSubmission } = await (await createClient()).from("submissions").select("file_name,link_url,note,score,feedback").eq("assignment_id", unit.assignment.id).eq("student_id", profile.id).maybeSingle();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar user={navbarUser(profile)} />
      <main className="flex-1">
        <AssignmentClient
          unitNumber={unit.number}
          assignment={unit.assignment}
          studentId={profile.id}
          initialSubmission={initialSubmission}
        />
      </main>
    </div>
  );
}
