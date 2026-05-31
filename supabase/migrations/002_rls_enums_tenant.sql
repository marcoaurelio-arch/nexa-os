-- ============================================================
-- NEXA OS · 002 — RLS multiempreendimento + CHECK de status + tenant nas tabelas-filhas
-- Complementa 001_nexa_os_core.sql. Idempotente: pode rodar mais de uma vez.
-- Aplicar DEPOIS da 001.
-- ============================================================

-- 1. CHECK de status (substitui texto livre por conjuntos válidos)
alter table empreendimentos drop constraint if exists chk_emp_status;
alter table empreendimentos add constraint chk_emp_status
  check (status in ('planejado','implantacao','obra','ativo','encerrado'));

alter table lojas drop constraint if exists chk_loja_status;
alter table lojas add constraint chk_loja_status
  check (status in ('disponivel','ocupada','negociacao','implantacao','em_obra','inativa'));

alter table lojistas drop constraint if exists chk_lojista_status;
alter table lojistas add constraint chk_lojista_status
  check (status in ('ativo','inativo','prospecto'));

alter table contratos drop constraint if exists chk_contrato_status;
alter table contratos add constraint chk_contrato_status
  check (status in ('em_elaboracao','ativo','vigente','vencendo','vencido','renovacao','encerrado','distrato'));

-- 2. empreendimento_id nas tabelas-filhas (base do isolamento) + backfill
alter table lojistas add column if not exists empreendimento_id uuid references empreendimentos(id);
update lojistas l set empreendimento_id = lo.empreendimento_id
  from lojas lo where l.loja_id = lo.id and l.empreendimento_id is null;
create index if not exists idx_lojistas_emp on lojistas (empreendimento_id) where deleted_at is null;

alter table contratos add column if not exists empreendimento_id uuid references empreendimentos(id);
update contratos c set empreendimento_id = lo.empreendimento_id
  from lojas lo where c.loja_id = lo.id and c.empreendimento_id is null;
create index if not exists idx_contratos_emp on contratos (empreendimento_id) where deleted_at is null;

-- 3. Usuários + acesso por empreendimento (base da RLS)
create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique,
  nome text not null,
  email text unique not null,
  perfil text not null default 'comercial'
    check (perfil in ('diretoria','administrativo','financeiro','comercial','operacoes','marketing','juridico')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_empreendimentos (
  user_id uuid not null references usuarios(id) on delete cascade,
  empreendimento_id uuid not null references empreendimentos(id) on delete cascade,
  primary key (user_id, empreendimento_id)
);
create index if not exists idx_user_emp_emp on user_empreendimentos (empreendimento_id);

create or replace function app_empreendimentos_do_usuario()
returns setof uuid
language sql stable security definer set search_path = public as $$
  select ue.empreendimento_id
  from user_empreendimentos ue
  join usuarios u on u.id = ue.user_id
  where u.auth_uid = auth.uid();
$$;

-- 4. RLS por empreendimento (service_role ignora RLS; anon vê só o que está vinculado)
alter table empreendimentos enable row level security;
drop policy if exists emp_tenant on empreendimentos;
create policy emp_tenant on empreendimentos for all
  using ( id in (select app_empreendimentos_do_usuario()) )
  with check ( id in (select app_empreendimentos_do_usuario()) );

alter table lojas enable row level security;
drop policy if exists lojas_tenant on lojas;
create policy lojas_tenant on lojas for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

alter table lojistas enable row level security;
drop policy if exists lojistas_tenant on lojistas;
create policy lojistas_tenant on lojistas for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

alter table contratos enable row level security;
drop policy if exists contratos_tenant on contratos;
create policy contratos_tenant on contratos for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

alter table usuarios enable row level security;
drop policy if exists usuarios_self on usuarios;
create policy usuarios_self on usuarios for select using ( auth_uid = auth.uid() );

alter table user_empreendimentos enable row level security;
drop policy if exists ue_self on user_empreendimentos;
create policy ue_self on user_empreendimentos for select
  using ( user_id in (select id from usuarios where auth_uid = auth.uid()) );

-- 5. Usuário de exemplo + vínculo (troque o auth_uid pelo id real do Supabase Auth)
insert into usuarios (id, nome, email, perfil, auth_uid)
values ('00000000-0000-4000-8000-000000000001', 'Diretoria Nexa', 'diretoria@nexamalls.com', 'diretoria', null)
on conflict (id) do nothing;

insert into user_empreendimentos (user_id, empreendimento_id)
select '00000000-0000-4000-8000-000000000001', e.id from empreendimentos e
on conflict do nothing;
