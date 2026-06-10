-- NEXA OS - Schemas Notion Fase 1
-- Usar estes CREATE TABLE no conector Notion para criar as bases.
-- Relations devem ser aplicadas apos todas as bases existirem.

CREATE TABLE "Gestao de Tarefas" (
  "Tarefa" TITLE,
  "Modulo" SELECT('CRM':blue, 'Projetos':purple, 'Terrenos':green, 'Ativos':orange, 'Propostas':pink, 'Reuniao':yellow, 'Relatorio':gray, 'Implantacao':red),
  "Responsavel" RICH_TEXT,
  "Prazo" DATE,
  "Status operacional" SELECT('Backlog':gray, 'A fazer':blue, 'Em andamento':yellow, 'Aguardando terceiro':orange, 'Aguardando aprovacao':purple, 'Concluida':green, 'Cancelada':red),
  "Prioridade" SELECT('Alta':red, 'Media':yellow, 'Baixa':green),
  "Descricao" RICH_TEXT,
  "Criterio de conclusao" RICH_TEXT,
  "Criado em" CREATED_TIME,
  "Ultima atualizacao" LAST_EDITED_TIME
);

CREATE TABLE "Pipeline de Projetos" (
  "Nome do projeto" TITLE,
  "Tipo" SELECT('Strip mall':blue, 'BTS':purple, 'Ativo comercial':green, 'Hub de servicos':orange, 'Terreno':yellow, 'Consultoria':gray, 'Parceria':pink),
  "Cidade/UF" RICH_TEXT,
  "Endereco/regiao" RICH_TEXT,
  "Status do projeto" SELECT('Ideia/oportunidade':gray, 'Triagem inicial':blue, 'Estudo de vocacao':purple, 'Viabilidade preliminar':yellow, 'Modelagem comercial':orange, 'Prospeccao de ancoras':pink, 'Negociacao com proprietario/parceiro':red, 'Estruturacao juridica':brown, 'Pre-comercializacao':blue, 'Desenvolvimento':yellow, 'Comercializacao ativa':green, 'Operacao/gestao':green, 'Pausado':gray, 'Encerrado':red),
  "Responsavel" RICH_TEXT,
  "Sponsor interno" RICH_TEXT,
  "Proximo marco" RICH_TEXT,
  "Prazo do proximo marco" DATE,
  "Prioridade" SELECT('Alta':red, 'Media':yellow, 'Baixa':green),
  "Area estimada" NUMBER,
  "Mix-alvo" MULTI_SELECT('Alimentacao':orange, 'Farmacia':green, 'Mercado':blue, 'Academia':purple, 'Saude':red, 'Estetica':pink, 'Pet':yellow, 'Servicos':gray, 'Fast food':brown, 'Entretenimento':purple, 'Financeiro':green, 'Educacao':blue),
  "Receita potencial" NUMBER,
  "Riscos principais" RICH_TEXT,
  "Proximos passos" RICH_TEXT,
  "Pasta Drive" URL
);

CREATE TABLE "CRM de Lojistas" (
  "Nome do lead" TITLE,
  "Tipo de lead" SELECT('Lojista':blue, 'Rede':purple, 'Ancora':red, 'Investidor':green, 'Proprietario':orange, 'Parceiro':gray),
  "Origem" SELECT('WhatsApp':green, 'Gmail':red, 'Indicacao':blue, 'LinkedIn':purple, 'Ativo atual':orange, 'Prospeccao ativa':yellow, 'Evento':pink, 'Site':gray),
  "Segmento" SELECT('Alimentacao':orange, 'Farmacia':green, 'Mercado':blue, 'Academia':purple, 'Saude':red, 'Estetica':pink, 'Pet':yellow, 'Servicos':gray, 'Fast food':brown, 'Entretenimento':purple, 'Financeiro':green, 'Educacao':blue, 'Outro':gray),
  "Contato principal" RICH_TEXT,
  "Telefone/WhatsApp" PHONE_NUMBER,
  "E-mail" EMAIL,
  "Cidade/UF" RICH_TEXT,
  "Status comercial" SELECT('Novo lead':blue, 'Qualificacao pendente':yellow, 'Qualificado':green, 'Material solicitado':purple, 'Material enviado':blue, 'Reuniao a agendar':orange, 'Reuniao agendada':green, 'Em negociacao':yellow, 'Proposta em elaboracao':purple, 'Proposta enviada':blue, 'Aguardando retorno':orange, 'Em contrato':green, 'Ganho':green, 'Perdido':red, 'Nutricao futura':gray),
  "Temperatura" SELECT('Frio':gray, 'Morno':yellow, 'Quente':orange, 'Estrategico':red),
  "Proximo follow-up" DATE,
  "Responsavel" RICH_TEXT,
  "Ultima interacao" DATE,
  "Ultimo resumo" RICH_TEXT,
  "Proxima acao" RICH_TEXT,
  "Consentimento/opt-in" CHECKBOX,
  "Aprovacao para envio" SELECT('Pendente':yellow, 'Aprovada':green, 'Revisoes solicitadas':orange, 'Rejeitada':red, 'Enviado':blue),
  "Link da pasta Drive" URL
);

