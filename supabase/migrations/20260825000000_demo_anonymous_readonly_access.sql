-- =====================================================================
-- LeadFlow AI — public "Demo Mode": anonymous sign-in, read-only
-- =====================================================================
-- Lets a visitor click "Explorar demonstração" (supabase.auth.signInAnonymously())
-- and land straight in the dashboard populated with the seed company
-- "LeadFlow" data, with no signup and no exposed credentials.
--
-- Anonymous sessions use the same `authenticated` Postgres role as real
-- users and carry `is_anonymous: true` in the JWT. No existing policy
-- changes: current_company_id() returns null for a visitor (no profiles
-- row), so every existing company-scoped policy already excludes them,
-- including all insert/update/delete policies — writes stay blocked by
-- the database itself, not just the UI. This migration only adds two
-- additive SELECT policies (permissive policies on the same table OR
-- together) scoped to is_anonymous + the demo company, plus a guard so
-- anonymous sign-ins don't each provision a throwaway company.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Skip onboarding provisioning for anonymous sign-ins.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id      uuid;
  resolved_company     text;
  resolved_full_name   text;
begin
  if new.is_anonymous then
    return new;
  end if;

  -- Idempotency guard, checked before creating the company so a
  -- re-invocation outside the normal signup flow can never leave an
  -- orphaned company behind.
  if exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

  resolved_company := nullif(trim(new.raw_user_meta_data ->> 'company_name'), '');
  if resolved_company is null then
    resolved_company := 'Minha Empresa';
  end if;

  resolved_full_name := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
  if resolved_full_name is null then
    resolved_full_name := coalesce(split_part(new.email, '@', 1), 'Novo usuário');
  end if;

  insert into public.companies (name)
  values (resolved_company)
  returning id into new_company_id;

  insert into public.profiles (id, company_id, full_name, role)
  values (new.id, new_company_id, resolved_full_name, 'admin')
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Read-only access to the demo company for anonymous visitors.
-- Scoped by the "LeadFlow" seed company name rather than a literal
-- UUID, so this migration doesn't depend on knowing that id in advance.
-- ---------------------------------------------------------------------
create policy "leads_select_demo_anonymous"
  on public.leads
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'is_anonymous')::boolean is true
    and company_id = (select id from public.companies where name = 'LeadFlow' limit 1)
  );

create policy "activities_select_demo_anonymous"
  on public.activities
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'is_anonymous')::boolean is true
    and exists (
      select 1
      from public.leads
      where leads.id = activities.lead_id
        and leads.company_id = (select id from public.companies where name = 'LeadFlow' limit 1)
    )
  );
