# LeadFlow AI

Mini-CRM multi-tenant para gestão de leads, com autenticação, atividades por lead, métricas reais e uma simulação de scoring por IA — construído como peça de portfólio em React + Vite + Supabase.

## Funcionalidades

- **Autenticação** — cadastro (com criação automática de empresa via trigger no signup), login, logout e sessão persistente via Supabase Auth.
- **Leads** — CRUD completo (criar, listar, editar, excluir), com nome, contato, origem, status do funil e valor estimado.
- **Atividades** — registro de interações (ligação, e-mail, reunião, nota...) por lead, com feed cronológico.
- **Visão geral** — métricas reais calculadas a partir dos leads da empresa (total, novos, valor estimado, taxa de conversão) e feed de atividades recentes.
- **Score de IA (demonstração)** — heurística local que gera uma pontuação e um resumo por lead a partir de status/atividades/valor. É explicitamente uma simulação (sem custo de API), com a arquitetura preparada para trocar por uma chamada real a um LLM no futuro.
- **Multi-tenant por Row Level Security** — cada empresa só enxerga seus próprios dados; isolamento garantido no banco (Postgres RLS), não só na aplicação.

## Stack

React 19 · Vite · Supabase (Postgres, Auth, RLS) · CSS puro (sem framework de UI) · ESLint.

## Rodando localmente

```bash
npm install
npm run dev
```

Crie um arquivo `.env.local` na raiz com as credenciais do seu projeto Supabase:

```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable
```

O schema (tabelas, RLS policies e o trigger de provisionamento de empresa no signup) está em `supabase/migrations/` e pode ser aplicado via SQL Editor do Supabase Studio, na ordem dos arquivos.

Outros scripts disponíveis:

```bash
npm run build    # build de produção
npm run lint      # ESLint
npm run preview   # preview do build de produção
```

## Estrutura

```
src/
  components/auth/       # tela de login/cadastro
  components/dashboard/  # shell (sidebar, header) e páginas (Visão geral, Leads, Atividades)
  hooks/                  # AuthProvider/useAuth, useCompanyId
  services/               # acesso a dados (Supabase) por domínio
supabase/migrations/      # schema, RLS policies, trigger de onboarding
```

## Arquitetura de dados

Cada usuário pertence a uma `company` (definida automaticamente no signup). Toda a segurança multi-tenant é aplicada via RLS no Postgres — as policies restringem cada `select`/`insert`/`update`/`delete` à empresa do usuário autenticado, então a UI não é a única barreira: mesmo uma chamada direta à API do Supabase com a chave pública não vaza dados de outra empresa.
