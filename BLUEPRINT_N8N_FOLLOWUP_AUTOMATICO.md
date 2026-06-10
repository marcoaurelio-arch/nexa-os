# Blueprint n8n - Follow-up Automatico CRM

## Objetivo

Este documento especifica o workflow `02_FOLLOWUP_AUTOMATICO_CRM`, responsavel por identificar leads com follow-up vencendo ou vencido no Notion, gerar rascunhos de abordagem, criar tarefas de aprovacao e notificar o responsavel.

Regra central: o workflow nunca envia mensagem externa automaticamente. Ele prepara o trabalho e exige aprovacao humana.

## Nome do workflow

```text
02_FOLLOWUP_AUTOMATICO_CRM
```

## Resultado esperado

Ao rodar diariamente, o workflow deve:

1. Buscar leads com `Proximo follow-up` hoje ou vencido.
2. Ignorar leads que nao devem receber contato.
3. Gerar rascunho contextual de follow-up.
4. Criar tarefa para o responsavel.
5. Marcar `Aprovacao para envio = Pendente`.
6. Notificar internamente o responsavel.
7. Registrar log de execucao.
8. Encerrar sem envio externo automatico.

## Bases Notion usadas

| Base | Uso |
|---|---|
| CRM de Lojistas | Fonte dos leads e atualizacao de aprovacao/proxima acao |
| Gestao de Tarefas | Criacao de tarefas de follow-up e aprovacao |
| Propostas Comerciais | Contexto de propostas enviadas ou em negociacao |
| Pipeline de Projetos | Contexto do empreendimento de interesse |
| Reunioes | Contexto de reunioes recentes, quando houver |

## Campos obrigatorios no CRM

| Campo | Uso no workflow |
|---|---|
| Nome do lead | Personalizacao do rascunho |
| Tipo de lead | Ajuste de abordagem |
| Origem | Contexto do canal |
| Segmento | Argumento comercial |
| Empreendimento de interesse | Contexto da oportunidade |
| Contato principal | Personalizacao |
| Telefone/WhatsApp | Canal WhatsApp |
| E-mail | Canal Gmail |
| Status comercial | Regra de elegibilidade |
| Temperatura | Prioridade e tom |
| Proximo follow-up | Filtro principal |
| Responsavel | Dono da tarefa |
| Ultima interacao | Contexto e cadencia |
| Ultimo resumo | Base do rascunho |
| Proxima acao | Chamada para acao |
| Consentimento/opt-in | Restricao de comunicacao recorrente |
| Aprovacao para envio | Bloqueio obrigatorio |

## Elegibilidade

### Incluir leads quando

- `Proximo follow-up` e hoje.
- `Proximo follow-up` esta vencido.
- `Status comercial` nao esta encerrado.
- Existe responsavel definido.
- Existe pelo menos um canal de contato: telefone/WhatsApp ou e-mail.

### Ignorar leads quando

- `Status comercial` e `Ganho`.
- `Status comercial` e `Perdido`.
- `Status comercial` e `Nutricao futura`, salvo se houver tarefa aberta de follow-up.
- `Aprovacao para envio` e `Aprovado` e ja existe tarefa aberta do mesmo follow-up.
- Lead nao tem canal de contato.
- Lead pediu para nao receber contato.

### Excecao

Se o lead for `Estrategico`, gerar tarefa mesmo com dados incompletos. Nesse caso, a tarefa deve ser de qualificacao e nao de envio.

## Cadencia sugerida

| Situacao | Follow-up |
|---|---|
| Novo lead sem resposta | D+1, D+3, D+7, depois Nutricao futura |
| Lead qualificado | A cada 3 dias uteis ate proximo avanco |
| Material enviado | D+2 e D+5 |
| Proposta enviada | D+2, D+5, D+10 |
| Reuniao realizada | Ate 24h para resumo e proximos passos |
| Lead quente | No maximo 1 dia util |
| Lead estrategico | No maximo 1 dia util, prioridade alta |

## Fluxo de alto nivel

```text
Cron diario 08:00
  -> Buscar leads com follow-up hoje/vencido
  -> Filtrar elegibilidade
  -> Enriquecer contexto do lead
  -> Verificar tarefa duplicada aberta
  -> Gerar rascunho por canal
  -> Criar tarefa de aprovacao/follow-up
  -> Atualizar CRM com aprovacao pendente
  -> Notificar responsavel interno
  -> Registrar log
  -> Fim sem envio automatico
```

## Nodes recomendados

