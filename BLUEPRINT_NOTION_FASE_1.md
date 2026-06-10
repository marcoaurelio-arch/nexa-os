# Blueprint Notion - Sistema Operacional Nexa Malls

## Objetivo

Este blueprint transforma a especificação da Fase 1 em uma configuração prática para implantação manual no Notion. A prioridade é criar uma base operacional simples, integrada e pronta para receber automações do n8n depois.

## Ordem de implantação recomendada

1. Criar a página raiz.
2. Criar a base `Gestao de Tarefas`.
3. Criar a base `Pipeline de Projetos`.
4. Criar a base `CRM de Lojistas`.
5. Criar a base `Banco de Terrenos`.
6. Criar a base `Reunioes`.
7. Criar a base `Propostas Comerciais`.
8. Criar a base `Relatorios Executivos`.
9. Criar relations entre bases.
10. Criar views operacionais.
11. Cadastrar registros iniciais.
12. Revisar obrigatoriedade dos campos antes de ligar automacoes.

## Pagina raiz

Nome da pagina:

```text
Sistema Operacional Nexa Malls
```

Blocos sugeridos:

- `Painel Executivo`
- `CRM Comercial`
- `Projetos e PMO`
- `Terrenos e Novos Negocios`
- `Propostas`
- `Reunioes`
- `Relatorios`
- `Implantacao`

Bases dentro da pagina:

- `CRM de Lojistas`
- `Pipeline de Projetos`
- `Banco de Terrenos`
- `Gestao de Tarefas`
- `Reunioes`
- `Propostas Comerciais`
- `Relatorios Executivos`

## 1. Base: Gestao de Tarefas

Criar primeiro porque quase todas as outras bases se relacionam com tarefas.

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Tarefa | Title | Sim | Acao clara com verbo |
| Modulo | Select | Sim | CRM, Projetos, Terrenos, Ativos, Propostas, Reuniao, Relatorio, Implantacao |
| Responsavel | Person | Sim | Dono da tarefa |
| Prazo | Date | Sim | Data objetiva |
| Status | Status | Sim | Backlog, A fazer, Em andamento, Aguardando terceiro, Aguardando aprovacao, Concluida, Cancelada |
| Prioridade | Select | Sim | Alta, Media, Baixa |
| Descricao | Text | Sim | Contexto da tarefa |
| Criterio de conclusao | Text | Sim | Como validar que terminou |
| Projeto relacionado | Relation | Nao | Relacionar depois com Pipeline de Projetos |
| Lead relacionado | Relation | Nao | Relacionar depois com CRM de Lojistas |
| Terreno relacionado | Relation | Nao | Relacionar depois com Banco de Terrenos |
| Reuniao relacionada | Relation | Nao | Relacionar depois com Reunioes |
| Proposta relacionada | Relation | Nao | Relacionar depois com Propostas Comerciais |
| Criado em | Created time | Sim | Automatico |
| Criado por | Created by | Sim | Automatico |
| Ultima atualizacao | Last edited time | Sim | Automatico |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Hoje | Table | Prazo e hoje, Status nao e Concluida/Cancelada | Prioridade desc, Prazo asc |
| Vencidas | Table | Prazo antes de hoje, Status nao e Concluida/Cancelada | Prazo asc |
| Por responsavel | Board | Agrupar por Responsavel | Prazo asc |
| Kanban | Board | Sem filtro | Agrupar por Status |
| Implantacao | Table | Modulo e Implantacao | Prioridade desc |

### Registros iniciais

| Tarefa | Modulo | Responsavel | Prazo | Status | Prioridade |
|---|---|---|---|---|---|
| Criar bases Notion da Fase 1 | Implantacao | Marco | Definir | A fazer | Alta |
| Criar estrutura de pastas no Google Drive | Implantacao | Marco | Definir | A fazer | Alta |
| Configurar credenciais Notion no n8n | Implantacao | Tecnico | Definir | Backlog | Alta |
| Definir regra formal de aprovacao humana | Implantacao | Marco | Definir | A fazer | Alta |
| Cadastrar projetos iniciais | Implantacao | Marco | Definir | A fazer | Alta |

