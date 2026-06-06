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
- BI, relatorio mensal automatico e controle de acesso por perfil

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
NOTION_API_KEY=
NOTION_PARENT_PAGE_ID=
CRON_SECRET=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_AUTH_REQUIRED=
```

As migrations estao em `supabase/migrations/`:

- `001_nexa_os_core.sql`: tabelas operacionais e seeds iniciais.
- `002_rls_enums_tenant.sql`: RLS, usuarios, perfis base e multiempreendimento.
- `003` a `008`: comercializacao, vacancia, consumo, OS, documentos e juridico.
- `009_reporting_access_notion.sql`: relatorios mensais, indicadores, matriz de acesso e controle de sync com Notion.

O manifesto TypeScript das 23 bases Notion esta em `lib/notion/schema.ts`.
O passo a passo de implantacao do banco esta em `docs/supabase-setup.md`.

## Automacao Notion

O endpoint `GET /api/notion/sync/cron` enfileira e processa a sincronizacao das bases Notion em lotes. Em producao, a chamada exige:

```txt
Authorization: Bearer $CRON_SECRET
```

O `vercel.json` agenda esse endpoint diariamente as 09:00 UTC. Localmente, se `CRON_SECRET` nao estiver definido, a rota pode ser chamada para teste.

## Deploy na Vercel

Use o guia `docs/vercel-deploy.md` para conectar o repositorio GitHub, cadastrar variaveis de ambiente e validar a publicacao em producao.

Antes do deploy, confira a configuracao local sem expor segredos:

```bash
npm run env:check
```

## Documentacao

- `docs/arquitetura.md`
- `docs/nexa-os-entrega-inicial.md`
- `docs/nexa-os-notion-databases.md`
- `docs/supabase-setup.md`
- `docs/vercel-deploy.md`
- `docs/auth-access.md`
- `docs/nexa-os-schema-inicial.sql`
