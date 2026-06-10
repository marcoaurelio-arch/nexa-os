# Backlog GitHub - NEXA OS

## 1. Resumo Executivo

Este backlog organiza as proximas issues do GitHub para transformar o NEXA OS em um sistema operacional implantavel, com documentacao, automacoes, dashboards e governanca.

## 2. Diagnostico

O repositorio ainda e composto por blueprints e especificacoes. O GitHub deve funcionar como controle de evolucao, priorizacao e historico de decisoes tecnicas.

## 3. Oportunidades

- Criar disciplina de implantacao.
- Controlar pendencias por modulo.
- Versionar prompts e playbooks.
- Separar ideias, bugs operacionais e melhorias.
- Preparar base para automacoes e dashboards.

## 4. Riscos

| Risco | Impacto | Controle |
|---|---|---|
| GitHub virar apenas arquivo | Medio | Criar issues com responsavel e criterio de conclusao |
| Muitas frentes abertas | Alto | Usar prioridades P0, P1 e P2 |
| Falta de owner tecnico | Alto | Definir responsavel por issue |
| Issues sem indicador | Medio | Toda issue deve ter criterio mensuravel |

## 5. Recomendacao

Criar as issues abaixo como marco inicial da implantacao.

## 6. Plano de Acao

| Acao | Responsavel | Prazo | Indicador |
|-------|------------|--------|------------|
| Criar milestone `Fase 1 - NEXA OS` | Marco / Tecnico | D+1 | Milestone criada |
| Criar labels por modulo | Tecnico | D+1 | Labels criadas |
| Abrir issues P0 | Tecnico | D+2 | Issues abertas |
| Revisar backlog semanalmente | Marco | Semanal | Issues atualizadas |

## Labels Recomendadas

| Label | Uso |
|---|---|
| `p0-critico` | Bloqueia implantacao |
| `p1-alto` | Importante para Fase 1 |
| `p2-melhoria` | Melhoria ou etapa posterior |
| `modulo-comercial` | CRM, leads e propostas |
| `modulo-ativos` | Gestao e relatorios de ativos |
| `modulo-pmo` | Projetos, reunioes e tarefas |
| `modulo-automacao` | n8n, conectores e rotinas |
| `modulo-dashboard` | Vercel, paineis e indicadores |
| `governanca` | Aprovacao, permissao e compliance |

## Issues Iniciais

### P0 - Aprovar prompt mestre do NEXA OS

Descricao:
Validar o prompt mestre, regras obrigatorias e formato padrao de resposta.

Criterio de conclusao:
- Prompt aprovado por Marco Aurelio.
- Regras de aprovacao humana confirmadas.
- Arquivo `agentes/nexa-os/PROMPTS.md` revisado.

Responsavel: Marco Aurelio

Indicador: Prompt aprovado.

### P0 - Criar estrutura oficial do Google Drive

Descricao:
Criar a pasta raiz `Nexa Malls - Sistema Operacional` e a arvore definida no blueprint.

Criterio de conclusao:
- Pasta raiz criada.
- Subpastas principais criadas.
- Permissoes revisadas.
- Templates iniciais criados.

Responsavel: Lara

Indicador: Estrutura Drive criada.

### P0 - Criar rotina de briefing diario no Google Calendar

Descricao:
Criar eventos recorrentes para briefing executivo, checkpoint comercial e fechamento executivo.

Criterio de conclusao:
- Eventos criados.
- Participantes definidos.
- Objetivo de cada evento registrado.

Responsavel: Marco / Lara

Indicador: Rotina ativa no calendario.

### P0 - Implantar regra de aprovacao humana

Descricao:
Formalizar que mensagens externas, decisoes comerciais sensiveis e compromissos juridicos exigem aprovacao humana.

Criterio de conclusao:
- Politica documentada no Drive.
- Campo de aprovacao refletido no CRM.
- Fluxos n8n bloqueados para envio automatico.

Responsavel: Marco / Lucas

Indicador: 0 envios externos sem aprovacao.

### P1 - Criar CRM minimo de lojistas

Descricao:
Implantar a base de CRM com campos obrigatorios definidos no blueprint.

Criterio de conclusao:
- Base criada.
- Campos obrigatorios criados.
- Views de follow-up criadas.
- Projetos iniciais relacionados.

Responsavel: Andre / Lara

Indicador: 100% leads com responsavel e proximo follow-up.

### P1 - Homologar workflow n8n de follow-up

Descricao:
Implantar o workflow `02_FOLLOWUP_AUTOMATICO_CRM` em ambiente de teste.

Criterio de conclusao:
- Busca leads vencidos.
- Gera rascunho.
- Cria tarefa.
- Notifica responsavel.
- Registra log.
- Nao envia mensagem externa.

Responsavel: Tecnico automacoes

Indicador: Workflow homologado.

### P1 - Criar relatorio mensal piloto de ativos

Descricao:
Gerar relatorio piloto para Villa Viseu e BlueMall.

Criterio de conclusao:
- Dados disponiveis consolidados.
- Lacunas documentadas.
- Plano de acao por ativo criado.

Responsavel: Wesley / Ana Luisa

Indicador: 2 relatorios piloto gerados.

### P1 - Especificar dashboard executivo MVP

Descricao:
Definir indicadores, fontes e layout do primeiro dashboard executivo.

Criterio de conclusao:
- KPIs definidos.
- Fonte de dados definida.
- Wireframe aprovado.

Responsavel: Marco / Tecnico automacoes

Indicador: Especificacao aprovada.

### P2 - Criar portal interno em Vercel

Descricao:
Construir prototipo de portal com indicadores, links de documentos, agenda e status dos pipelines.

Criterio de conclusao:
- App criado.
- Dashboard responsivo.
- Links para Drive/Notion.
- Sem dados sensiveis expostos publicamente.

Responsavel: Tecnico automacoes

Indicador: Portal publicado com acesso controlado.
