# Nexa OS — Architecture v1

## Visão Geral

O Nexa OS será o sistema operacional comercial da Nexa Malls.

Objetivo:

Centralizar prospecção, CRM, atendimento, gestão de oportunidades, inteligência comercial e indicadores executivos em uma única plataforma.

## Arquitetura lógica

```txt
Usuário
   ↓
Frontend Next.js
   ↓
API Layer
   ↓
Supabase/PostgreSQL
   ↓
Agentes de IA
   ├── SDR Agent
   ├── Research Agent
   ├── Qualification Agent
   ├── Follow-up Agent
   └── Executive Agent
   ↓
Integrações
   ├── WhatsApp/Zaper
   ├── Notion
   ├── Google Drive
   ├── Gmail
   └── Google Calendar
```

## Camadas

### Apresentação

- Dashboard
- CRM
- Empreendimentos
- Agentes
- Relatórios

### Negócio

- Gestão comercial
- Gestão de ativos
- Motor de agentes
- Regras de pipeline
- Regras de qualificação

### Dados

- Supabase
- PostgreSQL
- Storage para documentos

## Agentes

### SDR Agent

Responsável por:

- gerar prospecção;
- sugerir abordagem;
- identificar fit;
- priorizar oportunidades.

### Research Agent

Responsável por:

- pesquisar empresas;
- mapear expansão;
- identificar decisores;
- gerar inteligência comercial.

### Qualification Agent

Responsável por:

- atendimento inicial;
- coleta de informações;
- qualificação de leads.

### Follow-up Agent

Responsável por:

- monitorar pipeline;
- identificar oportunidades paradas;
- sugerir próximos passos.

### Executive Agent

Responsável por:

- consolidar indicadores;
- gerar relatórios;
- alertar riscos.

## Integrações prioritárias

1. Supabase
2. OpenAI
3. Zaper/WhatsApp
4. Notion
5. Google Drive

## Módulos futuros

- contratos;
- aluguel complementar;
- inadimplência;
- fundo de promoção;
- manutenção;
- gestão operacional de empreendimentos.

## Diretriz

Toda nova funcionalidade deve responder a uma pergunta:

Ela ajuda a captar, converter ou gerir melhor os ativos da Nexa?

Se não ajudar, não entra no MVP.
