-- MediaFlow Safe Notifications Table and Column Fix
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Ensure all upgraded columns exist on the public.notifications table
ALTER TABLE public.notifications 
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'workflow_update' NOT NULL,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;

-- 2. Drop old policies to prevent duplicates/conflicts
DROP POLICY IF EXISTS "Users can select own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- 3. Recreate clean RLS policies
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
