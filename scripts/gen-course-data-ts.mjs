import fs from 'fs';
import path from 'path';

const unitsDir = path.resolve('content/units');
const files = fs.readdirSync(unitsDir).filter(f => f.endsWith('.json')).sort();

const allUnits = files.map(f => JSON.parse(fs.readFileSync(path.join(unitsDir, f), 'utf8')));

const ts = `// Auto-generated statically compiled course content
// This allows the entire e-learning platform to run in standalone demo/preview mode
// without requiring an active Supabase database connection.

export interface Lesson {
  title: string;
  content_md: string;
}

export interface Question {
  text: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface RubricItem {
  criterion: string;
  max: number;
  description: string;
}

export interface Assignment {
  title: string;
  instructions_md: string;
  max_score: number;
  rubric: RubricItem[];
}

export interface UnitContent {
  number: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: Lesson[];
  questions: Question[];
  assignment: Assignment;
}

export const COURSE_UNITS: UnitContent[] = ${JSON.stringify(allUnits, null, 2)};

export function getUnitByNumber(num: number): UnitContent | undefined {
  return COURSE_UNITS.find(u => u.number === num);
}

export function getAllUnitsSummary() {
  return COURSE_UNITS.map(u => ({
    number: u.number,
    title: u.title,
    description: u.description,
    objectivesCount: u.objectives.length,
    lessonsCount: u.lessons.length,
    questionsCount: u.questions.length,
    assignmentTitle: u.assignment.title,
    assignmentMaxScore: u.assignment.max_score,
  }));
}
`;

const targetFile = path.resolve('lib/course-data.ts');
fs.writeFileSync(targetFile, ts, 'utf8');
console.log(`Generated TS content module: ${targetFile} (${ts.length} bytes)`);
