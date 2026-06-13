-- NEXA OS - 011 - Nexa Land Bank
-- Base geoespacial, CRM de proprietarios, score, pipeline e IA para terrenos.
-- Aplicar depois da 001 e 002, pois usa empreendimentos, usuarios e app_empreendimentos_do_usuario().

create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create or replace function land_bank_set_ponto()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.ponto = st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  end if;

  return new;
end;
$$ language plpgsql;

create table if not exists land_bank_areas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  codigo text not null,
  nome text not null,
  cidade text not null,
  estado char(2) not null,
  bairro text,
  cep text,
  endereco_completo text not null,
  latitude numeric(10,7) not null check (latitude between -90 and 90),
  longitude numeric(10,7) not null check (longitude between -180 and 180),
  google_maps_url text,
  ponto geography(Point, 4326),
  poligono geometry(MultiPolygon, 4326),
  area_total_m2 numeric(14,2) not null check (area_total_m2 > 0),
  frente_m numeric(14,2),
  topografia text,
  zoneamento text,
  coeficiente_aproveitamento numeric(8,4),
  taxa_ocupacao numeric(8,4),
  altura_maxima_m numeric(10,2),
  status text not null default 'disponivel'
    check (status in ('disponivel','em_negociacao','contrato_assinado','descartada')),
  valor_pedido numeric(14,2),
  valor_m2 numeric(14,2),
  valor_potencial numeric(14,2),
  viavel_bts boolean not null default false,
  viavel_strip_mall boolean not null default false,
  viavel_sale_leaseback boolean not null default false,
  prioridade text not null default 'media'
    check (prioridade in ('alta','media','baixa')),
  origem text,
  responsavel_id uuid references usuarios(id),
  observacoes text,
  dados_externos jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (empreendimento_id, codigo)
);

