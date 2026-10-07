import fs from 'fs';
import path from 'path';

const unitsDir = path.resolve('content/units');
const files = fs.readdirSync(unitsDir).filter(f => f.endsWith('.json')).sort();

let sql = `-- =====================================================================
-- Seed Data: Course Content, Questions, Assessments & Assignments
-- Generated automatically from validated content/units/*.json
-- =====================================================================

`;

for (const file of files) {
  const u = JSON.parse(fs.readFileSync(path.join(unitsDir, file), 'utf8'));
  const safeTitle = u.title.replace(/'/g, "''");
  const safeDesc = u.description.replace(/'/g, "''");
  const objectivesSql = "ARRAY[" + u.objectives.map(o => `'${o.replace(/'/g, "''")}'`).join(", ") + "]";

  sql += `-- Unit ${u.number}: ${safeTitle}\n`;
  sql += `INSERT INTO public.units (number, title, description, objectives, published)
VALUES (${u.number}, '${safeTitle}', '${safeDesc}', ${objectivesSql}, true)
ON CONFLICT (number) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  objectives = EXCLUDED.objectives,
  published = true;\n\n`;

  // Lessons
  u.lessons.forEach((l, idx) => {
    const lTitle = l.title.replace(/'/g, "''");
    const lContent = l.content_md.replace(/'/g, "''");
    sql += `INSERT INTO public.lessons (unit_id, position, title, content_md)
SELECT u.id, ${idx + 1}, '${lTitle}', '${lContent}'
FROM public.units u WHERE u.number = ${u.number};\n`;
  });
  sql += `\n`;

  // Questions
  u.questions.forEach((q) => {
    const qText = q.text.replace(/'/g, "''");
    const qChoices = JSON.stringify(q.choices).replace(/'/g, "''");
    const qExp = (q.explanation || '').replace(/'/g, "''");
    sql += `INSERT INTO public.questions (unit_id, text, choices, answer_index, explanation)
SELECT u.id, '${qText}', '${qChoices}'::jsonb, ${q.answer}, '${qExp}'
FROM public.units u WHERE u.number = ${u.number};\n`;
  });
  sql += `\n`;

  // Pretest & Posttest assessments
  sql += `INSERT INTO public.assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
SELECT 'pretest', u.id, 'แบบทดสอบก่อนเรียน: ' || u.title, ARRAY[u.number], 10, NULL, 1, true
FROM public.units u WHERE u.number = ${u.number}
ON CONFLICT (kind, unit_id) DO UPDATE SET title = EXCLUDED.title, question_count = EXCLUDED.question_count;\n`;

  sql += `INSERT INTO public.assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
SELECT 'posttest', u.id, 'แบบทดสอบหลังเรียน: ' || u.title, ARRAY[u.number], 10, 20, 3, true
FROM public.units u WHERE u.number = ${u.number}
ON CONFLICT (kind, unit_id) DO UPDATE SET title = EXCLUDED.title, question_count = EXCLUDED.question_count, max_attempts = EXCLUDED.max_attempts;\n\n`;

  // Assignment
  const a = u.assignment;
  const aKind = u.number === 9 ? 'project' : 'worksheet';
  const aTitle = a.title.replace(/'/g, "''");
  const aInst = a.instructions_md.replace(/'/g, "''");
  const aRubric = JSON.stringify(a.rubric).replace(/'/g, "''");

  sql += `INSERT INTO public.assignments (unit_id, kind, title, instructions_md, max_score, rubric)
SELECT u.id, '${aKind}', '${aTitle}', '${aInst}', ${a.max_score}, '${aRubric}'::jsonb
FROM public.units u WHERE u.number = ${u.number};\n\n`;
}

// Midterm & Final Exams
sql += `-- Midterm Exam (Units 1-4)
INSERT INTO public.assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
VALUES ('midterm', NULL, 'การสอบวัดผลกลางภาค (หน่วยที่ 1-4)', ARRAY[1, 2, 3, 4], 30, 45, 1, true)
ON CONFLICT (kind, unit_id) DO UPDATE SET
  title = EXCLUDED.title,
  unit_numbers = EXCLUDED.unit_numbers,
  question_count = EXCLUDED.question_count,
  time_limit_minutes = EXCLUDED.time_limit_minutes,
  max_attempts = 1;\n\n`;

sql += `-- Final Exam (Units 1-9)
INSERT INTO public.assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
VALUES ('final', NULL, 'การสอบวัดผลปลายภาค (หน่วยที่ 1-9)', ARRAY[1, 2, 3, 4, 5, 6, 7, 8, 9], 40, 60, 1, true)
ON CONFLICT (kind, unit_id) DO UPDATE SET
  title = EXCLUDED.title,
  unit_numbers = EXCLUDED.unit_numbers,
  question_count = EXCLUDED.question_count,
  time_limit_minutes = EXCLUDED.time_limit_minutes,
  max_attempts = 1;\n`;

const targetFile = path.resolve('supabase/migrations/0002_seed_content.sql');
fs.writeFileSync(targetFile, sql, 'utf8');
console.log(`Generated SQL seed file: ${targetFile} (${sql.length} bytes)`);
