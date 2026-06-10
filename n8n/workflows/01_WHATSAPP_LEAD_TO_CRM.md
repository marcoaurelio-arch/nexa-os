# Workflow n8n - 01_WHATSAPP_LEAD_TO_CRM

## Objetivo

Capturar mensagem WhatsApp/Zaper, criar ou atualizar lead no Notion, gerar tarefa de follow-up, preparar rascunho e notificar responsavel interno.

## Fluxo

```text
Zaper/Webhook Trigger
  -> Normalizar entrada
  -> Buscar lead por telefone no Notion
  -> IF lead existe
      -> Atualizar lead existente
      -> Resumir nova interacao
    ELSE
      -> Classificar lead novo
      -> Criar lead no CRM
  -> Calcular follow-up
  -> Criar tarefa de follow-up
  -> Registrar aprovacao pendente
  -> Notificar responsavel interno
  -> Registrar log
  -> Fim sem envio externo
```

## Regras

- Se telefone vazio: registrar erro e encerrar.
- Se mensagem vazia: registrar erro e nao criar lead.
- Se empreendimento nao encontrado: usar `Qualificacao pendente`.
- Se LLM retornar JSON invalido: tentar uma vez; se falhar, criar lead minimo manual.
- `Aprovacao para envio` sempre inicia como `Pendente`.
- `Envio externo` sempre deve ser `Nao`.

## Testes obrigatorios

- Lead novo completo.
- Lead novo incompleto.
- Lead existente pelo mesmo telefone.
- Pedido de proposta.
- Pedido de reuniao.
- Sem opt-in.
- Temperatura estrategica.

