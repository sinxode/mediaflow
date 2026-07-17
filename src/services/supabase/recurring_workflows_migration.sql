-- =========================================================================
-- Phase 19: Recurring Workflows & Automatic Task Generation Migration
-- =========================================================================

-- 1. Create RECURRING WORKFLOWS Table
CREATE TABLE IF NOT EXISTS public.recurring_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) >= 3),
  task_title_template TEXT NOT NULL CHECK (char_length(task_title_template) >= 3),
  task_description_template TEXT CHECK (char_length(task_description_template) >= 5),
  category TEXT NOT NULL,
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  backup_assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
  estimated_duration TEXT,
  tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
  
  -- Schedule details
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  schedule_config JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  -- Generation offsets and timing
  generation_offset TEXT NOT NULL DEFAULT 'immediately',
  generation_time TEXT DEFAULT '09:00' NOT NULL,
  
  -- Status state: 'active', 'paused', 'disabled'
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  
  created_by UUID REFERENCES public.users(id) ON DELETE RESTRICT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create WORKFLOW HISTORY Table
CREATE TABLE IF NOT EXISTS public.workflow_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.recurring_workflows(id) ON DELETE CASCADE NOT NULL,
  scheduled_event_date DATE NOT NULL,
  generation_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  generated_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'skipped', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Prevent double task generation for the same scheduled occurrence
  CONSTRAINT unique_workflow_occurrence UNIQUE (workflow_id, scheduled_event_date)
);

-- 3. Add column to tasks table to map back to recurring workflows
ALTER TABLE public.tasks 
  ADD COLUMN IF NOT EXISTS recurring_workflow_id UUID REFERENCES public.recurring_workflows(id) ON DELETE SET NULL;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.recurring_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_history ENABLE ROW LEVEL SECURITY;

-- 5. Policies for RECURRING WORKFLOWS
DROP POLICY IF EXISTS "Allow authenticated select workflows" ON public.recurring_workflows;
CREATE POLICY "Allow authenticated select workflows" 
  ON public.recurring_workflows FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow manager write workflows" ON public.recurring_workflows;
CREATE POLICY "Allow manager write workflows" 
  ON public.recurring_workflows FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 6. Policies for WORKFLOW HISTORY
DROP POLICY IF EXISTS "Allow authenticated select history" ON public.workflow_history;
CREATE POLICY "Allow authenticated select history" 
  ON public.workflow_history FOR SELECT 
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow automated write history" ON public.workflow_history;
CREATE POLICY "Allow automated write history" 
  ON public.workflow_history FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
