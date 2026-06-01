import type { CommercialLead, Contract, DelinquencyRecord, DocumentRecord, Enterprise, FppRecord, Payable, Receivable, RevenueAuditRecord, ServiceOrder, Store, Tenant, UtilityReading, VacancyRecord } from "@/lib/types";
import type { Database } from "./types";

type EnterpriseRow = Database["public"]["Tables"]["empreendimentos"]["Row"];
type StoreRow = Database["public"]["Tables"]["lojas"]["Row"];
type TenantRow = Database["public"]["Tables"]["lojistas"]["Row"];
type ContractRow = Database["public"]["Tables"]["contratos"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["receitas"]["Row"];
type PayableRow = Database["public"]["Tables"]["despesas"]["Row"];
type DelinquencyRow = Database["public"]["Tables"]["inadimplencias"]["Row"];
type FppRow = Database["public"]["Tables"]["fpp"]["Row"];
type RevenueAuditRow = Database["public"]["Tables"]["auditoria_faturamento"]["Row"];
type CommercialLeadRow = Database["public"]["Tables"]["comercial_leads"]["Row"];
type VacancyRow = Database["public"]["Tables"]["vacancia"]["Row"];
type UtilityReadingRow = Database["public"]["Tables"]["consumos"]["Row"];
type ServiceOrderRow = Database["public"]["Tables"]["ordens_servico"]["Row"];
type DocumentRow = Database["public"]["Tables"]["documentos"]["Row"];

export function mapEnterpriseRow(row: EnterpriseRow): Enterprise {
  return {
    id: row.id,
    nome: row.nome,
    cidade: row.cidade,
    estado: row.estado,
    status: row.status as Enterprise["status"],
    abl: row.abl_m2,
    lojas: row.numero_lojas,
    vagas: row.numero_vagas ?? 0,
    responsavel: "Nexa Malls"
  };
}

export function mapStoreRow(row: StoreRow): Store {
  return {
    id: row.id,
    codigo: row.codigo,
    empreendimentoId: row.empreendimento_id,
    nome: row.nome ?? row.codigo,
    segmento: row.segmento ?? "Nao informado",
    status: row.status as Store["status"],
    areaTotal: row.area_total_m2,
    aluguel: row.valor_aluguel,
    condominio: row.valor_condominio,
    fundo: row.valor_fundo_promocao
  };
}

export function mapTenantRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    nomeFantasia: row.nome_fantasia,
    razaoSocial: row.razao_social,
    cnpj: row.cnpj,
    responsavelLegal: row.responsavel_legal ?? "",
    telefone: row.telefone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    endereco: row.endereco ?? "",
    segmento: row.segmento ?? "Nao informado",
    lojaId: row.loja_id ?? "",
    dataEntrada: row.data_entrada ?? "",
    status: row.status as Tenant["status"]
  };
}

export function mapContractRow(row: ContractRow): Contract {
  return {
    id: row.id,
    lojaId: row.loja_id,
    lojistaId: row.lojista_id,
    dataInicio: row.data_inicio,
    dataTermino: row.data_termino,
    prazoMeses: row.prazo_meses,
    aluguelMinimo: row.aluguel_minimo,
    indiceReajuste: row.indice_reajuste ?? "",
    garantia: row.garantia ?? "",
    seguro: row.seguro ?? "",
    contratoUrl: row.contrato_url ?? "",
    aditivos: row.aditivos,
    status: row.status as Contract["status"]
  };
}

export function mapReceivableRow(row: ReceivableRow): Receivable {
  return {
    id: row.id,
    lojaId: row.loja_id,
    empreendimentoId: row.empreendimento_id,
    competencia: row.competencia,
    receita: row.receita as Receivable["receita"],
    valor: row.valor,
    vencimento: row.vencimento,
    recebimento: row.recebimento ?? "",
    status: row.status as Receivable["status"]
  };
}

export function mapPayableRow(row: PayableRow): Payable {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    fornecedor: row.fornecedor,
    categoria: row.categoria,
    competencia: row.competencia,
    valor: row.valor,
    vencimento: row.vencimento,
    pagamento: row.pagamento ?? "",
    centroCusto: row.centro_custo,
    status: row.status as Payable["status"]
  };
}

