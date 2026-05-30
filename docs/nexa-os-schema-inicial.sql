-- Nexa OS - schema inicial Supabase/PostgreSQL
-- Fonte oficial dos dados operacionais. Notion deve atuar como camada sincronizada.

create extension if not exists "pgcrypto";

create type app_role as enum (
  'diretoria',
  'administrativo',
  'financeiro',
  'comercial',
  'operacoes',
  'marketing',
  'juridico'
);

create type module_key as enum (
  'dashboard',
  'empreendimentos',
  'lojas',
  'lojistas',
  'contratos',
  'financeiro',
  'inadimplencia',
  'condominio',
  'fundo_promocao',
  'fpp',
  'auditoria_faturamento',
  'comercializacao',
  'ocupacao_vacancia',
  'energia',
  'agua',
  'ordens_servico',
  'documentos',
  'juridico',
  'bi',
  'relatorios',
  'configuracoes'
);

create type loja_status as enum (
  'ocupada',
  'disponivel',
  'negociacao',
  'implantacao',
  'em_obra',
  'inativa'
);

create type contrato_status as enum (
  'vigente',
  'vencido',
  'em_renovacao',
  'em_elaboracao',
  'rescindido',
  'suspenso'
);

create type financeiro_status as enum (
  'aberto',
  'pago',
  'vencido',
  'parcial',
  'cancelado',
  'acordo'
);

create type os_status as enum (
  'aberta',
  'em_triagem',
  'em_execucao',
  'aguardando_terceiro',
  'concluida',
  'cancelada'
);

create table profiles (
  id uuid primary key,
  nome text not null,
  email text not null unique,
  role app_role not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table role_permissions (
  id uuid primary key default gen_random_uuid(),
  role app_role not null,
  module module_key not null,
  can_read boolean not null default false,
  can_create boolean not null default false,
  can_update boolean not null default false,
  can_delete boolean not null default false,
  can_export boolean not null default false,
  can_approve boolean not null default false,
  unique (role, module)
);

create table empreendimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  endereco text,
  cidade text not null,
  estado char(2) not null,
  area_terreno_m2 numeric(14,2),
  abl_m2 numeric(14,2) not null default 0,
  numero_lojas integer not null default 0,
  numero_vagas integer,
  data_inauguracao date,
  status text not null default 'ativo',
  responsavel_id uuid references profiles(id),
  fotos jsonb not null default '[]'::jsonb,
  documentos jsonb not null default '[]'::jsonb,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table user_enterprises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, empreendimento_id)
);

create table lojas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  codigo text not null,
  nome text,
  area_privativa_m2 numeric(14,2),
  area_total_m2 numeric(14,2) not null default 0,
  segmento text,
  status loja_status not null default 'disponivel',
  loja_ancora boolean not null default false,
  loja_satelite boolean not null default true,
  valor_aluguel numeric(14,2) not null default 0,
  valor_condominio numeric(14,2) not null default 0,
  valor_fundo_promocao numeric(14,2) not null default 0,
  medidor_energia text,
  medidor_agua text,
  pasta_documental_url text,
  observacoes text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (empreendimento_id, codigo)
);

