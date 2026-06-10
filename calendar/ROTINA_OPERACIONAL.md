# Rotina Operacional - Google Calendar

## Eventos recorrentes sugeridos

| Horario | Evento | Frequencia | Resultado esperado |
|---|---|---|---|
| 08:00 | NEXA OS - Briefing executivo | Segunda a sexta | Prioridades, riscos, reunioes e follow-ups |
| 12:00 | NEXA OS - Checkpoint comercial | Segunda a sexta | Acoes comerciais, rascunhos e proximos contatos |
| 17:30 | NEXA OS - Fechamento executivo | Segunda a sexta | Relatorio diario e plano do dia seguinte |
| 16:00 | NEXA OS - Preparar pauta PMO | Vespero da reuniao semanal | Pauta, decisoes e tarefas criticas |
| 09:00 | NEXA OS - Relatorio mensal de ativos | Primeiro dia util | Relatorio mensal por ativo |

## Descricao padrao

```text
Rotina NEXA OS.

Entradas:
- Agenda.
- Tarefas vencidas.
- Follow-ups.
- Projetos criticos.
- Propostas em aprovacao.

Saidas:
- Prioridades.
- Riscos.
- Decisoes pendentes.
- Tarefas por responsavel.

Regra: nenhuma mensagem externa sem aprovacao humana.
```

## Eventos criados

Os eventos iniciais foram criados no Google Calendar principal e registrados em `calendar/EVENTOS_CRIADOS_GOOGLE_CALENDAR.md`.
