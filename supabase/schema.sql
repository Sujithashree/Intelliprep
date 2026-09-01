create table if not exists public.interviews (
  id text primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null,
  role text not null,
  company text,
  mode text,
  score integer,
  duration_minutes integer
);

create table if not exists public.questions (
  id text primary key,
  question text not null,
  type text not null,
  category text,
  difficulty text,
  roles text[] not null default '{}'
);

create table if not exists public.stories (
  id text primary key,
  created_at timestamptz not null default now(),
  title text not null,
  tags text[] not null default '{}',
  situation text,
  task text,
  action text,
  result text
);

alter table public.interviews enable row level security;
alter table public.questions enable row level security;
alter table public.stories enable row level security;

create policy "Public can read interview data"
  on public.interviews for select using (true);
create policy "Public can read questions"
  on public.questions for select using (true);
create policy "Public can read stories"
  on public.stories for select using (true);
