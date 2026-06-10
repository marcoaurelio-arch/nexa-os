# Sistema Operacional Nexa Malls - Fase 1

## 1. Arquitetura geral

### Objetivo da Fase 1

Criar a camada operacional mínima para centralizar leads, projetos, terrenos, tarefas, reuniões, propostas e relatórios da Nexa Malls em um sistema integrado entre Notion, WhatsApp/Zaper, Gmail, Google Calendar, Google Drive e n8n.

### Princípios obrigatórios

- Nenhuma mensagem externa deve ser enviada automaticamente sem aprovação humana.
- Toda tarefa deve ter responsável, prazo e status.
- Todo lead deve ter origem, segmento, empreendimento de interesse e próximo follow-up.
- Todo relatório deve conter resumo executivo, riscos, oportunidades e próximos passos.
- Todo fluxo automatizado deve registrar histórico, origem da informação e data de atualização.
- O Notion será a base operacional principal; Google Drive será o repositório de documentos; n8n será a camada de automação e orquestração.

### Camadas do sistema

| Camada | Ferramenta | Função |
|---|---|---|
| Base operacional | Notion | CRM, projetos, terrenos, tarefas, reuniões, propostas e relatórios |
| Entrada de leads | Zaper/WhatsApp, Gmail, formulários futuros | Captura inicial de oportunidades e contatos |
| Orquestração | n8n | Normalização, criação de registros, lembretes, pautas e rascunhos |
| Comunicação | WhatsApp, Gmail | Canais de contato com lojistas, parceiros, proprietários e investidores |
| Agenda | Google Calendar | Reuniões comerciais, PMO, ativos e follow-ups |
| Documentos | Google Drive | Propostas, apresentações, contratos, atas, relatórios e anexos |
| Inteligência assistida | Agentes IA | Triagem, análise, rascunhos, pautas, follow-ups e relatórios |

### Módulos da Fase 1

1. CRM de lojistas.
2. Pipeline de projetos.
3. Banco de terrenos.
4. Gestão de tarefas.
5. Agente comercial.
6. Agente de prospecção B2B.
7. Agente PMO.
8. Relatório executivo diário.
9. Relatório mensal de ativos.
10. Geração automática de propostas comerciais.

## 2. Estrutura das bases no Notion

### 2.1 Base: CRM de Lojistas

Finalidade: centralizar leads, lojistas, redes em expansão, operadores comerciais, histórico de contato, estágio comercial e próximos follow-ups.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Nome do lead | Título | Sim | Nome da empresa, marca ou contato |
| Tipo de lead | Select | Sim | Lojista, rede, âncora, investidor, proprietário, parceiro |
| Origem | Select | Sim | WhatsApp, Gmail, indicação, LinkedIn, ativo atual, prospecção ativa, evento, site |
| Segmento | Select | Sim | Alimentação, farmácia, mercado, academia, saúde, estética, pet, serviços, fast food, entretenimento, financeiro, educação, outro |
| Empreendimento de interesse | Relation | Sim | Relacionar com Pipeline de Projetos ou Ativos |
| Contato principal | Text | Sim | Nome da pessoa decisora ou interlocutora |
| Telefone/WhatsApp | Phone | Condicional | Obrigatório se origem for WhatsApp |
| E-mail | Email | Condicional | Obrigatório se origem for Gmail ou proposta formal |
| Cidade/UF | Text | Sim | Local de operação ou expansão |
| Status comercial | Select | Sim | Ver pipeline abaixo |
| Temperatura | Select | Sim | Frio, morno, quente, estratégico |
| Próximo follow-up | Date | Sim | Data objetiva do próximo contato |
| Responsável | Person | Sim | Dono do relacionamento |
| Última interação | Date | Sim | Atualizada por automação ou manualmente |
| Último resumo | Text | Sim | Síntese objetiva da conversa |
| Próxima ação | Text | Sim | Ex.: enviar material, agendar reunião, validar metragem |
| Consentimento/opt-in | Checkbox | Sim | Necessário para comunicações recorrentes |
| Aprovação para envio | Select | Sim | Pendente, aprovado, enviado, rejeitado |
| Link da pasta Drive | URL | Não | Pasta do lead, quando houver |

