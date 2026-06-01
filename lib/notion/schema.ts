export type NotionPropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "status"
  | "date"
  | "checkbox"
  | "phone_number"
  | "email"
  | "url"
  | "files"
  | "people"
  | "relation";

export type NotionPropertyDefinition = {
  name: string;
  type: NotionPropertyType;
  relationTo?: string;
  options?: string[];
};

export type NotionDatabaseDefinition = {
  id: number;
  name: string;
  slug: string;
  sourceTable?: string;
  titleProperty: string;
  properties: NotionPropertyDefinition[];
};

const commonProperties: NotionPropertyDefinition[] = [
  { name: "ID Nexa", type: "rich_text" },
  { name: "Status", type: "status" },
  { name: "Responsavel", type: "people" },
  { name: "Ultima sincronizacao", type: "date" },
  { name: "URL Nexa OS", type: "url" }
];

export const notionDatabases: NotionDatabaseDefinition[] = [
  {
    id: 1,
    name: "Empreendimentos",
    slug: "empreendimentos",
    sourceTable: "empreendimentos",
    titleProperty: "Nome",
    properties: [
      { name: "Nome", type: "title" },
      { name: "Cidade", type: "rich_text" },
      { name: "Estado", type: "select" },
      { name: "ABL", type: "number" },
      { name: "Numero de lojas", type: "number" },
      { name: "Lojas", type: "relation", relationTo: "Lojas" },
      { name: "Indicadores", type: "relation", relationTo: "Indicadores" },
      { name: "Relatorios", type: "relation", relationTo: "Relatorios" },
      ...commonProperties
    ]
  },
  {
    id: 2,
    name: "Lojas",
    slug: "lojas",
    sourceTable: "lojas",
    titleProperty: "Codigo",
    properties: [
      { name: "Codigo", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Nome da loja", type: "rich_text" },
      { name: "Area privativa", type: "number" },
      { name: "Area total", type: "number" },
      { name: "Segmento", type: "select" },
      { name: "Loja ancora", type: "checkbox" },
      { name: "Loja satelite", type: "checkbox" },
      { name: "Aluguel", type: "number" },
      { name: "Condominio", type: "number" },
      { name: "Fundo promocao", type: "number" },
      { name: "Lojista", type: "relation", relationTo: "Lojistas" },
      { name: "Contratos", type: "relation", relationTo: "Contratos" },
      { name: "Documentos", type: "relation", relationTo: "Documentos" },
      { name: "OS", type: "relation", relationTo: "OS" },
      ...commonProperties
    ]
  },
  {
    id: 3,
    name: "Lojistas",
    slug: "lojistas",
    sourceTable: "lojistas",
    titleProperty: "Nome fantasia",
    properties: [
      { name: "Nome fantasia", type: "title" },
      { name: "Razao social", type: "rich_text" },
      { name: "CNPJ", type: "rich_text" },
      { name: "Responsavel legal", type: "rich_text" },
      { name: "Telefone", type: "phone_number" },
      { name: "WhatsApp", type: "phone_number" },
      { name: "E-mail", type: "email" },
      { name: "Segmento", type: "select" },
      { name: "Loja vinculada", type: "relation", relationTo: "Lojas" },
      { name: "Contratos", type: "relation", relationTo: "Contratos" },
      ...commonProperties
    ]
  },
  {
    id: 4,
    name: "Contratos",
    slug: "contratos",
    sourceTable: "contratos",
    titleProperty: "Contrato",
    properties: [
      { name: "Contrato", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Lojista", type: "relation", relationTo: "Lojistas" },
      { name: "Data inicio", type: "date" },
      { name: "Data termino", type: "date" },
      { name: "Prazo", type: "number" },
      { name: "Aluguel minimo", type: "number" },
      { name: "Indice reajuste", type: "select" },
      { name: "Garantia", type: "select" },
      { name: "Seguro", type: "select" },
      { name: "Documentos", type: "relation", relationTo: "Documentos" },
      { name: "Juridico", type: "relation", relationTo: "Juridico" },
      { name: "Alerta 24m", type: "date" },
      { name: "Alerta 12m", type: "date" },
      { name: "Alerta 6m", type: "date" },
      { name: "Alerta 3m", type: "date" },
      ...commonProperties
    ]
  },
  createFinancialDatabase(5, "Receitas", "receitas", "receitas", "Receita"),
  createFinancialDatabase(6, "Despesas", "despesas", "despesas", "Despesa"),
  {
    id: 7,
    name: "Inadimplencia",
    slug: "inadimplencia",
    sourceTable: "inadimplencias",
    titleProperty: "Caso",
    properties: [
      { name: "Caso", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Receita", type: "relation", relationTo: "Receitas" },
      { name: "Valor", type: "number" },
      { name: "Dias atraso", type: "number" },
      { name: "Regua", type: "select" },
      { name: "Historico", type: "rich_text" },
      { name: "Negociacao", type: "rich_text" },
      ...commonProperties
    ]
  },
  createLedgerDatabase(8, "Condominio", "condominio"),
  createLedgerDatabase(9, "Fundo Promocao", "fundo-promocao"),
  {
    id: 10,
    name: "FPP",
    slug: "fpp",
    sourceTable: "fpp",
    titleProperty: "Apuracao",
    properties: [
      { name: "Apuracao", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Contrato", type: "relation", relationTo: "Contratos" },
      { name: "Competencia", type: "date" },
      { name: "Percentual", type: "number" },
      { name: "Aluguel minimo", type: "number" },
      { name: "Faturamento informado", type: "number" },
      { name: "Faturamento auditado", type: "number" },
      { name: "Valor percentual", type: "number" },
      { name: "Valor complementar", type: "number" },
      { name: "Valor cobrado", type: "number" },
      ...commonProperties
    ]
  },
  {
    id: 11,
    name: "Auditoria Faturamento",
    slug: "auditoria-faturamento",
    sourceTable: "auditoria_faturamento",
    titleProperty: "Auditoria",
    properties: [
      { name: "Auditoria", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Competencia", type: "date" },
      { name: "ERP", type: "number" },
      { name: "PDV", type: "number" },
      { name: "Stone", type: "number" },
      { name: "Rede", type: "number" },
      { name: "Cielo", type: "number" },
      { name: "PIX", type: "number" },
      { name: "iFood", type: "number" },
      { name: "Delivery", type: "number" },
      { name: "Divergencia", type: "number" },
      { name: "Queda", type: "number" },
      { name: "Alerta", type: "select" },
      ...commonProperties
    ]
  },
  createPipelineDatabase(12, "Leads", "leads", "comercial_leads"),
  createProposalDatabase(),
  createVacancyDatabase(),
  createOccupancyDatabase(),
  createUtilityDatabase(16, "Energia", "energia"),
  createUtilityDatabase(17, "Agua", "agua"),
  createServiceOrderDatabase(),
  createLegalDatabase(),
  createDocumentsDatabase(),
  createMarketingDatabase(),
  createReportsDatabase(),
  createIndicatorsDatabase()
];

export function databaseCreationOrder() {
  return notionDatabases.map((database) => database.slug);
}

function createFinancialDatabase(id: number, name: string, slug: string, sourceTable: string, titleProperty: string): NotionDatabaseDefinition {
  return {
    id,
    name,
    slug,
    sourceTable,
    titleProperty,
    properties: [
      { name: titleProperty, type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Competencia", type: "date" },
      { name: "Categoria", type: "select" },
      { name: "Valor", type: "number" },
      { name: "Vencimento", type: "date" },
      { name: "Pagamento", type: "date" },
      { name: "Centro de custo", type: "select" },
      ...commonProperties
    ]
  };
}

function createLedgerDatabase(id: number, name: string, slug: string): NotionDatabaseDefinition {
  return {
    id,
    name,
    slug,
    titleProperty: "Lancamento",
    properties: [
      { name: "Lancamento", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Tipo", type: "select" },
      { name: "Categoria", type: "select" },
      { name: "Competencia", type: "date" },
      { name: "Valor", type: "number" },
      ...commonProperties
    ]
  };
}

function createPipelineDatabase(id: number, name: string, slug: string, sourceTable: string): NotionDatabaseDefinition {
  return {
    id,
    name,
    slug,
    sourceTable,
    titleProperty: "Empresa",
    properties: [
      { name: "Empresa", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Segmento", type: "select" },
      { name: "Etapa", type: "status" },
      { name: "Proxima acao", type: "rich_text" },
      { name: "Propostas", type: "relation", relationTo: "Propostas" },
      { name: "Historico", type: "rich_text" },
      ...commonProperties
    ]
  };
}

function createProposalDatabase(): NotionDatabaseDefinition {
  return {
    id: 13,
    name: "Propostas",
    slug: "propostas",
    titleProperty: "Proposta",
    properties: [
      { name: "Proposta", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Lead", type: "relation", relationTo: "Leads" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Aluguel", type: "number" },
      { name: "Condominio", type: "number" },
      { name: "Fundo promocao", type: "number" },
      { name: "Data envio", type: "date" },
      { name: "Validade", type: "date" },
      ...commonProperties
    ]
  };
}

function createVacancyDatabase(): NotionDatabaseDefinition {
  return {
    id: 14,
    name: "Vacancia",
    slug: "vacancia",
    sourceTable: "vacancia",
    titleProperty: "Registro",
    properties: [
      { name: "Registro", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Inicio vacancia", type: "date" },
      { name: "Dias vaga", type: "number" },
      { name: "Receita perdida", type: "number" },
      { name: "Criticidade", type: "select" },
      { name: "Estrategica", type: "checkbox" },
      { name: "Observacoes", type: "rich_text" },
      ...commonProperties
    ]
  };
}

function createOccupancyDatabase(): NotionDatabaseDefinition {
  return {
    id: 15,
    name: "Ocupacao",
    slug: "ocupacao",
    titleProperty: "Snapshot",
    properties: [
      { name: "Snapshot", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Competencia", type: "date" },
      { name: "Total lojas", type: "number" },
      { name: "Lojas ocupadas", type: "number" },
      { name: "Lojas vagas", type: "number" },
      { name: "ABL total", type: "number" },
      { name: "ABL ocupada", type: "number" },
      { name: "Taxa ocupacao", type: "number" },
      ...commonProperties
    ]
  };
}

function createUtilityDatabase(id: number, name: string, slug: string): NotionDatabaseDefinition {
  return {
    id,
    name,
    slug,
    sourceTable: "consumos",
    titleProperty: "Medicao",
    properties: [
      { name: "Medicao", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Competencia", type: "date" },
      { name: "Consumo", type: "number" },
      { name: "Valor", type: "number" },
      { name: "Variacao", type: "number" },
      { name: "Alerta", type: "select" },
      ...commonProperties
    ]
  };
}

function createServiceOrderDatabase(): NotionDatabaseDefinition {
  return {
    id: 18,
    name: "OS",
    slug: "os",
    sourceTable: "ordens_servico",
    titleProperty: "Ordem",
    properties: [
      { name: "Ordem", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Categoria", type: "select" },
      { name: "Prioridade", type: "select" },
      { name: "Prazo", type: "date" },
      { name: "Custo previsto", type: "number" },
      { name: "Custo realizado", type: "number" },
      { name: "Documentos", type: "relation", relationTo: "Documentos" },
      ...commonProperties
    ]
  };
}

function createLegalDatabase(): NotionDatabaseDefinition {
  return {
    id: 19,
    name: "Juridico",
    slug: "juridico",
    sourceTable: "juridico",
    titleProperty: "Caso",
    properties: [
      { name: "Caso", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Lojista", type: "relation", relationTo: "Lojistas" },
      { name: "Contrato", type: "relation", relationTo: "Contratos" },
      { name: "Tipo", type: "select" },
      { name: "Prazo", type: "date" },
      { name: "Pendencias", type: "rich_text" },
      ...commonProperties
    ]
  };
}

function createDocumentsDatabase(): NotionDatabaseDefinition {
  return {
    id: 20,
    name: "Documentos",
    slug: "documentos",
    sourceTable: "documentos",
    titleProperty: "Documento",
    properties: [
      { name: "Documento", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Loja", type: "relation", relationTo: "Lojas" },
      { name: "Lojista", type: "relation", relationTo: "Lojistas" },
      { name: "Contrato", type: "relation", relationTo: "Contratos" },
      { name: "OS", type: "relation", relationTo: "OS" },
      { name: "Categoria", type: "select" },
      { name: "Arquivo", type: "files" },
      { name: "Google Drive URL", type: "url" },
      { name: "Validade", type: "date" },
      ...commonProperties
    ]
  };
}

function createMarketingDatabase(): NotionDatabaseDefinition {
  return {
    id: 21,
    name: "Marketing",
    slug: "marketing",
    titleProperty: "Acao",
    properties: [
      { name: "Acao", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Categoria", type: "select" },
      { name: "Data inicio", type: "date" },
      { name: "Data fim", type: "date" },
      { name: "Orcamento", type: "number" },
      { name: "Realizado", type: "number" },
      { name: "Fundo promocao", type: "relation", relationTo: "Fundo Promocao" },
      ...commonProperties
    ]
  };
}

function createReportsDatabase(): NotionDatabaseDefinition {
  return {
    id: 22,
    name: "Relatorios",
    slug: "relatorios",
    sourceTable: "relatorios_mensais",
    titleProperty: "Relatorio",
    properties: [
      { name: "Relatorio", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Competencia", type: "date" },
      { name: "PDF", type: "files" },
      { name: "Recomendacoes", type: "rich_text" },
      { name: "Indicadores", type: "relation", relationTo: "Indicadores" },
      ...commonProperties
    ]
  };
}

function createIndicatorsDatabase(): NotionDatabaseDefinition {
  return {
    id: 23,
    name: "Indicadores",
    slug: "indicadores",
    sourceTable: "indicadores",
    titleProperty: "Indicador",
    properties: [
      { name: "Indicador", type: "title" },
      { name: "Empreendimento", type: "relation", relationTo: "Empreendimentos" },
      { name: "Competencia", type: "date" },
      { name: "Categoria", type: "select" },
      { name: "Valor", type: "number" },
      { name: "Unidade", type: "select" },
      { name: "Relatorio", type: "relation", relationTo: "Relatorios" },
      ...commonProperties
    ]
  };
}
