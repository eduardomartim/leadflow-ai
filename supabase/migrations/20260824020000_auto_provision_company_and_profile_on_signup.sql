-- =====================================================================
-- LeadFlow AI — auto-provision company + profile on signup
-- =====================================================================
-- Every row inserted into auth.users gets:
--   1. a new company (name from raw_user_meta_data->>'company_name')
--   2. a profile linked to that company, role = 'admin'
--      (the signer-upper is, by definition, the founder/owner of a
--      brand-new company in this flow)
--
-- Runs SECURITY DEFINER, owned by the migration-applying role
-- (postgres, which has BYPASSRLS in Supabase). This is what lets it
-- write to public.companies / public.profiles without any new INSERT
-- policy for `authenticated` — no policy changes needed.
--
-- No revoke/grant execute here (unlike current_company_id()): this
-- function returns the pseudo-type `trigger`, which Postgres only
-- allows calling via the trigger mechanism — it cannot be exposed as
-- a PostgREST RPC, so there is no client-facing attack surface to
-- lock down. Revoking EXECUTE from PUBLIC here would require
-- remembering to grant it back to supabase_auth_admin, and forgetting
-- that would break every signup with an opaque error — not worth the
-- operational risk for zero security benefit.
--
-- Out of scope (documented, not implemented): a future "invite member
-- to existing company" flow will also fire this trigger and, as
-- written, will incorrectly create a brand-new company for the
-- invitee. When that flow is built, this function will need to check
-- a discriminator in raw_user_meta_data (e.g. invited_company_id)
-- before deciding whether to create a new company or attach to an
-- existing one.
-- =====================================================================

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

comment on function public.handle_new_user() is
  'Auto-provisions a company + admin profile for every new auth.users row. '
  'SECURITY DEFINER, owner = postgres (BYPASSRLS): no INSERT policy needed '
  'on companies/profiles for authenticated.';

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
