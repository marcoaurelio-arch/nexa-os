# Issues GitHub sugeridas - NEXA OS Fase 1

## Labels recomendadas

| Label | Uso |
|---|---|
| `p0-critico` | Bloqueia implantacao ou governanca |
| `p1-alto` | Necessario para Fase 1 funcionar |
| `p2-melhoria` | Evolucao apos MVP |
| `notion` | Bases, views, relations e rollups |
| `drive` | Pastas, templates e permissoes |
| `calendar` | Rotinas, reunioes e follow-ups |
| `n8n` | Workflows, logs e credenciais |
| `comercial` | CRM, leads, propostas e follow-ups |
| `ativos` | Relatorios e indicadores de ativos |
| `dashboard` | Vercel e paineis |
| `governanca` | Aprovacao humana, seguranca e auditoria |

## Milestone

```text
Fase 1 - NEXA OS Operacional
```

Objetivo: deixar o NEXA OS operando em rotina assistida, com bases, Drive, Calendar, governanca e workflows prontos para homologacao.

## Issue 1 - Criar workspace operacional Notion

Labels: `p0-critico`, `notion`, `governanca`

Responsavel: Marco / Lara

Descricao:
Configurar pagina raiz, 7 bases, propriedades obrigatorias, relations, rollups, views e painel executivo.

Criterios de aceite:

- Pagina raiz `Sistema Operacional Nexa Malls` criada.
- 7 bases criadas.
- Campos obrigatorios configurados.
- Relations e rollups criados.
- Views operacionais criadas.
- Painel executivo criado.
- Projetos iniciais cadastrados.

Indicador: workspace Notion pronto para uso manual.

## Issue 2 - Criar estrutura Google Drive

Labels: `p0-critico`, `drive`, `governanca`

Responsavel: Lara

Descricao:
Criar pasta raiz, subpastas por modulo/projeto, templates oficiais e politica de aprovacao.

Criterios de aceite:

- Pasta raiz `Nexa Malls - Sistema Operacional` criada.
- Arvore oficial criada, incluindo `08_NEXA_OS`.
- Templates criados.
- Permissoes revisadas.
- Politica de aprovacao publicada.
- Nenhuma credencial salva em texto aberto.

Indicador: estrutura documental pronta.

## Issue 3 - Criar rotina operacional Google Calendar

Labels: `p0-critico`, `calendar`, `governanca`

Responsavel: Marco / Lara

Descricao:
Criar eventos recorrentes de briefing executivo, checkpoint comercial, fechamento executivo, PMO semanal e relatorio mensal.

Criterios de aceite:

- Eventos recorrentes criados.
- Participantes definidos.
- Descricao padrao adicionada.
- Eventos com objetivo, entrada e saida.

Indicador: rotina ativa no calendario.

## Issue 4 - Configurar workflow 01_WHATSAPP_LEAD_TO_CRM

Labels: `p1-alto`, `n8n`, `comercial`

Responsavel: Tecnico automacoes / Andre

Descricao:
Capturar lead WhatsApp/Zaper, criar ou atualizar CRM, tarefa, rascunho, notificacao interna e log.

Criterios de aceite:

- Lead novo completo testado.
- Lead incompleto testado.
- Lead existente testado.
- Tarefa de follow-up criada.
- Aprovacao para envio marcada como pendente.
- Nenhum envio externo executado.

Indicador: workflow homologado em modo monitorado.

## Issue 5 - Configurar workflow 02_FOLLOWUP_AUTOMATICO_CRM

Labels: `p1-alto`, `n8n`, `comercial`

Responsavel: Tecnico automacoes / Andre

Descricao:
Rodar rotina diaria de follow-ups, evitar duplicidade, gerar tarefa e rascunho sem envio externo.

Criterios de aceite:

- Busca leads com follow-up hoje ou vencido.
- Ignora leads encerrados.
- Evita tarefa duplicada.
- Gera rascunho por canal.
- Notifica responsavel interno.
- Registra log.

Indicador: 100% follow-ups devidos geram tarefa ou log.

## Issue 6 - Configurar workflow 03_PAUTA_REUNIAO_SEMANAL

Labels: `p1-alto`, `n8n`, `calendar`

Responsavel: Marco / Lara / Tecnico automacoes

Descricao:
Gerar pauta semanal com projetos criticos, tarefas vencidas, leads quentes e decisoes pendentes.

Criterios de aceite:

- Consulta projetos, tarefas, leads, propostas e terrenos.
- Gera pauta estruturada.
- Cria registro em Reunioes.
- Cria rascunho interno.
- Aguarda aprovacao humana.

Indicador: PMO semanal com pauta gerada.

## Issue 7 - Configurar relatorio executivo diario

Labels: `p1-alto`, `n8n`, `governanca`

Responsavel: Marco / Lara

Descricao:
Gerar registro e documento diario com resumo executivo, riscos, oportunidades e proximos passos.

Criterios de aceite:

- Briefing diario gerado.
- Riscos criticos destacados.
- Tarefas por responsavel listadas.
- Pendencias do dia seguinte registradas.

Indicador: relatorio diario entregue em dias uteis.

## Issue 8 - Configurar relatorio mensal de ativos

Labels: `p1-alto`, `ativos`, `n8n`

Responsavel: Wesley / Ana Luisa

Descricao:
Gerar relatorio mensal por ativo com indicadores, lacunas de dados e plano de acao.

Criterios de aceite:

- Villa Viseu testado.
- BlueMall testado.
- Ocupacao, vacancia e inadimplencia incluidos quando houver dados.
- Lacunas declaradas.
- Plano de acao por responsavel.

Indicador: relatorio mensal entregue ate D+5.

## Issue 9 - Validar governanca de aprovacao humana

Labels: `p0-critico`, `governanca`

Responsavel: Marco / Lucas

Descricao:
Garantir que nenhum fluxo externo envie mensagem, proposta ou compromisso sem aprovacao humana registrada.

Criterios de aceite:

- Politica publicada.
- Campo de aprovacao nas bases.
- Workflows revisados.
- Teste negativo de envio automatico documentado.

Indicador: 0 envios externos sem aprovacao.

## Issue 10 - Preparar especificacao do dashboard Vercel

Labels: `p2-melhoria`, `dashboard`

Responsavel: Marco / Tecnico automacoes

Descricao:
Definir escopo do dashboard interno apos estabilizar dados e rotinas da Fase 1.

Criterios de aceite:

- KPIs definidos.
- Fontes de dados indicadas.
- Wireframe aprovado.
- Requisitos de seguranca definidos.

Indicador: especificacao pronta para desenvolvimento.
