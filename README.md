# Social Commerce e-Learning

Next.js application for BBVC. Supabase is the database, Auth provider and private assignment file storage.

## Local development

1. Run `npm ci` with Node.js 24.
2. Copy `.env.example` to `.env.local` and set the three Supabase values.
3. Run `npm run dev` and open `http://localhost:3000`.

## Production / Vercel

- Import this GitHub repository into Vercel, framework: Next.js, Node.js: 24.x.
- Install command: `npm ci`. Build command: `npm run build`.
- Set these environment variables in **Production** and **Preview** before building:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon or publishable key)
  - `SUPABASE_SERVICE_ROLE_KEY` (service role or secret key, server only)
- Redeploy after changing environment variables: the public values are included at build time.
- In Supabase Auth URL Configuration set Site URL to the production HTTPS domain and add the production origin plus `http://localhost:3000` to allowed redirects.
- The college Supabase already contains the schema and content. Do not reset its database or rerun seed scripts against it.
- For a new project only, apply `supabase/migrations/0001_init.sql` and `0002_seed_content.sql` once. Provision a teacher through Supabase Auth and a matching `profiles` row with `role='teacher'`; set `must_change_password=true` for a temporary password.
- The private `submissions` bucket accepts PDF/PNG/JPEG/WebP/GIF files up to 10 MB. Uploads go directly to Supabase Storage, bypassing Vercel request body limits.
- `sapabase_connect.txt`, `.env.local`, student lists and `.local/` are private local files and must never be committed.

## Operation

- Teachers add/import students with `student_code,full_name` CSV headers. Download generated passwords immediately and distribute individually. Repeat imports skip existing codes.
- Students change the temporary password before accessing protected pages.
- Published lessons and assessments come from Supabase. Starting an assessment creates or resumes an attempt; merely opening its page does not consume an attempt.
- Questions and choices are shuffled on the server; answer keys are never sent to the quiz client. Scoring and attempt/time limits are enforced on the server. Grades persist to `attempts`.
- Answers autosave to the database; timed submissions after expiry use the last saved answers. Refreshing and clicking "ทำต่อ" resumes the existing attempt.
- Teachers grade submissions and affective scores in the dashboard. Gradebook uses best test and simulation results, and averages all required assignments including missing work as zero.
- Replacing a submitted assignment clears its previous grade and returns it for review.
- Certificates require passing all nine posttests (60%) and submitting all nine assignments.

## Verification

`npm run typecheck`, `npm run validate-content`, `npm run build`, and `npm run check-supabase`.

With the development server running, `npm run test:production` runs integration tests against the configured Supabase using disposable test accounts, then removes those accounts and their test records. It does not change existing student scores. The test accounts are never emailed.
