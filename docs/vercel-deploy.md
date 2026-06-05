# Deploy Vercel - Nexa OS

Este guia prepara o Nexa OS para publicacao em producao na Vercel usando o repositorio GitHub `marcoaurelio-arch/nexa-os`.

## 1. Conectar o repositorio

1. Acesse a Vercel e escolha **Add New Project**.
2. Importe o repositorio `marcoaurelio-arch/nexa-os`.
3. Use as configuracoes padrao do Next.js:
   - Framework Preset: `Next.js`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: default
4. Mantenha o deploy conectado ao branch `main`.

## 2. Variaveis de ambiente

Cadastre estas variaveis em **Project Settings > Environment Variables**. Marque pelo menos o ambiente **Production**.

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NOTION_API_KEY
NOTION_PARENT_PAGE_ID
CRON_SECRET
NEXT_PUBLIC_APP_URL
```

Observacoes:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser publicas no navegador.
- `SUPABASE_SERVICE_ROLE_KEY`, `NOTION_API_KEY` e `CRON_SECRET` sao segredos de servidor.
- `NEXT_PUBLIC_APP_URL` deve apontar para a URL final da aplicacao em producao.
- `.env.local` e qualquer token real nao devem ser enviados ao GitHub.

## 3. Conferir ambiente local

Antes do deploy, rode:

```bash
npm run env:check
```

Para uma validacao obrigatoria, use:

```bash
npm run env:check:strict
```

O comando mostra apenas nomes de variaveis e status. Ele nao imprime valores sensiveis.

## 4. Cron Notion

O arquivo `vercel.json` agenda a rota:

```txt
GET /api/notion/sync/cron
```

A agenda roda diariamente as `09:00 UTC`, equivalente a `06:00` em Sao Paulo no horario de Brasilia padrao.

Em producao, chamadas manuais precisam do cabecalho:

```txt
Authorization: Bearer $CRON_SECRET
```

## 5. Validacao pos-deploy

Depois do primeiro deploy em producao, conferir:

```txt
/api/health/supabase
/api/health/notion
/api/notion/sync
/api/notion/sync/cron
```

Para a rota cron, use o cabecalho de autorizacao com `CRON_SECRET`.

Checklist final:

- Build aprovado na Vercel.
- Supabase conectado.
- Notion conectado.
- 23 bases Notion registradas.
- Rotina cron respondendo com autorizacao.
- Dashboard e Configuracoes abrindo em desktop e mobile.
