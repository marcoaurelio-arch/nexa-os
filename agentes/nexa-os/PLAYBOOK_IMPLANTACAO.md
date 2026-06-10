# Playbook de Implantacao - NEXA OS

## 1. Resumo Executivo

Este playbook organiza a implantacao do NEXA OS em quatro sprints curtos. A prioridade e sair de documentos soltos para uma rotina operacional com dados, responsaveis, prazos e indicadores.

## 2. Diagnostico

O projeto ja possui blueprints para Notion, Google Drive e n8n. O proximo gargalo nao e estrategia; e implantacao disciplinada.

Pontos de atencao:

- Confirmar onde cada dado oficial vive.
- Evitar automacao antes de padronizar campos.
- Garantir revisao humana para mensagens externas.
- Criar rotina semanal de melhoria do sistema.

## 3. Oportunidades

- Reduzir perda de follow-ups comerciais.
- Aumentar velocidade de propostas.
- Melhorar governanca de ativos.
- Criar historico operacional para escala.
- Preparar dashboards em Vercel com dados confiaveis.

## 4. Riscos

| Risco | Impacto | Controle |
|---|---|---|
| Implantar muitos modulos ao mesmo tempo | Alto | Trabalhar em sprints semanais |
| Criar bases sem uso real | Alto | Comecar pelas rotinas de Marco, Andre, Wesley e Ana Luisa |
| Falta de dados minimos | Alto | Usar campos obrigatorios e tarefas de saneamento |
| Automacao sem log | Medio | Registrar execucoes criticas |
| Falta de treinamento | Medio | Criar comandos padrao e rotina semanal |

## 5. Recomendacao

Implantar na sequencia:

1. Base documental e prompts.
2. Rotina executiva diaria.
3. CRM e follow-up comercial.
4. Relatorios de ativos e dashboard.

## 6. Plano de Acao

| Acao | Responsavel | Prazo | Indicador |
|-------|------------|--------|------------|
| Aprovar prompt mestre e regras do agente | Marco Aurelio | D+1 | Prompt aprovado |
| Criar pasta oficial do NEXA OS no Drive | Lara | D+2 | Pasta criada |
| Criar agenda de briefing diario no Calendar | Marco / Lara | D+2 | Evento recorrente criado |
| Implantar rotina de follow-up comercial manual | Andre | D+5 | 100% leads com proximo follow-up |
| Cadastrar projetos iniciais no sistema operacional | Marco / Lara | D+7 | 5 projetos cadastrados |
| Criar primeira pauta PMO via agente | Marco / Wesley | D+7 | Reuniao com pauta e tarefas |
| Criar relatorio piloto de Villa Viseu | Wesley / Ana Luisa | D+10 | Relatorio gerado |
| Criar relatorio piloto de BlueMall | Wesley / Ana Luisa | D+10 | Relatorio gerado |
| Preparar fluxo n8n de follow-up | Tecnico automacoes | D+15 | Workflow em homologacao |
| Definir dashboard executivo MVP | Marco / Tecnico automacoes | D+20 | Wireframe aprovado |

## Sprint 1 - Fundacao Operacional

Objetivo: deixar o agente pronto para uso manual e padronizar os comandos.

Entregaveis:

- `AGENTE_NEXA_OS.md` aprovado.
- `agentes/nexa-os/CONFIG.json` revisado.
- `agentes/nexa-os/PROMPTS.md` revisado.
- Pasta no Google Drive criada.
- Agenda de briefing diario criada.

Indicadores:

- 100% dos prompts principais aprovados.
- Pelo menos uma rotina diaria testada.

## Sprint 2 - Comercial e Follow-up

Objetivo: reduzir perda de leads e criar disciplina comercial.

Entregaveis:

- Leads classificados por empreendimento.
- Follow-ups com responsavel e prazo.
- Rascunhos de mensagem sempre pendentes de aprovacao.
- Playbook comercial validado por Andre.

Indicadores:

- Leads sem responsavel: 0.
- Leads sem proximo follow-up: 0.
- Follow-ups vencidos sem tarefa: 0.

## Sprint 3 - Ativos e Relatorios

Objetivo: criar rotina de gestao de ativos com dados minimos.

Entregaveis:

- Relatorio mensal piloto de Villa Viseu.
- Relatorio mensal piloto de BlueMall.
- Lista de dados faltantes por ativo.
- Plano de acao por responsavel.

Indicadores:

- Ocupacao monitorada.
- Vacancia monitorada.
- Inadimplencia monitorada.
- Receita e despesas monitoradas.

## Sprint 4 - Automacao e Dashboard

Objetivo: iniciar automacoes persistentes e preparar interface executiva.

Entregaveis:

- Workflow n8n de follow-up em homologacao.
- Logs de execucao definidos.
- Wireframe de dashboard executivo.
- Backlog de melhorias no GitHub.

Indicadores:

- 1 workflow homologado.
- 1 dashboard especificado.
- Issues criadas por modulo.
