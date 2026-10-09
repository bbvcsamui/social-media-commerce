import fs from 'node:fs';
import nextEnv from '@next/env';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
async function read(table) {
  const { data, error } = await admin.from(table).select('*');
  if (error) throw Error(`Cannot read ${table}: ${error.code}`);
  return data;
}
const [units, lessons, questions, assessments] = await Promise.all(['units', 'lessons', 'questions', 'assessments'].map(read));
const report = {
  checkedAt: new Date().toISOString(),
  totals: { units: units.length, lessons: lessons.length, questions: questions.length, assessments: assessments.length },
  units: units.sort((a,b) => a.number-b.number).map(unit => {
    const content = lessons.filter(l => l.unit_id === unit.id);
    const bank = questions.filter(q => q.unit_id === unit.id);
    return {
      number: unit.number, published: unit.published, lessons: content.length, questions: bank.length,
      validLessons: content.every(l => l.title?.trim() && l.content_md?.trim()) && new Set(content.map(l => l.position)).size === 3,
      validQuestions: bank.every(q => q.text?.trim() && Array.isArray(q.choices) && q.choices.length >= 2 && q.choices.every(c => typeof c === 'string' && c.trim()) && Number.isInteger(q.answer_index) && q.answer_index >= 0 && q.answer_index < q.choices.length && q.explanation?.trim()),
      assessments: assessments.filter(a => a.unit_id === unit.id).map(a => ({ kind: a.kind, isOpen: a.is_open, questionCount: a.question_count, maxAttempts: a.max_attempts })),
    };
  }),
};
const credentials = Papa.parse(fs.readFileSync('.local/student-credentials.csv', 'utf8'), { header: true, skipEmptyLines: true }).data[0];
const student = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, options);
const { data: session, error: signInError } = await student.auth.signInWithPassword({ email: `${credentials.student_code}@student.local`, password: credentials.password });
if (signInError) throw Error('Student sign-in failed');
report.studentAccess = {};
for (const table of ['units', 'lessons', 'questions', 'assessments']) {
  const { data, error } = await student.from(table).select('*');
  report.studentAccess[table] = { rows: data?.length ?? 0, errorCode: error?.code ?? null };
}
await student.auth.signOut({ scope: 'local' });
report.databaseContentReady = units.length === 9 && lessons.length === 27 && questions.length === 135 && report.units.every(u => u.published && u.lessons === 3 && u.questions === 15 && u.validLessons && u.validQuestions && ['pretest','posttest'].every(k => u.assessments.some(a => a.kind === k && a.isOpen && a.questionCount <= u.questions)));
fs.mkdirSync('.local', { recursive: true });
fs.writeFileSync('.local/course-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
