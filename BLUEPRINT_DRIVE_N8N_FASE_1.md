# Blueprint Drive e n8n - Sistema Operacional Nexa Malls

## Objetivo

Este documento detalha a segunda etapa da Fase 1: organizar o Google Drive e preparar o primeiro fluxo n8n de captura de lead via WhatsApp/Zaper para o CRM no Notion.

O foco e implantar com governanca simples:

- Documento certo na pasta certa.
- Lead novo sempre registrado no CRM.
- Follow-up sempre convertido em tarefa.
- Mensagem externa sempre bloqueada ate aprovacao humana.

## 1. Estrutura Google Drive

### Pasta raiz

```text
Nexa Malls - Sistema Operacional
```

Permissao sugerida:

| Grupo | Permissao |
|---|---|
| Marco / Diretoria | Editor |
| Comercial | Editor nas pastas 01_CRM_Lojistas e 04_Propostas_Comerciais |
| PMO | Editor nas pastas 02_Projetos, 05_Reunioes e 06_Relatorios |
| Tecnico automacoes | Editor em 07_Automacoes_n8n |
| Externos | Acesso somente por link especifico e quando aprovado |

### Arvore de pastas

```text
Nexa Malls - Sistema Operacional/
  00_Admin/
    Credenciais_e_Acessos/
    Templates/
    Governanca/
  01_CRM_Lojistas/
    Leads/
    Redes_em_Expansao/
    Historico_de_Contato/
    Materiais_Enviados/
  02_Projetos/
    Villa_Viseu/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Piazza_Nicomedes/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    BlueMall/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Boulevard_Naves/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Uberlandia_Shopping_HUB_de_Servicos/
      01_Estudos/
      02_Comercial/
      03_Juridico/
      04_Reunioes/
      05_Relatorios/
    Novos_Terrenos_Comerciais/
      01_Mapas_e_Fotos/
      02_Documentos/
      03_Estudos_de_Vocacao/
      04_Viabilidade/
  03_Banco_de_Terrenos/
    Mapas/
    Fotos/
    Matriculas_e_Documentos/
    Estudos/
  04_Propostas_Comerciais/
    01_Rascunhos/
    02_Em_Revisao/
    03_Aprovadas/
    04_Enviadas/
    05_Modelos/
  05_Reunioes/
    PMO_Semanal/
    Comercial/
    Ativos/
    Diretoria/
  06_Relatorios/
    Diario_Executivo/
    Mensal_de_Ativos/
    Comercial/
    PMO/
  07_Automacoes_n8n/
    Documentacao/
    Logs/
    Backups/
```

### Arquivos template a criar

| Pasta | Arquivo | Formato | Uso |
|---|---|---|---|
| `00_Admin/Templates` | `TEMPLATE_Proposta_Comercial_Nexa_Malls` | Google Docs | Propostas comerciais |
| `00_Admin/Templates` | `TEMPLATE_Ata_Reuniao_Nexa_Malls` | Google Docs | Registro de reunioes |
| `00_Admin/Templates` | `TEMPLATE_Relatorio_Executivo_Diario` | Google Docs | Relatorio diario |
| `00_Admin/Templates` | `TEMPLATE_Relatorio_Mensal_Ativos` | Google Docs | Relatorio de ativos |
| `00_Admin/Governanca` | `Politica_Aprovacao_Mensagens` | Google Docs | Regra de aprovacao humana |
| `07_Automacoes_n8n/Documentacao` | `Mapa_Credenciais_n8n` | Google Sheets | Controle de integracoes |
| `07_Automacoes_n8n/Logs` | `LOG_Execucoes_Criticas` | Google Sheets | Auditoria manual |

### Padrao de nomes

```text
AAAA-MM-DD_Tipo_Projeto_Descricao_v01
```

Exemplos:

```text
2026-06-09_Proposta_Villa_Viseu_Rede_Farmacia_v01
2026-06-09_Ata_PMO_Semanal_v01
2026-06_Relatorio_Mensal_BlueMall_v01
2026-06-09_Estudo_Terreno_Novos_Terrenos_Comerciais_v01
```

## 2. Preparacao Notion antes do n8n

Antes de ligar o fluxo, confirmar no Notion:

