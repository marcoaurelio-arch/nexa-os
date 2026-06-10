# Workflow n8n - 02_FOLLOWUP_AUTOMATICO_CRM

## Objetivo

Rodar diariamente as 08:00, encontrar leads com follow-up hoje ou vencido, gerar rascunhos e criar tarefas de aprovacao.

## Elegibilidade

Incluir:

- Proximo follow-up hoje ou vencido.
- Status diferente de Ganho e Perdido.
- Responsavel definido.
- Canal existente ou lead estrategico.

Ignorar:

- Ganho.
- Perdido.
- Nutricao futura sem tarefa aberta.
- Lead sem canal e nao estrategico.
- Duplicidade de tarefa aberta.

## Fluxo

```text
Cron 08:00
  -> Buscar leads com follow-up devido
  -> Filtrar elegibilidade
  -> Verificar tarefa duplicada aberta
  -> Enriquecer contexto com proposta/projeto/reuniao
  -> Gerar rascunho por canal
  -> Criar tarefa de aprovacao
  -> Atualizar CRM para aprovacao pendente
  -> Notificar responsavel interno
  -> Registrar log
  -> Fim sem envio externo
```

## Testes obrigatorios

- Follow-up hoje.
- Follow-up vencido.
- Lead ganho ignorado.
- Lead perdido ignorado.
- Tarefa duplicada evitada.
- Lead quente com prioridade alta.
- Lead estrategico incompleto vira qualificacao manual.
- JSON invalido do LLM gera fallback.