Status do pipeline comercial:

1. Novo lead.
2. Qualificação pendente.
3. Qualificado.
4. Material solicitado.
5. Material enviado.
6. Reunião a agendar.
7. Reunião agendada.
8. Em negociação.
9. Proposta em elaboração.
10. Proposta enviada.
11. Aguardando retorno.
12. Em contrato.
13. Ganho.
14. Perdido.
15. Nutrição futura.

### 2.2 Base: Pipeline de Projetos

Finalidade: acompanhar empreendimentos, BTS, ativos comerciais, novos negócios e projetos em desenvolvimento.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Nome do projeto | Título | Sim | Ex.: Villa Viseu, Piazza Nicomedes, BlueMall |
| Tipo | Select | Sim | Strip mall, BTS, ativo comercial, hub de serviços, terreno, consultoria, parceria |
| Cidade/UF | Text | Sim | Localização |
| Endereço/região | Text | Sim | Endereço completo ou região-alvo |
| Status do projeto | Select | Sim | Ver pipeline abaixo |
| Responsável | Person | Sim | Dono do projeto |
| Sponsor interno | Person | Sim | Decisor Nexa |
| Próximo marco | Text | Sim | Entrega crítica seguinte |
| Prazo do próximo marco | Date | Sim | Data objetiva |
| Prioridade | Select | Sim | Alta, média, baixa |
| Área estimada | Number | Não | m² de terreno, ABL ou loja |
| Mix-alvo | Multi-select | Não | Segmentos desejados |
| Receita potencial | Number | Não | Receita mensal ou anual estimada |
| Riscos principais | Text | Sim | Riscos comerciais, técnicos, jurídicos ou financeiros |
| Próximos passos | Text | Sim | Ações imediatas |
| Pasta Drive | URL | Sim | Pasta oficial do projeto |
| Tarefas vinculadas | Relation | Sim | Gestão de tarefas |
| Leads vinculados | Relation | Não | CRM de lojistas |
| Terreno vinculado | Relation | Não | Banco de terrenos |

Status do pipeline de projetos:

1. Ideia/oportunidade.
2. Triagem inicial.
3. Estudo de vocação.
4. Viabilidade preliminar.
5. Modelagem comercial.
6. Prospecção de âncoras.
7. Negociação com proprietário/parceiro.
8. Estruturação jurídica.
9. Pré-comercialização.
10. Desenvolvimento.
11. Comercialização ativa.
12. Operação/gestão.
13. Pausado.
14. Encerrado.

Projetos iniciais a cadastrar:

- Villa Viseu.
- Piazza Nicomedes.
- BlueMall.
- Boulevard Naves.
- Uberlândia Shopping HUB de Serviços.
- Novos terrenos comerciais.

### 2.3 Base: Banco de Terrenos

Finalidade: registrar terrenos e imóveis comerciais potenciais para desenvolvimento, BTS, parceria ou venda.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Nome do terreno | Título | Sim | Nome curto e identificável |
| Origem | Select | Sim | Proprietário, corretor, indicação, prospecção, parceiro, inbound |
| Endereço | Text | Sim | Localização completa ou referência |
| Cidade/UF | Text | Sim | Município e estado |
| Área do terreno | Number | Sim | m² |
| Frente | Number | Não | Metros de testada |
| Zoneamento | Text | Não | Quando disponível |
| Proprietário/interlocutor | Text | Sim | Nome do contato |
| Contato | Text | Sim | Telefone, e-mail ou canal |
| Status do terreno | Select | Sim | Ver pipeline abaixo |
| Vocação preliminar | Multi-select | Sim | Strip mall, BTS, mercado, farmácia, fast food, serviços, saúde, logística leve, outro |
| Preço/condição | Text | Não | Venda, aluguel, permuta, parceria, built-to-suit |
| Responsável | Person | Sim | Dono da avaliação |
| Próxima ação | Text | Sim | Ação objetiva |
| Prazo da próxima ação | Date | Sim | Data objetiva |
| Riscos | Text | Sim | Acesso, preço, zoneamento, documentação, concorrência |
| Projeto vinculado | Relation | Não | Pipeline de Projetos |
| Pasta Drive | URL | Não | Pasta com mapas, fotos, matrícula, estudos |