create table lojistas (
  id uuid primary key default gen_random_uuid(),
  nome_fantasia text not null,
  razao_social text,
  cnpj text,
  responsavel_legal text,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  segmento text,
  loja_id uuid references lojas(id),
  data_entrada date,
  status text not null default 'ativo',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table contratos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid not null references lojas(id),
  lojista_id uuid not null references lojistas(id),
  data_inicio date not null,
  data_termino date not null,
  prazo_meses integer,
  aluguel_minimo numeric(14,2) not null default 0,
  indice_reajuste text,
  garantia text,
  seguro text,
  contrato_documento_url text,
  aditivos jsonb not null default '[]'::jsonb,
  status contrato_status not null default 'vigente',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table contract_alerts (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references contratos(id) on delete cascade,
  meses_antes integer not null check (meses_antes in (24, 12, 6, 3)),
  alert_date date not null,
  sent_at timestamptz,
  status text not null default 'pendente',
  unique (contrato_id, meses_antes)
);

create table receitas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid references lojas(id),
  contrato_id uuid references contratos(id),
  competencia date not null,
  receita text not null,
  valor numeric(14,2) not null,
  vencimento date not null,
  recebimento date,
  status financeiro_status not null default 'aberto',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table fornecedores (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id),
  nome_fantasia text,
  razao_social text not null,
  cnpj text,
  categoria text,
  contato text,
  telefone text,
  email text,
  status text not null default 'ativo',
  observacoes text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table despesas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  fornecedor_id uuid references fornecedores(id),
  fornecedor text,
  categoria text not null,
  competencia date not null,
  valor numeric(14,2) not null,
  vencimento date not null,
  pagamento date,
  centro_custo text,
  status financeiro_status not null default 'aberto',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table pagamentos_recebidos (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid not null references receitas(id) on delete cascade,
  data_recebimento date not null,
  valor_recebido numeric(14,2) not null,
  forma_pagamento text,
  conciliado boolean not null default false,
  comprovante_documento_id uuid,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table pagamentos_realizados (
  id uuid primary key default gen_random_uuid(),
  despesa_id uuid not null references despesas(id) on delete cascade,
  data_pagamento date not null,
  valor_pago numeric(14,2) not null,
  forma_pagamento text,
  conciliado boolean not null default false,
  comprovante_documento_id uuid,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table inadimplencias (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid not null references lojas(id),
  receita_id uuid references receitas(id),
  valor numeric(14,2) not null,
  dias_atraso integer not null default 0,
  faixa_regua integer generated always as (
    case
      when dias_atraso >= 90 then 90
      when dias_atraso >= 60 then 60
      when dias_atraso >= 30 then 30
      when dias_atraso >= 15 then 15
      when dias_atraso >= 5 then 5
      else 0
    end
  ) stored,
  historico text,
  negociacao text,
  responsavel_id uuid references profiles(id),
  status text not null default 'aberta',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table condominio_lancamentos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null check (tipo in ('receita', 'despesa')),
  categoria text not null,
  competencia date not null,
  valor numeric(14,2) not null,
  status financeiro_status not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fundo_promocao_lancamentos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null check (tipo in ('receita', 'despesa')),
  categoria text not null,
  competencia date not null,
  valor numeric(14,2) not null,
  status financeiro_status not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fpp_competencias (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid not null references lojas(id),
  contrato_id uuid not null references contratos(id),
  competencia date not null,
  percentual numeric(8,4) not null,
  aluguel_minimo numeric(14,2) not null,
  faturamento_informado numeric(14,2),
  faturamento_auditado numeric(14,2),
  valor_percentual numeric(14,2) generated always as (coalesce(faturamento_auditado, faturamento_informado, 0) * percentual) stored,
  valor_complementar numeric(14,2) generated always as (greatest((coalesce(faturamento_auditado, faturamento_informado, 0) * percentual) - aluguel_minimo, 0)) stored,
  valor_cobrado numeric(14,2) generated always as (greatest((coalesce(faturamento_auditado, faturamento_informado, 0) * percentual), aluguel_minimo)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contrato_id, competencia)
);

create table auditorias_faturamento (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid not null references lojas(id),
  competencia date not null,
  relatorio_erp numeric(14,2),
  relatorio_pdv numeric(14,2),
  stone numeric(14,2),
  rede numeric(14,2),
  cielo numeric(14,2),
  pix numeric(14,2),
  ifood numeric(14,2),
  delivery numeric(14,2),
  faturamento_base numeric(14,2),
  divergencia_percentual numeric(8,4),
  queda_percentual numeric(8,4),
  alerta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loja_id, competencia)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid references lojas(id),
  empresa text not null,
  segmento text,
  responsavel_id uuid references profiles(id),
  etapa text not null default 'lead',
  proxima_acao text,
  historico text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table propostas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  lead_id uuid references leads(id),
  loja_id uuid references lojas(id),
  valor_aluguel numeric(14,2),
  valor_condominio numeric(14,2),
  valor_fundo_promocao numeric(14,2),
  status text not null default 'enviada',
  data_envio date,
  validade date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table medicoes_energia (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid not null references lojas(id),
  competencia date not null,
  consumo numeric(14,2) not null,
  valor numeric(14,2) not null,
  variacao_percentual numeric(8,4),
  alerta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loja_id, competencia)
);

create table medicoes_agua (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid not null references lojas(id),
  competencia date not null,
  consumo numeric(14,2) not null,
  valor numeric(14,2) not null,
  variacao_percentual numeric(8,4),
  alerta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (loja_id, competencia)
);

create table ordens_servico (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid references lojas(id),
  categoria text not null,
  prioridade text not null default 'media',
  status os_status not null default 'aberta',
  responsavel_id uuid references profiles(id),
  prazo date,
  custo_previsto numeric(14,2),
  custo_realizado numeric(14,2),
  fotos_antes jsonb not null default '[]'::jsonb,
  fotos_depois jsonb not null default '[]'::jsonb,
  descricao text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table documentos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id),
  loja_id uuid references lojas(id),
  lojista_id uuid references lojistas(id),
  contrato_id uuid references contratos(id),
  ordem_servico_id uuid references ordens_servico(id),
  categoria text not null,
  titulo text not null,
  arquivo_url text,
  google_drive_url text,
  validade date,
  status text not null default 'ativo',
  observacoes text,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table juridico_casos (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid references lojas(id),
  lojista_id uuid references lojistas(id),
  contrato_id uuid references contratos(id),
  tipo text not null,
  status text not null default 'aberto',
  responsavel_id uuid references profiles(id),
  prazo date,
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table marketing_acoes (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  nome text not null,
  categoria text,
  data_inicio date,
  data_fim date,
  orcamento numeric(14,2),
  realizado numeric(14,2),
  status text not null default 'planejada',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table ocupacao_snapshots (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  competencia date not null,
  total_lojas integer not null default 0,
  lojas_ocupadas integer not null default 0,
  lojas_vagas integer not null default 0,
  abl_total numeric(14,2) not null default 0,
  abl_ocupada numeric(14,2) not null default 0,
  abl_vaga numeric(14,2) not null default 0,
  receita_potencial numeric(14,2) not null default 0,
  receita_perdida numeric(14,2) not null default 0,
  tempo_medio_vacancia_dias integer,
  created_at timestamptz not null default now(),
  unique (empreendimento_id, competencia)
);

create table indicadores_snapshot (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid references empreendimentos(id),
  competencia date not null,
  indicador text not null,
  valor numeric(16,4) not null,
  unidade text,
  created_at timestamptz not null default now(),
  unique (empreendimento_id, competencia, indicador)
);

create table relatorios_mensais (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  competencia date not null,
  pdf_url text,
  recomendacoes text,
  status text not null default 'rascunho',
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empreendimento_id, competencia)
);

create table notion_sync_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  notion_database_id text,
  notion_page_id text,
  direction text not null default 'app_to_notion',
  status text not null default 'pending',
  error text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_id)
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_lojas_empreendimento_status on lojas (empreendimento_id, status);
create index idx_contratos_vencimento on contratos (empreendimento_id, data_termino, status);
create index idx_receitas_competencia_status on receitas (empreendimento_id, competencia, status);
create index idx_despesas_competencia_status on despesas (empreendimento_id, competencia, status);
create index idx_fornecedores_empreendimento on fornecedores (empreendimento_id, status);
create index idx_inadimplencias_regua on inadimplencias (empreendimento_id, faixa_regua, status);
create index idx_os_kanban on ordens_servico (empreendimento_id, status, prioridade);
create index idx_documentos_validade on documentos (empreendimento_id, validade, status);

create or replace view vw_dashboard_executivo as
select
  e.id as empreendimento_id,
  e.nome as empreendimento,
  e.abl_m2 as abl_total,
  count(l.id) as total_lojas,
  count(l.id) filter (where l.status = 'ocupada') as lojas_ocupadas,
  count(l.id) filter (where l.status in ('disponivel', 'negociacao', 'implantacao', 'em_obra')) as lojas_disponiveis_operacionais,
  coalesce(sum(l.area_total_m2) filter (where l.status = 'ocupada'), 0) as abl_ocupada,
  coalesce(sum(l.area_total_m2) filter (where l.status <> 'ocupada'), 0) as abl_disponivel,
  case when e.abl_m2 > 0
    then coalesce(sum(l.area_total_m2) filter (where l.status = 'ocupada'), 0) / e.abl_m2
    else 0
  end as taxa_ocupacao
from empreendimentos e
left join lojas l on l.empreendimento_id = e.id and l.deleted_at is null
where e.deleted_at is null
group by e.id, e.nome, e.abl_m2;