| Ordem | Node n8n | Nome do node | Funcao |
|---:|---|---|---|
| 1 | Cron | `Rodar diariamente 08h` | Iniciar rotina diaria |
| 2 | Notion | `Buscar leads com follow-up devido` | Query no CRM |
| 3 | Split In Batches | `Processar leads um a um` | Evitar falha em lote inteiro |
| 4 | IF | `Lead elegivel?` | Aplicar regras de inclusao/exclusao |
| 5 | Notion | `Buscar tarefas abertas do lead` | Evitar duplicidade |
| 6 | IF | `Ja existe tarefa aberta?` | Se sim, apenas registrar log |
| 7 | Notion | `Buscar propostas vinculadas` | Contexto comercial |
| 8 | Notion | `Buscar projeto vinculado` | Contexto do empreendimento |
| 9 | Notion | `Buscar reunioes recentes` | Contexto de ultima reuniao |
| 10 | LLM | `Gerar rascunho de follow-up` | Criar mensagem conforme canal/status |
| 11 | Notion | `Criar tarefa de aprovacao` | Tarefa com responsavel/prazo/status |
| 12 | Notion | `Atualizar CRM aprovacao pendente` | Proxima acao e aprovacao |
| 13 | Gmail interno | `Notificar responsavel` | Enviar alerta interno |
| 14 | Google Sheets ou Notion | `Registrar log` | Auditoria |
| 15 | NoOp | `Fim sem envio externo` | Encerrar |

## Query Notion - CRM

Filtro logico:

```json
{
  "and": [
    {
      "property": "Proximo follow-up",
      "date": {
        "on_or_before": "{{today}}"
      }
    },
    {
      "property": "Status comercial",
      "status": {
        "does_not_equal": "Ganho"
      }
    },
    {
      "property": "Status comercial",
      "status": {
        "does_not_equal": "Perdido"
      }
    }
  ]
}
```

Ordenacao:

```json
[
  {
    "property": "Temperatura",
    "direction": "descending"
  },
  {
    "property": "Proximo follow-up",
    "direction": "ascending"
  }
]
```

Observacao: se o Notion nao ordenar select/status como esperado, ordenar no node Code/Function.

## Regra anti-duplicidade

Antes de criar tarefa, buscar na base `Gestao de Tarefas`:

- `Lead relacionado` contem o lead atual.
- `Status` nao e `Concluida`.
- `Status` nao e `Cancelada`.
- `Modulo` e `CRM`.
- `Tarefa` contem `follow-up` ou `aprovar`.

Se existir tarefa aberta:

- Nao criar nova tarefa.
- Registrar log como `duplicidade_evitaria`.
- Opcionalmente atualizar a tarefa existente com comentario/resumo.

## Selecionar canal recomendado

| Condicao | Canal recomendado |
|---|---|
| Origem WhatsApp e tem telefone | WhatsApp |
| Origem Gmail e tem e-mail | E-mail |
| Proposta enviada e tem e-mail | E-mail |
| Lead quente/estrategico e tem telefone | WhatsApp ou ligacao |
| Sem opt-in para recorrencia | Tarefa manual, sem rascunho de campanha |
| Sem telefone e sem e-mail | Tarefa de qualificacao |

## Prompt do rascunho de follow-up

Usar no node `Gerar rascunho de follow-up`:

```text
Voce e o Agente Comercial da Nexa Malls.

Objetivo: gerar um rascunho de follow-up comercial para aprovacao humana.

Contexto da Nexa Malls:
- Desenvolvimento, estruturacao, comercializacao e gestao de strip malls, BTS, ativos comerciais e novos negocios imobiliarios.
- Argumentos comerciais relevantes: localizacao, acesso, visibilidade, estacionamento, fluxo potencial, sinergia de mix, seguranca para expansao e capacidade da Nexa de estruturar ativos comerciais.

Regras obrigatorias:
- Nao envie ou autorize envio automatico.
- Nao invente metragem, preco, condicoes comerciais, disponibilidade ou dados juridicos.
- Use linguagem profissional, direta e consultiva.
- O texto deve ser especifico para o segmento e empreendimento quando houver dados.
- Se faltarem dados, gere uma abordagem curta para completar qualificacao.
- Sempre deixe claro o proximo passo.
- Retorne somente JSON valido.

Dados do lead:
Nome do lead: {{nome_do_lead}}
Contato: {{contato_principal}}
Tipo de lead: {{tipo_de_lead}}
Segmento: {{segmento}}
Empreendimento de interesse: {{empreendimento_de_interesse}}
Status comercial: {{status_comercial}}
Temperatura: {{temperatura}}
Origem: {{origem}}
Ultima interacao: {{ultima_interacao}}
Ultimo resumo: {{ultimo_resumo}}
Proxima acao atual: {{proxima_acao}}
Canal recomendado: {{canal_recomendado}}
Contexto de proposta: {{contexto_proposta}}
Contexto de reuniao: {{contexto_reuniao}}

Retorne JSON neste formato:
{
  "canal": "WhatsApp | E-mail | Ligacao | Qualificacao manual",
  "assunto_email": "",
  "rascunho": "",
  "script_ligacao": [],
  "proxima_acao_recomendada": "",
  "prazo_sugerido_proximo_followup": "",
  "dados_pendentes": [],
  "observacao_interna": ""
}
```