## 2. Base: Pipeline de Projetos

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Nome do projeto | Title | Sim | Nome oficial |
| Tipo | Select | Sim | Strip mall, BTS, Ativo comercial, Hub de servicos, Terreno, Consultoria, Parceria |
| Cidade/UF | Text | Sim | Ex.: Uberlandia/MG |
| Endereco/regiao | Text | Sim | Endereco ou regiao-alvo |
| Status do projeto | Status | Sim | Ideia/oportunidade, Triagem inicial, Estudo de vocacao, Viabilidade preliminar, Modelagem comercial, Prospeccao de ancoras, Negociacao com proprietario/parceiro, Estruturacao juridica, Pre-comercializacao, Desenvolvimento, Comercializacao ativa, Operacao/gestao, Pausado, Encerrado |
| Responsavel | Person | Sim | Dono operacional |
| Sponsor interno | Person | Sim | Decisor interno |
| Proximo marco | Text | Sim | Marco critico seguinte |
| Prazo do proximo marco | Date | Sim | Data objetiva |
| Prioridade | Select | Sim | Alta, Media, Baixa |
| Area estimada | Number | Nao | m2 |
| Mix-alvo | Multi-select | Nao | Alimentacao, Farmacia, Mercado, Academia, Saude, Estetica, Pet, Servicos, Fast food, Entretenimento, Financeiro, Educacao |
| Receita potencial | Number | Nao | Receita estimada |
| Riscos principais | Text | Sim | Riscos comerciais, tecnicos, juridicos ou financeiros |
| Proximos passos | Text | Sim | Acoes imediatas |
| Pasta Drive | URL | Sim | Link da pasta oficial |
| Leads vinculados | Relation | Nao | CRM de Lojistas |
| Terreno vinculado | Relation | Nao | Banco de Terrenos |
| Tarefas vinculadas | Relation | Sim | Gestao de Tarefas |
| Reunioes vinculadas | Relation | Nao | Reunioes |
| Propostas vinculadas | Relation | Nao | Propostas Comerciais |
| Relatorios vinculados | Relation | Nao | Relatorios Executivos |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Projetos ativos | Table | Status nao e Pausado/Encerrado | Prioridade desc |
| Kanban PMO | Board | Sem filtro | Agrupar por Status do projeto |
| Alta prioridade | Table | Prioridade e Alta | Prazo do proximo marco asc |
| Marcos proximos | Calendar | Prazo do proximo marco | N/A |
| Operacao e gestao | Table | Status e Operacao/gestao | Nome asc |

### Registros iniciais

| Nome do projeto | Tipo | Cidade/UF | Status do projeto | Prioridade | Proximo marco |
|---|---|---|---|---|---|
| Villa Viseu | Strip mall | Definir | Triagem inicial | Alta | Completar dados do projeto |
| Piazza Nicomedes | Strip mall | Definir | Triagem inicial | Alta | Completar dados do projeto |
| BlueMall | Ativo comercial | Definir | Triagem inicial | Alta | Completar dados do projeto |
| Boulevard Naves | Ativo comercial | Definir | Triagem inicial | Alta | Completar dados do projeto |
| Uberlandia Shopping HUB de Servicos | Hub de servicos | Uberlandia/MG | Triagem inicial | Alta | Completar dados do projeto |
| Novos Terrenos Comerciais | Terreno | Definir | Ideia/oportunidade | Alta | Montar banco inicial de terrenos |

