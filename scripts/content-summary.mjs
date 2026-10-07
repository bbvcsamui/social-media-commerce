import fs from 'fs';
import path from 'path';

const unitsDir = path.resolve('content/units');
const files = fs.readdirSync(unitsDir).filter(f => f.endsWith('.json')).sort();

let totalLessons = 0;
let totalQuestions = 0;

for (const file of files) {
  const u = JSON.parse(fs.readFileSync(path.join(unitsDir, file), 'utf8'));
  totalLessons += u.lessons.length;
  totalQuestions += u.questions.length;
  console.log(`Unit ${u.number}: ${u.title}`);
  console.log(`  Lessons: ${u.lessons.length}, Questions: ${u.questions.length}, Assignment max: ${u.assignment.max_score}, Rubrics: ${u.assignment.rubric.length}`);
}

console.log('--------------------------------------------------');
console.log(`TOTAL UNITS: ${files.length}`);
console.log(`TOTAL LESSONS: ${totalLessons}`);
console.log(`TOTAL MULTIPLE-CHOICE QUESTIONS: ${totalQuestions}`);
