-- =========================================================================
-- Phase 20: Computer Lab Operations Center (Ignite LabOS) Migration
-- =========================================================================

-- 1. Create LAB SESSIONS Table
CREATE TABLE IF NOT EXISTS public.lab_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 3),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  operating_days TEXT[] DEFAULT '{"monday", "tuesday", "wednesday", "thursday", "friday"}'::text[] NOT NULL,
  capacity_minutes INT DEFAULT 300 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create LAB STUDENTS Table
CREATE TABLE IF NOT EXISTS public.lab_students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  enrollment_number TEXT UNIQUE NOT NULL CHECK (char_length(enrollment_number) >= 3),
  batch TEXT NOT NULL,
  credit_balance INT DEFAULT 45 NOT NULL, -- Initial default allocation
  total_sessions INT DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create LAB REQUESTS & ACTIVE SESSIONS Table
CREATE TABLE IF NOT EXISTS public.lab_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.lab_students(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.lab_sessions(id) ON DELETE CASCADE NOT NULL,
  purpose TEXT NOT NULL,
  requested_duration INT NOT NULL CHECK (requested_duration > 0),
  
  -- status: 'pending', 'approved', 'active', 'completed', 'rejected', 'cancelled'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'completed', 'rejected', 'cancelled')),
  
  assigned_computer TEXT, -- PC-1, PC-2, etc.
  queue_position INT,
  notes TEXT,
  
  -- Timestamps
  request_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  approval_time TIMESTAMP WITH TIME ZONE,
  session_start_time TIMESTAMP WITH TIME ZONE,
  session_end_time TIMESTAMP WITH TIME ZONE,
  actual_duration INT, -- recorded in minutes upon session end
  
  -- Credit tracking
  credits_used INT DEFAULT 0 NOT NULL,
  credits_returned INT DEFAULT 0 NOT NULL,
  
  -- Extensions
  extension_requested_duration INT DEFAULT 0 NOT NULL,
  extension_status TEXT NOT NULL DEFAULT 'none' CHECK (extension_status IN ('none', 'pending', 'approved', 'rejected')),
  
  reviewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create LAB SETTINGS Table
CREATE TABLE IF NOT EXISTS public.lab_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- 5. Seed default lab settings
INSERT INTO public.lab_settings (key, value) VALUES
  ('pc_count', '4'::jsonb),
  ('pc_names', '["PC-1", "PC-2", "PC-3", "PC-4"]'::jsonb),
  ('warning_threshold', '5'::jsonb), -- Warning at 5 minutes
  ('alert_threshold', '1'::jsonb),   -- Alert at 1 minute
  ('overtime_policy', '"allow"'::jsonb),
  ('default_credit_allocation', '45'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 6. Seed some default lab sessions
INSERT INTO public.lab_sessions (name, start_time, end_time, operating_days, capacity_minutes) VALUES
  ('Morning Lab Session', '09:00:00', '10:30:00', '{"monday", "tuesday", "wednesday", "thursday", "friday"}', 360),
  ('Evening Lab Session', '17:00:00', '18:15:00', '{"monday", "tuesday", "wednesday", "thursday", "friday"}', 300),
  ('Weekend Lab Practice', '10:00:00', '12:00:00', '{"saturday", "sunday"}', 480)
ON CONFLICT DO NOTHING;

-- 7. Seed initial test students
INSERT INTO public.lab_students (name, enrollment_number, batch, credit_balance) VALUES
  ('Muhammad Nihal', 'IGN-2026-001', 'Batch Alpha', 45),
  ('Muhammad Irfan', 'IGN-2026-002', 'Batch Alpha', 30),
  ('Ashif Rahman', 'IGN-2026-003', 'Batch Beta', 60),
  ('Fahad Shamil', 'IGN-2026-004', 'Batch Beta', 45),
  ('Salman Faris', 'IGN-2026-005', 'Batch Gamma', 45)
ON CONFLICT (enrollment_number) DO NOTHING;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.lab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_settings ENABLE ROW LEVEL SECURITY;

-- 9. Setup permissive policies for anonymous / authenticated access (Shared student terminal uses anon or auth)
CREATE POLICY "Allow select lab sessions" ON public.lab_sessions FOR SELECT USING (true);
CREATE POLICY "Allow write lab sessions" ON public.lab_sessions FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow select lab students" ON public.lab_students FOR SELECT USING (true);
CREATE POLICY "Allow write lab students" ON public.lab_students FOR ALL USING (true);

CREATE POLICY "Allow select lab requests" ON public.lab_requests FOR SELECT USING (true);
CREATE POLICY "Allow write lab requests" ON public.lab_requests FOR ALL USING (true);

CREATE POLICY "Allow select lab settings" ON public.lab_settings FOR SELECT USING (true);
CREATE POLICY "Allow write lab settings" ON public.lab_settings FOR ALL USING (auth.role() = 'authenticated');
