# Nexa OS - Setup Supabase

## Objetivo

Preparar o Supabase/PostgreSQL como fonte oficial do Nexa OS, substituindo o mock local usado no desenvolvimento.

## Checklist

1. Criar projeto no Supabase.
2. Copiar `.env.example` para `.env.local`.
3. Preencher `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Aplicar as migrations em `supabase/migrations` na ordem `001` a `012`.
5. Reiniciar o servidor Next.js.
6. Abrir `Configuracoes` e confirmar que a fonte de dados mudou para `Supabase`.

## Verificacao local

```bash
npm run supabase:check
```

Esse comando confere migrations, `.env.example`, `.env.local`, manifesto Notion e rota de criacao das bases Notion.

## Verificacao dentro do app

A tela `Configuracoes` possui o bloco `Saude do banco`, que chama:

```txt
GET /api/health/supabase
```

Esse endpoint verifica se as variaveis foram carregadas no servidor e consulta a tabela `empreendimentos`. Quando retornar `ok`, o app esta pronto para operar com dados reais.

## Leitura dos dados reais

O frontend carrega a carteira por:

```txt
GET /api/assets
```

Essa rota roda no servidor com `SUPABASE_SERVICE_ROLE_KEY`, respeitando a decisao de manter a chave sensivel fora do browser. O app continua usando fallback local quando a rota nao estiver disponivel.

## Aplicar migrations pela Management API

Quando `SUPABASE_ACCESS_TOKEN` e `SUPABASE_PROJECT_REF` estiverem definidos no ambiente, e possivel aplicar as migrations com:

```bash
npm run supabase:apply
```

Para aplicar apenas o pacote incremental do Banco de Terrenos em ambiente que ja recebeu `001` a `010`:

```bash
npm run supabase:apply -- --from=011
```

Para conferir a selecao sem enviar SQL ao Supabase:

```bash
npm run supabase:apply -- --from=011 --dry-run
```

Opcionalmente, o mesmo filtro pode ser definido por ambiente:

```bash
SUPABASE_MIGRATION_FROM=011 npm run supabase:apply
```

## Exposicao Data API

Projetos Supabase novos podem nao expor tabelas publicas novas automaticamente na Data API. Por isso, a migration `012_land_bank_data_api_grants.sql` concede acesso explicito apenas para `authenticated` e `service_role` nas tabelas do Banco de Terrenos.

Nao liberar `anon` para as tabelas `land_bank_*`. A protecao por empreendimento continua sendo feita por RLS na migration `011_nexa_land_bank.sql`.

## Ordem das migrations

- `001_nexa_os_core.sql`
- `002_rls_enums_tenant.sql`
- `003_commercial_pipeline.sql`
- `004_vacancy_occupancy.sql`
- `005_utilities_consumption.sql`
- `006_service_orders.sql`
- `007_documents_management.sql`
- `008_legal_management.sql`
- `009_reporting_access_notion.sql`
- `010_notion_workspace_binding.sql`
- `011_nexa_land_bank.sql`
- `012_land_bank_data_api_grants.sql`

## Observacao

O app continua funcionando com dados locais quando o Supabase nao esta configurado. Depois que as credenciais e as tabelas estiverem prontas, o `fetchAssetData()` passa a carregar os dados reais automaticamente.
