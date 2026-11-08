-- Run this once in Supabase SQL Editor so class equipment persists.
alter table public.class_profiles
  add column if not exists equipment jsonb not null default '[]'::jsonb;
