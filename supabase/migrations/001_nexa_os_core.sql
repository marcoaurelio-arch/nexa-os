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

create index if not exists idx_empreendimentos_status on empreendimentos (status) where deleted_at is null;
create index if not exists idx_lojas_empreendimento_status on lojas (empreendimento_id, status) where deleted_at is null;
create index if not exists idx_lojistas_loja_status on lojistas (loja_id, status) where deleted_at is null;

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
