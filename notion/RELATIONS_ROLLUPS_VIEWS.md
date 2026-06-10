# Relations, rollups e views - Notion Fase 1

## Relations obrigatorias apos criar as bases

| Base origem | Propriedade | Base destino |
|---|---|---|
| CRM de Lojistas | Empreendimento de interesse | Pipeline de Projetos |
| CRM de Lojistas | Tarefas vinculadas | Gestao de Tarefas |
| CRM de Lojistas | Reunioes vinculadas | Reunioes |
| CRM de Lojistas | Propostas vinculadas | Propostas Comerciais |
| Pipeline de Projetos | Tarefas vinculadas | Gestao de Tarefas |
| Pipeline de Projetos | Terreno vinculado | Banco de Terrenos |
| Pipeline de Projetos | Reunioes vinculadas | Reunioes |
| Pipeline de Projetos | Propostas vinculadas | Propostas Comerciais |
| Pipeline de Projetos | Relatorios vinculados | Relatorios Executivos |
| Banco de Terrenos | Projeto vinculado | Pipeline de Projetos |
| Banco de Terrenos | Tarefas vinculadas | Gestao de Tarefas |
| Reunioes | Tarefas geradas | Gestao de Tarefas |
| Propostas Comerciais | Tarefas vinculadas | Gestao de Tarefas |
| Relatorios Executivos | Tarefas geradas | Gestao de Tarefas |

## Views principais

### Gestao de Tarefas

- Hoje: prazo hoje, status diferente de Concluida/Cancelada.
- Vencidas: prazo antes de hoje, status diferente de Concluida/Cancelada.
- Por responsavel: board agrupado por Responsavel.
- Kanban: board agrupado por Status.
- Implantacao: filtro Modulo = Implantacao.

### CRM de Lojistas

- Pipeline comercial: board por Status comercial.
- Follow-ups de hoje: Proximo follow-up hoje.
- Follow-ups vencidos: Proximo follow-up antes de hoje.
- Leads quentes: Temperatura Quente ou Estrategico.
- Aguardando aprovacao: Aprovacao para envio = Pendente.

### Pipeline de Projetos

- Projetos ativos: status diferente de Pausado/Encerrado.
- Kanban PMO: board por Status do projeto.
- Alta prioridade: Prioridade = Alta.
- Marcos proximos: calendar por Prazo do proximo marco.

### Painel Executivo

Criar na pagina raiz views linkadas para:

- Tarefas vencidas.
- Follow-ups de hoje.
- Leads quentes.
- Projetos de alta prioridade.
- Propostas aguardando aprovacao.
- Relatorios em revisao.
- Terrenos em negociacao.

