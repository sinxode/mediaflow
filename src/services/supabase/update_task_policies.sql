-- MediaFlow SQL Migration: Update Task Table RLS Policies
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Creators can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Creators and Reviewers can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Creators can delete tasks" ON public.tasks;
DROP POLICY IF EXISTS "Creators and Reviewers can delete tasks" ON public.tasks;

-- 2. Create updated policy for inserting/creating tasks (allow both creators and reviewers)
CREATE POLICY "Creators and Reviewers can create tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('creator', 'reviewer')
    )
  );

-- 3. Create updated policy for deleting tasks (allow both creators and reviewers)
CREATE POLICY "Creators and Reviewers can delete tasks" 
  ON public.tasks FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('creator', 'reviewer')
    )
  );
