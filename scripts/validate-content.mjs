import fs from 'fs';
import path from 'path';

const unitsDir = path.resolve('content/units');
if (!fs.existsSync(unitsDir)) {
  console.error("Directory content/units does not exist");
  process.exit(1);
}

const files = fs.readdirSync(unitsDir).filter(f => f.endsWith('.json')).sort();
console.log(`Found ${files.length} unit files:`, files);

let hasError = false;
for (const file of files) {
  const p = path.join(unitsDir, file);
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const u = JSON.parse(raw);
    console.log(`Checking ${file}: Unit ${u.number} - ${u.title}`);
    if (typeof u.number !== 'number') { console.error(`  [FAIL] ${file}: missing number`); hasError = true; }
    if (!u.title) { console.error(`  [FAIL] ${file}: missing title`); hasError = true; }
    if (!Array.isArray(u.lessons) || u.lessons.length === 0) { console.error(`  [FAIL] ${file}: lessons invalid`); hasError = true; }
    if (!Array.isArray(u.questions) || u.questions.length !== 15) { 
      console.warn(`  [WARN] ${file}: questions count is ${u.questions?.length} (expected 15)`); 
    }
    if (!u.assignment || !u.assignment.rubric) { console.error(`  [FAIL] ${file}: assignment/rubric invalid`); hasError = true; }
    const rubricTotal = u.assignment.rubric.reduce((acc, r) => acc + (r.max || 0), 0);
    if (rubricTotal !== u.assignment.max_score) {
      console.warn(`  [WARN] ${file}: rubric sum (${rubricTotal}) != max_score (${u.assignment.max_score})`);
    }
  } catch (err) {
    console.error(`  [ERROR] parsing ${file}:`, err.message);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log("Validation completed successfully!");
}