## 3. Base: CRM de Lojistas

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Nome do lead | Title | Sim | Empresa, marca ou contato |
| Tipo de lead | Select | Sim | Lojista, Rede, Ancora, Investidor, Proprietario, Parceiro |
| Origem | Select | Sim | WhatsApp, Gmail, Indicacao, LinkedIn, Ativo atual, Prospeccao ativa, Evento, Site |
| Segmento | Select | Sim | Alimentacao, Farmacia, Mercado, Academia, Saude, Estetica, Pet, Servicos, Fast food, Entretenimento, Financeiro, Educacao, Outro |
| Empreendimento de interesse | Relation | Sim | Pipeline de Projetos |
| Contato principal | Text | Sim | Pessoa decisora ou interlocutora |
| Telefone/WhatsApp | Phone | Condicional | Obrigatorio se origem for WhatsApp |
| E-mail | Email | Condicional | Obrigatorio se origem for Gmail ou proposta formal |
| Cidade/UF | Text | Sim | Local de operacao ou expansao |
| Status comercial | Status | Sim | Novo lead, Qualificacao pendente, Qualificado, Material solicitado, Material enviado, Reuniao a agendar, Reuniao agendada, Em negociacao, Proposta em elaboracao, Proposta enviada, Aguardando retorno, Em contrato, Ganho, Perdido, Nutricao futura |
| Temperatura | Select | Sim | Frio, Morno, Quente, Estrategico |
| Proximo follow-up | Date | Sim | Data objetiva |
| Responsavel | Person | Sim | Dono do relacionamento |
| Ultima interacao | Date | Sim | Atualizada manualmente ou por n8n |
| Ultimo resumo | Text | Sim | Sintese da conversa |
| Proxima acao | Text | Sim | Ex.: enviar material, agendar reuniao |
| Consentimento/opt-in | Checkbox | Sim | Necessario para comunicacoes recorrentes |
| Aprovacao para envio | Select | Sim | Pendente, Aprovado, Enviado, Rejeitado |
| Link da pasta Drive | URL | Nao | Pasta do lead |
| Tarefas vinculadas | Relation | Nao | Gestao de Tarefas |
| Reunioes vinculadas | Relation | Nao | Reunioes |
| Propostas vinculadas | Relation | Nao | Propostas Comerciais |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Pipeline comercial | Board | Sem filtro | Agrupar por Status comercial |
| Follow-ups de hoje | Table | Proximo follow-up e hoje, Status nao e Ganho/Perdido | Temperatura, Proximo follow-up |
| Follow-ups vencidos | Table | Proximo follow-up antes de hoje, Status nao e Ganho/Perdido | Proximo follow-up asc |
| Leads quentes | Table | Temperatura e Quente ou Estrategico | Proximo follow-up asc |
| Por empreendimento | Board | Sem filtro | Agrupar por Empreendimento de interesse |
| Aguardando aprovacao | Table | Aprovacao para envio e Pendente | Proximo follow-up asc |

### Registros iniciais

Criar apenas leads reais. Se ainda nao houver leads consolidados, criar um registro de teste e arquivar depois:

| Nome do lead | Tipo de lead | Origem | Segmento | Status comercial | Temperatura | Proxima acao |
|---|---|---|---|---|---|---|
| Lead teste - nao usar em producao | Lojista | WhatsApp | Servicos | Novo lead | Frio | Validar fluxo de cadastro e follow-up |

## 4. Base: Banco de Terrenos

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Nome do terreno | Title | Sim | Nome curto e identificavel |
| Origem | Select | Sim | Proprietario, Corretor, Indicacao, Prospeccao, Parceiro, Inbound |
| Endereco | Text | Sim | Endereco ou referencia |
| Cidade/UF | Text | Sim | Municipio e estado |
| Area do terreno | Number | Sim | m2 |
| Frente | Number | Nao | Testada em metros |
| Zoneamento | Text | Nao | Quando disponivel |
| Proprietario/interlocutor | Text | Sim | Nome do contato |
| Contato | Text | Sim | Telefone, e-mail ou canal |
| Status do terreno | Status | Sim | Novo terreno, Dados pendentes, Em triagem, Analise de localizacao, Analise juridica/documental, Estudo de vocacao, Viabilidade preliminar, Em negociacao, Aprovado para projeto, Reprovado, Banco futuro |
| Vocacao preliminar | Multi-select | Sim | Strip mall, BTS, Mercado, Farmacia, Fast food, Servicos, Saude, Logistica leve, Outro |
| Preco/condicao | Text | Nao | Venda, aluguel, permuta, parceria, BTS |
| Responsavel | Person | Sim | Dono da avaliacao |
| Proxima acao | Text | Sim | Acao objetiva |
| Prazo da proxima acao | Date | Sim | Data objetiva |
| Riscos | Text | Sim | Acesso, preco, zoneamento, documentacao, concorrencia |
| Projeto vinculado | Relation | Nao | Pipeline de Projetos |
| Tarefas vinculadas | Relation | Nao | Gestao de Tarefas |
| Pasta Drive | URL | Nao | Fotos, mapas, matricula e estudos |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Pipeline de terrenos | Board | Sem filtro | Agrupar por Status do terreno |
| Em analise | Table | Status contem Analise ou Estudo ou Viabilidade | Prazo da proxima acao asc |
| Negociacao | Table | Status e Em negociacao | Priorizar manualmente |
| Banco futuro | Table | Status e Banco futuro | Cidade/UF asc |
| Prazos proximos | Calendar | Prazo da proxima acao | N/A |

