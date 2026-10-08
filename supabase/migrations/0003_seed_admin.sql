-- =====================================================================
-- Migration: เพิ่มบัญชี Admin / ครูผู้สอน (Admin User Seeding)
-- ข้อมูลจาก detail.txt:
--   Email: boonlert.s@mail.bbvc.ac.th
--   Password: (จะถูก hash ด้วย crypt/blowfish)
--   Role: teacher (admin ในระบบ profiles)
-- =====================================================================

create extension if not exists pgcrypto;

do $$
declare
  v_user_id uuid;
  v_email text := 'boonlert.s@mail.bbvc.ac.th';
  v_password text := '12345678';
  v_full_name text := 'อาจารย์บุญเลิศ (ผู้ดูแลระบบ)';
  v_role text := 'teacher';
begin
  -- 1. ตรวจสอบว่ามีผู้ใช้นี้ใน auth.users หรือยัง
  select id into v_user_id from auth.users where email = v_email;

  if v_user_id is null then
    -- สร้าง UUID ใหม่สำหรับ user
    v_user_id := gen_random_uuid();

    -- สร้าง user ใน auth.users ของ Supabase
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_full_name, 'role', v_role),
      now(),
      now(),
      '',
      ''
    );

    -- เพิ่มข้อมูล identity สำหรับ auth.identities
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      v_user_id,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      now(),
      now(),
      now()
    );
  else
    -- หากมี user อยู่แล้ว ให้อัปเดตรหัสผ่านและยืนยันอีเมล
    update auth.users
    set encrypted_password = crypt(v_password, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = jsonb_build_object('full_name', v_full_name, 'role', v_role),
        updated_at = now()
    where id = v_user_id;
  end if;

  -- 2. เพิ่ม/อัปเดตข้อมูลในตาราง public.profiles (role = 'teacher')
  insert into public.profiles (
    id,
    role,
    student_code,
    full_name,
    must_change_password,
    created_at
  ) values (
    v_user_id,
    'teacher',
    null,
    v_full_name,
    false,
    now()
  )
  on conflict (id) do update set
    role = 'teacher',
    full_name = v_full_name,
    must_change_password = false;

  raise notice 'Admin user % has been created/updated successfully with ID %', v_email, v_user_id;
end $$;
