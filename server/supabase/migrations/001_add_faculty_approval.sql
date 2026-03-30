-- Migration: Add faculty approval system and multiple faculty assignments
-- Run this AFTER the initial schema.sql has been executed

-- Step 1: Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approval_status text NOT NULL DEFAULT 'approved' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rejection_count integer NOT NULL DEFAULT 0;

-- Step 2: Update existing profiles to approved status
UPDATE public.profiles 
SET approval_status = 'approved', 
    approved_at = created_at 
WHERE approval_status = 'pending';

-- Step 3: Create query_faculty_assignments table for multiple faculty per query
CREATE TABLE IF NOT EXISTS public.query_faculty_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id uuid NOT NULL REFERENCES public.queries(id) ON DELETE CASCADE,
  faculty_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(query_id, faculty_id)
);

-- Step 4: Migrate existing assigned_to data to new table
INSERT INTO public.query_faculty_assignments (query_id, faculty_id, assigned_at)
SELECT id, assigned_to, updated_at
FROM public.queries
WHERE assigned_to IS NOT NULL
ON CONFLICT (query_id, faculty_id) DO NOTHING;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_query_faculty_assignments_query 
ON public.query_faculty_assignments(query_id);

CREATE INDEX IF NOT EXISTS idx_query_faculty_assignments_faculty 
ON public.query_faculty_assignments(faculty_id);

CREATE INDEX IF NOT EXISTS idx_profiles_approval_status 
ON public.profiles(approval_status) WHERE role = 'faculty';

-- Step 6: Add a comment explaining the schema change
COMMENT ON COLUMN public.profiles.approval_status IS 'Approval status for faculty accounts: pending (awaiting admin approval), approved (can login), rejected (denied access)';
COMMENT ON COLUMN public.profiles.rejection_count IS 'Number of times faculty account has been rejected (max 3 allowed)';
COMMENT ON TABLE public.query_faculty_assignments IS 'Supports multiple faculty members assigned to a single query';
