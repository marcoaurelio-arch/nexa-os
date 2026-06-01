-- NEXA OS - 007 - Gestao documental
-- Documentos por loja com categorias padronizadas e links Google Drive.

create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  loja_id uuid not null references lojas(id),
  empreendimento_id uuid not null references empreendimentos(id),
  categoria text not null
    check (categoria in ('contratos','aditivos','garantias','seguros','alvaras','avcb','vistorias','licencas','plantas','projetos','fotos')),
  titulo text not null,
  status text not null default 'pendente'
    check (status in ('pendente','vigente','vencendo','vencido','dispensado')),
  vencimento date,
  pasta_drive_url text,
  arquivo_url text,
  responsavel text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_documentos_emp_categoria on documentos (empreendimento_id, categoria) where deleted_at is null;
create index if not exists idx_documentos_loja_categoria on documentos (loja_id, categoria) where deleted_at is null;
create index if not exists idx_documentos_vencimento on documentos (vencimento) where deleted_at is null;
create index if not exists idx_documentos_status on documentos (status) where deleted_at is null;

drop trigger if exists trg_documentos_updated_at on documentos;
create trigger trg_documentos_updated_at
before update on documentos
for each row execute function set_updated_at();

alter table documentos enable row level security;
drop policy if exists documentos_tenant on documentos;
create policy documentos_tenant on documentos for all
  using ( empreendimento_id in (select app_empreendimentos_do_usuario()) )
  with check ( empreendimento_id in (select app_empreendimentos_do_usuario()) );

insert into documentos (
  id,
  loja_id,
  empreendimento_id,
  categoria,
  titulo,
  status,
  vencimento,
  pasta_drive_url,
  arquivo_url,
  responsavel,
  observacoes
)
values
  (
    '17171717-1717-4171-8171-171717171701',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'contratos',
    'Contrato de locacao - Gastro Prime',
    'vigente',
    '2026-11-30',
    'drive://nexa/documentos/villa-viseu/vv-01/contratos',
    'drive://nexa/documentos/villa-viseu/vv-01/contratos/contrato.pdf',
    'Juridico',
    'Contrato principal assinado e validado.'
  ),
  (
    '17171717-1717-4171-8171-171717171702',
    (select id from lojas where codigo = 'VV-01' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'seguros',
    'Seguro empresarial - Gastro Prime',
    'vencendo',
    '2026-07-15',
    'drive://nexa/documentos/villa-viseu/vv-01/seguros',
    'drive://nexa/documentos/villa-viseu/vv-01/seguros/apolice.pdf',
    'Administrativo',
    'Solicitar renovacao com 30 dias de antecedencia.'
  ),
  (
    '17171717-1717-4171-8171-171717171703',
    (select id from lojas where codigo = 'VV-02' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'avcb',
    'AVCB loja Clinica Vida',
    'vigente',
    '2027-03-20',
    'drive://nexa/documentos/villa-viseu/vv-02/avcb',
    'drive://nexa/documentos/villa-viseu/vv-02/avcb/avcb.pdf',
    'Operacoes',
    'Documento conferido na ultima vistoria.'
  ),
  (
    '17171717-1717-4171-8171-171717171704',
    (select id from lojas where codigo = 'VV-03' limit 1),
    '11111111-1111-4111-8111-111111111111',
    'projetos',
    'Projeto preliminar de implantacao',
    'pendente',
    null,
    'drive://nexa/documentos/villa-viseu/vv-03/projetos',
    null,
    'Comercial',
    'Aguardando operador definir layout final.'
  ),
  (
    '17171717-1717-4171-8171-171717171705',
    (select id from lojas where codigo = 'PN-01' limit 1),
    '22222222-2222-4222-8222-222222222222',
    'alvaras',
    'Alvara de funcionamento - Cafe Jardim',
    'vencendo',
    '2026-08-10',
    'drive://nexa/documentos/piazza-nicomedes/pn-01/alvaras',
    'drive://nexa/documentos/piazza-nicomedes/pn-01/alvaras/alvara.pdf',
    'Administrativo',
    'Renovacao prevista para o inicio da operacao.'
  ),
  (
    '17171717-1717-4171-8171-171717171706',
    (select id from lojas where codigo = 'BR-01' limit 1),
    '33333333-3333-4333-8333-333333333333',
    'vistorias',
    'Relatorio de vistoria anual',
    'vigente',
    '2027-01-15',
    'drive://nexa/documentos/bluemall-rondon/br-01/vistorias',
    'drive://nexa/documentos/bluemall-rondon/br-01/vistorias/relatorio.pdf',
    'Operacoes',
    'Sem pendencias estruturais.'
  ),
  (
    '17171717-1717-4171-8171-171717171707',
    (select id from lojas where codigo = 'BC-01' limit 1),
    '44444444-4444-4444-8444-444444444444',
    'fotos',
    'Fotos de fachada e loja',
    'vigente',
    null,
    'drive://nexa/documentos/bluemall-centro/bc-01/fotos',
    'drive://nexa/documentos/bluemall-centro/bc-01/fotos/fachada',
    'Marketing',
    'Acervo atualizado apos troca de comunicacao visual.'
  )
on conflict (id) do update set
  loja_id = excluded.loja_id,
  empreendimento_id = excluded.empreendimento_id,
  categoria = excluded.categoria,
  titulo = excluded.titulo,
  status = excluded.status,
  vencimento = excluded.vencimento,
  pasta_drive_url = excluded.pasta_drive_url,
  arquivo_url = excluded.arquivo_url,
  responsavel = excluded.responsavel,
  observacoes = excluded.observacoes;
