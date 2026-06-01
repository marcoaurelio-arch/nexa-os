-- NEXA OS - 005 - Energia e agua
-- Leituras CEMIG e DMAE por loja, competencia e medidor.

create table if not exists consumos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id),
  empreendimento_id uuid not null references empreendimentos(id),
  tipo text not null check (tipo in ('energia','agua')),
  competencia text not null,
  consumo numeric(14,2) not null default 0,
  consumo_anterior numeric(14,2) not null default 0,
  valor numeric(14,2) not null default 0,
  medidor text,
  status text not null default 'normal'
    check (status in ('normal','atencao','critico')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_consumos_emp_tipo on consumos (empreendimento_id, tipo) where deleted_at is null;
create index if not exists idx_consumos_loja on consumos (loja_id) where deleted_at is null;
create index if not exists idx_consumos_competencia on consumos (competencia) where deleted_at is null;

drop trigger if exists trg_consumos_updated_at on consumos;
create trigger trg_consumos_updated_at
before update on consumos
for each row execute function set_updated_at();

alter table consumos enable row level security;
drop policy if exists consumos_tenant on consumos;
create policy consumos_tenant on consumos for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

insert into consumos (
  id,
  loja_id,
  empreendimento_id,
  tipo,
  competencia,
  consumo,
  consumo_anterior,
  valor,
  medidor,
  status
)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'energia',
    '2026-05',
    12800,
    11800,
    14200,
    'CEMIG-VV-001',
    'normal'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2',
    (select id from lojas where codigo = 'VV-02' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'energia',
    '2026-05',
    9200,
    7100,
    10120,
    'CEMIG-VV-002',
    'atencao'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3',
    (select id from lojas where codigo = 'BR-01' limit 1),
    '33333333-3333-4333-8333-333333333333',
    'energia',
    '2026-05',
    44000,
    40200,
    48900,
    'CEMIG-BR-001',
    'normal'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee4',
    (select id from lojas where codigo = 'PN-01' limit 1),
    '22222222-2222-4222-8222-222222222222',
    'energia',
    '2026-05',
    6400,
    5400,
    7040,
    'CEMIG-PN-001',
    'normal'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee5',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'agua',
    '2026-05',
    420,
    390,
    3600,
    'DMAE-VV-001',
    'normal'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee6',
    (select id from lojas where codigo = 'VV-02' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'agua',
    '2026-05',
    610,
    340,
    5200,
    'DMAE-VV-002',
    'critico'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee7',
    (select id from lojas where codigo = 'PN-01' limit 1),
    '22222222-2222-4222-8222-222222222222',
    'agua',
    '2026-05',
    220,
    210,
    1850,
    'DMAE-PN-001',
    'normal'
  ),
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee8',
    (select id from lojas where codigo = 'BC-01' limit 1),
    '44444444-4444-4444-8444-444444444444',
    'agua',
    '2026-05',
    280,
    230,
    2420,
    'DMAE-BC-001',
    'atencao'
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  empreendimento_id = excluded.empreendimento_id,
  tipo = excluded.tipo,
  competencia = excluded.competencia,
  consumo = excluded.consumo,
  consumo_anterior = excluded.consumo_anterior,
  valor = excluded.valor,
  medidor = excluded.medidor,
  status = excluded.status;
