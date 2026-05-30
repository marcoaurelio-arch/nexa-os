# Nexa OS — Roadmap MVP v1.0

## Objetivo do MVP

Construir a primeira versão operacional do Nexa OS para centralizar prospecção, atendimento, CRM, gestão de oportunidades e dashboards executivos da Nexa Malls.

## Resultado esperado

Ao final do MVP, o sistema deve permitir:

- cadastrar empreendimentos;
- cadastrar lojas/unidades disponíveis;
- cadastrar empresas prospectadas;
- cadastrar decisores e contatos;
- criar oportunidades comerciais;
- acompanhar pipeline em kanban;
- gerar mensagens comerciais com IA;
- sugerir follow-ups;
- gerar relatório executivo;
- integrar entrada inicial via formulário, WhatsApp ou cadastro manual.

## Escopo funcional

### 1. CRM Comercial

- Empresas
- Contatos
- Oportunidades
- Atividades
- Histórico de relacionamento
- Pipeline comercial

### 2. Gestão de Empreendimentos

- Empreendimentos
- Lojas disponíveis
- ABL total
- ABL disponível
- Segmentos desejados
- Regras comerciais
- Status de ocupação

### 3. Agentes de IA

- SDR Agent
- Research Agent
- Follow-up Agent
- Qualification Agent
- Executive Agent

### 4. Dashboard Executivo

- leads cadastrados;
- oportunidades abertas;
- pipeline financeiro;
- propostas enviadas;
- reuniões agendadas;
- follow-ups atrasados;
- ocupação por empreendimento;
- vacância por empreendimento.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase/PostgreSQL
- OpenAI API
- n8n
- Zaper/WhatsApp
- Notion API
- Google Drive
- Vercel

## Sprints

### Sprint 1 — Fundação técnica

- revisar estrutura atual do projeto;
- validar dependências;
- configurar variáveis de ambiente;
- organizar layout base;
- validar conexão com Supabase;
- preparar autenticação.

### Sprint 2 — CRM Core

- criar tabela de empresas;
- criar tabela de contatos;
- criar tabela de oportunidades;
- criar tabela de atividades;
- criar telas CRUD;
- criar kanban comercial.

### Sprint 3 — Empreendimentos

- cadastrar ativos seed;
- criar tela de empreendimentos;
- criar tela de lojas disponíveis;
- criar indicadores de ABL, ocupação e vacância;
- relacionar oportunidades com empreendimentos.

### Sprint 4 — Agentes de IA

- implementar SDR Agent;
- implementar Research Agent;
- implementar Follow-up Agent;
- implementar Qualification Agent;
- implementar Executive Agent;
- criar área de prompts e logs.

### Sprint 5 — Integrações

- integração inicial com WhatsApp/Zaper;
- integração inicial com Notion;
- integração inicial com Google Drive;
- automação n8n para follow-up;
- automação n8n para relatório executivo.

### Sprint 6 — Dashboard executivo

- consolidar KPIs;
- criar visão por empreendimento;
- criar visão por responsável;
- criar visão por estágio comercial;
- criar relatório diário.

## Critérios de aceite

O MVP estará pronto quando:

- o usuário conseguir cadastrar empresas, contatos, ativos e oportunidades;
- o pipeline funcionar em kanban;
- cada oportunidade tiver responsável e próximo follow-up;
- os agentes conseguirem gerar mensagens e recomendações;
- o dashboard consolidar os principais indicadores;
- houver documentação suficiente para evolução com Codex/Claude.

## Fora do escopo do MVP

- assinatura digital de contratos;
- emissão de boletos;
- conciliação financeira completa;
- app mobile nativo;
- BI avançado;
- integração total com ERP.

## Diretriz principal

O Nexa OS deve ser simples, operacional e orientado à execução comercial. Nada de construir uma nave espacial para vender uma loja de 80 m². Primeiro roda, depois sofistica.