## Exemplos de saida esperada

### WhatsApp

```json
{
  "canal": "WhatsApp",
  "assunto_email": "",
  "rascunho": "Ola, [Nome]. Tudo bem? Retomo nosso contato sobre [empreendimento]. Pelo perfil da [empresa/segmento], acredito que vale avaliarmos os proximos detalhes de metragem e condicoes. Podemos marcar uma conversa rapida esta semana?",
  "script_ligacao": [],
  "proxima_acao_recomendada": "Aprovar rascunho e realizar follow-up via WhatsApp",
  "prazo_sugerido_proximo_followup": "3 dias uteis",
  "dados_pendentes": [],
  "observacao_interna": "Mensagem aguardando aprovacao humana."
}
```

### E-mail

```json
{
  "canal": "E-mail",
  "assunto_email": "Follow-up sobre oportunidade comercial - [Empreendimento]",
  "rascunho": "Ola, [Nome]. Tudo bem?\n\nRetomo nosso contato sobre a oportunidade comercial em [Empreendimento]. Acredito que o ponto pode fazer sentido para o segmento de [Segmento], especialmente pela combinacao de localizacao, acesso e sinergia com o mix previsto.\n\nPodemos agendar uma conversa rapida para avaliar se faz sentido avancarmos com as informacoes de metragem e condicoes?\n\nFico a disposicao.\n\nMarco Aurelio\nNexa Malls",
  "script_ligacao": [],
  "proxima_acao_recomendada": "Aprovar rascunho e enviar e-mail manualmente ou via fluxo aprovado",
  "prazo_sugerido_proximo_followup": "5 dias uteis",
  "dados_pendentes": [],
  "observacao_interna": "Nao enviar sem aprovacao."
}
```

## Criacao da tarefa no Notion

### Nome da tarefa

```text
Aprovar e realizar follow-up com {{nome_do_lead}}
```

### Campos

| Campo Notion | Valor |
|---|---|
| Tarefa | `Aprovar e realizar follow-up com {{nome_do_lead}}` |
| Modulo | CRM |
| Responsavel | Responsavel do lead |
| Prazo | Hoje para quente/estrategico; hoje ou proximo dia util para demais vencidos |
| Status | A fazer |
| Prioridade | Alta para quente/estrategico/proposta enviada; Media nos demais |
| Descricao | Incluir resumo, canal recomendado e rascunho |
| Criterio de conclusao | Follow-up aprovado e realizado, ou proxima acao atualizada no CRM |
| Lead relacionado | Lead atual |

### Descricao sugerida

```text
Lead com follow-up devido.

Status comercial: {{status_comercial}}
Temperatura: {{temperatura}}
Empreendimento: {{empreendimento_de_interesse}}
Canal recomendado: {{canal}}

Resumo:
{{ultimo_resumo}}

Rascunho para aprovacao:
{{rascunho}}

Observacao interna:
{{observacao_interna}}
```

## Atualizacao do CRM

Atualizar o lead com:

| Campo | Valor |
|---|---|
| Aprovacao para envio | Pendente |
| Proxima acao | Valor gerado pelo LLM |
| Ultimo resumo | Manter resumo existente e acrescentar nota curta do follow-up gerado |
| Proximo follow-up | Nao alterar ate o follow-up ser feito, salvo se a regra operacional decidir reagendar |

Recomendacao: nao empurrar automaticamente a data do follow-up para frente antes da acao humana. Isso evita esconder pendencias.

## Notificacao interna

Canal inicial: Gmail interno.

Assunto:

```text
[Nexa CRM] Follow-up pendente - {{nome_do_lead}}
```

Corpo:

