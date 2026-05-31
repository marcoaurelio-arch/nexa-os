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

export type ServiceOrder = {
  id: string;
  empreendimentoId: string;
  loja: string;
  categoria: string;
  prioridade: "baixa" | "media" | "alta" | "critica";
  status: "aberta" | "em_execucao" | "aguardando_terceiro" | "concluida";
  prazo: string;
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
