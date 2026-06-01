-- NEXA OS - 008 - Juridico
-- Notificacoes, acoes judiciais, garantias, contratos, renovacoes e pendencias.

create table if not exists juridico (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id),
  empreendimento_id uuid not null references empreendimentos(id),
  contrato_id uuid references contratos(id),
  tipo text not null
    check (tipo in ('notificacao','acao_judicial','garantia','contrato','renovacao','pendencia')),
  titulo text not null,
  parte_contraria text,
  valor_causa numeric(14,2) not null default 0,
  prazo date not null,
  status text not null default 'aberto'
    check (status in ('aberto','em_andamento','aguardando','concluido','critico')),
  risco text not null default 'medio'
    check (risco in ('baixo','medio','alto')),
  responsavel text,
  historico text,
  proxima_acao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_juridico_emp_status on juridico (empreendimento_id, status) where deleted_at is null;
create index if not exists idx_juridico_loja_tipo on juridico (loja_id, tipo) where deleted_at is null;
create index if not exists idx_juridico_prazo on juridico (prazo) where deleted_at is null;
create index if not exists idx_juridico_risco on juridico (risco) where deleted_at is null;

drop trigger if exists trg_juridico_updated_at on juridico;
create trigger trg_juridico_updated_at
before update on juridico
for each row execute function set_updated_at();

alter table juridico enable row level security;
drop policy if exists juridico_tenant on juridico;
create policy juridico_tenant on juridico for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

insert into juridico (
  id,
  loja_id,
  empreendimento_id,
  contrato_id,
  tipo,
  titulo,
  parte_contraria,
  valor_causa,
  prazo,
  status,
  risco,
  responsavel,
  historico,
  proxima_acao
)
values
  (
    '18181818-1818-4181-8181-181818181801',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    (select id from contratos where loja_id = (select id from lojas where codigo = 'VV-01' limit 1) limit 1),
    'renovacao',
    'Renovacao contratual Gastro Prime',
    'Gastro Prime Alimentacao Ltda',
    0,
    '2026-08-30',
    'em_andamento',
    'medio',
    'Juridico',
    'Contrato vence em 2026-11-30 e requer alinhamento de garantia e novo indice.',
    'Preparar minuta de renovacao com Comercial.'
  ),
  (
    '18181818-1818-4181-8181-181818181802',
    (select id from lojas where codigo = 'VV-02' limit 1),
    '11111111-1111-4111-8111-111111111111',
    (select id from contratos where loja_id = (select id from lojas where codigo = 'VV-02' limit 1) limit 1),
    'notificacao',
    'Notificacao por atraso de aluguel',
    'Clinica Vida Integrada Ltda',
    31000,
    '2026-06-07',
    'critico',
    'alto',
    'Financeiro/Juridico',
    'Receita de aluguel vencida, contato administrativo sem retorno conclusivo.',
    'Enviar notificacao extrajudicial e registrar comprovante.'
  ),
  (
    '18181818-1818-4181-8181-181818181803',
    (select id from lojas where codigo = 'BR-01' limit 1),
    '33333333-3333-4333-8333-333333333333',
    (select id from contratos where loja_id = (select id from lojas where codigo = 'BR-01' limit 1) limit 1),
    'acao_judicial',
    'Acao revisional em acompanhamento',
    'Hub Fitness Rondonopolis Ltda',
    125000,
    '2026-06-20',
    'aguardando',
    'alto',
    'Escritorio parceiro',
    'Processo em fase de manifestacao sobre documentos apresentados.',
    'Revisar manifestacao e atualizar diretoria.'
  ),
  (
    '18181818-1818-4181-8181-181818181804',
    (select id from lojas where codigo = 'PN-01' limit 1),
    '22222222-2222-4222-8222-222222222222',
    null,
    'garantia',
    'Garantia pendente para implantacao',
    'Cafe Jardim Nicomedes Ltda',
    19000,
    '2026-06-12',
    'aberto',
    'medio',
    'Administrativo',
    'Operador em implantacao ainda nao apresentou garantia final.',
    'Cobrar comprovante de caucao antes da liberacao final.'
  ),
  (
    '18181818-1818-4181-8181-181818181805',
    (select id from lojas where codigo = 'VV-03' limit 1),
    '11111111-1111-4111-8111-111111111111',
    null,
    'contrato',
    'Minuta para nova operacao',
    'Mini Mercado',
    24000,
    '2026-06-05',
    'em_andamento',
    'baixo',
    'Juridico',
    'Oportunidade aprovada comercialmente e enviada para minuta.',
    'Concluir minuta e enviar para assinatura.'
  ),
  (
    '18181818-1818-4181-8181-181818181806',
    (select id from lojas where codigo = 'BC-01' limit 1),
    '44444444-4444-4444-8444-444444444444',
    null,
    'pendencia',
    'Regularizacao de seguro complementar',
    'Odonto Mais',
    0,
    '2026-07-01',
    'aberto',
    'baixo',
    'Administrativo',
    'Pendencia documental identificada no checklist mensal.',
    'Solicitar apolice complementar atualizada.'
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  empreendimento_id = excluded.empreendimento_id,
  contrato_id = excluded.contrato_id,
  tipo = excluded.tipo,
  titulo = excluded.titulo,
  parte_contraria = excluded.parte_contraria,
  valor_causa = excluded.valor_causa,
  prazo = excluded.prazo,
  status = excluded.status,
  risco = excluded.risco,
  responsavel = excluded.responsavel,
  historico = excluded.historico,
  proxima_acao = excluded.proxima_acao;
