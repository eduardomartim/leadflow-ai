-- =====================================================================
-- LeadFlow AI — initial schema
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM types
-- ---------------------------------------------------------------------
create type public.lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

create type public.lead_source as enum (
  'website',
  'referral',
  'cold_call',
  'social_media',
  'email_campaign',
  'event',
  'other'
);

create type public.activity_type as enum (
  'note',
  'call',
  'email',
  'meeting',
  'status_change',
  'task',
  'other'
);

-- ---------------------------------------------------------------------
-- Generic updated_at trigger function
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- companies (tenant)
-- ---------------------------------------------------------------------
create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(trim(name)) > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger set_companies_updated_at
  before update on public.companies
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  company_id  uuid references public.companies(id) on delete set null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_profiles_company_id on public.profiles(company_id);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------
create table public.leads (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies(id) on delete cascade,
  name            text not null check (char_length(trim(name)) > 0),
  email           text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone           text,
  company_name    text,
  source          public.lead_source not null default 'other',
  status          public.lead_status not null default 'new',
  estimated_value numeric(12,2) check (estimated_value is null or estimated_value >= 0),
  notes           text,
  ai_score        numeric(5,2) check (ai_score is null or (ai_score >= 0 and ai_score <= 100)),
  ai_summary      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_leads_company_id on public.leads(company_id);
create index idx_leads_status     on public.leads(status);
create index idx_leads_source     on public.leads(source);
create index idx_leads_email      on public.leads(email);
create index idx_leads_created_at on public.leads(created_at);

create trigger set_leads_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- activities (immutable log, no updated_at)
-- ---------------------------------------------------------------------
create table public.activities (
  id          uuid primary key default gen_random_uuid(),
  lead_id     uuid not null references public.leads(id) on delete cascade,
  type        public.activity_type not null default 'note',
  description text not null check (char_length(trim(description)) > 0),
  created_at  timestamptz not null default now()
);

create index idx_activities_lead_id    on public.activities(lead_id);
create index idx_activities_created_at on public.activities(created_at);

-- ---------------------------------------------------------------------
-- RLS: enabled everywhere, NO policies yet (deny-all by default)
-- ---------------------------------------------------------------------
alter table public.companies  enable row level security;
alter table public.profiles   enable row level security;
alter table public.leads      enable row level security;
alter table public.activities enable row level security;