Status do pipeline de terrenos:

1. Novo terreno.
2. Dados pendentes.
3. Em triagem.
4. Análise de localização.
5. Análise jurídica/documental.
6. Estudo de vocação.
7. Viabilidade preliminar.
8. Em negociação.
9. Aprovado para projeto.
10. Reprovado.
11. Banco futuro.

### 2.4 Base: Gestão de Tarefas

Finalidade: ser a base única de compromissos operacionais, comerciais, PMO, ativos e implantação.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Tarefa | Título | Sim | Ação clara com verbo |
| Módulo | Select | Sim | CRM, projetos, terrenos, ativos, propostas, reunião, relatório, implantação |
| Responsável | Person | Sim | Obrigatório |
| Prazo | Date | Sim | Obrigatório |
| Status | Select | Sim | Ver status abaixo |
| Prioridade | Select | Sim | Alta, média, baixa |
| Projeto relacionado | Relation | Não | Pipeline de Projetos |
| Lead relacionado | Relation | Não | CRM de Lojistas |
| Terreno relacionado | Relation | Não | Banco de Terrenos |
| Descrição | Text | Sim | Contexto objetivo |
| Critério de conclusão | Text | Sim | Como saber que terminou |
| Data de criação | Created time | Sim | Automático |
| Criado por | Created by | Sim | Automático |
| Última atualização | Last edited time | Sim | Automático |

Status de tarefas:

1. Backlog.
2. A fazer.
3. Em andamento.
4. Aguardando terceiro.
5. Aguardando aprovação.
6. Concluída.
7. Cancelada.

### 2.5 Base: Reuniões

Finalidade: registrar pautas, atas, decisões e tarefas geradas em reuniões comerciais, PMO, ativos e diretoria.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Nome da reunião | Título | Sim | Ex.: Reunião semanal PMO |
| Tipo | Select | Sim | Comercial, PMO, ativos, diretoria, investidor, lojista, proprietário |
| Data/hora | Date | Sim | Sincronizado com Google Calendar |
| Participantes | People/Text | Sim | Internos e externos |
| Projeto relacionado | Relation | Não | Pipeline de Projetos |
| Lead relacionado | Relation | Não | CRM |
| Pauta | Text | Sim | Preparada pelo agente PMO |
| Decisões | Text | Sim | O que foi decidido |
| Riscos | Text | Sim | Riscos levantados |
| Oportunidades | Text | Sim | Oportunidades levantadas |
| Próximos passos | Text | Sim | Ações objetivas |
| Tarefas geradas | Relation | Sim | Toda ação deve virar tarefa |
| Link Calendar | URL | Não | Evento da agenda |
| Pasta/anexos Drive | URL | Não | Materiais de apoio |

### 2.6 Base: Propostas Comerciais

Finalidade: controlar geração, revisão, aprovação e envio de propostas comerciais.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Nome da proposta | Título | Sim | Ex.: Proposta Villa Viseu - [Marca] |
| Tipo de proposta | Select | Sim | Lojista, BTS, proprietário, investidor, gestão, comercialização, parceria |
| Público-alvo | Select | Sim | Lojista, rede, investidor, proprietário, incorporador, parceiro |
| Lead/projeto vinculado | Relation | Sim | CRM ou Pipeline |
| Responsável | Person | Sim | Dono da proposta |
| Status | Select | Sim | Ver status abaixo |
| Prazo | Date | Sim | Data para conclusão/envio |
| Escopo | Text | Sim | Escopo resumido |
| Condições comerciais | Text | Não | Valores, remuneração ou premissas |
| Link do documento | URL | Sim | Google Drive |
| Aprovação humana | Select | Sim | Pendente, aprovada, revisões solicitadas, rejeitada |
| Data de envio | Date | Não | Apenas após aprovação |
| Próximo follow-up | Date | Sim | Obrigatório após envio |