create table if not exists land_bank_proprietarios (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  nome text not null,
  telefone text,
  whatsapp text,
  email text,
  cpf_cnpj text,
  tipo text not null default 'proprietario'
    check (tipo in ('proprietario','representante','corretor','empresa')),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists land_bank_area_proprietarios (
  area_id uuid not null references land_bank_areas(id) on delete cascade,
  proprietario_id uuid not null references land_bank_proprietarios(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id),
  percentual_posse numeric(8,4),
  papel text not null default 'proprietario',
  principal boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (area_id, proprietario_id)
);

create table if not exists land_bank_anexos (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references land_bank_areas(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null
    check (tipo in ('matricula','iptu','foto','video','estudo','contrato','proposta','outro')),
  nome text not null,
  storage_bucket text not null default 'land-bank',
  storage_path text not null,
  url_publica text,
  tamanho_bytes bigint,
  mime_type text,
  metadata jsonb not null default '{}'::jsonb,
  uploaded_by uuid references usuarios(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists land_bank_scores (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references land_bank_areas(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id),
  fluxo_score integer not null check (fluxo_score between 0 and 100),
  renda_score integer not null check (renda_score between 0 and 100),
  densidade_score integer not null check (densidade_score between 0 and 100),
  concorrencia_score integer not null check (concorrencia_score between 0 and 100),
  acesso_score integer not null check (acesso_score between 0 and 100),
  visibilidade_score integer not null check (visibilidade_score between 0 and 100),
  urbanistico_score integer not null check (urbanistico_score between 0 and 100),
  score_total numeric(5,2) not null check (score_total between 0 and 100),
  classificacao text not null
    check (classificacao in ('excelente','boa','media','baixa','descartar')),
  confidence_score numeric(5,2) check (confidence_score between 0 and 100),
  fontes jsonb not null default '[]'::jsonb,
  premissas jsonb not null default '{}'::jsonb,
  calculado_por text not null default 'sistema',
  created_by uuid references usuarios(id),
  created_at timestamptz not null default now()
);

create table if not exists land_bank_pipeline (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references land_bank_areas(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id),
  etapa text not null default 'lead'
    check (etapa in ('lead','contato_realizado','visita','estudo','proposta','negociacao','contrato','implantado','cancelado')),
  posicao integer not null default 0,
  titulo text not null,
  responsavel_id uuid references usuarios(id),
  probabilidade integer check (probabilidade between 0 and 100),
  valor_potencial numeric(14,2),
  proxima_acao text,
  data_proxima_acao date,
  motivo_cancelamento text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (area_id)
);

create table if not exists land_bank_interacoes (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references land_bank_areas(id) on delete cascade,
  proprietario_id uuid references land_bank_proprietarios(id),
  pipeline_id uuid references land_bank_pipeline(id) on delete set null,
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null
    check (tipo in ('ligacao','whatsapp','reuniao','visita','email','nota','tarefa')),
  direcao text check (direcao in ('entrada','saida','interno')),
  titulo text not null,
  descricao text,
  ocorreu_em timestamptz not null default now(),
  proxima_acao text,
  data_proxima_acao date,
  responsavel_id uuid references usuarios(id),
  anexos jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists land_bank_relatorios_ia (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references land_bank_areas(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null
    check (tipo in ('analise_terreno','strip_mall','bts','melhor_uso','riscos','potencial_locacao','executivo')),
  pergunta text,
  resposta_markdown text not null,
  resposta_json jsonb not null default '{}'::jsonb,
  modelo text,
  prompt_version text,
  status text not null default 'gerado'
    check (status in ('rascunho','gerado','aprovado','enviado','arquivado')),
  gerado_por uuid references usuarios(id),
  aprovado_por uuid references usuarios(id),
  aprovado_em timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists land_bank_eventos_automacao (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references land_bank_areas(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null,
  destino text not null
    check (destino in ('notion','google_drive','gmail','google_calendar','whatsapp','zaper','webhook','interno')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pendente'
    check (status in ('pendente','processando','concluido','erro','ignorado')),
  erro text,
  processado_em timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists land_bank_permissoes_usuario (
  user_id uuid not null references usuarios(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id) on delete cascade,
  pode_ver boolean not null default true,
  pode_criar boolean not null default false,
  pode_editar boolean not null default false,
  pode_excluir boolean not null default false,
  pode_exportar boolean not null default false,
  pode_ver_dados_sensiveis boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, empreendimento_id)
);

create index if not exists idx_land_areas_emp_status on land_bank_areas (empreendimento_id, status) where deleted_at is null;
create index if not exists idx_land_areas_cidade_status on land_bank_areas (estado, cidade, status) where deleted_at is null;
create index if not exists idx_land_areas_valor on land_bank_areas (valor_pedido) where deleted_at is null;
create index if not exists idx_land_areas_metragem on land_bank_areas (area_total_m2) where deleted_at is null;
create index if not exists idx_land_areas_ponto_gist on land_bank_areas using gist (ponto);
create index if not exists idx_land_areas_poligono_gist on land_bank_areas using gist (poligono);

create index if not exists idx_land_prop_emp_nome on land_bank_proprietarios (empreendimento_id, nome) where deleted_at is null;
create index if not exists idx_land_area_prop_prop on land_bank_area_proprietarios (proprietario_id);
create index if not exists idx_land_anexos_area_tipo on land_bank_anexos (area_id, tipo) where deleted_at is null;
create index if not exists idx_land_scores_area_created on land_bank_scores (area_id, created_at desc);
create index if not exists idx_land_pipeline_emp_etapa on land_bank_pipeline (empreendimento_id, etapa, posicao) where deleted_at is null;
create index if not exists idx_land_pipeline_proxima_acao on land_bank_pipeline (data_proxima_acao) where deleted_at is null;
create index if not exists idx_land_interacoes_area_data on land_bank_interacoes (area_id, ocorreu_em desc) where deleted_at is null;
create index if not exists idx_land_ai_area_tipo on land_bank_relatorios_ia (area_id, tipo, created_at desc);
create index if not exists idx_land_eventos_status on land_bank_eventos_automacao (status, created_at);

drop trigger if exists trg_land_bank_areas_set_ponto on land_bank_areas;
create trigger trg_land_bank_areas_set_ponto
before insert or update of latitude, longitude on land_bank_areas
for each row execute function land_bank_set_ponto();

drop trigger if exists trg_land_bank_areas_updated_at on land_bank_areas;
create trigger trg_land_bank_areas_updated_at
before update on land_bank_areas
for each row execute function set_updated_at();

drop trigger if exists trg_land_bank_proprietarios_updated_at on land_bank_proprietarios;
create trigger trg_land_bank_proprietarios_updated_at
before update on land_bank_proprietarios
for each row execute function set_updated_at();

drop trigger if exists trg_land_bank_pipeline_updated_at on land_bank_pipeline;
create trigger trg_land_bank_pipeline_updated_at
before update on land_bank_pipeline
for each row execute function set_updated_at();

drop trigger if exists trg_land_bank_interacoes_updated_at on land_bank_interacoes;
create trigger trg_land_bank_interacoes_updated_at
before update on land_bank_interacoes
for each row execute function set_updated_at();

drop trigger if exists trg_land_bank_permissoes_updated_at on land_bank_permissoes_usuario;
create trigger trg_land_bank_permissoes_updated_at
before update on land_bank_permissoes_usuario
for each row execute function set_updated_at();

alter table land_bank_areas enable row level security;
drop policy if exists land_bank_areas_tenant on land_bank_areas;
create policy land_bank_areas_tenant on land_bank_areas for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_proprietarios enable row level security;
drop policy if exists land_bank_proprietarios_tenant on land_bank_proprietarios;
create policy land_bank_proprietarios_tenant on land_bank_proprietarios for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_area_proprietarios enable row level security;
drop policy if exists land_bank_area_proprietarios_tenant on land_bank_area_proprietarios;
create policy land_bank_area_proprietarios_tenant on land_bank_area_proprietarios for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_anexos enable row level security;
drop policy if exists land_bank_anexos_tenant on land_bank_anexos;
create policy land_bank_anexos_tenant on land_bank_anexos for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_scores enable row level security;
drop policy if exists land_bank_scores_tenant on land_bank_scores;
create policy land_bank_scores_tenant on land_bank_scores for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_pipeline enable row level security;
drop policy if exists land_bank_pipeline_tenant on land_bank_pipeline;
create policy land_bank_pipeline_tenant on land_bank_pipeline for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_interacoes enable row level security;
drop policy if exists land_bank_interacoes_tenant on land_bank_interacoes;
create policy land_bank_interacoes_tenant on land_bank_interacoes for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_relatorios_ia enable row level security;
drop policy if exists land_bank_relatorios_ia_tenant on land_bank_relatorios_ia;
create policy land_bank_relatorios_ia_tenant on land_bank_relatorios_ia for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_eventos_automacao enable row level security;
drop policy if exists land_bank_eventos_automacao_tenant on land_bank_eventos_automacao;
create policy land_bank_eventos_automacao_tenant on land_bank_eventos_automacao for all
  using (empreendimento_id in (select app_empreendimentos_do_usuario()))
  with check (empreendimento_id in (select app_empreendimentos_do_usuario()));

alter table land_bank_permissoes_usuario enable row level security;
drop policy if exists land_bank_permissoes_usuario_self on land_bank_permissoes_usuario;
create policy land_bank_permissoes_usuario_self on land_bank_permissoes_usuario for select
  using (user_id in (select id from usuarios where auth_uid = auth.uid()));
