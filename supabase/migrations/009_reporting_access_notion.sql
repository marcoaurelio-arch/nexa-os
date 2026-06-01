-- ============================================================
-- NEXA OS · 009 — Relatorios, indicadores, perfis e sync Notion
-- Complementa os modulos BI, relatorio mensal automatico e controle de acesso.
-- Idempotente: pode rodar mais de uma vez.
-- ============================================================

create table if not exists perfis_acesso (
  id text primary key,
  nome text not null,
  descricao text not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists perfil_modulos (
  perfil_id text not null references perfis_acesso(id) on delete cascade,
  modulo text not null,
  pode_visualizar boolean not null default true,
  pode_editar boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (perfil_id, modulo)
);

create table if not exists relatorios_mensais (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id),
  competencia text not null,
  titulo text not null,
  status text not null default 'rascunho'
    check (status in ('rascunho','gerado','enviado','arquivado')),
  resumo text,
  secoes jsonb not null default '[]'::jsonb,
  recomendacoes jsonb not null default '[]'::jsonb,
  indicadores jsonb not null default '{}'::jsonb,
  pdf_url text,
  notion_page_id text,
  gerado_por uuid references usuarios(id),
  gerado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists indicadores (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id),
  relatorio_id uuid references relatorios_mensais(id) on delete set null,
  competencia text not null,
  categoria text not null,
  indicador text not null,
  valor numeric(18,4) not null default 0,
  unidade text not null default 'numero',
  origem text not null default 'nexa_os',
  meta numeric(18,4),
  variacao numeric(18,4),
  status text not null default 'normal'
    check (status in ('normal','atencao','critico')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists notion_databases (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  slug text not null unique,
  notion_database_id text unique,
  status text not null default 'pendente'
    check (status in ('pendente','criado','sincronizado','erro','pausado')),
  schema jsonb not null default '{}'::jsonb,
  relacoes jsonb not null default '[]'::jsonb,
  ultima_sincronizacao timestamptz,
  erro text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notion_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  database_id uuid references notion_databases(id) on delete set null,
  entidade text not null,
  entidade_id text,
  direcao text not null default 'push'
    check (direcao in ('push','pull')),
  status text not null default 'pendente'
    check (status in ('pendente','processando','concluido','erro')),
  payload jsonb not null default '{}'::jsonb,
  erro text,
  iniciado_em timestamptz,
  finalizado_em timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_perfil_modulos_modulo on perfil_modulos (modulo);
create index if not exists idx_relatorios_emp_competencia on relatorios_mensais (empreendimento_id, competencia) where deleted_at is null;
create index if not exists idx_relatorios_status on relatorios_mensais (status) where deleted_at is null;
create index if not exists idx_indicadores_emp_competencia on indicadores (empreendimento_id, competencia) where deleted_at is null;
create index if not exists idx_indicadores_categoria on indicadores (categoria, indicador) where deleted_at is null;
create index if not exists idx_notion_databases_status on notion_databases (status);
create index if not exists idx_notion_sync_jobs_status on notion_sync_jobs (status, created_at desc);

drop trigger if exists trg_perfis_acesso_updated_at on perfis_acesso;
create trigger trg_perfis_acesso_updated_at
before update on perfis_acesso
for each row execute function set_updated_at();

drop trigger if exists trg_relatorios_mensais_updated_at on relatorios_mensais;
create trigger trg_relatorios_mensais_updated_at
before update on relatorios_mensais
for each row execute function set_updated_at();

drop trigger if exists trg_indicadores_updated_at on indicadores;
create trigger trg_indicadores_updated_at
before update on indicadores
for each row execute function set_updated_at();

drop trigger if exists trg_notion_databases_updated_at on notion_databases;
create trigger trg_notion_databases_updated_at
before update on notion_databases
for each row execute function set_updated_at();

insert into perfis_acesso (id, nome, descricao) values
  ('diretoria', 'Diretoria', 'Visao completa da carteira, indicadores, governanca e configuracoes.'),
  ('administrativo', 'Administrativo', 'Cadastro, documentos, contratos operacionais e fechamento gerencial.'),
  ('financeiro', 'Financeiro', 'Recebiveis, despesas, inadimplencia, FPP, auditoria e relatorios.'),
  ('comercial', 'Comercial', 'Lojas, lojistas, contratos comerciais, pipeline e vacancia.'),
  ('operacoes', 'Operacoes', 'Ordens de servico, consumo, documentos tecnicos e indicadores operacionais.'),
  ('marketing', 'Marketing', 'Fundo de promocao, auditoria de campanhas, BI e reportes mensais.'),
  ('juridico', 'Juridico', 'Contratos, notificacoes, garantias, documentos e relatorios executivos.')
on conflict (id) do update set
  nome = excluded.nome,
  descricao = excluded.descricao,
  ativo = true;

insert into perfil_modulos (perfil_id, modulo, pode_visualizar, pode_editar) values
  ('diretoria','Dashboard',true,true), ('diretoria','BI',true,true), ('diretoria','Empreendimentos',true,true), ('diretoria','Lojas',true,true),
  ('diretoria','Lojistas',true,true), ('diretoria','Contratos',true,true), ('diretoria','Financeiro',true,true), ('diretoria','Inadimplencia',true,true),
  ('diretoria','Condominio',true,true), ('diretoria','Fundo',true,true), ('diretoria','FPP',true,true), ('diretoria','Auditoria',true,true),
  ('diretoria','Comercial',true,true), ('diretoria','Vacancia',true,true), ('diretoria','Operacoes',true,true), ('diretoria','Energia e Agua',true,true),
  ('diretoria','Documentos',true,true), ('diretoria','Juridico',true,true), ('diretoria','Relatorios',true,true), ('diretoria','Configuracoes',true,true),
  ('administrativo','Dashboard',true,false), ('administrativo','BI',true,false), ('administrativo','Empreendimentos',true,true), ('administrativo','Lojas',true,true),
  ('administrativo','Lojistas',true,true), ('administrativo','Contratos',true,true), ('administrativo','Condominio',true,true), ('administrativo','Documentos',true,true),
  ('administrativo','Relatorios',true,true), ('administrativo','Configuracoes',true,false),
  ('financeiro','Dashboard',true,false), ('financeiro','BI',true,false), ('financeiro','Financeiro',true,true), ('financeiro','Inadimplencia',true,true),
  ('financeiro','Condominio',true,true), ('financeiro','Fundo',true,true), ('financeiro','FPP',true,true), ('financeiro','Auditoria',true,true), ('financeiro','Relatorios',true,true),
  ('comercial','Dashboard',true,false), ('comercial','BI',true,false), ('comercial','Lojas',true,false), ('comercial','Lojistas',true,true),
  ('comercial','Contratos',true,true), ('comercial','Comercial',true,true), ('comercial','Vacancia',true,true), ('comercial','Relatorios',true,false),
  ('operacoes','Dashboard',true,false), ('operacoes','BI',true,false), ('operacoes','Operacoes',true,true), ('operacoes','Energia e Agua',true,true),
  ('operacoes','Documentos',true,true), ('operacoes','Relatorios',true,false),
  ('marketing','Dashboard',true,false), ('marketing','BI',true,false), ('marketing','Fundo',true,true), ('marketing','Auditoria',true,false),
  ('marketing','Comercial',true,false), ('marketing','Relatorios',true,true),
  ('juridico','Dashboard',true,false), ('juridico','BI',true,false), ('juridico','Contratos',true,true), ('juridico','Inadimplencia',true,false),
  ('juridico','Documentos',true,true), ('juridico','Juridico',true,true), ('juridico','Relatorios',true,false)
on conflict (perfil_id, modulo) do update set
  pode_visualizar = excluded.pode_visualizar,
  pode_editar = excluded.pode_editar;

insert into notion_databases (nome, slug, schema, relacoes) values
  ('Empreendimentos','empreendimentos','{"title":"Nome","properties":["ID Nexa","Cidade","Estado","Status","ABL","Numero de lojas","Responsavel","URL Nexa OS"]}'::jsonb,'["Lojas","Indicadores","Relatorios"]'::jsonb),
  ('Lojas','lojas','{"title":"Codigo","properties":["ID Nexa","Empreendimento","Nome da loja","Area total","Segmento","Status","Aluguel","Condominio","Fundo promocao"]}'::jsonb,'["Empreendimentos","Lojistas","Contratos","Documentos","OS"]'::jsonb),
  ('Lojistas','lojistas','{"title":"Nome fantasia","properties":["ID Nexa","Razao social","CNPJ","Responsavel legal","WhatsApp","E-mail","Segmento","Status"]}'::jsonb,'["Lojas","Contratos"]'::jsonb),
  ('Contratos','contratos','{"title":"Contrato","properties":["ID Nexa","Loja","Lojista","Data inicio","Data termino","Prazo","Aluguel minimo","Garantia","Seguro","Status"]}'::jsonb,'["Lojas","Lojistas","Documentos","Juridico"]'::jsonb),
  ('Receitas','receitas','{"title":"Receita","properties":["ID Nexa","Empreendimento","Loja","Competencia","Tipo receita","Valor","Vencimento","Recebimento","Status"]}'::jsonb,'["Empreendimentos","Lojas","Inadimplencia"]'::jsonb),
  ('Despesas','despesas','{"title":"Despesa","properties":["ID Nexa","Empreendimento","Fornecedor","Categoria","Competencia","Valor","Vencimento","Pagamento","Centro de custo","Status"]}'::jsonb,'["Empreendimentos"]'::jsonb),
  ('Inadimplencia','inadimplencia','{"title":"Caso","properties":["ID Nexa","Empreendimento","Loja","Receita","Valor","Dias atraso","Regua","Historico","Negociacao","Responsavel","Status"]}'::jsonb,'["Empreendimentos","Lojas","Receitas"]'::jsonb),
  ('Condominio','condominio','{"title":"Lancamento","properties":["ID Nexa","Empreendimento","Tipo","Categoria","Competencia","Valor","Status"]}'::jsonb,'["Empreendimentos"]'::jsonb),
  ('Fundo Promocao','fundo-promocao','{"title":"Lancamento","properties":["ID Nexa","Empreendimento","Tipo","Categoria","Competencia","Valor","Status"]}'::jsonb,'["Empreendimentos","Marketing"]'::jsonb),
  ('FPP','fpp','{"title":"Apuracao","properties":["ID Nexa","Empreendimento","Loja","Contrato","Competencia","Percentual","Aluguel minimo","Faturamento informado","Faturamento auditado","Valor complementar"]}'::jsonb,'["Empreendimentos","Lojas","Contratos"]'::jsonb),
  ('Auditoria Faturamento','auditoria-faturamento','{"title":"Auditoria","properties":["ID Nexa","Empreendimento","Loja","Competencia","ERP","PDV","Stone","Rede","Cielo","PIX","iFood","Delivery","Divergencia","Alerta"]}'::jsonb,'["Empreendimentos","Lojas"]'::jsonb),
  ('Leads','leads','{"title":"Empresa","properties":["ID Nexa","Empreendimento","Loja","Segmento","Responsavel","Etapa","Proxima acao","Historico"]}'::jsonb,'["Empreendimentos","Lojas","Propostas"]'::jsonb),
  ('Propostas','propostas','{"title":"Proposta","properties":["ID Nexa","Empreendimento","Lead","Loja","Aluguel","Condominio","Fundo promocao","Data envio","Validade","Status"]}'::jsonb,'["Empreendimentos","Leads","Lojas"]'::jsonb),
  ('Vacancia','vacancia','{"title":"Registro","properties":["ID Nexa","Empreendimento","Loja","Inicio vacancia","Dias vaga","Receita perdida","Criticidade","Estrategica","Observacoes"]}'::jsonb,'["Empreendimentos","Lojas"]'::jsonb),
  ('Ocupacao','ocupacao','{"title":"Snapshot","properties":["ID Nexa","Empreendimento","Competencia","Total lojas","Lojas ocupadas","Lojas vagas","ABL total","ABL ocupada","Taxa ocupacao"]}'::jsonb,'["Empreendimentos"]'::jsonb),
  ('Energia','energia','{"title":"Medicao","properties":["ID Nexa","Empreendimento","Loja","Competencia","Consumo","Valor","Variacao","Alerta"]}'::jsonb,'["Empreendimentos","Lojas"]'::jsonb),
  ('Agua','agua','{"title":"Medicao","properties":["ID Nexa","Empreendimento","Loja","Competencia","Consumo","Valor","Variacao","Alerta"]}'::jsonb,'["Empreendimentos","Lojas"]'::jsonb),
  ('OS','os','{"title":"Ordem","properties":["ID Nexa","Empreendimento","Loja","Categoria","Prioridade","Status","Responsavel","Prazo","Custo previsto","Custo realizado"]}'::jsonb,'["Empreendimentos","Lojas","Documentos"]'::jsonb),
  ('Juridico','juridico','{"title":"Caso","properties":["ID Nexa","Empreendimento","Loja","Lojista","Contrato","Tipo","Status","Responsavel","Prazo","Pendencias"]}'::jsonb,'["Empreendimentos","Lojas","Lojistas","Contratos"]'::jsonb),
  ('Documentos','documentos','{"title":"Documento","properties":["ID Nexa","Empreendimento","Loja","Lojista","Contrato","OS","Categoria","Arquivo","Google Drive URL","Validade","Status"]}'::jsonb,'["Empreendimentos","Lojas","Lojistas","Contratos","OS"]'::jsonb),
  ('Marketing','marketing','{"title":"Acao","properties":["ID Nexa","Empreendimento","Categoria","Data inicio","Data fim","Orcamento","Realizado","Status"]}'::jsonb,'["Empreendimentos","Fundo Promocao"]'::jsonb),
  ('Relatorios','relatorios','{"title":"Relatorio","properties":["ID Nexa","Empreendimento","Competencia","PDF","Status","Recomendacoes"]}'::jsonb,'["Empreendimentos","Indicadores"]'::jsonb),
  ('Indicadores','indicadores','{"title":"Indicador","properties":["ID Nexa","Empreendimento","Competencia","Categoria","Valor","Unidade","Status"]}'::jsonb,'["Empreendimentos","Relatorios"]'::jsonb)
on conflict (slug) do update set
  nome = excluded.nome,
  schema = excluded.schema,
  relacoes = excluded.relacoes;

alter table relatorios_mensais enable row level security;
drop policy if exists relatorios_mensais_tenant on relatorios_mensais;
create policy relatorios_mensais_tenant on relatorios_mensais for all
  using ( empreendimento_id is null or empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id is null or empreendimento_id in (select app_empreendimentos_do_usuario()) );

alter table indicadores enable row level security;
drop policy if exists indicadores_tenant on indicadores;
create policy indicadores_tenant on indicadores for all
  using ( empreendimento_id is null or empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id is null or empreendimento_id in (select app_empreendimentos_do_usuario()) );

alter table perfis_acesso enable row level security;
drop policy if exists perfis_acesso_read on perfis_acesso;
create policy perfis_acesso_read on perfis_acesso for select using (true);

alter table perfil_modulos enable row level security;
drop policy if exists perfil_modulos_read on perfil_modulos;
create policy perfil_modulos_read on perfil_modulos for select using (true);

alter table notion_databases enable row level security;
drop policy if exists notion_databases_diretoria on notion_databases;
create policy notion_databases_diretoria on notion_databases for all
  using (exists (select 1 from usuarios where auth_uid = auth.uid() and perfil in ('diretoria','administrativo')))
  with check (exists (select 1 from usuarios where auth_uid = auth.uid() and perfil in ('diretoria','administrativo')));

alter table notion_sync_jobs enable row level security;
drop policy if exists notion_sync_jobs_diretoria on notion_sync_jobs;
create policy notion_sync_jobs_diretoria on notion_sync_jobs for all
  using (exists (select 1 from usuarios where auth_uid = auth.uid() and perfil in ('diretoria','administrativo')))
  with check (exists (select 1 from usuarios where auth_uid = auth.uid() and perfil in ('diretoria','administrativo')));
