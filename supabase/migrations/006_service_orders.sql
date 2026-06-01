-- NEXA OS - 006 - Ordens de servico
-- Kanban operacional com prioridade, responsavel, prazo, custos e evidencias.

create table if not exists ordens_servico (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  loja_id uuid references lojas(id),
  local text not null,
  categoria text not null
    check (categoria in ('eletrica','hidraulica','civil','limpeza','seguranca','jardinagem','comunicacao_visual','ar_condicionado')),
  prioridade text not null default 'media'
    check (prioridade in ('baixa','media','alta','critica')),
  status text not null default 'aberta'
    check (status in ('aberta','em_execucao','aguardando_terceiro','concluida')),
  responsavel text,
  prazo date not null,
  custo_previsto numeric(14,2) not null default 0,
  custo_realizado numeric(14,2) not null default 0,
  fotos_antes text,
  fotos_depois text,
  descricao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_ordens_servico_emp_status on ordens_servico (empreendimento_id, status) where deleted_at is null;
create index if not exists idx_ordens_servico_loja on ordens_servico (loja_id) where deleted_at is null;
create index if not exists idx_ordens_servico_prazo on ordens_servico (prazo) where deleted_at is null;
create index if not exists idx_ordens_servico_prioridade on ordens_servico (prioridade) where deleted_at is null;

drop trigger if exists trg_ordens_servico_updated_at on ordens_servico;
create trigger trg_ordens_servico_updated_at
before update on ordens_servico
for each row execute function set_updated_at();

alter table ordens_servico enable row level security;
drop policy if exists ordens_servico_tenant on ordens_servico;
create policy ordens_servico_tenant on ordens_servico for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

insert into ordens_servico (
  id,
  empreendimento_id,
  loja_id,
  local,
  categoria,
  prioridade,
  status,
  responsavel,
  prazo,
  custo_previsto,
  custo_realizado,
  fotos_antes,
  fotos_depois,
  descricao
)
values
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff1',
    '11111111-1111-4111-8111-111111111111',
    (select id from lojas where codigo = 'VV-02' limit 1),
    'Sala tecnica da Clinica Vida',
    'ar_condicionado',
    'alta',
    'aberta',
    'Operacoes',
    '2026-06-03',
    3200,
    0,
    'drive://nexa/os-1024/antes',
    null,
    'Ajuste preventivo em evaporadora com ruido acima do padrao.'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff2',
    '11111111-1111-4111-8111-111111111111',
    null,
    'Area comum - bloco central',
    'hidraulica',
    'critica',
    'em_execucao',
    'Manutencao',
    '2026-06-01',
    5800,
    2100,
    'drive://nexa/os-1025/antes',
    null,
    'Vazamento em prumada com risco de impacto em lojas vizinhas.'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff3',
    '22222222-2222-4222-8222-222222222222',
    (select id from lojas where codigo = 'PN-01' limit 1),
    'PN-01 - Cafe Jardim',
    'civil',
    'media',
    'aguardando_terceiro',
    'Engenharia',
    '2026-06-09',
    7400,
    0,
    'drive://nexa/os-1026/antes',
    null,
    'Regularizacao de acabamento em fachada antes da vistoria final.'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff4',
    '33333333-3333-4333-8333-333333333333',
    (select id from lojas where codigo = 'BR-01' limit 1),
    'BR-01 - Smart Fit Hub',
    'eletrica',
    'media',
    'aberta',
    'Eletrica',
    '2026-06-05',
    1900,
    0,
    'drive://nexa/os-1027/antes',
    null,
    'Inspecao em quadro dedicado apos oscilacao informada pelo lojista.'
  ),
  (
    'ffffffff-ffff-4fff-8fff-fffffffffff5',
    '44444444-4444-4444-8444-444444444444',
    (select id from lojas where codigo = 'BC-01' limit 1),
    'BC-01 - Odonto Mais',
    'comunicacao_visual',
    'baixa',
    'concluida',
    'Marketing',
    '2026-05-29',
    1200,
    1080,
    'drive://nexa/os-1028/antes',
    'drive://nexa/os-1028/depois',
    'Substituicao de adesivo de vitrine e padronizacao de fachada.'
  )
on conflict (id) do update set
  empreendimento_id = excluded.empreendimento_id,
  loja_id = excluded.loja_id,
  local = excluded.local,
  categoria = excluded.categoria,
  prioridade = excluded.prioridade,
  status = excluded.status,
  responsavel = excluded.responsavel,
  prazo = excluded.prazo,
  custo_previsto = excluded.custo_previsto,
  custo_realizado = excluded.custo_realizado,
  fotos_antes = excluded.fotos_antes,
  fotos_depois = excluded.fotos_depois,
  descricao = excluded.descricao;
