-- =====================================================================
-- LeadFlow AI — Demo Mode: pin the read-only anonymous policies to the
-- demo company's literal id instead of a name lookup.
-- =====================================================================
-- The name-based subquery in 20260825000000 (`where name = 'LeadFlow'`)
-- didn't return the expected rows for the anonymous session in testing.
-- Confirmed via SQL Editor that the demo company is
-- a0b0e563-64fd-428c-8ea6-b15ea16c0d8a ("LeadFlow"). Swapping to a
-- literal UUID removes the dependency on the subquery/name matching
-- and is easier to reason about for a single fixed demo tenant. Only
-- these two anonymous-only SELECT policies are touched — every policy
-- scoping real companies (leads_select_company, activities_select_company,
-- insert/update/delete, etc.) is untouched.
-- =====================================================================

drop policy if exists "leads_select_demo_anonymous" on public.leads;
drop policy if exists "activities_select_demo_anonymous" on public.activities;

create policy "leads_select_demo_anonymous"
  on public.leads
  for select
  to authenticated
  using (
    (auth.jwt() ->> 'is_anonymous')::boolean is true
    and company_id = 'a0b0e563-64fd-428c-8ea6-b15ea16c0d8a'::uuid
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
        and leads.company_id = 'a0b0e563-64fd-428c-8ea6-b15ea16c0d8a'::uuid
    )
  );