## 5. Base: Reunioes

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Nome da reuniao | Title | Sim | Ex.: PMO semanal |
| Tipo | Select | Sim | Comercial, PMO, Ativos, Diretoria, Investidor, Lojista, Proprietario |
| Data/hora | Date | Sim | Sincronizar com Google Calendar depois |
| Participantes | Text | Sim | Internos e externos |
| Projeto relacionado | Relation | Nao | Pipeline de Projetos |
| Lead relacionado | Relation | Nao | CRM de Lojistas |
| Pauta | Text | Sim | Preparada manualmente ou por agente |
| Decisoes | Text | Sim | O que foi decidido |
| Riscos | Text | Sim | Riscos levantados |
| Oportunidades | Text | Sim | Oportunidades levantadas |
| Proximos passos | Text | Sim | Acoes objetivas |
| Tarefas geradas | Relation | Sim | Gestao de Tarefas |
| Link Calendar | URL | Nao | Evento da agenda |
| Pasta/anexos Drive | URL | Nao | Materiais de apoio |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Proximas reunioes | Calendar | Data/hora | N/A |
| PMO semanal | Table | Tipo e PMO | Data/hora desc |
| Diretoria | Table | Tipo e Diretoria | Data/hora desc |
| Sem tarefas geradas | Table | Tarefas geradas vazio, Data/hora antes de hoje | Data/hora desc |

### Template de pagina

```text
# Pauta

## Decisoes necessarias

## Projetos criticos

## Comercial e prospeccao

## Terrenos e novos negocios

## Ativos em operacao

## Pendencias vencidas

## Riscos

## Oportunidades

## Proximos passos
```

## 6. Base: Propostas Comerciais

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Nome da proposta | Title | Sim | Ex.: Proposta Villa Viseu - Marca |
| Tipo de proposta | Select | Sim | Lojista, BTS, Proprietario, Investidor, Gestao, Comercializacao, Parceria |
| Publico-alvo | Select | Sim | Lojista, Rede, Investidor, Proprietario, Incorporador, Parceiro |
| Lead vinculado | Relation | Condicional | CRM de Lojistas |
| Projeto vinculado | Relation | Condicional | Pipeline de Projetos |
| Responsavel | Person | Sim | Dono da proposta |
| Status | Status | Sim | Solicitada, Briefing pendente, Em elaboracao, Em revisao interna, Aguardando aprovacao, Aprovada para envio, Enviada, Em negociacao, Aceita, Recusada, Arquivada |
| Prazo | Date | Sim | Data para conclusao/envio |
| Escopo | Text | Sim | Escopo resumido |
| Condicoes comerciais | Text | Nao | Valores, remuneracao ou premissas |
| Link do documento | URL | Sim | Google Drive |
| Aprovacao humana | Select | Sim | Pendente, Aprovada, Revisoes solicitadas, Rejeitada |
| Data de envio | Date | Nao | Preencher somente apos envio |
| Proximo follow-up | Date | Sim | Obrigatorio apos envio |
| Tarefas vinculadas | Relation | Nao | Gestao de Tarefas |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Pipeline de propostas | Board | Sem filtro | Agrupar por Status |
| Aguardando aprovacao | Table | Aprovacao humana e Pendente | Prazo asc |
| Enviadas com follow-up | Table | Status e Enviada ou Em negociacao | Proximo follow-up asc |
| Vencendo prazo | Table | Prazo nos proximos 7 dias, Status nao e Enviada/Aceita/Recusada/Arquivada | Prazo asc |

