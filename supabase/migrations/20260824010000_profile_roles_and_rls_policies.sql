-- =====================================================================
-- LeadFlow AI — profile roles + row level security policies
-- =====================================================================

-- ---------------------------------------------------------------------
-- profiles.role (admin / member)
-- ---------------------------------------------------------------------
create type public.user_role as enum ('admin', 'member');

alter table public.profiles
  add column role public.user_role not null default 'member';

-- ---------------------------------------------------------------------
-- current_company_id(): resolves the calling user's company_id.
-- SECURITY DEFINER so policies on other tables can call it without
-- depending on the caller's own visibility into profiles (avoids
-- recursive RLS evaluation).
-- ---------------------------------------------------------------------
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id
  from public.profiles
  where id = auth.uid()
$$;

revoke execute on function public.current_company_id() from public;
grant execute on function public.current_company_id() to authenticated;

-- ---------------------------------------------------------------------
-- Guard against an authenticated user changing their own role or
-- company_id. service_role (future admin tooling) is exempt.
-- ---------------------------------------------------------------------
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    if new.role <> old.role then
      raise exception 'Not authorized to change role';
    end if;
    if new.company_id is distinct from old.company_id then
      raise exception 'Not authorized to change company_id';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_profiles_privileged_fields
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileged_fields();

-- ---------------------------------------------------------------------
-- RLS policies: companies
-- Members can see their own company. No client-side insert/update/
-- delete yet — company provisioning goes through service_role.
-- ---------------------------------------------------------------------
create policy "companies_select_own"
  on public.companies
  for select
  to authenticated
  using (id = public.current_company_id());

-- ---------------------------------------------------------------------
-- RLS policies: profiles
-- Any member can see profiles in their own company (team visibility);
-- everyone can always see their own row. Users may update their own
-- row, but role/company_id changes are blocked by the trigger above.
-- No client-side insert/delete — provisioning goes through
-- service_role.
-- ---------------------------------------------------------------------
create policy "profiles_select_self_or_company"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or company_id = public.current_company_id()
  );

create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- RLS policies: leads
-- Full CRUD scoped to the caller's company. No admin/member
-- distinction yet — every authenticated company member has the same
-- access.
-- ---------------------------------------------------------------------
create policy "leads_select_company"
  on public.leads
  for select
  to authenticated
  using (company_id = public.current_company_id());

create policy "leads_insert_company"
  on public.leads
  for insert
  to authenticated
  with check (company_id = public.current_company_id());

create policy "leads_update_company"
  on public.leads
  for update
  to authenticated
  using (company_id = public.current_company_id())
  with check (company_id = public.current_company_id());

create policy "leads_delete_company"
  on public.leads
  for delete
  to authenticated
  using (company_id = public.current_company_id());

-- ---------------------------------------------------------------------
-- RLS policies: activities
-- Append-only: select + insert, no update/delete for authenticated.
-- activities has no company_id column, so visibility is derived
-- through lead_id -> leads.company_id. service_role bypasses RLS
-- entirely and can administer activities freely later.
-- ---------------------------------------------------------------------
create policy "activities_select_company"
  on public.activities
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.leads
      where leads.id = activities.lead_id
        and leads.company_id = public.current_company_id()
    )
  );

create policy "activities_insert_company"
  on public.activities
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.leads
      where leads.id = activities.lead_id
        and leads.company_id = public.current_company_id()
    )
  );
