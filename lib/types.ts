export type EnterpriseStatus = "ativo" | "implantacao" | "planejado";
export type StoreStatus =
  | "ocupada"
  | "disponivel"
  | "negociacao"
  | "implantacao"
  | "em_obra"
  | "inativa";

export type Enterprise = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  status: EnterpriseStatus;
  abl: number;
  lojas: number;
  vagas: number;
  responsavel: string;
};

export type Store = {
  id: string;
  codigo: string;
  empreendimentoId: string;
  nome: string;
  segmento: string;
  status: StoreStatus;
  areaTotal: number;
  aluguel: number;
  condominio: number;
  fundo: number;
};

export type TenantStatus = "ativo" | "implantacao" | "inadimplente" | "inativo";

export type Tenant = {
  id: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  responsavelLegal: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: string;
  segmento: string;
  lojaId: string;
  dataEntrada: string;
  status: TenantStatus;
};

export type ContractStatus = "ativo" | "vencendo" | "renovacao" | "encerrado" | "minuta";

export type Contract = {
  id: string;
  lojaId: string;
  lojistaId: string;
  dataInicio: string;
  dataTermino: string;
  prazoMeses: number;
  aluguelMinimo: number;
  indiceReajuste: string;
  garantia: string;
  seguro: string;
  contratoUrl: string;
  aditivos: number;
  status: ContractStatus;
};

export type FinancialStatus = "aberto" | "vencido" | "pago" | "cancelado";
export type RevenueType = "aluguel" | "condominio" | "fundo_promocao" | "fpp" | "multa" | "juros";

export type Receivable = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  competencia: string;
  receita: RevenueType;
  valor: number;
  vencimento: string;
  recebimento: string;
  status: FinancialStatus;
};

export type Payable = {
  id: string;
  empreendimentoId: string;
  fornecedor: string;
  categoria: string;
  competencia: string;
  valor: number;
  vencimento: string;
  pagamento: string;
  centroCusto: string;
  status: FinancialStatus;
};

export type DelinquencyRecord = {
  id: string;
  receivableId: string;
  lojaId: string;
  valor: number;
  diasAtraso: number;
  historico: string;
  negociacao: string;
  responsavel: string;
  status: "regua" | "negociacao" | "juridico" | "regularizado";
};

export type FppRecord = {
  id: string;
  lojaId: string;
  contratoId: string;
  empreendimentoId: string;
  competencia: string;
  percentual: number;
  aluguelMinimo: number;
  faturamentoInformado: number;
  faturamentoAuditado: number;
  status: FinancialStatus;
};

export type RevenueAuditStatus = "pendente" | "conciliado" | "divergente" | "critico";

export type RevenueAuditRecord = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  competencia: string;
  relatorioErp: number;
  relatorioPdv: number;
  stone: number;
  rede: number;
  cielo: number;
  pix: number;
  ifood: number;
  delivery: number;
  faturamentoAnterior: number;
  status: RevenueAuditStatus;
};

export type CommercialStage =
  | "prospeccao"
  | "lead"
  | "visita"
  | "proposta"
  | "negociacao"
  | "contrato"
  | "implantacao"
  | "inauguracao";

export type CommercialLead = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  empresa: string;
  segmento: string;
  responsavel: string;
  proximaAcao: string;
  dataProximaAcao: string;
  historico: string;
  etapa: CommercialStage;
  valorProposta: number;
};

export type VacancyCriticality = "baixa" | "media" | "alta" | "estrategica";

export type VacancyRecord = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  inicioVacancia: string;
  motivo: string;
  criticidade: VacancyCriticality;
  estrategia: string;
  receitaPotencial: number;
  responsavel: string;
};

export type UtilityKind = "energia" | "agua";
export type UtilityStatus = "normal" | "atencao" | "critico";

export type UtilityReading = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  tipo: UtilityKind;
  competencia: string;
  consumo: number;
  consumoAnterior: number;
  valor: number;
  medidor: string;
  status: UtilityStatus;
};

export type DocumentCategory =
  | "contratos"
  | "aditivos"
  | "garantias"
  | "seguros"
  | "alvaras"
  | "avcb"
  | "vistorias"
  | "licencas"
  | "plantas"
  | "projetos"
  | "fotos";
export type DocumentStatus = "pendente" | "vigente" | "vencendo" | "vencido" | "dispensado";

export type DocumentRecord = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  categoria: DocumentCategory;
  titulo: string;
  status: DocumentStatus;
  vencimento: string;
  pastaDriveUrl: string;
  arquivoUrl: string;
  responsavel: string;
  observacoes: string;
};

export type LegalCaseType = "notificacao" | "acao_judicial" | "garantia" | "contrato" | "renovacao" | "pendencia";
export type LegalCaseStatus = "aberto" | "em_andamento" | "aguardando" | "concluido" | "critico";
export type LegalRisk = "baixo" | "medio" | "alto";

