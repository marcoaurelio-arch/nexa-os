# Teste - 01_WHATSAPP_LEAD_TO_CRM

## Arquivos

- Workflow importavel: `n8n/workflows/01_WHATSAPP_LEAD_TO_CRM.workflow.json`
- Runbook de importacao: `n8n/RUNBOOK_IMPORTACAO_WORKFLOW_01.md`
- Fixture lead novo completo: `n8n/fixtures/lead_novo_completo.json`
- Fixture lead novo incompleto: `n8n/fixtures/lead_novo_incompleto.json`
- Fixture lead existente: `n8n/fixtures/lead_existente.json`

## Validacoes obrigatorias

1. Importar o workflow no n8n com `active = false`.
2. Configurar credenciais de Notion e Gmail somente em ambiente controlado.
3. Confirmar variaveis:
   - `NOTION_CRM_DATA_SOURCE_ID`
   - `NOTION_TASKS_DATA_SOURCE_ID`
   - `GMAIL_INTERNAL_NOTIFY_TO`
4. Executar `lead_novo_completo.json`.
   - Deve criar ou simular criacao de CRM.
   - Deve criar tarefa de follow-up.
   - Deve criar rascunho interno.
   - Deve retornar `envio_externo = Nao`.
5. Executar `lead_novo_incompleto.json`.
   - Deve marcar `Qualificacao pendente`.
   - Deve listar campos faltantes.
   - Deve manter `Aprovacao para envio = Pendente`.
6. Executar `lead_existente.json`.
   - Deve atualizar ultima interacao.
   - Nao deve duplicar cadastro se a busca por telefone retornar registro existente.

## Travas de governanca

- Workflow desativado por padrao.
- Nenhum no de envio externo automatico.
- Gmail limitado a rascunho interno.
- Aprovacao sempre inicia como `Pendente`.
- `Envio externo = Nao` deve aparecer no retorno e nos logs.

## Status atual

- Testes manuais assistidos registrados em `n8n/logs/`.
- Homologacao no n8n real ainda pendente de credenciais e variaveis de ambiente.
- Ativacao em producao bloqueada ate aprovacao humana registrada.
