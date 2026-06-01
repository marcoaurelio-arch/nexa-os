-- ============================================================
-- NEXA OS · 010 — Vinculo operacional com workspace Notion
-- Guarda database_id, data_source_id e URL para sincronizacoes pela API atual.
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================

alter table notion_databases
  add column if not exists notion_data_source_id text unique,
  add column if not exists notion_url text;

create index if not exists idx_notion_databases_data_source_id
  on notion_databases (notion_data_source_id)
  where notion_data_source_id is not null;

create index if not exists idx_notion_databases_url
  on notion_databases (notion_url)
  where notion_url is not null;