Status de propostas:

1. Solicitada.
2. Briefing pendente.
3. Em elaboração.
4. Em revisão interna.
5. Aguardando aprovação.
6. Aprovada para envio.
7. Enviada.
8. Em negociação.
9. Aceita.
10. Recusada.
11. Arquivada.

### 2.7 Base: Relatórios Executivos

Finalidade: consolidar relatórios diários, semanais e mensais.

Campos obrigatórios:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| Nome do relatório | Título | Sim | Ex.: Executivo Diário - 2026-06-09 |
| Tipo | Select | Sim | Diário executivo, mensal de ativos, comercial, PMO, terrenos |
| Período | Date | Sim | Dia, semana ou mês |
| Responsável | Person | Sim | Dono do relatório |
| Status | Select | Sim | Rascunho, em revisão, aprovado, enviado, arquivado |
| Resumo executivo | Text | Sim | Obrigatório |
| Riscos | Text | Sim | Obrigatório |
| Oportunidades | Text | Sim | Obrigatório |
| Próximos passos | Text | Sim | Obrigatório |
| Indicadores | Text | Não | KPIs relevantes |
| Link do documento | URL | Não | PDF/Doc/Sheet no Drive |

## 3. Fluxos n8n em etapas

### 3.1 Fluxo: Lead WhatsApp -> CRM

Objetivo: transformar uma conversa recebida no WhatsApp em lead estruturado no Notion, com triagem e follow-up.

Etapas:

1. Trigger Zaper/WhatsApp: nova mensagem recebida.
2. n8n consulta contato pelo telefone no CRM de Lojistas.
3. Se contato existir, atualizar "Última interação", anexar resumo e preservar histórico.
4. Se contato não existir, criar novo lead com status "Novo lead".
5. Agente comercial classifica tipo de lead, origem, segmento, empreendimento de interesse provável, temperatura e próxima ação.
6. Se dados obrigatórios estiverem ausentes, criar tarefa "Completar qualificação do lead".
7. Definir "Próximo follow-up" conforme regra:
   - Lead quente: até 1 dia útil.
   - Lead morno: até 3 dias úteis.
   - Lead frio: até 7 dias úteis.
   - Lead estratégico: até 1 dia útil e alerta ao responsável.
8. Criar ou atualizar tarefa vinculada ao lead com responsável, prazo e status.
9. Gerar rascunho de resposta no Notion ou Gmail/WhatsApp, com status "Aguardando aprovação".
10. Notificar responsável interno para revisar e aprovar envio.
11. Envio só ocorre após aprovação humana explícita.

Dados mínimos para criar lead:

- Nome do lead.
- Origem = WhatsApp.
- Segmento.
- Empreendimento de interesse.
- Próximo follow-up.
- Responsável.
- Status comercial.
- Último resumo.
- Próxima ação.

Controles:

- Se não houver consentimento/opt-in, não incluir em régua automática.
- Se lead pedir proposta, criar registro em Propostas Comerciais.
- Se lead citar terreno, criar alerta para Banco de Terrenos.

### 3.2 Fluxo: Follow-up automático

Objetivo: identificar leads com follow-up vencendo ou vencido, gerar rascunhos e criar alertas para o responsável.

Etapas:

1. Trigger diário no n8n às 08:00.
2. Consultar CRM de Lojistas onde "Próximo follow-up" é hoje ou está vencido.
3. Ignorar leads com status "Ganho", "Perdido" ou "Nutrição futura", salvo se houver tarefa aberta.
4. Agente comercial lê último resumo, status, empreendimento e próxima ação.
5. Gerar sugestão de abordagem por canal:
   - WhatsApp: curta, direta e consultiva.
   - E-mail: formal, com contexto e próximo passo.
   - Ligação: script de 3 bullets.
6. Criar tarefa "Aprovar e realizar follow-up" com responsável, prazo no mesmo dia e status "A fazer".
7. Registrar rascunho no campo "Próxima ação" ou em página de histórico.
8. Notificar responsável no canal interno definido.
9. Após aprovação humana, responsável envia mensagem manualmente ou autoriza envio pelo fluxo.
10. Após envio aprovado, atualizar "Última interação", "Próximo follow-up" e status comercial.

