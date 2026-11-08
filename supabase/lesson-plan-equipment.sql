-- Run in Supabase SQL Editor before using the equipment checklist.
alter table public.class_profiles
  add column if not exists equipment jsonb not null default '[]'::jsonb;
