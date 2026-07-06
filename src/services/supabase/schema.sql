-- MediaFlow Production Database Schema & Security Policy Configuration
-- Run this script in the Supabase SQL Editor to initialize the database.

-- --------------------------------------------------
-- 0. DYNAMIC CLEANUP (DROPS ALL STALE TRIGGERS ON AUTH.USERS)
-- --------------------------------------------------
DO $$
DECLARE
  trig RECORD;
BEGIN
  -- Drop all user-defined triggers on auth.users dynamically to resolve conflicts
  FOR trig IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal
  LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trig.tgname) || ' ON auth.users CASCADE;';
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS auth.handle_new_user() CASCADE; -- Drop duplicate function in auth schema if exists

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS task_status CASCADE;
DROP TYPE IF EXISTS task_priority CASCADE;

-- --------------------------------------------------
-- 1. ENUMS AND CUSTOM TYPES
-- --------------------------------------------------
CREATE TYPE user_role AS ENUM ('creator', 'reviewer');

CREATE TYPE task_status AS ENUM (
  'created',
  'assigned',
  'working',
  'ready_for_review',
  'reviewing',
  'approved',
  'published',
  'completed'
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');

-- --------------------------------------------------
-- 2. TABLE SCHEMAS
-- --------------------------------------------------

-- A. USERS TABLE (Linked to auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'creator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. TASKS TABLE
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT CHECK (char_length(description) >= 5),
  category TEXT NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'created',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
  deadline DATE,
  file_url TEXT,
  file_name TEXT,
  file_size TEXT,
  file_uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. COMMENTS TABLE
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. ACTIVITY LOGS TABLE
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- E. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  related_activity_id UUID REFERENCES public.activity_logs(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE & LOOKUPS
-- --------------------------------------------------
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_activity_logs_task_id ON public.activity_logs(task_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_related_task_id ON public.notifications(related_task_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read) WHERE (is_read = false);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id) WHERE (is_read = false);

-- --------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- A. USERS POLICIES
CREATE POLICY "Allow public select for authenticated users" 
  ON public.users FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for users on their own profiles" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id AND role = role);

CREATE POLICY "Allow insert for users on their own profiles" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- B. TASKS POLICIES
CREATE POLICY "Authenticated users can select all tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Creators and Reviewers can create tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('creator', 'reviewer')
    )
  );

CREATE POLICY "Permitted users can update tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Creators and Reviewers can delete tasks" 
  ON public.tasks FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('creator', 'reviewer')
    )
  );

-- C. COMMENTS POLICIES
CREATE POLICY "Authenticated users can select comments" 
  ON public.comments FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can edit own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- D. ACTIVITY LOGS POLICIES
CREATE POLICY "Authenticated users can select activity logs" 
  ON public.activity_logs FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can log activities" 
  ON public.activity_logs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- E. NOTIFICATIONS POLICIES
CREATE POLICY "Users can select own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- --------------------------------------------------
-- 5. AUTOMATED AUTH SYNCHRONIZATION TRIGGER
-- --------------------------------------------------
-- Automatically inserts a record into public.users when a new user registers on Supabase Auth.
-- The search path is set explicitly to public, pg_catalog to prevent resolution failures.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role user_role := 'creator'::user_role;
  meta_role text;
  meta_name text;
  safe_email text;
BEGIN
  -- Safe guard to ensure new.id is never null (should not happen on AFTER INSERT)
  IF new.id IS NULL THEN
    RETURN new;
  END IF;

  -- Handle missing or empty emails gracefully (anonymous/phone accounts fallback)
  safe_email := COALESCE(new.email, 'user_' || new.id || '@mediaflow.com');

  -- Extract name from metadata or split email prefix
  meta_name := COALESCE(new.raw_user_meta_data->>'name', split_part(safe_email, '@', 1));
  
  -- Ensure name satisfies length constraint (>= 2 chars)
  IF char_length(meta_name) < 2 THEN
    meta_name := meta_name || '_user';
  END IF;

  -- Verify and parse role enum value safely
  meta_role := new.raw_user_meta_data->>'role';
  IF meta_role IS NOT NULL AND meta_role = 'reviewer' THEN
    default_role := 'reviewer'::user_role;
  END IF;

  -- Delete any stale profile with the same email but a different ID
  -- (e.g. from manual test inserts) to prevent unique email constraint violations.
  DELETE FROM public.users WHERE email = safe_email AND id <> new.id;

  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    meta_name,
    safe_email,
    default_role
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_catalog;

-- Bind trigger on AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------
-- 6. REFERENCE SEED DATA FOR MANUAL TESTING
-- --------------------------------------------------
-- Below is a SQL block to seed a test user inside the SQL editor.
-- It inserts into Supabase Auth table (auth.users) which triggers the public profile copy.

/*
-- Copy and run this script in the SQL editor to seed your first test user:

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
BEGIN
  -- Insert into auth.users schema
  INSERT INTO auth.users (
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
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'sinan@zainussunna.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Muhammad Sinan","role":"creator"}'::jsonb, -- Sets profile role
    now(),
    now(),
    '',
    '',
    '',
    ''
  );
END $$;
*/

-- --------------------------------------------------
-- 7. STORAGE BUCKET & POLICIES SETUP
-- --------------------------------------------------
-- Create the 'mediaflow-assets' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('mediaflow-assets', 'mediaflow-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old policies if they exist to prevent name conflict errors
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Create policies to secure storage operations
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mediaflow-assets');

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mediaflow-assets');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'mediaflow-assets');
