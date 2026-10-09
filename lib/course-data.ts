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