export type LegalCase = {
  id: string;
  lojaId: string;
  empreendimentoId: string;
  contratoId: string;
  tipo: LegalCaseType;
  titulo: string;
  parteContraria: string;
  valorCausa: number;
  prazo: string;
  status: LegalCaseStatus;
  risco: LegalRisk;
  responsavel: string;
  historico: string;
  proximaAcao: string;
};

export type LandBankAreaStatus = "disponivel" | "em_negociacao" | "contrato_assinado" | "descartada";
export type LandBankPriority = "alta" | "media" | "baixa";
export type LandBankContactType = "proprietario" | "representante" | "corretor" | "empresa";
export type LandBankPipelineStage =
  | "lead"
  | "contato_realizado"
  | "visita"
  | "estudo"
  | "proposta"
  | "negociacao"
  | "contrato"
  | "implantado"
  | "cancelado";

export type LandBankArea = {
  id: string;
  empreendimentoId: string;
  codigo: string;
  nome: string;
  cidade: string;
  estado: string;
  bairro: string;
  enderecoCompleto: string;
  latitude: number;
  longitude: number;
  areaTotalM2: number;
  frenteM: number;
  zoneamento: string;
  status: LandBankAreaStatus;
  valorPedido: number;
  valorM2: number;
  valorPotencial: number;
  viavelBts: boolean;
  viavelStripMall: boolean;
  viavelSaleLeaseback: boolean;
  prioridade: LandBankPriority;
  etapa: LandBankPipelineStage;
  origem: string;
  contatoNome: string;
  contatoTipo: LandBankContactType;
  contatoTelefone: string;
  contatoWhatsapp: string;
  contatoEmail: string;
  responsavel: string;
  proximaAcao: string;
  dataProximaAcao: string;
  score: number;
  classificacao: string;
  observacoes: string;
};

export type Revenue = {
  empreendimentoId: string;
  competencia: string;
  aluguel: number;
  condominio: number;
  fundo: number;
  fpp: number;
  vencidas: number;
  receber: number;
  pagar: number;
};

export type ServiceOrderCategory =
  | "eletrica"
  | "hidraulica"
  | "civil"
  | "limpeza"
  | "seguranca"
  | "jardinagem"
  | "comunicacao_visual"
  | "ar_condicionado";
export type ServiceOrderPriority = "baixa" | "media" | "alta" | "critica";
export type ServiceOrderStatus = "aberta" | "em_execucao" | "aguardando_terceiro" | "concluida";

export type ServiceOrder = {
  id: string;
  empreendimentoId: string;
  lojaId: string;
  local: string;
  categoria: ServiceOrderCategory;
  prioridade: ServiceOrderPriority;
  status: ServiceOrderStatus;
  responsavel: string;
  prazo: string;
  custoPrevisto: number;
  custoRealizado: number;
  fotosAntes: string;
  fotosDepois: string;
  descricao: string;
};

export type ContractAlert = {
  id: string;
  empreendimentoId: string;
  loja: string;
  lojista: string;
  meses: 24 | 12 | 6 | 3;
  vencimento: string;
  risco: "baixo" | "medio" | "alto";
};

export type OccupancyConsolidatedView = {
  totalLojas: number;
  lojasOcupadas: number;
  lojasVagas: number;
  ocupacaoPct: number;
  ablTotalM2: number;
  ablOcupadaM2: number;
};

export type OccupancyEnterpriseView = OccupancyConsolidatedView & {
  empreendimentoId: string;
  nome: string;
  ocupacaoLojasPct: number;
  ocupacaoAblPct: number;
};

export type FinancialKpisView = {
  contasAReceber: number;
  contasVencidas: number;
  recebido: number;
  totalAluguel: number;
  totalCondominio: number;
  totalFundoPromocao: number;
};

export type DelinquencyAgingView = {
  casos: number;
  total: number;
  faixa0A5: number;
  faixa6A15: number;
  faixa16A30: number;
  faixa31A60: number;
  faixa61A90: number;
  faixa90Mais: number;
  maiorAtrasoDias: number;
};

export type ContractExpiringView = {
  id: string;
  status: string;
  dataTermino: string;
  lojaCodigo: string;
  lojista: string;
  empreendimento: string;
  aluguelMinimo: number;
  diasParaVencer: number;
  receitaAnualEmRisco: number;
};

export type CommercialPipelineView = {
  etapa: string;
  oportunidades: number;
  valorTotal: number;
};

export type CentralAlertView = {
  tipo: string;
  empreendimento: string;
  referencia: string;
  detalhe: string;
  prazoData: string;
  dias: number;
  valor: number;
  risco: string;
  severidade: string;
};

export type AssetAnalytics = {
  occupancy: OccupancyConsolidatedView | null;
  occupancyByEnterprise: OccupancyEnterpriseView[];
  financialKpis: FinancialKpisView | null;
  delinquencyAging: DelinquencyAgingView | null;
  expiringContracts: ContractExpiringView[];
  commercialPipeline: CommercialPipelineView[];
  centralAlerts: CentralAlertView[];
  error?: string;
};
