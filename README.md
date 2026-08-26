# LeadFlow AI

A multi-tenant CRM built to manage leads, track sales activity, and surface pipeline metrics in real time — designed and built end-to-end as a portfolio project with React, Vite, and Supabase.

## Overview

Sales teams need a lightweight way to track leads through a pipeline, log interactions, and see where deals stand — without the overhead of an enterprise CRM. LeadFlow AI solves that with a focused, fast, multi-tenant CRM: each company sees only its own data, enforced at the database level (not just in the UI), with a dashboard that turns raw lead/activity data into real, computed metrics.

**Live demo:** [leadflow-ai-projeto.vercel.app](https://leadflow-ai-projeto.vercel.app/) — no signup required, use **"Explore Demo"** on the login screen for instant read-only access to a populated workspace.

## Features

- **Authentication** — email/password sign-up and login via Supabase Auth, with automatic company + admin profile provisioning on sign-up (handled by a Postgres trigger, not client-side logic). Sessions persist across reloads.
- **Demo mode** — anonymous, read-only sign-in that drops a visitor straight into a fully populated workspace, with no account and no write access — safe to explore publicly.
- **Lead management** — listing, editing, and deleting leads, with contact info, source, funnel status, and estimated deal value. Lead creation is currently seeded/provisioned rather than exposed in the UI.
- **Sales pipeline** — leads move through 7 stages (New → Contacted → Qualified → Proposal → Negotiation → Won/Lost), visualized in a live bar chart with per-stage counts and share of total.
- **Activity tracking** — append-only log of interactions (calls, emails, meetings, notes, status changes) per lead, with a chronological feed.
- **Dashboard & metrics** — real, computed KPIs (total leads, estimated value, conversion rate, activity volume) with trend sparklines, a stage-distribution chart, an activity timeline, and a top-opportunities list — all derived from actual lead/activity data, not mocked.
- **Multi-tenancy** — every company only ever sees its own leads, activities, and team profiles.
- **Row Level Security (RLS)** — tenant isolation is enforced in Postgres itself, at the database layer, not just in application code.
- **Responsive UI** — verified at mobile (~390px), tablet (~768px), and desktop breakpoints, with no horizontal overflow and proportionally resizing charts.

## Tech Stack

- **Frontend:** React 19, Vite 8
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **Styling:** Plain CSS (no UI framework, no CSS-in-JS)
- **Tooling:** ESLint

No router, no state-management library, and no UI kit — navigation is plain React state, and the design system is hand-built CSS. This was a deliberate choice to keep the codebase small and dependency-light.

## Architecture

```
src/
  assets/                 # logo and static images
  components/auth/        # login/sign-up screen
  components/dashboard/   # shell (sidebar, header) and pages (Overview, Leads, Activities)
  hooks/                  # AuthProvider/useAuth, useCompanyId
  services/               # Supabase data access, one module per domain
supabase/migrations/      # schema, RLS policies, onboarding trigger, demo mode
```

Every user belongs to a `company`, assigned automatically on sign-up via a Postgres trigger (`handle_new_user`). All read/write access is scoped to that company through RLS policies — the frontend never filters by `company_id` on the client; it relies entirely on the database to enforce that boundary.

## Security & Data Isolation

- **RLS enabled on every table** (`companies`, `profiles`, `leads`, `activities`), deny-by-default: no policy means no access.
- **Tenant scoping via a `SECURITY DEFINER` function** (`current_company_id()`) that resolves the caller's company from their own profile — used consistently across every `SELECT`/`INSERT`/`UPDATE`/`DELETE` policy.
- **Write-path protection**: `INSERT`/`UPDATE` policies on `leads` re-validate that `company_id` matches the caller's own company on the *resulting* row, so a crafted request can't move a record into (or create one in) another tenant.
- **Privileged-field protection**: a trigger blocks any authenticated user from changing their own `role` or `company_id`, even through a permitted `UPDATE`.
- **No service-role exposure**: the frontend only ever uses Supabase's public/publishable key. Company and profile provisioning run through a `SECURITY DEFINER` trigger, not a client-side privileged call.
- **Demo mode is genuinely read-only**: anonymous sessions are scoped to a single fixed demo company via RLS — not just hidden by the UI — so even a direct API call from a demo session cannot read another tenant's data or write anything.

## Running Locally

```bash
npm install
npm run dev
```

Other available scripts:

```bash
npm run build     # production build
npm run lint       # ESLint
npm run preview    # preview the production build
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your own Supabase project credentials:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Both are safe to expose in a client bundle — Supabase's publishable key is designed for frontend use; access control is enforced by RLS, not by keeping this key secret.

The schema (tables, RLS policies, onboarding trigger, demo mode) lives in `supabase/migrations/` and can be applied via the Supabase Studio SQL Editor, in file order.

## Screenshots

<img width="1920" height="1080" alt="tela LeadFlow" src="https://github.com/user-attachments/assets/6d81ffb5-ded5-4194-a196-aa3202907704" />


## AI & Production Architecture

The current demo includes a **local, deterministic lead-scoring heuristic** (`aiScoringService.js`): it scores a lead from 0–100 based on its pipeline stage, activity count/recency, and deal value, and generates a short summary — entirely client-side, with no external API calls, no cost, and no dependency on a third-party AI provider. This keeps the demo self-contained and instantly runnable by anyone reviewing the project.

A production version of LeadFlow AI would extend this into a real pipeline:

```
Lead → CRM → AI API → Classification / Scoring → n8n → Automations / Actions
```

- **AI API**: replace the local heuristic with a call to an LLM (or a dedicated ML scoring model) to classify and score leads based on richer signals (message content, sentiment, engagement history).
- **n8n**: an orchestration layer subscribing to scoring events, driving downstream automations — e.g. notifying a rep when a lead crosses a priority threshold, updating external tools, or triggering a follow-up sequence.

**This integration is a planned/possible production architecture, not something implemented in the current demo.** Nothing in this repository calls an external LLM API or an n8n instance today — the scoring you see live is the local heuristic described above.