Regras de cadência sugeridas:

- Novo lead sem resposta: D+1, D+3, D+7, depois nutrição futura.
- Proposta enviada: D+2, D+5, D+10.
- Reunião realizada: até 24h para envio de resumo e próximos passos.
- Lead estratégico: nunca deixar vencer sem tarefa de responsável.

### 3.3 Fluxo: Pauta reunião semanal

Objetivo: preparar pauta objetiva para reunião semanal de diretoria/PMO com base em CRM, projetos, terrenos, tarefas e ativos.

Etapas:

1. Trigger semanal no n8n, preferencialmente na véspera da reunião às 16:00.
2. Consultar Google Calendar para localizar reunião semanal.
3. Consultar bases Notion:
   - Projetos com prioridade alta ou marco nos próximos 14 dias.
   - Tarefas vencidas ou bloqueadas.
   - Leads quentes/estratégicos.
   - Propostas em revisão, aprovação ou negociação.
   - Terrenos em análise ou negociação.
   - Relatórios pendentes.
4. Agente PMO consolida pauta por blocos:
   - Decisões necessárias.
   - Projetos críticos.
   - Comercial e prospecção.
   - Terrenos e novos negócios.
   - Ativos em operação.
   - Pendências vencidas.
   - Riscos e oportunidades.
   - Próximos passos.
5. Criar página na base Reuniões com pauta, participantes, links e anexos.
6. Criar rascunho de e-mail/convite com a pauta.
7. Enviar para aprovação humana.
8. Após aprovação, atualizar descrição do evento no Google Calendar ou enviar aos participantes.
9. Após reunião, criar tarefas a partir dos próximos passos, sempre com responsável, prazo e status.

### 3.4 Fluxo: Relatório executivo diário

Objetivo: gerar um resumo diário para diretoria com foco em decisões, riscos e próximos passos.

Etapas:

1. Trigger diário no n8n às 17:30.
2. Consultar alterações do dia nas bases CRM, Projetos, Terrenos, Tarefas, Propostas e Reuniões.
3. Agente PMO gera relatório com:
   - Resumo executivo.
   - Principais avanços.
   - Riscos.
   - Oportunidades.
   - Próximos passos.
   - Tarefas vencidas ou críticas.
   - Decisões pendentes.
4. Criar registro em Relatórios Executivos com status "Rascunho".
5. Notificar responsável para revisão.
6. Só enviar por e-mail ou WhatsApp após aprovação humana.

### 3.5 Fluxo: Relatório mensal de ativos

Objetivo: padronizar relatório mensal de performance dos ativos comerciais.

Etapas:

1. Trigger mensal no primeiro dia útil.
2. Consultar base de projetos/ativos em status "Operação/gestão".
3. Coletar indicadores disponíveis:
   - ABL total e ocupada.
   - Taxa de ocupação.
   - Vacância.
   - Receita contratada.
   - Receita recebida.
   - Inadimplência.
   - NOI.
   - Contratos a vencer.
   - Leads comerciais.
   - Chamados de manutenção.
   - Riscos operacionais.
4. Gerar relatório com resumo executivo, riscos, oportunidades e próximos passos.
5. Criar documento no Google Drive a partir de template.
6. Registrar link na base Relatórios Executivos.
7. Encaminhar para aprovação humana antes de envio a sócios, proprietários ou investidores.

## 4. Prompts dos agentes

### 4.1 Agente Comercial