export function mapDelinquencyRow(row: DelinquencyRow): DelinquencyRecord {
  return {
    id: row.id,
    receivableId: row.receita_id ?? "",
    lojaId: row.loja_id,
    valor: row.valor,
    diasAtraso: row.dias_atraso,
    historico: row.historico ?? "",
    negociacao: row.negociacao ?? "",
    responsavel: row.responsavel ?? "",
    status: row.status as DelinquencyRecord["status"]
  };
}

export function mapFppRow(row: FppRow): FppRecord {
  return {
    id: row.id,
    lojaId: row.loja_id,
    contratoId: row.contrato_id ?? "",
    empreendimentoId: row.empreendimento_id,
    competencia: row.competencia,
    percentual: row.percentual,
    aluguelMinimo: row.aluguel_minimo,
    faturamentoInformado: row.faturamento_informado,
    faturamentoAuditado: row.faturamento_auditado,
    status: row.status as FppRecord["status"]
  };
}

export function mapRevenueAuditRow(row: RevenueAuditRow): RevenueAuditRecord {
  return {
    id: row.id,
    lojaId: row.loja_id,
    empreendimentoId: row.empreendimento_id,
    competencia: row.competencia,
    relatorioErp: row.relatorio_erp,
    relatorioPdv: row.relatorio_pdv,
    stone: row.stone,
    rede: row.rede,
    cielo: row.cielo,
    pix: row.pix,
    ifood: row.ifood,
    delivery: row.delivery,
    faturamentoAnterior: row.faturamento_anterior,
    status: row.status as RevenueAuditRecord["status"]
  };
}

export function mapCommercialLeadRow(row: CommercialLeadRow): CommercialLead {
  return {
    id: row.id,
    lojaId: row.loja_id ?? "",
    empreendimentoId: row.empreendimento_id,
    empresa: row.empresa,
    segmento: row.segmento ?? "",
    responsavel: row.responsavel ?? "",
    proximaAcao: row.proxima_acao ?? "",
    dataProximaAcao: row.data_proxima_acao ?? "",
    historico: row.historico ?? "",
    etapa: row.etapa as CommercialLead["etapa"],
    valorProposta: row.valor_proposta
  };
}

export function mapVacancyRow(row: VacancyRow): VacancyRecord {
  return {
    id: row.id,
    lojaId: row.loja_id,
    empreendimentoId: row.empreendimento_id,
    inicioVacancia: row.inicio_vacancia,
    motivo: row.motivo ?? "",
    criticidade: row.criticidade as VacancyRecord["criticidade"],
    estrategia: row.estrategia ?? "",
    receitaPotencial: row.receita_potencial,
    responsavel: row.responsavel ?? ""
  };
}

export function mapUtilityReadingRow(row: UtilityReadingRow): UtilityReading {
  return {
    id: row.id,
    lojaId: row.loja_id,
    empreendimentoId: row.empreendimento_id,
    tipo: row.tipo as UtilityReading["tipo"],
    competencia: row.competencia,
    consumo: row.consumo,
    consumoAnterior: row.consumo_anterior,
    valor: row.valor,
    medidor: row.medidor ?? "",
    status: row.status as UtilityReading["status"]
  };
}

export function mapServiceOrderRow(row: ServiceOrderRow): ServiceOrder {
  return {
    id: row.id,
    empreendimentoId: row.empreendimento_id,
    lojaId: row.loja_id ?? "",
    local: row.local,
    categoria: row.categoria as ServiceOrder["categoria"],
    prioridade: row.prioridade as ServiceOrder["prioridade"],
    status: row.status as ServiceOrder["status"],
    responsavel: row.responsavel ?? "",
    prazo: row.prazo,
    custoPrevisto: row.custo_previsto,
    custoRealizado: row.custo_realizado,
    fotosAntes: row.fotos_antes ?? "",
    fotosDepois: row.fotos_depois ?? "",
    descricao: row.descricao ?? ""
  };
}

export function mapDocumentRow(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    lojaId: row.loja_id,
    empreendimentoId: row.empreendimento_id,
    categoria: row.categoria as DocumentRecord["categoria"],
    titulo: row.titulo,
    status: row.status as DocumentRecord["status"],
    vencimento: row.vencimento ?? "",
    pastaDriveUrl: row.pasta_drive_url ?? "",
    arquivoUrl: row.arquivo_url ?? "",
    responsavel: row.responsavel ?? "",
    observacoes: row.observacoes ?? ""
  };
}