### Template de pagina

```text
# Proposta Comercial

## Entendimento da oportunidade

## Objetivo

## Escopo de atuacao

## Entregaveis

## Cronograma preliminar

## Modelo de remuneracao / Condicoes comerciais

## Premissas

## Responsabilidades das partes

## Proximos passos

## Pendencias para aprovacao
```

## 7. Base: Relatorios Executivos

### Propriedades

| Nome | Tipo Notion | Obrigatorio | Opcoes / Observacao |
|---|---|---:|---|
| Nome do relatorio | Title | Sim | Ex.: Executivo Diario - AAAA-MM-DD |
| Tipo | Select | Sim | Diario executivo, Mensal de ativos, Comercial, PMO, Terrenos |
| Periodo | Date | Sim | Dia, semana ou mes |
| Responsavel | Person | Sim | Dono do relatorio |
| Status | Status | Sim | Rascunho, Em revisao, Aprovado, Enviado, Arquivado |
| Resumo executivo | Text | Sim | Obrigatorio |
| Riscos | Text | Sim | Obrigatorio |
| Oportunidades | Text | Sim | Obrigatorio |
| Proximos passos | Text | Sim | Obrigatorio |
| Indicadores | Text | Nao | KPIs relevantes |
| Projeto vinculado | Relation | Nao | Pipeline de Projetos |
| Link do documento | URL | Nao | PDF, Doc ou Sheet no Drive |
| Tarefas geradas | Relation | Nao | Gestao de Tarefas |

### Views

| View | Tipo | Filtro | Ordenacao |
|---|---|---|---|
| Diario executivo | Table | Tipo e Diario executivo | Periodo desc |
| Mensal de ativos | Table | Tipo e Mensal de ativos | Periodo desc |
| Em revisao | Table | Status e Em revisao ou Rascunho | Periodo desc |
| Enviados | Table | Status e Enviado | Periodo desc |

### Template: Relatorio executivo diario

```text
# Relatorio Executivo Diario

## Resumo executivo

## Principais avancos

## Riscos

## Oportunidades

## Proximos passos

## Tarefas vencidas ou criticas

## Decisoes pendentes
```

### Template: Relatorio mensal de ativos

```text
# Relatorio Mensal de Ativos

## Resumo executivo

## Indicadores do mes

## Ocupacao e vacancia

## Receita, inadimplencia e NOI

## Comercializacao e leads

## Operacao e manutencao

## Riscos

## Oportunidades

## Proximos passos

## Dados pendentes
```

## Relations obrigatorias

Configurar as relations depois que todas as bases existirem.

| Base origem | Propriedade | Base destino | Uso |
|---|---|---|---|
| CRM de Lojistas | Empreendimento de interesse | Pipeline de Projetos | Vincular lead ao projeto |
| CRM de Lojistas | Tarefas vinculadas | Gestao de Tarefas | Follow-ups e pendencias |
| CRM de Lojistas | Reunioes vinculadas | Reunioes | Historico comercial |
| CRM de Lojistas | Propostas vinculadas | Propostas Comerciais | Propostas por lead |
| Pipeline de Projetos | Tarefas vinculadas | Gestao de Tarefas | PMO |
| Pipeline de Projetos | Terreno vinculado | Banco de Terrenos | Origem imobiliaria |
| Pipeline de Projetos | Reunioes vinculadas | Reunioes | Governanca |
| Pipeline de Projetos | Propostas vinculadas | Propostas Comerciais | Propostas por projeto |
| Pipeline de Projetos | Relatorios vinculados | Relatorios Executivos | Historico executivo |
| Banco de Terrenos | Projeto vinculado | Pipeline de Projetos | Conversao terreno-projeto |
| Banco de Terrenos | Tarefas vinculadas | Gestao de Tarefas | Pendencias de analise |
| Reunioes | Tarefas geradas | Gestao de Tarefas | Ata acionavel |
| Propostas Comerciais | Tarefas vinculadas | Gestao de Tarefas | Revisao, aprovacao e follow-up |
| Relatorios Executivos | Tarefas geradas | Gestao de Tarefas | Plano de acao |

