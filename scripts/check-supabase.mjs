import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd());
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anon || !secret) throw new Error('Missing Supabase environment configuration');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secret, options);
const publicClient = createClient(url, anon, options);
let failed = false;
const health = await fetch(`${url}/auth/v1/health`, { headers: { apikey: anon }, signal: AbortSignal.timeout(15000) });
console.log(`Auth connection: ${health.status}`);
if (!health.ok) failed = true;
const { error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
console.log(`Server key: ${authError ? 'FAIL (' + authError.status + ')' : 'OK'}`);
if (authError) failed = true;
for (const table of ['profiles', 'units', 'lessons', 'questions', 'assessments', 'attempts', 'assignments', 'submissions', 'simulation_results', 'affective_scores']) {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
  console.log(`${table}: ${error ? 'FAIL (' + error.code + ')' : 'OK, rows=' + count}`);
  if (error) failed = true;
}
const { data, error } = await publicClient.from('units').select('number').order('number');
console.log(`Public course read: ${error ? 'FAIL (' + error.code + ')' : 'OK, units=' + data.length}`);
if (error) failed = true;
process.exitCode = failed ? 1 : 0;
