# Teste - 02_FOLLOWUP_AUTOMATICO_CRM

## Arquivos

- Workflow importavel: `n8n/workflows/02_FOLLOWUP_AUTOMATICO_CRM.workflow.json`
- Fixture follow-up hoje: `n8n/fixtures/followup_hoje.json`
- Fixture follow-up vencido: `n8n/fixtures/followup_vencido.json`

## Validacoes obrigatorias

1. Importar o workflow no n8n com `active = false`.
2. Configurar credenciais de Notion e Gmail somente em ambiente controlado.
3. Confirmar variaveis:
   - `NOTION_CRM_DATA_SOURCE_ID`
   - `NOTION_TASKS_DATA_SOURCE_ID`
   - `GMAIL_INTERNAL_NOTIFY_TO`
4. Executar cenario `followup_hoje`.
   - Deve identificar lead com `Proximo follow-up` igual a data do dia.
   - Deve criar tarefa de aprovacao/follow-up.
   - Deve manter `Aprovacao para envio = Pendente`.
   - Deve retornar `envio_externo = Nao`.
5. Executar cenario `followup_vencido`.
   - Deve identificar lead com `Proximo follow-up` anterior a data do dia.
   - Deve criar tarefa de aprovacao/follow-up com prioridade alta.
   - Deve registrar log do workflow no historico do n8n.
   - Deve retornar `envio_externo = Nao`.

## Travas de governanca

- Workflow desativado por padrao.
- Nenhum no de envio externo automatico.
- Gmail limitado a rascunho interno.
- Aprovacao sempre inicia ou volta para `Pendente`.
- `Envio externo = Nao` deve aparecer no retorno, tarefa e logs.

## Pendencias para homologacao real

- Configurar credenciais no n8n.
- Rodar contra base Notion real em modo controlado.
- Verificar regra anti-duplicidade de tarefa aberta.
- Testar leads `Ganho` e `Perdido` como ignorados.
- Conectar planilha `LOG_Execucoes_Criticas` em evolucao posterior.