## Rollups recomendados

| Base | Rollup | Origem | Calculo |
|---|---|---|---|
| Pipeline de Projetos | Tarefas abertas | Tarefas vinculadas -> Status | Count where Status nao e Concluida/Cancelada |
| Pipeline de Projetos | Leads vinculados total | Leads vinculados | Count all |
| Pipeline de Projetos | Propostas ativas | Propostas vinculadas -> Status | Count where Status nao e Aceita/Recusada/Arquivada |
| CRM de Lojistas | Propostas enviadas | Propostas vinculadas -> Status | Count where Status e Enviada/Em negociacao |
| Reunioes | Tarefas geradas total | Tarefas geradas | Count all |
| Banco de Terrenos | Tarefas abertas | Tarefas vinculadas -> Status | Count where Status nao e Concluida/Cancelada |

## Painel executivo

Na pagina raiz, criar uma area `Painel Executivo` com linked views:

1. `Tarefas vencidas` da base Gestao de Tarefas.
2. `Follow-ups de hoje` da base CRM de Lojistas.
3. `Leads quentes` da base CRM de Lojistas.
4. `Alta prioridade` da base Pipeline de Projetos.
5. `Aguardando aprovacao` da base Propostas Comerciais.
6. `Em revisao` da base Relatorios Executivos.
7. `Negociacao` da base Banco de Terrenos.

## Regras de qualidade dos dados

Antes de conectar n8n, validar:

- Nenhum lead sem origem.
- Nenhum lead sem segmento.
- Nenhum lead sem empreendimento de interesse.
- Nenhum lead sem proximo follow-up.
- Nenhuma tarefa sem responsavel.
- Nenhuma tarefa sem prazo.
- Nenhuma tarefa sem status.
- Nenhuma proposta com status `Enviada` sem aprovacao humana `Aprovada`.
- Nenhum relatorio sem resumo executivo, riscos, oportunidades e proximos passos.
- Nenhuma reuniao encerrada sem tarefas geradas ou justificativa nos proximos passos.

## Permissoes sugeridas

| Perfil | Permissao |
|---|---|
| Marco / Diretoria | Full access |
| Comercial | Editar CRM, Propostas e Tarefas; visualizar Projetos |
| PMO | Editar Projetos, Tarefas, Reunioes e Relatorios |
| Operacao de ativos | Editar Relatorios de ativos, Tarefas e Projetos em operacao |
| Tecnico automacoes | Editar integracoes e bases necessarias; sem apagar dados |
| Consultores externos | Acesso restrito por projeto ou pasta |

## Checklist de aceite do Notion

| Item | Status |
|---|---|
| Pagina raiz criada | A fazer |
| 7 bases criadas | A fazer |
| Propriedades obrigatorias configuradas | A fazer |
| Status dos pipelines configurados | A fazer |
| Relations criadas | A fazer |
| Rollups principais criados | A fazer |
| Views operacionais criadas | A fazer |
| Painel executivo criado | A fazer |
| Projetos iniciais cadastrados | A fazer |
| Tarefas iniciais cadastradas | A fazer |
| Templates de reuniao, proposta e relatorio criados | A fazer |
| Permissoes revisadas | A fazer |
| Regras de qualidade validadas | A fazer |

## Proximo passo apos este blueprint

Depois que o Notion estiver criado e validado manualmente:

1. Criar a estrutura de pastas no Google Drive.
2. Colar os links das pastas nos registros de projetos.
3. Configurar credenciais do Notion, Gmail, Google Calendar, Google Drive e Zaper/WhatsApp no n8n.
4. Implementar primeiro o fluxo `Lead WhatsApp -> CRM`.
5. Testar o bloqueio de envio sem aprovacao humana.
