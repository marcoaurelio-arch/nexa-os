-- NEXA OS - 003 - Pipeline comercial
-- Cria oportunidades comerciais com isolamento por empreendimento.

create table if not exists comercial_leads (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid references lojas(id),
  empreendimento_id uuid not null references empreendimentos(id),
  empresa text not null,
  segmento text,
  responsavel text,
  proxima_acao text,
  data_proxima_acao date,
  historico text,
  etapa text not null default 'lead'
    check (etapa in ('prospeccao','lead','visita','proposta','negociacao','contrato','implantacao','inauguracao')),
  valor_proposta numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_comercial_emp_etapa on comercial_leads (empreendimento_id, etapa) where deleted_at is null;
create index if not exists idx_comercial_loja on comercial_leads (loja_id) where deleted_at is null;
create index if not exists idx_comercial_proxima_acao on comercial_leads (data_proxima_acao) where deleted_at is null;

drop trigger if exists trg_comercial_leads_updated_at on comercial_leads;
create trigger trg_comercial_leads_updated_at
before update on comercial_leads
for each row execute function set_updated_at();

alter table comercial_leads enable row level security;
drop policy if exists comercial_leads_tenant on comercial_leads;
create policy comercial_leads_tenant on comercial_leads for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

insert into comercial_leads (
  id,
  loja_id,
  empreendimento_id,
  empresa,
  segmento,
  responsavel,
  proxima_acao,
  data_proxima_acao,
  historico,
  etapa,
  valor_proposta
)
values
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
    (select id from lojas where codigo = 'VV-03' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'Academia Boutique',
    'Fitness',
    'Comercial',
    'Enviar estudo de mix e fluxo',
    '2026-06-04',
    'Prospect mapeado para ocupar loja satelite proxima a servicos.',
    'prospeccao',
    18500
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
    (select id from lojas where codigo = 'PN-01' limit 1),
    '22222222-2222-4222-8222-222222222222',
    'Pet Center Prime',
    'Servicos',
    'Marina',
    'Validar restricoes tecnicas com operacoes',
    '2026-06-05',
    'Lead indicado pela diretoria para sinergia com conveniencia.',
    'lead',
    14200
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
    (select id from lojas where codigo = 'VV-04' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'Cafeteria Regional',
    'Alimentacao',
    'Comercial',
    'Visita tecnica agendada',
    '2026-06-03',
    'Operador quer vitrine para avenida e area externa.',
    'visita',
    16800
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc4',
    (select id from lojas where codigo = 'BN-01' limit 1),
    '55555555-5555-4555-8555-555555555555',
    'Clinica de Estetica',
    'Saude',
    'Renata',
    'Revisar proposta com carencia de implantacao',
    '2026-06-06',
    'Proposta enviada com aluguel minimo e fundo reduzido nos 90 dias iniciais.',
    'proposta',
    18500
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc5',
    (select id from lojas where codigo = 'BC-01' limit 1),
    '44444444-4444-4444-8444-444444444444',
    'Wine Bar',
    'Gastronomia',
    'Comercial',
    'Negociar luvas e prazo contratual',
    '2026-06-07',
    'Operador aceita condominio, negocia carencia de obra.',
    'negociacao',
    22000
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-ccccccccccc6',
    (select id from lojas where codigo = 'VV-03' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'Mini Mercado',
    'Conveniencia',
    'Juridico',
    'Enviar minuta para assinatura',
    '2026-06-02',
    'Aprovado comercialmente e em elaboracao contratual.',
    'contrato',
    24000
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  empreendimento_id = excluded.empreendimento_id,
  empresa = excluded.empresa,
  segmento = excluded.segmento,
  responsavel = excluded.responsavel,
  proxima_acao = excluded.proxima_acao,
  data_proxima_acao = excluded.data_proxima_acao,
  historico = excluded.historico,
  etapa = excluded.etapa,
  valor_proposta = excluded.valor_proposta;
