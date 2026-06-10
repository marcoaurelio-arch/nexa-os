# Checklist Google Drive e Google Calendar - NEXA OS

## 1. Resumo Executivo

Este checklist orienta a configuracao inicial de Google Drive e Google Calendar para o NEXA OS operar como secretaria executiva e camada de governanca.

## 2. Diagnostico

Drive e Calendar sao as primeiras integracoes praticas para organizar documentos e rotina. Antes de automatizar, e preciso padronizar pastas, permissoes e eventos recorrentes.

## 3. Oportunidades

- Organizar documentos por ativo, lead e proposta.
- Reduzir perda de atas e materiais.
- Criar rotina diaria de decisao.
- Preparar base para automacoes n8n.

## 4. Riscos

| Risco | Impacto | Controle |
|---|---|---|
| Permissoes amplas demais | Alto | Revisar acesso por grupo |
| Duplicidade de pastas | Medio | Definir pasta raiz unica |
| Eventos sem objetivo | Medio | Todo evento deve ter pauta |
| Reunioes sem tarefas | Alto | Ata deve gerar tarefas |

## 5. Recomendacao

Criar uma pasta raiz unica no Drive e tres eventos recorrentes no Calendar.

## 6. Plano de Acao

| Acao | Responsavel | Prazo | Indicador |
|-------|------------|--------|------------|
| Criar pasta raiz no Drive | Lara | D+2 | Pasta criada |
| Criar subpastas da Fase 1 | Lara | D+3 | Estrutura completa |
| Revisar permissoes | Marco / Lara | D+3 | Acessos aprovados |
| Criar evento Briefing Executivo | Lara | D+2 | Evento recorrente criado |
| Criar evento Checkpoint Comercial | Lara / Andre | D+2 | Evento recorrente criado |
| Criar evento Fechamento Executivo | Lara | D+2 | Evento recorrente criado |
| Criar modelo de ata | Lara | D+5 | Template publicado |
| Criar modelo de relatorio executivo | Marco / Lara | D+5 | Template publicado |

## Google Drive

### Pasta raiz

```text
Nexa Malls - Sistema Operacional
```

### Subpastas principais

```text
00_Admin
01_CRM_Lojistas
02_Projetos
03_Banco_de_Terrenos
04_Propostas_Comerciais
05_Reunioes
06_Relatorios
07_Automacoes_n8n
08_NEXA_OS
```

### Pasta do agente

```text
08_NEXA_OS
  01_Prompts
  02_Playbooks
  03_Rotinas
  04_Logs
  05_Dashboards
```

### Permissoes sugeridas

| Grupo | Permissao |
|---|---|
| Marco / Diretoria | Editor |
| Lara / Administrativo | Editor |
| Andre / Comercial | Editor em CRM e Propostas |
| Wesley / Operacoes | Editor em Ativos e Relatorios |
| Ana Luisa / Financeiro | Editor em Relatorios financeiros |
| Lucas / Juridico | Editor em Juridico e Governanca |
| Tecnico automacoes | Editor em Automacoes e NEXA OS |
| Externos | Acesso por link especifico e aprovado |

## Google Calendar

### Evento 1 - Briefing Executivo

```text
Nome: NEXA OS - Briefing Executivo Diario
Horario: 08:00
Recorrencia: dias uteis
Participantes: Marco, Lara
Objetivo: definir prioridades, riscos, reunioes e follow-ups do dia.
```

### Evento 2 - Checkpoint Comercial

```text
Nome: NEXA OS - Checkpoint Comercial
Horario: 12:00
Recorrencia: dias uteis
Participantes: Marco, Andre
Objetivo: revisar leads, propostas, follow-ups e rascunhos pendentes.
```

### Evento 3 - Fechamento Executivo

```text
Nome: NEXA OS - Fechamento Executivo
Horario: 17:30
Recorrencia: dias uteis
Participantes: Marco, Lara
Objetivo: registrar conclusoes, pendencias, riscos e plano do dia seguinte.
```

### Evento 4 - PMO Semanal

```text
Nome: NEXA OS - PMO Semanal
Horario: a definir
Recorrencia: semanal
Participantes: Marco, Wesley, Lara, Andre, Amanda, Rosberg
Objetivo: revisar projetos, ativos, marcos, riscos e tarefas.
```

## Regras de Governanca

- Toda reuniao recorrente deve ter pauta.
- Toda ata deve gerar tarefas quando houver acao.
- Toda tarefa deve ter responsavel, prazo e criterio de conclusao.
- Toda proposta deve ter pasta ou documento no Drive.
- Todo documento sensivel deve ter permissao revisada.
- Nenhuma automacao deve enviar comunicacao externa sem aprovacao.
