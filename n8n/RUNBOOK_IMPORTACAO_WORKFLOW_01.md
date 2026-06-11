# Runbook - Importacao e Homologacao Workflow 01

Workflow: `01_WHATSAPP_LEAD_TO_CRM`

Arquivo importavel: `n8n/workflows/01_WHATSAPP_LEAD_TO_CRM.workflow.json`

Objetivo: importar o fluxo WhatsApp/Zaper -> CRM no n8n real, executar homologacao controlada e manter o workflow desativado ate aprovacao humana.

## 1. Pre-requisitos

- Acesso admin ao n8n.
- Credencial `Notion Nexa OS` criada no n8n.
- Credencial `Gmail Nexa OS` criada no n8n.
- Data source ID real do Notion para `CRM de Lojistas`.
- Data source ID real do Notion para `Gestao de Tarefas`.
- Email interno para receber rascunhos/revisoes.
- Usuario responsavel pela homologacao definido.

Nao registrar tokens, client secrets, senhas ou chaves API neste repositorio.

## 2. Variaveis de ambiente n8n

Configurar no ambiente do n8n:

```text
NOTION_CRM_DATA_SOURCE_ID=<id-real-crm-lojistas>
NOTION_TASKS_DATA_SOURCE_ID=<id-real-gestao-tarefas>
GMAIL_INTERNAL_NOTIFY_TO=<email-interno-aprovador>
```

Os IDs fallback presentes no JSON sao apenas referencia tecnica. A homologacao deve usar variaveis reais do ambiente.

## 3. Importacao

1. Abrir n8n.
2. Importar `n8n/workflows/01_WHATSAPP_LEAD_TO_CRM.workflow.json`.
3. Confirmar que `active = false`.
4. Vincular os nos Notion a credencial `Notion Nexa OS`.
5. Vincular o no Gmail a credencial `Gmail Nexa OS`.
6. Confirmar que o Gmail usa `resource = draft`, nao `send`.
7. Salvar o workflow sem ativar.

## 4. Conferencia de governanca

Antes de executar fixtures, verificar:

| Item | Criterio |
|---|---|
| Envio externo | Nenhum no envia WhatsApp, email externo ou proposta automaticamente |
| Gmail | Apenas cria rascunho interno |
| Aprovacao | Todo lead inicia com `Aprovacao para envio = Pendente` |
| Retorno webhook | Deve retornar `envio_externo = Nao` |
| Tarefa | Toda tarefa criada tem responsavel, prazo e status |
| Lead | Todo lead tem origem, segmento, empreendimento de interesse e proximo follow-up |

Se qualquer item falhar, parar a homologacao e manter o workflow desativado.

## 5. Execucao das fixtures

No editor do n8n, abrir o workflow e clicar em `Listen for test event` no webhook. Usar a URL de teste:

```text
${N8N_BASE_URL}/webhook-test/nexa/whatsapp/lead-to-crm
```

Executar as fixtures:

```bash
curl -X POST "${N8N_BASE_URL}/webhook-test/nexa/whatsapp/lead-to-crm" \
  -H "Content-Type: application/json" \
  --data-binary @n8n/fixtures/lead_novo_completo.json
```

```bash
curl -X POST "${N8N_BASE_URL}/webhook-test/nexa/whatsapp/lead-to-crm" \
  -H "Content-Type: application/json" \
  --data-binary @n8n/fixtures/lead_novo_incompleto.json
```

```bash
curl -X POST "${N8N_BASE_URL}/webhook-test/nexa/whatsapp/lead-to-crm" \
  -H "Content-Type: application/json" \
  --data-binary @n8n/fixtures/lead_existente.json
```

Nao usar a URL `/webhook/` de producao nesta etapa.

## 6. Criterios de aceite por cenario

### Lead novo completo

- Lead criado ou atualizado no `CRM de Lojistas`.
- Tarefa de follow-up criada em `Gestao de Tarefas`.
- Rascunho interno criado no Gmail.
- Retorno contem `envio_externo = Nao`.
- Retorno contem `aprovacao_para_envio = Pendente`.

### Lead novo incompleto

- Lead fica como `Qualificacao pendente`.
- Campos faltantes permanecem documentados.
- Tarefa orienta completar qualificacao.
- Nenhum envio externo e criado.
- Aprovacao permanece `Pendente`.

### Lead existente

- Busca por telefone encontra registro existente.
- Registro existente e atualizado.
- Nenhum lead duplicado e criado.
- Nova tarefa de follow-up e criada.
- Aprovacao permanece `Pendente`.

## 7. Registro de evidencias

Para cada execucao, registrar em `n8n/logs/`:

- Data e horario.
- Fixture usada.
- URL de teste usada, sem tokens.
- Resultado do webhook.
- Link do lead no Notion.
- Link da tarefa no Notion.
- Confirmacao de que nenhum envio externo ocorreu.
- Pendencias encontradas.

Modelo de resultado esperado:

```text
Workflow: 01_WHATSAPP_LEAD_TO_CRM
Fixture: lead_novo_completo.json
Resultado: aprovado/reprovado
Lead Notion:
Tarefa Notion:
Rascunho Gmail: criado/nao criado
Envio externo: Nao
Aprovacao para envio: Pendente
Pendencias:
```

## 8. Criterio para ativacao

Somente ativar o workflow quando todos os itens abaixo estiverem concluidos:

- 3 fixtures executadas no n8n real.
- 0 envios externos realizados.
- 0 leads duplicados no teste de lead existente.
- Rascunho Gmail interno validado.
- Logs salvos em `n8n/logs/`.
- Aprovacao humana registrada no Notion.
- Issue GitHub correspondente atualizada.

Depois da aprovacao, ativar em janela monitorada e manter acompanhamento por 48 horas.

## 9. Rollback

Se ocorrer erro em producao:

1. Desativar o workflow imediatamente.
2. Exportar execucao com erro do n8n.
3. Registrar incidente em `n8n/logs/`.
4. Corrigir credenciais, propriedades ou mapeamentos.
5. Repetir as tres fixtures antes de reativar.