```text
Existe um follow-up pendente no CRM.

Lead: {{nome_do_lead}}
Contato: {{contato_principal}}
Segmento: {{segmento}}
Empreendimento: {{empreendimento_de_interesse}}
Status: {{status_comercial}}
Temperatura: {{temperatura}}
Canal recomendado: {{canal}}

Resumo:
{{ultimo_resumo}}

Rascunho sugerido:
{{rascunho}}

Tarefa:
{{tarefa_url}}

CRM:
{{crm_url}}

Acao necessaria:
Revisar, aprovar e realizar o follow-up. Nenhuma mensagem foi enviada automaticamente.
```

## Logs

Registrar cada lead processado.

| Campo | Valor |
|---|---|
| Data/hora | Execucao |
| Workflow | `02_FOLLOWUP_AUTOMATICO_CRM` |
| Lead | Nome do lead |
| CRM URL | URL do registro |
| Resultado | tarefa_criada, ignorado, duplicidade_evitaria, erro |
| Motivo | Texto curto |
| Responsavel | Responsavel do lead |
| Envio externo | Sempre `Nao` |

## Tratamento de erros

| Erro | Tratamento |
|---|---|
| Lead sem responsavel | Criar tarefa para responsavel padrao e marcar prioridade alta |
| Lead sem canal | Criar tarefa de qualificacao, sem rascunho de envio |
| Relation de projeto quebrada | Gerar rascunho generico e registrar dado pendente |
| LLM retorna JSON invalido | Tentar novamente uma vez; se falhar, criar tarefa sem rascunho |
| Notion falha | Retry 3 vezes; registrar erro |
| Gmail interno falha | Criar tarefa mesmo assim e registrar erro de notificacao |

## Testes de aceite

| Teste | Entrada | Resultado esperado |
|---|---|---|
| Follow-up hoje | Lead com Proximo follow-up hoje | Criar tarefa e rascunho |
| Follow-up vencido | Lead com data anterior a hoje | Criar tarefa prioridade alta se vencido ha mais de 2 dias |
| Lead ganho | Status Ganho | Ignorar |
| Lead perdido | Status Perdido | Ignorar |
| Nutricao futura | Status Nutricao futura sem tarefa aberta | Ignorar |
| Lead quente | Temperatura Quente | Tarefa prioridade alta |
| Lead estrategico incompleto | Sem e-mail/telefone | Criar tarefa de qualificacao |
| Tarefa duplicada | Ja existe tarefa aberta | Nao criar nova tarefa |
| Proposta enviada | Status Proposta enviada | Rascunho contextual de proposta |
| Sem opt-in | Consentimento false | Tarefa manual, sem campanha recorrente |
| Erro LLM | JSON invalido | Retry e fallback para tarefa sem rascunho |
| Aprovacao | Qualquer caso elegivel | Aprovacao para envio fica Pendente |
| Envio externo | Qualquer caso | Nenhum WhatsApp/Gmail externo enviado |

## Checklist de implantacao

| Item | Status |
|---|---|
| Confirmar campos no CRM | A fazer |
| Confirmar campos em Gestao de Tarefas | A fazer |
| Criar credencial Notion no n8n | A fazer |
| Criar credencial Gmail interna no n8n | A fazer |
| Criar node Cron diario 08h | A fazer |
| Criar query de leads com follow-up devido | A fazer |
| Criar filtro de elegibilidade | A fazer |
| Criar verificacao anti-duplicidade | A fazer |
| Criar prompt de rascunho | A fazer |
| Criar tarefa no Notion | A fazer |
| Atualizar CRM com aprovacao pendente | A fazer |
| Notificar responsavel interno | A fazer |
| Criar log de execucao | A fazer |
| Rodar testes com leads ficticios | A fazer |
| Validar ausencia de envio externo | A fazer |

## Definicao de pronto

O workflow esta pronto quando:

- Identifica corretamente leads com follow-up hoje ou vencido.
- Ignora leads encerrados.
- Nao duplica tarefas abertas.
- Cria tarefa com responsavel, prazo e status.
- Gera rascunho contextual de follow-up.
- Marca aprovacao como pendente.
- Notifica o responsavel interno.
- Registra log de execucao.
- Nao envia mensagens externas automaticamente.

## Proximo workflow recomendado

Depois deste fluxo, implementar:

```text
03_PAUTA_REUNIAO_SEMANAL
```

Esse sera o primeiro workflow de PMO, usando dados de projetos, tarefas, leads, propostas e terrenos para gerar a pauta semanal executiva.
