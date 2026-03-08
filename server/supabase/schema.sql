-- Run this in Supabase SQL Editor before starting the API.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  supabase_id uuid not null unique,
  email text not null unique,
  name text not null,
  role text not null default 'student' check (role in ('student', 'admin', 'faculty')),
  roll_number text,
  department text,
  year text,
  phone text,
  avatar text default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.queries (
  id uuid primary key default gen_random_uuid(),
  query_id text not null unique,
  title text not null,
  description text not null,
  category text not null check (category in ('Scholarship','Attendance','Exam','Internship','Mentoring','Library','Hostel','Fee','Other')),
  status text not null default 'open' check (status in ('open','in-progress','resolved','closed')),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  raised_by uuid not null references public.profiles(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  attachments jsonb not null default '[]'::jsonb,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.query_responses (
  id uuid primary key default gen_random_uuid(),
  query_id uuid not null references public.queries(id) on delete cascade,
  message text not null,
  responded_by uuid not null references public.profiles(id) on delete cascade,
  is_internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_supabase_id on public.profiles(supabase_id);
create index if not exists idx_queries_raised_by on public.queries(raised_by);
create index if not exists idx_queries_status on public.queries(status);
create index if not exists idx_query_responses_query_id on public.query_responses(query_id);
