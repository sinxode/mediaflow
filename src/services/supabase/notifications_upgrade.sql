-- SQL Upgrade Script for Advanced Notification System

-- 1. Extend the public.notifications table with category, archiving, and generic metadata support
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'workflow_update' NOT NULL,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;

-- 2. Create the notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  push_enabled BOOLEAN DEFAULT true NOT NULL,
  email_enabled BOOLEAN DEFAULT false NOT NULL,
  mentions BOOLEAN DEFAULT true NOT NULL,
  review_requests BOOLEAN DEFAULT true NOT NULL,
  assignments BOOLEAN DEFAULT true NOT NULL,
  approvals BOOLEAN DEFAULT true NOT NULL,
  publishing_updates BOOLEAN DEFAULT true NOT NULL,
  team_hub_updates BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Establish RLS policies for preferences
DROP POLICY IF EXISTS "Users can select own preferences" ON public.notification_preferences;
CREATE POLICY "Users can select own preferences" 
  ON public.notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.notification_preferences;
CREATE POLICY "Users can insert own preferences" 
  ON public.notification_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.notification_preferences;
CREATE POLICY "Users can update own preferences" 
  ON public.notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);