```text
Você é o Agente Comercial da Nexa Malls.

Objetivo: apoiar a qualificação de leads, análise comercial, preparação de follow-ups e geração de próximos passos para lojistas, redes em expansão, operadores comerciais, proprietários, investidores e parceiros.

Contexto: a Nexa Malls desenvolve, estrutura, comercializa e gere ativos comerciais como strip malls, BTS, centros de conveniência, hubs de serviços e novos negócios imobiliários.

Regras obrigatórias:
- Não autorize envio automático de mensagens sem aprovação humana.
- Todo lead deve ter origem, segmento, empreendimento de interesse e próximo follow-up.
- Toda ação deve virar tarefa com responsável, prazo e status.
- Use linguagem profissional, direta, consultiva e comercialmente firme.
- Nunca invente dados de metragem, preço, disponibilidade ou condições comerciais.
- Quando faltar informação, use placeholders claros e liste os dados pendentes.

Entrada esperada:
- Mensagem recebida, histórico do lead, empreendimento de interesse, status atual e última interação.

Saída obrigatória:
1. Classificação do lead.
2. Segmento.
3. Temperatura.
4. Empreendimento de interesse.
5. Resumo da interação.
6. Próxima ação recomendada.
7. Data sugerida de próximo follow-up.
8. Tarefa a criar.
9. Rascunho de resposta para aprovação humana.
```

### 4.2 Agente de Prospecção B2B

```text
Você é o Agente de Prospecção B2B da Nexa Malls.

Objetivo: identificar, priorizar e preparar abordagens para redes, marcas e operadores comerciais compatíveis com os empreendimentos da Nexa Malls.

Princípios comerciais:
- Priorize localização, acesso, visibilidade, estacionamento, fluxo potencial, sinergia de mix e capacidade de expansão da marca.
- Adapte a abordagem ao segmento do prospect.
- Evite mensagens genéricas e excesso de adjetivos.
- Sempre deixe claro o próximo passo.
- Não envie mensagens sem aprovação humana.

Entrada esperada:
- Nome da marca, segmento, cidade, empreendimento, tese comercial, canal de contato e histórico.

Saída obrigatória:
1. Fit com o empreendimento.
2. Argumentos comerciais principais.
3. Riscos ou objeções prováveis.
4. Canal recomendado.
5. Rascunho de mensagem ou e-mail.
6. Próximo passo.
7. Tarefa com responsável, prazo e status.
```

### 4.3 Agente PMO

```text
Você é o Agente PMO da Nexa Malls.

Objetivo: organizar projetos, tarefas, reuniões, riscos, decisões e relatórios executivos da operação.

Regras obrigatórias:
- Toda tarefa deve ter responsável, prazo e status.
- Todo relatório deve ter resumo executivo, riscos, oportunidades e próximos passos.
- Destaque decisões pendentes e bloqueios.
- Não trate pendências críticas como observações passivas; transforme em ação.
- Use linguagem executiva, objetiva e orientada a decisão.

Entrada esperada:
- Dados de projetos, tarefas, CRM, terrenos, reuniões, propostas e relatórios.

Saída obrigatória:
1. Resumo executivo.
2. Itens críticos.
3. Decisões necessárias.
4. Riscos.
5. Oportunidades.
6. Próximos passos.
7. Tarefas a criar ou atualizar.
8. Pauta de reunião, quando aplicável.
```

### 4.4 Agente de Propostas Comerciais

```text
Você é o Agente de Propostas Comerciais da Nexa Malls.

Objetivo: gerar rascunhos estruturados de propostas comerciais para lojistas, redes varejistas, proprietários de terrenos, investidores, incorporadores, parceiros estratégicos e operadores comerciais.

Regras obrigatórias:
- Não invente valores, prazos, áreas, condições comerciais ou dados jurídicos.
- Use placeholders quando faltarem dados.
- Separe escopo, entregáveis, cronograma, remuneração, premissas e próximos passos.
- Adapte a proposta ao público-alvo.
- Toda proposta deve passar por aprovação humana antes do envio.

Saída obrigatória:
1. Título da proposta.
2. Entendimento da oportunidade.
3. Objetivo.
4. Escopo.
5. Entregáveis.
6. Cronograma preliminar.
7. Modelo de remuneração ou condições comerciais, se informado.
8. Premissas.
9. Responsabilidades das partes.
10. Próximos passos.
11. Pendências para aprovação.
```

### 4.5 Agente de Relatórios de Ativos

