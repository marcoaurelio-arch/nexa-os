create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists empreendimentos (
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
  responsavel_id uuid,
  fotos jsonb not null default '[]'::jsonb,
  documentos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists lojas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  codigo text not null,
  nome text,
  area_privativa_m2 numeric(14,2),
  area_total_m2 numeric(14,2) not null default 0,
  segmento text,
  status text not null default 'disponivel',
  loja_ancora boolean not null default false,
  loja_satelite boolean not null default true,
  valor_aluguel numeric(14,2) not null default 0,
  valor_condominio numeric(14,2) not null default 0,
  valor_fundo_promocao numeric(14,2) not null default 0,
  medidor_energia text,
  medidor_agua text,
  pasta_documental_url text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (empreendimento_id, codigo)
);

create table if not exists lojistas (
  id uuid primary key default gen_random_uuid(),
  nome_fantasia text not null,
  razao_social text not null,
  cnpj text not null unique,
  responsavel_legal text,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  segmento text,
  loja_id uuid references lojas(id),
  data_entrada date,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists contratos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id),
  lojista_id uuid not null references lojistas(id),
  data_inicio date not null,
  data_termino date not null,
  prazo_meses integer not null default 0,
  aluguel_minimo numeric(14,2) not null default 0,
  indice_reajuste text,
  garantia text,
  seguro text,
  contrato_url text,
  aditivos integer not null default 0,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists receitas (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id),
  empreendimento_id uuid not null references empreendimentos(id),
  competencia text not null,
  receita text not null,
  valor numeric(14,2) not null default 0,
  vencimento date not null,
  recebimento date,
  status text not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists despesas (
  id uuid primary key default gen_random_uuid(),
  empreendimento_id uuid not null references empreendimentos(id),
  fornecedor text not null,
  categoria text not null,
  competencia text not null,
  valor numeric(14,2) not null default 0,
  vencimento date not null,
  pagamento date,
  centro_custo text not null,
  status text not null default 'aberto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists inadimplencias (
  id uuid primary key default gen_random_uuid(),
  receita_id uuid references receitas(id),
  loja_id uuid not null references lojas(id),
  valor numeric(14,2) not null default 0,
  dias_atraso integer not null default 0,
  historico text,
  negociacao text,
  responsavel text,
  status text not null default 'regua',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_empreendimentos_status on empreendimentos (status) where deleted_at is null;
create index if not exists idx_lojas_empreendimento_status on lojas (empreendimento_id, status) where deleted_at is null;
create index if not exists idx_lojistas_loja_status on lojistas (loja_id, status) where deleted_at is null;
create index if not exists idx_contratos_termino_status on contratos (data_termino, status) where deleted_at is null;
create index if not exists idx_receitas_competencia_status on receitas (competencia, status) where deleted_at is null;
create index if not exists idx_receitas_loja_vencimento on receitas (loja_id, vencimento) where deleted_at is null;
create index if not exists idx_despesas_competencia_status on despesas (competencia, status) where deleted_at is null;
create index if not exists idx_despesas_empreendimento_vencimento on despesas (empreendimento_id, vencimento) where deleted_at is null;
create index if not exists idx_inadimplencias_loja_status on inadimplencias (loja_id, status) where deleted_at is null;
create index if not exists idx_inadimplencias_dias_atraso on inadimplencias (dias_atraso desc) where deleted_at is null;

drop trigger if exists trg_empreendimentos_updated_at on empreendimentos;
create trigger trg_empreendimentos_updated_at
before update on empreendimentos
for each row execute function set_updated_at();

drop trigger if exists trg_lojas_updated_at on lojas;
create trigger trg_lojas_updated_at
before update on lojas
for each row execute function set_updated_at();

drop trigger if exists trg_lojistas_updated_at on lojistas;
create trigger trg_lojistas_updated_at
before update on lojistas
for each row execute function set_updated_at();

drop trigger if exists trg_contratos_updated_at on contratos;
create trigger trg_contratos_updated_at
before update on contratos
for each row execute function set_updated_at();

drop trigger if exists trg_receitas_updated_at on receitas;
create trigger trg_receitas_updated_at
before update on receitas
for each row execute function set_updated_at();

drop trigger if exists trg_despesas_updated_at on despesas;
create trigger trg_despesas_updated_at
before update on despesas
for each row execute function set_updated_at();

drop trigger if exists trg_inadimplencias_updated_at on inadimplencias;
create trigger trg_inadimplencias_updated_at
before update on inadimplencias
for each row execute function set_updated_at();

insert into empreendimentos (id, nome, cidade, estado, status, abl_m2, numero_lojas, numero_vagas)
values
  ('11111111-1111-4111-8111-111111111111', 'Villa Viseu', 'Uberlandia', 'MG', 'ativo', 8420, 62, 238),
  ('22222222-2222-4222-8222-222222222222', 'Piazza Nicomedes', 'Uberlandia', 'MG', 'implantacao', 6140, 44, 176),
  ('33333333-3333-4333-8333-333333333333', 'Bluemall Rondon', 'Rondonopolis', 'MT', 'ativo', 5100, 38, 151),
  ('44444444-4444-4444-8444-444444444444', 'Bluemall Centro', 'Uberlandia', 'MG', 'ativo', 3750, 31, 96),
  ('55555555-5555-4555-8555-555555555555', 'Boulevard Naves', 'Uberlandia', 'MG', 'planejado', 4720, 29, 122)
on conflict (id) do update set
  nome = excluded.nome,
  cidade = excluded.cidade,
  estado = excluded.estado,
  status = excluded.status,
  abl_m2 = excluded.abl_m2,
  numero_lojas = excluded.numero_lojas,
  numero_vagas = excluded.numero_vagas;

insert into lojas (
  empreendimento_id,
  codigo,
  nome,
  area_total_m2,
  segmento,
  status,
  valor_aluguel,
  valor_condominio,
  valor_fundo_promocao
)
values
  ('11111111-1111-4111-8111-111111111111', 'VV-01', 'Gastro Prime', 180, 'Alimentacao', 'ocupada', 25000, 6800, 2500),
  ('11111111-1111-4111-8111-111111111111', 'VV-02', 'Clinica Vida', 220, 'Saude', 'ocupada', 31000, 7600, 3100),
  ('11111111-1111-4111-8111-111111111111', 'VV-03', 'Loja 03', 96, 'Servicos', 'negociacao', 11800, 3400, 950),
  ('11111111-1111-4111-8111-111111111111', 'VV-04', 'Loja 04', 134, 'Moda', 'disponivel', 16200, 4100, 1300),
  ('22222222-2222-4222-8222-222222222222', 'PN-01', 'Cafe Jardim', 140, 'Alimentacao', 'implantacao', 19000, 5200, 1800),
  ('33333333-3333-4333-8333-333333333333', 'BR-01', 'Smart Fit Hub', 620, 'Fitness', 'ocupada', 52000, 12800, 4400),
  ('44444444-4444-4444-8444-444444444444', 'BC-01', 'Odonto Mais', 150, 'Saude', 'ocupada', 18400, 4500, 1200),
  ('55555555-5555-4555-8555-555555555555', 'BN-01', 'Loja ancora', 900, 'Mercado', 'negociacao', 73000, 18000, 6500)
on conflict (empreendimento_id, codigo) do update set
  nome = excluded.nome,
  area_total_m2 = excluded.area_total_m2,
  segmento = excluded.segmento,
  status = excluded.status,
  valor_aluguel = excluded.valor_aluguel,
  valor_condominio = excluded.valor_condominio,
  valor_fundo_promocao = excluded.valor_fundo_promocao;

insert into lojistas (
  nome_fantasia,
  razao_social,
  cnpj,
  responsavel_legal,
  telefone,
  whatsapp,
  email,
  endereco,
  segmento,
  loja_id,
  data_entrada,
  status
)
values
  (
    'Gastro Prime',
    'Gastro Prime Alimentacao Ltda',
    '12.345.678/0001-90',
    'Marina Campos',
    '(34) 3222-1001',
    '(34) 99991-1001',
    'financeiro@gastroprime.com.br',
    'Av. dos Vinhedos, 1200 - Uberlandia/MG',
    'Alimentacao',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '2024-03-01',
    'ativo'
  ),
  (
    'Clinica Vida',
    'Clinica Vida Integrada Ltda',
    '23.456.789/0001-10',
    'Renato Vieira',
    '(34) 3222-1002',
    '(34) 99991-1002',
    'administrativo@clinicavida.com.br',
    'Rua das Acacias, 88 - Uberlandia/MG',
    'Saude',
    (select id from lojas where codigo = 'VV-02' limit 1),
    '2024-07-15',
    'ativo'
  ),
  (
    'Smart Fit Hub',
    'Hub Fitness Rondonopolis Ltda',
    '34.567.890/0001-55',
    'Patricia Lima',
    '(66) 3422-1003',
    '(66) 99991-1003',
    'gestao@hubfitness.com.br',
    'Av. Rondon, 455 - Rondonopolis/MT',
    'Fitness',
    (select id from lojas where codigo = 'BR-01' limit 1),
    '2023-11-20',
    'ativo'
  )
on conflict (cnpj) do update set
  nome_fantasia = excluded.nome_fantasia,
  razao_social = excluded.razao_social,
  responsavel_legal = excluded.responsavel_legal,
  telefone = excluded.telefone,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  endereco = excluded.endereco,
  segmento = excluded.segmento,
  loja_id = excluded.loja_id,
  data_entrada = excluded.data_entrada,
  status = excluded.status;

insert into contratos (
  id,
  loja_id,
  lojista_id,
  data_inicio,
  data_termino,
  prazo_meses,
  aluguel_minimo,
  indice_reajuste,
  garantia,
  seguro,
  contrato_url,
  aditivos,
  status
)
values
  (
    '66666666-6666-4666-8666-666666666661',
    (select id from lojas where codigo = 'VV-01' limit 1),
    (select id from lojistas where cnpj = '12.345.678/0001-90' limit 1),
    '2024-03-01',
    '2026-11-30',
    33,
    25000,
    'IPCA',
    'Fianca bancaria',
    'Seguro empresarial ativo',
    '',
    1,
    'vencendo'
  ),
  (
    '66666666-6666-4666-8666-666666666662',
    (select id from lojas where codigo = 'VV-02' limit 1),
    (select id from lojistas where cnpj = '23.456.789/0001-10' limit 1),
    '2024-07-15',
    '2027-05-28',
    34,
    31000,
    'IGP-M',
    'Caucao',
    'Seguro empresarial ativo',
    '',
    0,
    'ativo'
  ),
  (
    '66666666-6666-4666-8666-666666666663',
    (select id from lojas where codigo = 'BR-01' limit 1),
    (select id from lojistas where cnpj = '34.567.890/0001-55' limit 1),
    '2023-11-20',
    '2026-08-29',
    33,
    52000,
    'IPCA',
    'Seguro garantia',
    'Seguro empresarial ativo',
    '',
    2,
    'renovacao'
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  lojista_id = excluded.lojista_id,
  data_inicio = excluded.data_inicio,
  data_termino = excluded.data_termino,
  prazo_meses = excluded.prazo_meses,
  aluguel_minimo = excluded.aluguel_minimo,
  indice_reajuste = excluded.indice_reajuste,
  garantia = excluded.garantia,
  seguro = excluded.seguro,
  contrato_url = excluded.contrato_url,
  aditivos = excluded.aditivos,
  status = excluded.status;

insert into receitas (
  id,
  loja_id,
  empreendimento_id,
  competencia,
  receita,
  valor,
  vencimento,
  recebimento,
  status
)
values
  (
    '77777777-7777-4777-8777-777777777771',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    '2026-05',
    'aluguel',
    25000,
    '2026-05-10',
    '2026-05-09',
    'pago'
  ),
  (
    '77777777-7777-4777-8777-777777777772',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    '2026-05',
    'condominio',
    6800,
    '2026-05-10',
    null,
    'aberto'
  ),
  (
    '77777777-7777-4777-8777-777777777773',
    (select id from lojas where codigo = 'VV-02' limit 1),
    '11111111-1111-4111-8111-111111111111',
    '2026-05',
    'aluguel',
    31000,
    '2026-05-10',
    null,
    'vencido'
  ),
  (
    '77777777-7777-4777-8777-777777777774',
    (select id from lojas where codigo = 'BR-01' limit 1),
    '33333333-3333-4333-8333-333333333333',
    '2026-05',
    'aluguel',
    52000,
    '2026-05-12',
    '2026-05-12',
    'pago'
  ),
  (
    '77777777-7777-4777-8777-777777777775',
    (select id from lojas where codigo = 'PN-01' limit 1),
    '22222222-2222-4222-8222-222222222222',
    '2026-05',
    'fundo_promocao',
    1800,
    '2026-05-15',
    null,
    'aberto'
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  empreendimento_id = excluded.empreendimento_id,
  competencia = excluded.competencia,
  receita = excluded.receita,
  valor = excluded.valor,
  vencimento = excluded.vencimento,
  recebimento = excluded.recebimento,
  status = excluded.status;

insert into despesas (
  id,
  empreendimento_id,
  fornecedor,
  categoria,
  competencia,
  valor,
  vencimento,
  pagamento,
  centro_custo,
  status
)
values
  (
    '88888888-8888-4888-8888-888888888881',
    '11111111-1111-4111-8111-111111111111',
    'Limpeza Triangulo',
    'Limpeza',
    '2026-05',
    28400,
    '2026-05-18',
    '2026-05-18',
    'Condominio',
    'pago'
  ),
  (
    '88888888-8888-4888-8888-888888888882',
    '11111111-1111-4111-8111-111111111111',
    'Seguranca Prime',
    'Seguranca',
    '2026-05',
    42000,
    '2026-05-25',
    null,
    'Condominio',
    'aberto'
  ),
  (
    '88888888-8888-4888-8888-888888888883',
    '11111111-1111-4111-8111-111111111111',
    'Agencia Criar',
    'Marketing',
    '2026-05',
    18500,
    '2026-05-20',
    null,
    'Fundo promocao',
    'vencido'
  ),
  (
    '88888888-8888-4888-8888-888888888884',
    '33333333-3333-4333-8333-333333333333',
    'Concessionaria energia',
    'Energia',
    '2026-05',
    31500,
    '2026-05-22',
    '2026-05-22',
    'Operacoes',
    'pago'
  )
on conflict (id) do update set
  empreendimento_id = excluded.empreendimento_id,
  fornecedor = excluded.fornecedor,
  categoria = excluded.categoria,
  competencia = excluded.competencia,
  valor = excluded.valor,
  vencimento = excluded.vencimento,
  pagamento = excluded.pagamento,
  centro_custo = excluded.centro_custo,
  status = excluded.status;

insert into inadimplencias (
  id,
  receita_id,
  loja_id,
  valor,
  dias_atraso,
  historico,
  negociacao,
  responsavel,
  status
)
values
  (
    '99999999-9999-4999-8999-999999999991',
    '77777777-7777-4777-8777-777777777772',
    (select id from lojas where codigo = 'VV-01' limit 1),
    6800,
    21,
    'Boleto reenviado e contato realizado por WhatsApp.',
    'Promessa de pagamento em 03/06/2026.',
    'Financeiro',
    'negociacao'
  ),
  (
    '99999999-9999-4999-8999-999999999992',
    '77777777-7777-4777-8777-777777777773',
    (select id from lojas where codigo = 'VV-02' limit 1),
    31000,
    21,
    'Notificacao preventiva enviada.',
    'Aguardando retorno do responsavel legal.',
    'Administrativo',
    'regua'
  ),
  (
    '99999999-9999-4999-8999-999999999993',
    '77777777-7777-4777-8777-777777777775',
    (select id from lojas where codigo = 'PN-01' limit 1),
    1800,
    16,
    'Primeiro lembrete enviado.',
    'A acompanhar na proxima semana.',
    'Financeiro',
    'regua'
  )
on conflict (id) do update set
  receita_id = excluded.receita_id,
  loja_id = excluded.loja_id,
  valor = excluded.valor,
  dias_atraso = excluded.dias_atraso,
  historico = excluded.historico,
  negociacao = excluded.negociacao,
  responsavel = excluded.responsavel,
  status = excluded.status;