| Base | Campo | Motivo |
|---|---|---|
| CRM de Lojistas | Nome do lead | Titulo do registro |
| CRM de Lojistas | Origem | Obrigatorio para lead |
| CRM de Lojistas | Segmento | Obrigatorio para lead |
| CRM de Lojistas | Empreendimento de interesse | Obrigatorio para lead |
| CRM de Lojistas | Proximo follow-up | Obrigatorio para lead |
| CRM de Lojistas | Aprovacao para envio | Bloqueio de comunicacao |
| Gestao de Tarefas | Responsavel | Toda tarefa precisa de dono |
| Gestao de Tarefas | Prazo | Toda tarefa precisa de data |
| Gestao de Tarefas | Status | Toda tarefa precisa de estado |

Valores default recomendados para lead incompleto:

| Campo | Default |
|---|---|
| Status comercial | Qualificacao pendente |
| Temperatura | Morno |
| Aprovacao para envio | Pendente |
| Consentimento/opt-in | false |
| Responsavel | Marco ou responsavel comercial definido |

## 3. Credenciais n8n

Criar as seguintes credenciais no n8n:

| Credencial | Nome sugerido | Escopo |
|---|---|---|
| Notion API | `notion_nexa_operacional` | Ler/criar/atualizar paginas nas bases da Fase 1 |
| Google Drive | `gdrive_nexa_operacional` | Criar pastas, ler templates, criar docs |
| Gmail | `gmail_nexa_operacional` | Criar rascunhos e consultar mensagens, sem envio automatico |
| Google Calendar | `gcal_nexa_operacional` | Ler/criar/atualizar eventos |
| Zaper/WhatsApp | `zaper_whatsapp_nexa` | Receber mensagens e, futuramente, enviar apenas com aprovacao |
| OpenAI/LLM | `llm_nexa_agentes` | Classificacao e rascunhos |

Regra: nenhuma credencial deve ficar documentada com token, senha ou chave em texto aberto no Drive ou Notion.

## 4. Workflow n8n 01 - Lead WhatsApp para CRM

Nome do workflow:

```text
01_WHATSAPP_LEAD_TO_CRM
```

Objetivo:

Capturar mensagem recebida via WhatsApp/Zaper, verificar se o contato ja existe no CRM, criar ou atualizar o lead, gerar tarefa de follow-up e produzir rascunho de resposta para aprovacao humana.

### Fluxo de alto nivel

```text
Zaper Trigger
  -> Normalizar payload
  -> Buscar lead no Notion por telefone
  -> Lead existe?
      -> Sim: atualizar lead
      -> Nao: classificar e criar lead
  -> Criar tarefa de follow-up
  -> Gerar rascunho de resposta
  -> Registrar aprovacao pendente
  -> Notificar responsavel interno
  -> Fim sem envio externo automatico
```

### Nodes recomendados

| Ordem | Node n8n | Nome do node | Funcao |
|---:|---|---|---|
| 1 | Webhook ou Zaper Trigger | `Trigger WhatsApp recebido` | Receber nova mensagem |
| 2 | Set | `Normalizar entrada` | Padronizar telefone, nome, mensagem, horario |
| 3 | Notion | `Buscar lead por telefone` | Consultar CRM de Lojistas |
| 4 | IF | `Lead ja existe?` | Separar criacao de atualizacao |
| 5A | LLM | `Classificar lead novo` | Extrair segmento, interesse, temperatura e proxima acao |
| 6A | Notion | `Criar lead no CRM` | Criar registro novo |
| 5B | LLM | `Resumir nova interacao` | Atualizar resumo de lead existente |
| 6B | Notion | `Atualizar lead existente` | Atualizar ultima interacao e proxima acao |
| 7 | Function/Code | `Calcular follow-up` | Definir prazo conforme temperatura |
| 8 | Notion | `Criar tarefa de follow-up` | Criar tarefa obrigatoria |
| 9 | LLM | `Gerar rascunho de resposta` | Criar mensagem para aprovacao |
| 10 | Notion | `Registrar aprovacao pendente` | Campo `Aprovacao para envio = Pendente` |
| 11 | Gmail/Slack/Email interno | `Notificar responsavel` | Avisar internamente para revisar |
| 12 | NoOp | `Fim sem envio automatico` | Encerrar fluxo |

### Payload minimo esperado do Zaper

```json
{
  "phone": "+5534999999999",
  "contact_name": "Nome do contato",
  "message": "Mensagem recebida no WhatsApp",
  "timestamp": "2026-06-09T09:00:00-03:00",
  "channel": "whatsapp"
}
```

