# Runbook - Importacao e Homologacao do Workflow 02

## 1. Resumo Executivo

Este runbook orienta a importacao segura do workflow `02_FOLLOWUP_AUTOMATICO_CRM` no n8n.

Regra central: importar com `active = false` e nunca enviar mensagem externa automaticamente.

## 2. Diagnostico

O Workflow 02 depende de CRM, tarefas, Gmail interno e log de execucao do n8n. Ele so deve ser ativado depois de passar pelos testes de follow-up hoje e follow-up vencido.

## 3. Oportunidades

- Reduzir perda de follow-ups comerciais.
- Criar tarefas automaticas para responsaveis.
- Garantir rastreabilidade por log.
- Evitar envio externo sem aprovacao.

## 4. Riscos

| Risco | Mitigacao |
|---|---|
| Criar tarefas duplicadas | Buscar tarefa aberta antes de criar nova |
| Enviar mensagem externa | Manter Gmail como rascunho interno e `envio_externo = Nao` |
| Acionar leads encerrados | Ignorar `Ganho` e `Perdido` |
| Rodar sem credenciais corretas | Homologar com `active = false` |
| Prometer log externo antes da integracao | Usar log nativo do n8n nesta etapa; conectar planilha critica na evolucao seguinte |

## 5. Recomendacao

Rodar primeiro com fixtures controladas, depois com um lote pequeno de leads reais.

## 6. Plano de Acao

| Acao | Responsavel | Prazo | Indicador |
|-------|------------|--------|------------|
| Importar workflow com `active=false` | Tecnico automacoes | D+1 | Workflow importado |
| Configurar credenciais Notion/Gmail | Tecnico automacoes | D+2 | Credenciais testadas |
| Executar fixture follow-up hoje | Tecnico / Andre | D+3 | Tarefa criada |
| Executar fixture follow-up vencido | Tecnico / Andre | D+3 | Log do workflow registrado |
| Validar anti-duplicidade | Tecnico automacoes | D+4 | 0 tarefas duplicadas |

## Variaveis

```text
NOTION_CRM_DATA_SOURCE_ID=0bb61aec-0fb8-414a-87c9-703c07a93e52
NOTION_TASKS_DATA_SOURCE_ID=f28eeb36-0aa0-476d-a70b-6a0d011b25f8
GMAIL_INTERNAL_NOTIFY_TO=marcoaurelio@planejarimoveis.com.br
```

Observacao: a planilha `LOG_Execucoes_Criticas` ja existe, mas ainda nao esta conectada ao Workflow 02. A conexao Sheets deve entrar somente apos a homologacao basica de Notion e Gmail.

## Criterio de pronto

- Workflow importado e desativado.
- Credenciais configuradas sem segredo em arquivos.
- Dois cenarios principais homologados.
- Nenhum envio externo realizado.
- Logs registrados.
