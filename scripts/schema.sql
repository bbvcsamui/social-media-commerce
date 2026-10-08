-- =====================================================================
-- Database Schema for MySQL / MariaDB
-- วิชา 31910-2028 การพาณิชย์บนสื่อสังคมออนไลน์
-- วิทยาลัยอาชีวศึกษาภาวนาโพธิคุณ
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. Profiles & Users
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('teacher', 'student') NOT NULL DEFAULT 'student',
  student_code VARCHAR(50) UNIQUE,
  full_name VARCHAR(255) NOT NULL DEFAULT '',
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Course Units
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number INT NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  objectives JSON NOT NULL,
  published BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Lessons
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  position INT NOT NULL DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  content_md LONGTEXT,
  INDEX idx_lessons_unit (unit_id, position),
  CONSTRAINT fk_lessons_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Question Bank
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NOT NULL,
  text TEXT NOT NULL,
  choices JSON NOT NULL,
  answer_index INT NOT NULL,
  explanation TEXT,
  INDEX idx_questions_unit (unit_id),
  CONSTRAINT fk_questions_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. Assessments
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind ENUM('pretest', 'posttest', 'midterm', 'final') NOT NULL,
  unit_id INT NULL,
  title VARCHAR(255) NOT NULL,
  unit_numbers JSON NOT NULL,
  question_count INT NOT NULL DEFAULT 10,
  time_limit_minutes INT NULL,
  max_attempts INT NOT NULL DEFAULT 1,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE KEY uq_kind_unit (kind, unit_id),
  CONSTRAINT fk_assessments_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. Exam / Quiz Attempts
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attempts (
  id VARCHAR(64) PRIMARY KEY,
  assessment_id INT NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  question_ids JSON NOT NULL,
  choice_orders JSON NOT NULL,
  answers JSON NOT NULL,
  score INT NULL,
  max_score INT NOT NULL,
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  submitted_at TIMESTAMP NULL,
  INDEX idx_attempts_student (student_id, assessment_id),
  CONSTRAINT fk_attempts_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
  CONSTRAINT fk_attempts_student FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. Assignments & Submissions
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  unit_id INT NULL,
  kind ENUM('worksheet', 'project') NOT NULL DEFAULT 'worksheet',
  title VARCHAR(255) NOT NULL,
  instructions_md LONGTEXT,
  max_score DECIMAL(5, 2) NOT NULL DEFAULT 20.00,
  rubric JSON NOT NULL,
  due_at TIMESTAMP NULL,
  CONSTRAINT fk_assignments_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(64) PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  file_path TEXT NULL,
  file_name VARCHAR(255) NULL,
  link_url TEXT NULL,
  note TEXT NULL,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_late BOOLEAN NOT NULL DEFAULT FALSE,
  score DECIMAL(5, 2) NULL,
  rubric_scores JSON NULL,
  feedback TEXT NULL,
  graded_at TIMESTAMP NULL,
  UNIQUE KEY uq_assignment_student (assignment_id, student_id),
  CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. Simulation Results & Student Scores
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS simulation_results (
  student_id VARCHAR(64) NOT NULL,
  sim_key ENUM('slip', 'chat', 'pricing') NOT NULL,
  best_score INT NOT NULL DEFAULT 0,
  last_score INT NOT NULL DEFAULT 0,
  plays INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, sim_key),
  CONSTRAINT fk_sim_student FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS affective_scores (
  student_id VARCHAR(64) PRIMARY KEY,
  scores JSON NOT NULL,
  note TEXT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_affective_student FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS unit_unlocks (
  student_id VARCHAR(64) NOT NULL,
  unit_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, unit_id),
  CONSTRAINT fk_unlocks_student FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_unlocks_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO settings (`key`, `value`) VALUES
  ('grading', '{"worksheets":20,"simulations":5,"project":15,"posttests":10,"midterm":10,"final":20,"affective":20,"passPercent":60}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

SET FOREIGN_KEY_CHECKS = 1;
