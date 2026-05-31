-- NEXA OS - 004 - Ocupacao e vacancia
-- Registros de vacancia, criticidade e estrategia por loja.

create table if not exists vacancia (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id),
  empreendimento_id uuid not null references empreendimentos(id),
  inicio_vacancia date not null,
  motivo text,
  criticidade text not null default 'media'
    check (criticidade in ('baixa','media','alta','estrategica')),
  estrategia text,
  receita_potencial numeric(14,2) not null default 0,
  responsavel text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_vacancia_emp_criticidade on vacancia (empreendimento_id, criticidade) where deleted_at is null;
create index if not exists idx_vacancia_loja on vacancia (loja_id) where deleted_at is null;
create index if not exists idx_vacancia_inicio on vacancia (inicio_vacancia) where deleted_at is null;

drop trigger if exists trg_vacancia_updated_at on vacancia;
create trigger trg_vacancia_updated_at
before update on vacancia
for each row execute function set_updated_at();

alter table vacancia enable row level security;
drop policy if exists vacancia_tenant on vacancia;
create policy vacancia_tenant on vacancia for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

insert into vacancia (
  id,
  loja_id,
  empreendimento_id,
  inicio_vacancia,
  motivo,
  criticidade,
  estrategia,
  receita_potencial,
  responsavel
)
values
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',
    (select id from lojas where codigo = 'VV-03' limit 1),
    '11111111-1111-4111-8111-111111111111',
    '2026-02-10',
    'Loja em negociacao apos troca de mix.',
    'estrategica',
    'Priorizar operador de conveniencia para reforcar fluxo diario.',
    11800,
    'Comercial'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd2',
    (select id from lojas where codigo = 'VV-04' limit 1),
    '11111111-1111-4111-8111-111111111111',
    '2026-03-18',
    'Espaco disponivel para moda ou servicos leves.',
    'alta',
    'Ofertar pacote com carencia curta e contrato padrao.',
    16200,
    'Marina'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd3',
    (select id from lojas where codigo = 'BN-01' limit 1),
    '55555555-5555-4555-8555-555555555555',
    '2026-01-05',
    'Ancora em negociacao com impacto financeiro relevante.',
    'estrategica',
    'Negociar operador ancora com prazo longo e ativacao de marketing.',
    73000,
    'Diretoria'
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
    (select id from lojas where codigo = 'BC-01' limit 1),
    '44444444-4444-4444-8444-444444444444',
    '2026-04-02',
    'Risco de vacancia futura em renovacao.',
    'media',
    'Monitorar renovacao e preparar substitutos por segmento.',
    18400,
    'Comercial'
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  empreendimento_id = excluded.empreendimento_id,
  inicio_vacancia = excluded.inicio_vacancia,
  motivo = excluded.motivo,
  criticidade = excluded.criticidade,
  estrategia = excluded.estrategia,
  receita_potencial = excluded.receita_potencial,
  responsavel = excluded.responsavel;
