# Workflow n8n - 03_PAUTA_REUNIAO_SEMANAL

## Objetivo

Preparar pauta semanal de diretoria/PMO a partir de CRM, projetos, terrenos, tarefas, propostas e relatorios.

## Fluxo

```text
Cron semanal na vespera 16:00
  -> Buscar reuniao no Google Calendar
  -> Consultar projetos com prioridade alta ou marco em 14 dias
  -> Consultar tarefas vencidas ou bloqueadas
  -> Consultar leads quentes/estrategicos
  -> Consultar propostas em revisao/aprovacao/negociacao
  -> Consultar terrenos em analise/negociacao
  -> Gerar pauta PMO
  -> Criar registro em Reunioes
  -> Criar rascunho de comunicacao interna
  -> Aguardar aprovacao humana
```

## Estrutura da pauta

- Decisoes necessarias.
- Projetos criticos.
- Comercial e prospeccao.
- Terrenos e novos negocios.
- Ativos em operacao.
- Pendencias vencidas.
- Riscos.
- Oportunidades.
- Proximos passos.

