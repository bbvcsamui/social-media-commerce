import assert from 'node:assert/strict';
import { randomUUID, randomBytes } from 'node:crypto';
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
nextEnv.loadEnvConfig(process.cwd());
const base = process.env.TEST_BASE_URL || 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const created = [];
const sessions = [];
async function signIn(email, password, teacher = false) {
  const jar = new Map();
  const client = createServerClient(url, anon, { cookies: { getAll: () => [...jar].map(([name,value]) => ({name,value})), setAll: values => values.forEach(({name,value}) => jar.set(name,value)) } });
  let error;
  if (teacher) {
    const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email });
    assert.equal(linkError, null);
    ({ error } = await client.auth.verifyOtp({ token_hash: link.properties.hashed_token, type: 'magiclink' }));
  } else ({ error } = await client.auth.signInWithPassword({ email, password }));
  assert.equal(error, null); sessions.push(client);
  return { Cookie: [...jar].map(([k,v]) => `${k}=${v}`).join('; '), Origin: base, 'Content-Type': 'application/json' };
}
async function account() {
  const email = `qa-${randomUUID()}@student.local`;
  const password = randomBytes(24).toString('base64url');
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.equal(error, null); created.push(data.user.id);
  const { error: profileError } = await admin.from('profiles').insert({ id: data.user.id, role: 'student', full_name: 'Integration test (temporary)', student_code: '99' + String(Date.now()) + String(created.length), must_change_password: false });
  assert.equal(profileError, null);
  return { id: data.user.id, headers: await signIn(email,password) };
}
async function api(path, headers, method = 'GET', body, expected = 200) {
  const response = await fetch(base + path, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }), redirect: 'manual' });
  const text = await response.text();
  assert.equal(response.status, expected, `${method} ${path}: unexpected status ${response.status}`);
  return text ? JSON.parse(text) : null;
}
async function correctAnswers(attempt) {
  const { data: record } = await admin.from('attempts').select('choice_orders').eq('id',attempt.id).single();
  const { data: keys } = await admin.from('questions').select('id,answer_index').in('id',attempt.questions.map(q=>q.id));
  return Object.fromEntries(keys.map(q=>[q.id,record.choice_orders[q.id].indexOf(q.answer_index)]));
}
try {
  const [a,b] = await Promise.all([account(),account()]);
  const { data: teacher } = await admin.from('profiles').select('id').eq('role','teacher').limit(1).single();
  const { data: teacherUser } = await admin.auth.admin.getUserById(teacher.id);
  const teacherHeaders = await signIn(teacherUser.user.email,null,true);
  const { data: assessments } = await admin.from('assessments').select('*');
  const { data: units } = await admin.from('units').select('id,number');
  const unit1=units.find(u=>u.number===1);
  const pre=assessments.find(t=>t.kind==='pretest'&&t.unit_id===unit1.id);
  const post=assessments.find(t=>t.kind==='posttest'&&t.unit_id===unit1.id);
  const mid=assessments.find(t=>t.kind==='midterm');
  const final=assessments.find(t=>t.kind==='final');
  await api(`/api/assessments/${pre.id}/attempts`,{},'POST',{},403);
  await api(`/api/assessments/${pre.id}/attempts`,{...a.headers,Origin:'https://example.com'},'POST',{},403);
  await api(`/api/assessments/${pre.id}/attempts`,teacherHeaders,'POST',{},403);
  const concurrent = await Promise.all(Array.from({length:4},()=>api(`/api/assessments/${pre.id}/attempts`,a.headers,'POST',{})));
  assert.equal(new Set(concurrent.map(t=>t.id)).size,1);
  const attempt=concurrent[0];assert.equal(attempt.questions.length,10);
  for(const q of attempt.questions) {assert.equal('answer' in q,false);assert.equal('answer_index' in q,false);assert.equal('explanation' in q,false);}
  const resume=await api(`/api/attempts/${attempt.id}`,a.headers);
  assert.deepEqual(resume.questions,attempt.questions);
  await api(`/api/attempts/${attempt.id}`,b.headers,'GET',undefined,404);
  await api(`/api/attempts/${attempt.id}`,b.headers,'POST',{answers:{}},404);
  await api(`/api/attempts/${attempt.id}`,a.headers,'POST',{answers:{[attempt.questions[0].id]:999}},400);
  const correct=await correctAnswers(attempt);
  await api(`/api/attempts/${attempt.id}`,a.headers,'PATCH',{answers:correct});
  const result=await api(`/api/attempts/${attempt.id}`,a.headers,'POST',{answers:correct,score:999});
  assert.equal(result.score,10);
  const repeat=await api(`/api/attempts/${attempt.id}`,a.headers,'POST',{answers:{},score:0});assert.equal(repeat.score,10);
  await api(`/api/assessments/${pre.id}/attempts`,a.headers,'POST',{},409);
  await api(`/api/attempts/${attempt.id}`,a.headers,'PATCH',{answers:{}},409);
  console.log('Quiz: no answer-key leak; concurrent starts, resume, ownership, validation, server scoring, immutable result and attempt limit passed.');
  for(let i=0;i<post.max_attempts;i++) {
    const t=await api(`/api/assessments/${post.id}/attempts`,a.headers,'POST',{});
    await api(`/api/attempts/${t.id}`,a.headers,'POST',{answers:i===0?await correctAnswers(t):{}});
  }
  await api(`/api/assessments/${post.id}/attempts`,a.headers,'POST',{},409);
  const exam=await api(`/api/assessments/${mid.id}/attempts`,a.headers,'POST',{});
  assert.equal(exam.questions.length,30);assert.ok(exam.expiresAt);
  const expiryDelta=Date.parse(exam.expiresAt)-Date.now();assert.ok(expiryDelta>44*60000&&expiryDelta<=45*60000);
  const examCorrect=await correctAnswers(exam);
  const savedAnswer={ [exam.questions[0].id]:examCorrect[exam.questions[0].id] };
  await api(`/api/attempts/${exam.id}`,a.headers,'PATCH',{answers:savedAnswer});
  await admin.from('attempts').update({expires_at:new Date(Date.now()-1000).toISOString()}).eq('id',exam.id).eq('student_id',a.id);
  const expired=await api(`/api/attempts/${exam.id}`,a.headers,'POST',{answers:examCorrect,score:30});assert.equal(expired.score,1);
  const finalExam=await api(`/api/assessments/${final.id}/attempts`,a.headers,'POST',{});assert.equal(finalExam.questions.length,40);assert.ok(finalExam.expiresAt);
  await api(`/api/attempts/${finalExam.id}`,a.headers,'POST',{answers:{}});
  console.log('Exams: 30/40 questions, configured duration, saved answers after expiry and posttest retry limit passed.');
  const { data: assignment }=await admin.from('assignments').select('id').eq('unit_id',unit1.id).single();
  await api('/api/submissions',a.headers,'POST',{assignment_id:assignment.id,note:'test',link_url:'javascript:alert(1)'},400);
  await api('/api/submissions',a.headers,'POST',{assignment_id:assignment.id,note:'test',file_path:`${b.id}/unknown.pdf`},400);
  await api('/api/submissions',a.headers,'POST',{assignment_id:assignment.id,note:'test',link_url:'https://example.com/test'});
  let uploadClient;
  for (const client of sessions) { const { data: { user } } = await client.auth.getUser(); if (user?.id === a.id) { uploadClient = client; break; } }
  assert.ok(uploadClient);
  const filePath = `${a.id}/${randomUUID()}.pdf`;
  const { error: uploadError } = await uploadClient.storage.from('submissions').upload(filePath, Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF'), { contentType: 'application/pdf' });
  assert.equal(uploadError,null);
  await api('/api/submissions',b.headers,'POST',{assignment_id:assignment.id,note:'test',file_path:filePath,file_name:'test.pdf'},400);
  await api('/api/submissions',a.headers,'POST',{assignment_id:assignment.id,note:'test',file_path:filePath,file_name:'test.pdf'});
  const { data: submission }=await admin.from('submissions').select('id').eq('student_id',a.id).eq('assignment_id',assignment.id).single();
  await api('/api/teacher/grades',a.headers,'GET',undefined,403);
  await api('/api/teacher/grades',teacherHeaders,'PATCH',{type:'submission',id:submission.id,score:999,feedback:'test'},400);
  await api('/api/teacher/grades',teacherHeaders,'PATCH',{type:'submission',id:submission.id,score:10,feedback:'verified'});
  const fileLink = await fetch(`${base}/api/teacher/submission-file?id=${submission.id}`,{headers:teacherHeaders,redirect:'manual'});
  assert.equal(fileLink.status,307);
  const download = await fetch(fileLink.headers.get('location'));assert.equal(download.status,200);
  await api('/api/teacher/grades',teacherHeaders,'PATCH',{type:'affective',student_id:a.id,score:15});
  await api('/api/simulations',a.headers,'POST',{key:'slip',answers:{1:'approve',2:'reject',3:'reject',4:'reject'},score:999});
  await api('/api/simulations',a.headers,'POST',{key:'chat',answers:{1:1,2:1,3:0}});
  const pricing=await api('/api/simulations',a.headers,'POST',{key:'pricing',inputs:{productCost:100,packagingCost:15,shippingCost:35,freeShipping:true,platformFeePercent:8,marketingPercent:15,targetMarginPercent:25,answer:289}});assert.equal(pricing.score,100);
  await api('/api/simulations',a.headers,'POST',{key:'slip',answers:{1:'reject',2:'approve',3:'approve',4:'approve'}});
  const grades=await api('/api/teacher/grades',teacherHeaders);const row=grades.rows.find(r=>r.id===a.id);
  assert.equal(row.simulations,5);assert.equal(row.affective,15);assert.ok(Math.abs(row.posttests-10/9)<.001);assert.ok(row.worksheets>0);assert.ok(Math.abs(row.midterm-1/3)<.001);
  console.log('Assignments, teacher grading, best test/simulation scores, affective scores and persisted gradebook passed.');
  for(const path of ['/learn','/learn/unit/1','/learn/unit/9?lesson=3','/quiz/1/posttest','/exam/midterm','/certificate']) {
    const page=await fetch(base+path,{headers:a.headers,redirect:'manual'});assert.equal(page.status,200,path);const html=await page.text();assert.ok(!html.includes('"answer_index"'));
    if(path==='/certificate')assert.ok(html.includes('ยังไม่ผ่านเงื่อนไขออกเกียรติบัตร'));
  }
  const teacherPage=await fetch(base+'/teacher',{headers:teacherHeaders});const html=await teacherPage.text();assert.equal(teacherPage.status,200);assert.ok(!html.includes('นายธนากร มีสุข'));assert.ok(html.includes('สมุดคะแนนจากฐานข้อมูล'));
  console.log('Protected lesson/quiz/exam pages, certificate eligibility and removal of dummy students passed.');
} finally {
  for(const client of sessions) await client.auth.signOut({scope:'local'});
  for(const id of created) {
    const {data: files}=await admin.storage.from('submissions').list(id);
    if(files?.length) await admin.storage.from('submissions').remove(files.map(f=>`${id}/${f.name}`));
    const {error}=await admin.auth.admin.deleteUser(id);if(error)throw Error('Could not remove disposable integration account');
  }
  console.log('Disposable accounts and their test records removed.');
}