### Objeto normalizado

```json
{
  "telefone": "+5534999999999",
  "contato_principal": "Nome do contato",
  "mensagem_recebida": "Mensagem recebida no WhatsApp",
  "origem": "WhatsApp",
  "data_interacao": "2026-06-09",
  "responsavel_padrao": "Marco",
  "aprovacao_para_envio": "Pendente"
}
```

## 5. Prompt do classificador do workflow

Usar no node `Classificar lead novo`:

```text
Voce e o classificador comercial da Nexa Malls.

Analise a mensagem recebida de um contato via WhatsApp e retorne somente JSON valido.

Contexto da Nexa Malls:
- Desenvolvimento, comercializacao e gestao de strip malls, BTS, ativos comerciais e novos negocios imobiliarios.
- Projetos conhecidos: Villa Viseu, Piazza Nicomedes, BlueMall, Boulevard Naves, Uberlandia Shopping HUB de Servicos e Novos Terrenos Comerciais.

Regras:
- Nao invente dados.
- Se nao souber o segmento, use "Outro".
- Se nao souber o empreendimento de interesse, use "Novos Terrenos Comerciais" apenas quando a mensagem tratar de terreno; caso contrario use "A definir".
- Toda saida deve sugerir proximo follow-up.
- Nunca autorize envio automatico.

Mensagem:
{{mensagem_recebida}}

Contato:
{{contato_principal}}

Retorne JSON neste formato:
{
  "nome_do_lead": "",
  "tipo_de_lead": "Lojista | Rede | Ancora | Investidor | Proprietario | Parceiro",
  "segmento": "",
  "empreendimento_de_interesse": "",
  "temperatura": "Frio | Morno | Quente | Estrategico",
  "status_comercial": "Novo lead | Qualificacao pendente | Qualificado | Material solicitado | Reuniao a agendar",
  "ultimo_resumo": "",
  "proxima_acao": "",
  "dados_pendentes": [],
  "rascunho_resposta": ""
}
```

## 6. Regras de follow-up

| Temperatura | Prazo |
|---|---|
| Estrategico | 1 dia util |
| Quente | 1 dia util |
| Morno | 3 dias uteis |
| Frio | 7 dias uteis |

Se houver pedido explicito de reuniao, proposta ou material, usar no maximo 1 dia util.

Se o lead estiver incompleto, criar tarefa:

```text
Completar qualificacao do lead: [Nome do lead]
```

Critério de conclusão:

```text
Lead com origem, segmento, empreendimento de interesse, contato principal, proxima acao e proximo follow-up preenchidos.
```

## 7. Mapeamento para Notion

### CRM de Lojistas

| Campo Notion | Valor n8n |
|---|---|
| Nome do lead | `classificacao.nome_do_lead` ou `contato_principal` |
| Tipo de lead | `classificacao.tipo_de_lead` |
| Origem | `WhatsApp` |
| Segmento | `classificacao.segmento` |
| Empreendimento de interesse | Relation por nome `classificacao.empreendimento_de_interesse` |
| Contato principal | `contato_principal` |
| Telefone/WhatsApp | `telefone` |
| Status comercial | `classificacao.status_comercial` |
| Temperatura | `classificacao.temperatura` |
| Proximo follow-up | `followup.data` |
| Responsavel | responsavel padrao |
| Ultima interacao | `data_interacao` |
| Ultimo resumo | `classificacao.ultimo_resumo` |
| Proxima acao | `classificacao.proxima_acao` |
| Consentimento/opt-in | `false` |
| Aprovacao para envio | `Pendente` |

### Gestao de Tarefas

| Campo Notion | Valor n8n |
|---|---|
| Tarefa | `Realizar follow-up com [Nome do lead]` |
| Modulo | `CRM` |
| Responsavel | responsavel padrao |
| Prazo | `followup.data` |
| Status | `A fazer` |
| Prioridade | Alta se temperatura Quente/Estrategico; Media nos demais |
| Descricao | Resumo da mensagem e proxima acao |
| Criterio de conclusao | Follow-up realizado ou resposta aprovada/enviada manualmente |
| Lead relacionado | Registro criado/atualizado no CRM |

## 8. Bloqueio de aprovacao humana

O workflow nao deve ter node ativo de envio externo no final.

Permitido:

- Criar rascunho de resposta.
- Notificar responsavel interno.
- Criar tarefa de aprovacao.
- Atualizar campo `Aprovacao para envio = Pendente`.

