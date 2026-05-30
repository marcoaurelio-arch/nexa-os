# Nexa OS — Database Schema v1

## Objetivo

Definir a estrutura inicial do banco de dados do Nexa OS para suportar CRM comercial, gestão de empreendimentos, prospecção B2B, atendimento, follow-up e dashboards executivos.

## Banco recomendado

- Supabase
- PostgreSQL
- UUID como chave primária
- Row Level Security no futuro
- Timestamps em todas as tabelas principais

## Entidades principais

```txt
companies
contacts
assets
units
opportunities
activities
messages
agent_logs
users
```

## 1. Companies

Empresas prospectadas, redes em expansão, operadores, franquias e potenciais lojistas.

```sql
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  segment text,
  subsegment text,
  website text,
  city_origin text,
  state_origin text,
  country text default 'Brasil',
  expansion_status text,
  company_size text,
  priority text check (priority in ('A', 'B', 'C')),
  fit_score integer check (fit_score >= 0 and fit_score <= 100),
  source text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 2. Contacts

Decisores, heads de expansão, franqueados, operadores e contatos comerciais.

```sql
create table contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text,
  role text,
  department text,
  email text,
  phone text,
  whatsapp text,
  linkedin text,
  decision_power text,
  relationship_status text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 3. Assets

Empreendimentos e ativos comerciais da Nexa Malls.

```sql
create table assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  asset_type text,
  city text,
  state text,
  address text,
  neighborhood text,
  total_gla numeric,
  available_gla numeric,
  occupied_gla numeric,
  parking_spaces integer,
  daily_flow_estimate integer,
  target_segments text[],
  restrictions text,
  commercial_notes text,
  status text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 4. Units

Lojas, salas, áreas disponíveis e unidades comerciais por empreendimento.

```sql
create table units (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  code text,
  floor text,
  area numeric,
  frontage numeric,
  status text,
  target_rent numeric,
  condominium_fee numeric,
  property_tax numeric,
  key_money numeric,
  ideal_segments text[],
  restrictions text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 5. Opportunities

Oportunidades comerciais ligadas a empresas, contatos, empreendimentos e unidades.

```sql
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  contact_id uuid references contacts(id),
  asset_id uuid references assets(id),
  unit_id uuid references units(id),
  title text not null,
  stage text,
  priority text check (priority in ('A', 'B', 'C')),
  required_area numeric,
  estimated_rent numeric,
  potential_monthly_revenue numeric,
  potential_contract_value numeric,
  probability integer check (probability >= 0 and probability <= 100),
  expected_close_date date,
  next_followup date,
  owner text,
  origin text,
  notes text,
  lost_reason text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 6. Activities

Tarefas, ligações, reuniões, follow-ups, visitas e pendências comerciais.

```sql
create table activities (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  company_id uuid references companies(id),
  contact_id uuid references contacts(id),
  type text,
  title text,
  description text,
  due_date date,
  due_time time,
  completed boolean default false,
  completed_at timestamp with time zone,
  owner text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## 7. Messages

Histórico de mensagens geradas, enviadas ou sugeridas pelos agentes.

```sql
create table messages (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id),
  contact_id uuid references contacts(id),
  channel text,
  direction text,
  subject text,
  body text,
  status text,
  sent_at timestamp with time zone,
  created_by_agent text,
  created_at timestamp with time zone default now()
);
```

## 8. Agent Logs

Logs de execução dos agentes de IA.

```sql
create table agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_name text not null,
  input jsonb,
  output jsonb,
  status text,
  error_message text,
  related_opportunity_id uuid references opportunities(id),
  created_at timestamp with time zone default now()
);
```

## 9. Users

Usuários internos do Nexa OS.

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text,
  department text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

## Stages comerciais padrão

```txt
Mapeado
Contato identificado
Primeira abordagem enviada
Respondeu
Reunião agendada
Perfil de expansão recebido
Proposta enviada
Em negociação
Contrato
Perdido
```

## Assets seed

```sql
insert into assets (name, asset_type, city, state, status) values
('Villa Viseu', 'Strip Mall', 'Uberlândia', 'MG', 'Em operação'),
('Piazza Nicomedes', 'Strip Mall', 'Uberlândia', 'MG', 'Em desenvolvimento'),
('Bluemall Rondon', 'Strip Mall', 'Uberlândia', 'MG', 'Em comercialização'),
('Bluemall Centro', 'Strip Mall', 'Uberlândia', 'MG', 'Em desenvolvimento'),
('Boulevard Naves', 'Strip Mall', 'Uberlândia', 'MG', 'Em desenvolvimento'),
('Uberlândia Shopping HUB de Serviços', 'Hub de Serviços', 'Uberlândia', 'MG', 'Em comercialização'),
('Terreno Rondon Pacheco', 'Terreno Comercial', 'Uberlândia', 'MG', 'Disponível');
```

## Índices recomendados

```sql
create index idx_companies_segment on companies(segment);
create index idx_companies_priority on companies(priority);
create index idx_contacts_company_id on contacts(company_id);
create index idx_opportunities_stage on opportunities(stage);
create index idx_opportunities_asset_id on opportunities(asset_id);
create index idx_opportunities_next_followup on opportunities(next_followup);
create index idx_activities_due_date on activities(due_date);
```

## Observação técnica

Este schema é a base do MVP. No futuro, pode evoluir para módulos específicos de contratos, financeiro, inadimplência, fundo de promoção, aluguel complementar e gestão operacional de cada empreendimento.