```text
Você é o Agente de Relatórios de Ativos da Nexa Malls.

Objetivo: consolidar a performance mensal de ativos comerciais geridos ou acompanhados pela Nexa Malls.

Indicadores prioritários:
- ABL total e ocupada.
- Taxa de ocupação.
- Vacância.
- Receita contratada.
- Receita recebida.
- Inadimplência.
- NOI.
- Custos operacionais.
- Contratos a vencer.
- Leads comerciais.
- Chamados de manutenção.
- SLA de atendimento.

Regras obrigatórias:
- Todo relatório deve conter resumo executivo, riscos, oportunidades e próximos passos.
- Diferencie fato, análise e recomendação.
- Não invente números ausentes; sinalize lacunas de dados.
- Converta riscos e oportunidades em tarefas com responsável, prazo e status.

Saída obrigatória:
1. Resumo executivo.
2. Indicadores do mês.
3. Análise de ocupação e receita.
4. Riscos.
5. Oportunidades.
6. Próximos passos.
7. Tarefas recomendadas.
8. Dados pendentes.
```

## 5. Estrutura de pastas no Google Drive

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

Padrão de nomenclatura:

- Projetos: `AAAA-MM-DD_Projeto_Assunto_Versao`.
- Propostas: `AAAA-MM-DD_Proposta_Publico_Projeto_Versao`.
- Reuniões: `AAAA-MM-DD_Tipo_Reuniao_Assunto`.
- Relatórios: `AAAA-MM_Periodo_Tipo_Relatorio_Projeto`.

## 6. Checklist de implantação

### Etapa 1 - Fundacao operacional

| Item | Responsável | Prazo | Status |
|---|---|---|---|
| Criar workspace/página principal "Sistema Operacional Nexa Malls" no Notion | Marco | Definir | A fazer |
| Criar base CRM de Lojistas | Marco | Definir | A fazer |
| Criar base Pipeline de Projetos | Marco | Definir | A fazer |
| Criar base Banco de Terrenos | Marco | Definir | A fazer |
| Criar base Gestão de Tarefas | Marco | Definir | A fazer |
| Criar base Reuniões | Marco | Definir | A fazer |
| Criar base Propostas Comerciais | Marco | Definir | A fazer |
| Criar base Relatórios Executivos | Marco | Definir | A fazer |
| Criar relations e rollups entre bases | Marco | Definir | A fazer |
| Cadastrar projetos iniciais | Marco | Definir | A fazer |

### Etapa 2 - Drive e templates

| Item | Responsável | Prazo | Status |
|---|---|---|---|
| Criar pasta raiz no Google Drive | Marco | Definir | A fazer |
| Criar subpastas por módulo e projeto | Marco | Definir | A fazer |
| Criar template de proposta comercial | Marco | Definir | A fazer |
| Criar template de ata de reunião | Marco | Definir | A fazer |
| Criar template de relatório executivo diário | Marco | Definir | A fazer |
| Criar template de relatório mensal de ativos | Marco | Definir | A fazer |
| Inserir links das pastas nos registros Notion | Marco | Definir | A fazer |

### Etapa 3 - Automacoes n8n

| Item | Responsável | Prazo | Status |
|---|---|---|---|
| Configurar credenciais Notion no n8n | Marco/Técnico | Definir | A fazer |
| Configurar credenciais Google Drive | Marco/Técnico | Definir | A fazer |
| Configurar credenciais Gmail | Marco/Técnico | Definir | A fazer |
| Configurar credenciais Google Calendar | Marco/Técnico | Definir | A fazer |
| Configurar integração Zaper/WhatsApp | Marco/Técnico | Definir | A fazer |
| Implementar fluxo Lead WhatsApp -> CRM | Técnico | Definir | A fazer |
| Implementar fluxo Follow-up automático | Técnico | Definir | A fazer |
| Implementar fluxo Pauta reunião semanal | Técnico | Definir | A fazer |
| Implementar fluxo Relatório executivo diário | Técnico | Definir | A fazer |
| Implementar fluxo Relatório mensal de ativos | Técnico | Definir | A fazer |
| Adicionar etapa obrigatória de aprovação humana nos fluxos de envio | Técnico | Definir | A fazer |

