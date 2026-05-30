# Nexa OS

Plataforma proprietaria da Nexa Malls para gestao, comercializacao e operacao de ativos comerciais, preparada para operacao multiempreendimento.

## Escopo inicial

- Dashboard executivo multiempreendimento
- Cadastro de empreendimentos
- Cadastro de lojas
- Pipeline comercial em kanban
- Contratos e alertas de vencimento
- Financeiro, inadimplencia e operacoes
- Persistencia local com fallback
- Estrutura Supabase/PostgreSQL
- Documentacao de arquitetura e databases Notion

## Empreendimentos seed

- Villa Viseu
- Piazza Nicomedes
- Bluemall Rondon
- Bluemall Centro
- Boulevard Naves

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- React Query
- React Hook Form
- Zod
- Recharts
- Supabase/PostgreSQL
- Notion API
- Vercel

## Rodando localmente

```bash
npm install --legacy-peer-deps --no-audit --no-fund --ignore-scripts
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

A migration inicial esta em `supabase/migrations/001_nexa_os_core.sql`.

## Documentacao

- `docs/arquitetura.md`
- `docs/nexa-os-entrega-inicial.md`
- `docs/nexa-os-notion-databases.md`
- `docs/nexa-os-schema-inicial.sql`
