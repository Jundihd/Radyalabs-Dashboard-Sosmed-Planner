-- Radya Labs Social Media System (v1 Schema — REAL, Supabase)
-- Jalankan file ini di Supabase SQL Editor, lalu seed.sql

create extension if not exists "pgcrypto";

-- 1. BRANDS
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  audience_summary text not null,
  tone_context text not null,
  created_at timestamptz default now()
);

-- 2. USERS
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  role text check (role in ('creator', 'approver')) not null default 'creator',
  created_at timestamptz default now()
);

-- 3. POSTS (lifecycle: draft -> pending_approval -> approved -> posted / rejected)
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  brand_slug text not null default 'radya',
  platform text check (platform in ('instagram', 'linkedin')) not null default 'instagram',
  status text check (status in ('draft', 'pending_approval', 'approved', 'posted', 'rejected')) default 'draft',
  title text not null,
  caption text default '',
  media_url text,
  scheduled_at timestamptz,
  created_by text,
  rejection_comment text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migrasi ringan kalau tabel lama belum punya kolom brand_slug/media
alter table posts add column if not exists brand_slug text not null default 'radya';
alter table posts add column if not exists media_url text;
alter table posts add column if not exists updated_at timestamptz default now();
-- brand_id jadi nullable agar insert via slug tetap aman
alter table posts alter column brand_id drop not null;

create index if not exists idx_posts_scheduled on posts(scheduled_at);
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_brand on posts(brand_slug);

-- 5. MEDIA STORAGE — foto dari Gemini disimpan sebagai file nyata, URL-nya ada di posts.media_url.
insert into storage.buckets (id, name, public)
values ('social-media', 'social-media', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view social media" on storage.objects;
create policy "Public can view social media"
on storage.objects for select
using (bucket_id = 'social-media');

-- 4. RLS — internal tool: izinkan read + insert + update + delete via anon/service key
alter table brands enable row level security;
alter table users enable row level security;
alter table posts enable row level security;

drop policy if exists "Allow all users to read brands" on brands;
create policy "Allow all users to read brands" on brands for select using (true);

drop policy if exists "Allow internal team to read posts" on posts;
create policy "Allow internal team to read posts" on posts for select using (true);

drop policy if exists "Allow authenticated users to insert posts" on posts;
create policy "Allow anon+auth insert posts" on posts for insert with check (true);

drop policy if exists "Allow updates on posts" on posts;
create policy "Allow updates on posts" on posts for update using (true) with check (true);

drop policy if exists "Allow deletes on posts" on posts;
create policy "Allow deletes on posts" on posts for delete using (true);