### Etapa 4 - Agentes e governanca

| Item | Responsável | Prazo | Status |
|---|---|---|---|
| Configurar prompt do Agente Comercial | Marco/Técnico | Definir | A fazer |
| Configurar prompt do Agente de Prospecção B2B | Marco/Técnico | Definir | A fazer |
| Configurar prompt do Agente PMO | Marco/Técnico | Definir | A fazer |
| Configurar prompt do Agente de Propostas Comerciais | Marco/Técnico | Definir | A fazer |
| Configurar prompt do Agente de Relatórios de Ativos | Marco/Técnico | Definir | A fazer |
| Definir responsáveis por módulo | Marco | Definir | A fazer |
| Definir política de aprovação de mensagens | Marco | Definir | A fazer |
| Definir rotina semanal de auditoria dos dados | Marco | Definir | A fazer |

### Etapa 5 - Testes de aceite

| Item | Responsável | Prazo | Status |
|---|---|---|---|
| Testar criação de lead via WhatsApp | Técnico | Definir | A fazer |
| Testar criação de tarefa obrigatória para lead incompleto | Técnico | Definir | A fazer |
| Testar bloqueio de envio sem aprovação humana | Técnico | Definir | A fazer |
| Testar follow-up vencido | Técnico | Definir | A fazer |
| Testar geração de pauta semanal | Técnico | Definir | A fazer |
| Testar criação de relatório executivo diário | Técnico | Definir | A fazer |
| Testar criação de relatório mensal de ativos | Técnico | Definir | A fazer |
| Validar campos obrigatórios em todas as bases | Marco/Técnico | Definir | A fazer |

## 7. Prioridade de execução

### Prioridade 1 - Base única de verdade

1. Criar bases Notion.
2. Criar relações entre CRM, Projetos, Terrenos, Tarefas, Reuniões, Propostas e Relatórios.
3. Cadastrar projetos iniciais.
4. Criar estrutura do Google Drive.

Motivo: sem base limpa e campos obrigatórios, automação apenas amplifica desorganização.

### Prioridade 2 - Governança mínima

1. Definir responsáveis por módulo.
2. Definir regra de aprovação humana.
3. Definir rotina semanal de revisão.
4. Criar templates de proposta, reunião e relatórios.

Motivo: o sistema precisa de donos, prazos e critérios antes de operar com agentes.

### Prioridade 3 - Automação comercial

1. Implementar Lead WhatsApp -> CRM.
2. Implementar Follow-up automático.
3. Implementar geração de rascunhos comerciais.
4. Testar bloqueio de envio sem aprovação.

Motivo: captura de leads e follow-up têm impacto direto em receita e relacionamento.

### Prioridade 4 - PMO e relatórios

1. Implementar pauta de reunião semanal.
2. Implementar relatório executivo diário.
3. Implementar relatório mensal de ativos.

Motivo: a governança executiva depende de dados já alimentados pelo CRM, projetos e tarefas.

### Prioridade 5 - Propostas automáticas

1. Criar template comercial padrão.
2. Implementar geração de rascunho de proposta.
3. Criar fluxo de revisão/aprovação.
4. Registrar envio e follow-up no CRM.

Motivo: proposta automática deve vir depois da base de dados e da governança de aprovação.

## 8. Definição de pronto da Fase 1

A Fase 1 estará pronta quando:

- Todas as bases Notion estiverem criadas com campos obrigatórios.
- Todo lead novo puder ser registrado com origem, segmento, empreendimento de interesse e próximo follow-up.
- Toda tarefa tiver responsável, prazo e status.
- O fluxo WhatsApp -> CRM criar ou atualizar leads corretamente.
- O fluxo de follow-up gerar rascunhos sem envio automático.
- A pauta semanal for gerada a partir dos dados reais das bases.
- O relatório diário tiver resumo executivo, riscos, oportunidades e próximos passos.
- O relatório mensal de ativos tiver indicadores, riscos, oportunidades e próximos passos.
- As propostas forem geradas como rascunho e exigirem aprovação humana antes do envio.
