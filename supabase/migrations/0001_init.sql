-- =====================================================================
-- e-learning: 31910-2028 การพาณิชย์บนสื่อสังคมออนไลน์
-- Run this whole file once in Supabase Dashboard > SQL Editor.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('teacher', 'student')),
  student_code text unique,
  full_name text not null default '',
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'teacher');
$$;

-- ---------------------------------------------------------------------
-- Course content
-- ---------------------------------------------------------------------
create table if not exists public.units (
  id serial primary key,
  number int not null unique,
  title text not null,
  description text not null default '',
  objectives text[] not null default '{}',
  published boolean not null default true
);

create table if not exists public.lessons (
  id serial primary key,
  unit_id int not null references public.units(id) on delete cascade,
  position int not null default 1,
  title text not null,
  content_md text not null default ''
);
create index if not exists lessons_unit_idx on public.lessons(unit_id, position);

-- Question bank (contains answer keys -> teacher only)
create table if not exists public.questions (
  id serial primary key,
  unit_id int not null references public.units(id) on delete cascade,
  text text not null,
  choices jsonb not null,            -- ["...", "...", "...", "..."]
  answer_index int not null,
  explanation text not null default ''
);
create index if not exists questions_unit_idx on public.questions(unit_id);

-- Assessments: pretest/posttest per unit, midterm, final
create table if not exists public.assessments (
  id serial primary key,
  kind text not null check (kind in ('pretest', 'posttest', 'midterm', 'final')),
  unit_id int references public.units(id) on delete cascade,
  title text not null,
  unit_numbers int[] not null default '{}',   -- source units for exams
  question_count int not null default 10,
  time_limit_minutes int,                     -- null = no limit
  max_attempts int not null default 1,
  is_open boolean not null default true,
  unique (kind, unit_id)
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  assessment_id int not null references public.assessments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  question_ids int[] not null,
  choice_orders jsonb not null,      -- { "<qid>": [2,0,3,1] } display order -> original index
  answers jsonb not null default '{}'::jsonb, -- { "<qid>": displayIndex }; server maps through choice_orders
  score int,
  max_score int not null,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  submitted_at timestamptz
);
create index if not exists attempts_student_idx on public.attempts(student_id, assessment_id);

-- ---------------------------------------------------------------------
-- Assignments (worksheets + project)
-- ---------------------------------------------------------------------
create table if not exists public.assignments (
  id serial primary key,
  unit_id int references public.units(id) on delete set null,
  kind text not null default 'worksheet' check (kind in ('worksheet', 'project')),
  title text not null,
  instructions_md text not null default '',
  max_score numeric not null default 20,
  rubric jsonb not null default '[]'::jsonb, -- [{criterion, max, description}]
  due_at timestamptz
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id int not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  file_path text,
  file_name text,
  link_url text,
  note text,
  submitted_at timestamptz not null default now(),
  is_late boolean not null default false,
  score numeric,
  rubric_scores jsonb,
  feedback text,
  graded_at timestamptz,
  unique (assignment_id, student_id)
);

-- ---------------------------------------------------------------------
-- Simulations, affective scores, unlocks, settings
-- ---------------------------------------------------------------------
create table if not exists public.simulation_results (
  student_id uuid not null references public.profiles(id) on delete cascade,
  sim_key text not null check (sim_key in ('slip', 'chat', 'pricing')),
  best_score int not null default 0,       -- 0..100
  last_score int not null default 0,
  plays int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, sim_key)
);

create table if not exists public.affective_scores (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  scores jsonb not null default '{}'::jsonb,  -- { criterionKey: 0..4 }
  note text,
  updated_at timestamptz not null default now()
);

create table if not exists public.unit_unlocks (
  student_id uuid not null references public.profiles(id) on delete cascade,
  unit_id int not null references public.units(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, unit_id)
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null
);

insert into public.settings (key, value) values
  ('grading', '{"worksheets":20,"simulations":5,"project":15,"posttests":10,"midterm":10,"final":20,"affective":20,"passPercent":60}'::jsonb)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.questions enable row level security;
alter table public.assessments enable row level security;
alter table public.attempts enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.simulation_results enable row level security;
alter table public.affective_scores enable row level security;
alter table public.unit_unlocks enable row level security;
alter table public.settings enable row level security;

-- profiles
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
  using (id = auth.uid() or public.is_teacher());
drop policy if exists profiles_teacher_all on public.profiles;
create policy profiles_teacher_all on public.profiles for all
  using (public.is_teacher()) with check (public.is_teacher());

-- read-only course content for signed-in users, full access for teacher
drop policy if exists units_read on public.units;
create policy units_read on public.units for select
  using (auth.uid() is not null and (published or public.is_teacher()));
drop policy if exists units_teacher on public.units;
create policy units_teacher on public.units for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons for select using (auth.uid() is not null);
drop policy if exists lessons_teacher on public.lessons;
create policy lessons_teacher on public.lessons for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists questions_teacher on public.questions;
create policy questions_teacher on public.questions for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists assessments_read on public.assessments;
create policy assessments_read on public.assessments for select using (auth.uid() is not null);
drop policy if exists assessments_teacher on public.assessments;
create policy assessments_teacher on public.assessments for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists attempts_read on public.attempts;
create policy attempts_read on public.attempts for select
  using (student_id = auth.uid() or public.is_teacher());

drop policy if exists assignments_read on public.assignments;
create policy assignments_read on public.assignments for select using (auth.uid() is not null);
drop policy if exists assignments_teacher on public.assignments;
create policy assignments_teacher on public.assignments for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists submissions_read on public.submissions;
create policy submissions_read on public.submissions for select
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists submissions_teacher on public.submissions;
create policy submissions_teacher on public.submissions for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists sims_read on public.simulation_results;
create policy sims_read on public.simulation_results for select
  using (student_id = auth.uid() or public.is_teacher());

drop policy if exists affective_read on public.affective_scores;
create policy affective_read on public.affective_scores for select
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists affective_teacher on public.affective_scores;
create policy affective_teacher on public.affective_scores for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists unlocks_read on public.unit_unlocks;
create policy unlocks_read on public.unit_unlocks for select
  using (student_id = auth.uid() or public.is_teacher());
drop policy if exists unlocks_teacher on public.unit_unlocks;
create policy unlocks_teacher on public.unit_unlocks for all
  using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select using (auth.uid() is not null);
drop policy if exists settings_teacher on public.settings;
create policy settings_teacher on public.settings for all
  using (public.is_teacher()) with check (public.is_teacher());

-- ---------------------------------------------------------------------
-- Storage: private bucket for submission files (max 10 MB)
-- Students upload directly from the browser into "<their uid>/..."
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('submissions', 'submissions', false, 10485760,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists submissions_upload_own on storage.objects;
create policy submissions_upload_own on storage.objects for insert to authenticated
  with check (bucket_id = 'submissions' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists submissions_read_own on storage.objects;
create policy submissions_read_own on storage.objects for select to authenticated
  using (bucket_id = 'submissions'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_teacher()));

drop policy if exists submissions_delete_own on storage.objects;
create policy submissions_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'submissions'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_teacher()));
