# Workflow n8n - 04_RELATORIO_EXECUTIVO_DIARIO

## Objetivo

Gerar resumo diario para diretoria as 17:30 com decisoes, riscos, oportunidades e proximos passos.

## Fluxo

```text
Cron diario 17:30
  -> Consultar alteracoes do dia no Notion
  -> Consolidar CRM, projetos, terrenos, tarefas, propostas e reunioes
  -> Gerar relatorio executivo
  -> Criar registro em Relatorios Executivos com status Rascunho
  -> Criar documento no Drive a partir do template
  -> Notificar responsavel para revisao
  -> Encerrar sem envio externo
```

## Conteudo minimo

- Resumo executivo.
- Principais avancos.
- Riscos.
- Oportunidades.
- Proximos passos.
- Tarefas vencidas ou criticas.
- Decisoes pendentes.