CREATE TABLE "Banco de Terrenos" (
  "Nome do terreno" TITLE,
  "Origem" SELECT('Proprietario':orange, 'Corretor':blue, 'Indicacao':green, 'Prospeccao':purple, 'Parceiro':gray, 'Inbound':yellow),
  "Endereco" RICH_TEXT,
  "Cidade/UF" RICH_TEXT,
  "Area do terreno" NUMBER,
  "Frente" NUMBER,
  "Zoneamento" RICH_TEXT,
  "Proprietario/interlocutor" RICH_TEXT,
  "Contato" RICH_TEXT,
  "Status do terreno" SELECT('Novo terreno':blue, 'Dados pendentes':yellow, 'Em triagem':purple, 'Analise de localizacao':orange, 'Analise juridica/documental':red, 'Estudo de vocacao':purple, 'Viabilidade preliminar':yellow, 'Em negociacao':orange, 'Aprovado para projeto':green, 'Reprovado':red, 'Banco futuro':gray),
  "Vocacao preliminar" MULTI_SELECT('Strip mall':blue, 'BTS':purple, 'Mercado':green, 'Farmacia':green, 'Fast food':orange, 'Servicos':gray, 'Saude':red, 'Logistica leve':yellow, 'Outro':gray),
  "Preco/condicao" RICH_TEXT,
  "Responsavel" RICH_TEXT,
  "Proxima acao" RICH_TEXT,
  "Prazo da proxima acao" DATE,
  "Riscos" RICH_TEXT,
  "Pasta Drive" URL
);

CREATE TABLE "Reunioes" (
  "Nome da reuniao" TITLE,
  "Tipo" SELECT('Comercial':blue, 'PMO':purple, 'Ativos':green, 'Diretoria':red, 'Investidor':orange, 'Lojista':yellow, 'Proprietario':gray),
  "Data/hora" DATE,
  "Participantes" RICH_TEXT,
  "Pauta" RICH_TEXT,
  "Decisoes" RICH_TEXT,
  "Riscos" RICH_TEXT,
  "Oportunidades" RICH_TEXT,
  "Proximos passos" RICH_TEXT,
  "Link Calendar" URL,
  "Pasta/anexos Drive" URL
);

CREATE TABLE "Propostas Comerciais" (
  "Nome da proposta" TITLE,
  "Tipo de proposta" SELECT('Lojista':blue, 'BTS':purple, 'Proprietario':orange, 'Investidor':green, 'Gestao':gray, 'Comercializacao':pink, 'Parceria':yellow),
  "Publico-alvo" SELECT('Lojista':blue, 'Rede':purple, 'Investidor':green, 'Proprietario':orange, 'Incorporador':yellow, 'Parceiro':gray),
  "Responsavel" RICH_TEXT,
  "Status" SELECT('Solicitada':blue, 'Briefing pendente':yellow, 'Em elaboracao':purple, 'Em revisao interna':orange, 'Aguardando aprovacao':red, 'Aprovada para envio':green, 'Enviada':blue, 'Em negociacao':yellow, 'Aceita':green, 'Recusada':red, 'Arquivada':gray),
  "Prazo" DATE,
  "Escopo" RICH_TEXT,
  "Condicoes comerciais" RICH_TEXT,
  "Link do documento" URL,
  "Aprovacao humana" SELECT('Pendente':yellow, 'Aprovada':green, 'Revisoes solicitadas':orange, 'Rejeitada':red),
  "Data de envio" DATE,
  "Proximo follow-up" DATE
);

CREATE TABLE "Relatorios Executivos" (
  "Nome do relatorio" TITLE,
  "Tipo" SELECT('Diario executivo':blue, 'Mensal de ativos':green, 'Comercial':purple, 'PMO':orange, 'Terrenos':yellow),
  "Periodo" DATE,
  "Responsavel" RICH_TEXT,
  "Status" SELECT('Rascunho':gray, 'Em revisao':yellow, 'Aprovado':green, 'Enviado':blue, 'Arquivado':red),
  "Resumo executivo" RICH_TEXT,
  "Riscos" RICH_TEXT,
  "Oportunidades" RICH_TEXT,
  "Proximos passos" RICH_TEXT,
  "Indicadores" RICH_TEXT,
  "Link do documento" URL
);