Nao permitido:

- Enviar WhatsApp automaticamente.
- Enviar Gmail automaticamente para contato externo.
- Mudar `Aprovacao para envio` para `Aprovado` sem acao humana.
- Fazer follow-up em massa sem revisao.

Se no futuro houver envio via n8n, criar workflow separado:

```text
02_APROVACAO_HUMANA_ENVIO_MENSAGEM
```

Esse workflow so pode iniciar quando:

- `Aprovacao para envio = Aprovado`.
- Existe usuario humano responsavel pela aprovacao.
- Existe registro de data/hora da aprovacao.
- Existe rascunho final aprovado.

## 9. Notificacao interna

Canal inicial recomendado: Gmail interno para o responsavel.

Assunto:

```text
[Nexa CRM] Novo lead WhatsApp aguardando aprovacao - {{nome_do_lead}}
```

Corpo:

```text
Novo lead/interacao recebida via WhatsApp.

Lead: {{nome_do_lead}}
Telefone: {{telefone}}
Segmento: {{segmento}}
Empreendimento: {{empreendimento_de_interesse}}
Temperatura: {{temperatura}}
Proximo follow-up: {{proximo_followup}}

Resumo:
{{ultimo_resumo}}

Proxima acao:
{{proxima_acao}}

Rascunho sugerido para aprovacao:
{{rascunho_resposta}}

Link do CRM:
{{notion_url}}
```

## 10. Testes de aceite do workflow

| Teste | Entrada | Resultado esperado |
|---|---|---|
| Lead novo completo | Mensagem com empresa, segmento e projeto | Criar lead no CRM e tarefa de follow-up |
| Lead novo incompleto | Mensagem generica | Criar lead como Qualificacao pendente e tarefa para completar dados |
| Lead existente | Mesmo telefone de lead ja cadastrado | Atualizar ultima interacao e criar nova tarefa |
| Pedido de proposta | Mensagem pedindo proposta | Criar lead/tarefa e sinalizar necessidade de proposta |
| Pedido de reuniao | Mensagem pedindo agenda | Criar tarefa com follow-up de ate 1 dia util |
| Sem opt-in | Contato sem consentimento | Nao incluir em regua automatica |
| Aprovacao pendente | Qualquer lead | Nao enviar mensagem externa |
| Temperatura estrategica | Rede ancora ou investidor relevante | Follow-up em 1 dia util e prioridade alta |

## 11. Logs e auditoria

Registrar no n8n ou Google Sheets:

| Campo | Descricao |
|---|---|
| Data/hora | Momento da execucao |
| Workflow | Nome do fluxo |
| Telefone | Telefone recebido |
| Resultado | Criou lead, atualizou lead, erro, pendente |
| Registro Notion | URL do lead |
| Tarefa criada | URL da tarefa |
| Envio externo | Sempre `Nao` neste workflow |
| Erro | Mensagem de erro, se houver |

## 12. Erros previstos

| Erro | Tratamento |
|---|---|
| Telefone vazio | Encerrar e registrar log de erro |
| Mensagem vazia | Criar log, nao criar lead |
| Empreendimento nao encontrado | Usar status Qualificacao pendente e tarefa para revisar |
| Notion fora do ar | Repetir 3 vezes e registrar erro |
| LLM retorna JSON invalido | Reexecutar classificacao uma vez; se falhar, criar lead minimo manual |
| Responsavel nao definido | Usar responsavel padrao |

## 13. Ordem de execucao agora

1. Criar pastas no Google Drive.
2. Criar templates em `00_Admin/Templates`.
3. Inserir links das pastas dos projetos no Notion.
4. Configurar credenciais n8n.
5. Montar workflow `01_WHATSAPP_LEAD_TO_CRM`.
6. Rodar testes com lead ficticio.
7. Validar que nenhum envio externo acontece.
8. Ativar em modo producao monitorado.

## 14. Definicao de pronto

Esta etapa esta pronta quando:

- A estrutura do Google Drive existe.
- Os templates existem.
- As credenciais n8n foram configuradas sem exposicao de segredos.
- O workflow cria lead novo.
- O workflow atualiza lead existente.
- O workflow cria tarefa de follow-up.
- O workflow gera rascunho para aprovacao.
- O workflow nao envia mensagens externas automaticamente.
- Os logs de execucao registram sucesso e erro.
