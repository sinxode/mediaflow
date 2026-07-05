-- MediaFlow Team Hub Schema Expansion
-- Run this script in the Supabase SQL Editor to add the Team Hub tables.

-- 1. DROP TABLES IF THEY EXIST
DROP TABLE IF EXISTS public.team_hub_item_messages CASCADE;
DROP TABLE IF EXISTS public.team_hub_plans CASCADE;
DROP TABLE IF EXISTS public.team_hub_ideas CASCADE;
DROP TABLE IF EXISTS public.team_hub_messages CASCADE;

-- 2. CREATE SCHEMAS

-- A. GLOBAL DISCUSSION MESSAGES
CREATE TABLE public.team_hub_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb NOT NULL,
  parent_id UUID REFERENCES public.team_hub_messages(id) ON DELETE CASCADE,
  reactions JSONB DEFAULT '[]'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- B. IDEAS TABLE
CREATE TABLE public.team_hub_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_discussion', 'approved', 'archived')),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- C. PLANS TABLE (Actionable items before tasks)
CREATE TABLE public.team_hub_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  linked_idea_id UUID REFERENCES public.team_hub_ideas(id) ON DELETE SET NULL,
  converted_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- D. LIGHTWEIGHT DISCUSSION THREADS FOR IDEAS & PLANS
CREATE TABLE public.team_hub_item_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type TEXT NOT NULL CHECK (item_type IN ('idea', 'plan')),
  item_id UUID NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INDEXES FOR LOOKUPS & PERFORMANCE
CREATE INDEX idx_th_messages_user ON public.team_hub_messages(user_id);
CREATE INDEX idx_th_messages_parent ON public.team_hub_messages(parent_id);
CREATE INDEX idx_th_messages_created ON public.team_hub_messages(created_at DESC);
CREATE INDEX idx_th_ideas_creator ON public.team_hub_ideas(created_by);
CREATE INDEX idx_th_ideas_status ON public.team_hub_ideas(status);
CREATE INDEX idx_th_plans_creator ON public.team_hub_plans(created_by);
CREATE INDEX idx_th_plans_status ON public.team_hub_plans(status);
CREATE INDEX idx_th_plans_idea ON public.team_hub_plans(linked_idea_id);
CREATE INDEX idx_th_item_msg_lookup ON public.team_hub_item_messages(item_type, item_id);

-- 4. ENABLE RLS
ALTER TABLE public.team_hub_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_hub_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_hub_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_hub_item_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR AUTHENTICATED USERS
CREATE POLICY "TH messages access" ON public.team_hub_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "TH ideas access" ON public.team_hub_ideas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "TH plans access" ON public.team_hub_plans
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "TH item messages access" ON public.team_hub_item_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
