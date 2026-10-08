import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('Connected to MySQL/MariaDB database.');

  // 1. Run Schema
  const schemaSql = fs.readFileSync(path.resolve('scripts/schema.sql'), 'utf8');
  console.log('Applying schema...');
  await conn.query(schemaSql);
  console.log('Schema applied successfully.');

  // 2. Insert Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'boonlert.s@mail.bbvc.ac.th';
  console.log(`Setting up Admin user: ${adminEmail}`);
  await conn.execute(`
    INSERT INTO profiles (id, email, password_hash, role, full_name, must_change_password)
    VALUES (?, ?, ?, 'teacher', ?, FALSE)
    ON DUPLICATE KEY UPDATE
      email = VALUES(email),
      role = 'teacher',
      full_name = VALUES(full_name),
      must_change_password = FALSE
  `, ['admin-teacher-01', adminEmail, '12345678', 'อาจารย์บุญเลิศ (ผู้ดูแลระบบ)']);

  // 3. Seed Course Units, Lessons, Questions, Assessments, Assignments
  const unitsDir = path.resolve('content/units');
  const files = fs.readdirSync(unitsDir).filter(f => f.endsWith('.json')).sort();
  console.log(`Found ${files.length} units to seed.`);

  for (const file of files) {
    const u = JSON.parse(fs.readFileSync(path.join(unitsDir, file), 'utf8'));
    console.log(`Seeding Unit ${u.number}: ${u.title}...`);

    // Insert or update unit
    await conn.execute(`
      INSERT INTO units (number, title, description, objectives, published)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        objectives = VALUES(objectives),
        published = VALUES(published)
    `, [u.number, u.title, u.description || '', JSON.stringify(u.objectives || []), true]);

    const [unitRows] = await conn.execute('SELECT id FROM units WHERE number = ?', [u.number]);
    const unitId = unitRows[0].id;

    // Remove old lessons & questions for this unit to ensure clean sync
    await conn.execute('DELETE FROM lessons WHERE unit_id = ?', [unitId]);
    await conn.execute('DELETE FROM questions WHERE unit_id = ?', [unitId]);

    // Insert Lessons
    for (let i = 0; i < u.lessons.length; i++) {
      const l = u.lessons[i];
      await conn.execute(`
        INSERT INTO lessons (unit_id, position, title, content_md)
        VALUES (?, ?, ?, ?)
      `, [unitId, i + 1, l.title, l.content_md || '']);
    }

    // Insert Questions
    for (const q of u.questions) {
      await conn.execute(`
        INSERT INTO questions (unit_id, text, choices, answer_index, explanation)
        VALUES (?, ?, ?, ?, ?)
      `, [unitId, q.text, JSON.stringify(q.choices), q.answer, q.explanation || '']);
    }

    // Assessments: pretest & posttest
    await conn.execute(`
      INSERT INTO assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
      VALUES ('pretest', ?, ?, ?, 10, NULL, 1, TRUE)
      ON DUPLICATE KEY UPDATE title = VALUES(title), question_count = VALUES(question_count)
    `, [unitId, `แบบทดสอบก่อนเรียน: ${u.title}`, JSON.stringify([u.number])]);

    await conn.execute(`
      INSERT INTO assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
      VALUES ('posttest', ?, ?, ?, 10, 20, 3, TRUE)
      ON DUPLICATE KEY UPDATE title = VALUES(title), question_count = VALUES(question_count), max_attempts = VALUES(max_attempts)
    `, [unitId, `แบบทดสอบหลังเรียน: ${u.title}`, JSON.stringify([u.number])]);

    // Assignment
    if (u.assignment) {
      const kind = u.number === 9 ? 'project' : 'worksheet';
      await conn.execute(`
        DELETE FROM assignments WHERE unit_id = ?
      `, [unitId]);

      await conn.execute(`
        INSERT INTO assignments (unit_id, kind, title, instructions_md, max_score, rubric)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        unitId,
        kind,
        u.assignment.title,
        u.assignment.instructions_md || '',
        u.assignment.max_score || 20,
        JSON.stringify(u.assignment.rubric || [])
      ]);
    }
  }

  // Midterm & Final Exams
  await conn.execute(`
    INSERT INTO assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
    VALUES ('midterm', NULL, 'การสอบวัดผลกลางภาค (หน่วยที่ 1-4)', ?, 30, 45, 1, TRUE)
    ON DUPLICATE KEY UPDATE title = VALUES(title), question_count = VALUES(question_count), time_limit_minutes = VALUES(time_limit_minutes)
  `, [JSON.stringify([1, 2, 3, 4])]);

  await conn.execute(`
    INSERT INTO assessments (kind, unit_id, title, unit_numbers, question_count, time_limit_minutes, max_attempts, is_open)
    VALUES ('final', NULL, 'การสอบวัดผลปลายภาค (หน่วยที่ 1-9)', ?, 40, 60, 1, TRUE)
    ON DUPLICATE KEY UPDATE title = VALUES(title), question_count = VALUES(question_count), time_limit_minutes = VALUES(time_limit_minutes)
  `, [JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9])]);

  // Insert mock/initial student profiles
  const sampleStudents = [
    { code: '673191001', name: 'นายธนากร มีสุข' },
    { code: '673191002', name: 'นางสาวศิริพร บุญยืน' },
    { code: '673191003', name: 'นายกิตติศักดิ์ พัฒนา' },
    { code: '673191004', name: 'นางสาวณิชากานต์ แซ่ลี้' },
    { code: '673191005', name: 'นายอนุชา สมใจ' },
    { code: '673191006', name: 'นางสาวพิมลพรรณ สดใส' }
  ];

  for (const st of sampleStudents) {
    await conn.execute(`
      INSERT INTO profiles (id, email, password_hash, role, student_code, full_name, must_change_password)
      VALUES (?, ?, ?, 'student', ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE
        full_name = VALUES(full_name),
        student_code = VALUES(student_code)
    `, [`student-${st.code}`, `${st.code}@student.bvc.ac.th`, '12345678', st.code, st.name]);
  }

  console.log('Seeding completed successfully!');
  await conn.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
