-- Waitlist signups (written only from Vercel API using service role).
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_lower unique (email)
);

create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- No policies: anon/authenticated cannot read or write; service role bypasses RLS.

comment on table public.waitlist is 'Landing page waitlist; inserts via /api/waitlist only.';
