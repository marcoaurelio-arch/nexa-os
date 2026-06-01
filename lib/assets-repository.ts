import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  mapCommercialLeadRow,
  mapContractRow,
  mapDelinquencyRow,
  mapDocumentRow,
  mapEnterpriseRow,
  mapFppRow,
  mapLegalCaseRow,
  mapPayableRow,
  mapReceivableRow,
  mapRevenueAuditRow,
  mapServiceOrderRow,
  mapStoreRow,
  mapTenantRow,
  mapUtilityReadingRow,
  mapVacancyRow
} from "@/lib/supabase/mappers";
import type { CommercialLead, Contract, DelinquencyRecord, DocumentRecord, Enterprise, FppRecord, LegalCase, Payable, Receivable, RevenueAuditRecord, ServiceOrder, Store, Tenant, UtilityReading, VacancyRecord } from "@/lib/types";

export type AssetData = {
  enterprises: Enterprise[];
  stores: Store[];
  tenants: Tenant[];
  contracts: Contract[];
  receivables: Receivable[];
  payables: Payable[];
  delinquencyRecords: DelinquencyRecord[];
  fppRecords: FppRecord[];
  revenueAuditRecords: RevenueAuditRecord[];
  commercialLeads: CommercialLead[];
  vacancyRecords: VacancyRecord[];
  utilityReadings: UtilityReading[];
  serviceOrders: ServiceOrder[];
  documentRecords: DocumentRecord[];
  legalCases: LegalCase[];
};

const LOCAL_ASSET_DATA_KEY = "nexa-os.asset-data.v1";

export function loadLocalAssetData(): AssetData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_ASSET_DATA_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AssetData;
    if (!Array.isArray(parsed.enterprises) || !Array.isArray(parsed.stores)) {
      return null;
    }

    return {
      enterprises: parsed.enterprises,
      stores: parsed.stores,
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      contracts: Array.isArray(parsed.contracts) ? parsed.contracts : [],
      receivables: Array.isArray(parsed.receivables) ? parsed.receivables : [],
      payables: Array.isArray(parsed.payables) ? parsed.payables : [],
      delinquencyRecords: Array.isArray(parsed.delinquencyRecords) ? parsed.delinquencyRecords : [],
      fppRecords: Array.isArray(parsed.fppRecords) ? parsed.fppRecords : [],
      revenueAuditRecords: Array.isArray(parsed.revenueAuditRecords) ? parsed.revenueAuditRecords : [],
      commercialLeads: Array.isArray(parsed.commercialLeads) ? parsed.commercialLeads : [],
      vacancyRecords: Array.isArray(parsed.vacancyRecords) ? parsed.vacancyRecords : [],
      utilityReadings: Array.isArray(parsed.utilityReadings) ? parsed.utilityReadings : [],
      serviceOrders: Array.isArray(parsed.serviceOrders) ? parsed.serviceOrders : [],
      documentRecords: Array.isArray(parsed.documentRecords) ? parsed.documentRecords : [],
      legalCases: Array.isArray(parsed.legalCases) ? parsed.legalCases : []
    };
  } catch {
    return null;
  }
}

export function saveLocalAssetData(data: AssetData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_ASSET_DATA_KEY, JSON.stringify(data));
}

export function resetLocalAssetData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_ASSET_DATA_KEY);
}

export async function fetchAssetData(): Promise<AssetData | null> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/assets", { cache: "no-store" });

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(payload?.error ?? "Falha ao carregar dados do Supabase");
    }

    return response.json() as Promise<AssetData>;
  }

  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return null;
  }

  const client = supabase as any;

  const [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult] = await Promise.all([
    client
      .from("empreendimentos")
      .select("*")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    client
      .from("lojas")
      .select("*")
      .is("deleted_at", null)
      .order("codigo", { ascending: true }),
    client
      .from("lojistas")
      .select("*")
      .is("deleted_at", null)
      .order("nome_fantasia", { ascending: true }),
    client
      .from("contratos")
      .select("*")
      .is("deleted_at", null)
      .order("data_termino", { ascending: true }),
    client
      .from("receitas")
      .select("*")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("despesas")
      .select("*")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("inadimplencias")
      .select("*")
      .is("deleted_at", null)
      .order("dias_atraso", { ascending: false }),
    client
      .from("fpp")
      .select("*")
      .is("deleted_at", null)
      .order("competencia", { ascending: false }),
    client
      .from("auditoria_faturamento")
      .select("*")
      .is("deleted_at", null)
      .order("competencia", { ascending: false }),
    client
      .from("comercial_leads")
      .select("*")
      .is("deleted_at", null)
      .order("data_proxima_acao", { ascending: true }),
    client
      .from("vacancia")
      .select("*")
      .is("deleted_at", null)
      .order("inicio_vacancia", { ascending: true }),
    client
      .from("consumos")
      .select("*")
      .is("deleted_at", null)
      .order("competencia", { ascending: false }),
    client
      .from("ordens_servico")
      .select("*")
      .is("deleted_at", null)
      .order("prazo", { ascending: true }),
    client
      .from("documentos")
      .select("*")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("juridico")
      .select("*")
      .is("deleted_at", null)
      .order("prazo", { ascending: true })
  ]);

  if (enterpriseResult.error) throw enterpriseResult.error;
  if (storeResult.error) throw storeResult.error;
  if (tenantResult.error) throw tenantResult.error;
  if (contractResult.error) throw contractResult.error;
  if (receivableResult.error) throw receivableResult.error;
  if (payableResult.error) throw payableResult.error;
  if (delinquencyResult.error) throw delinquencyResult.error;
  if (fppResult.error) throw fppResult.error;
  if (auditResult.error) throw auditResult.error;
  if (commercialResult.error) throw commercialResult.error;
  if (vacancyResult.error) throw vacancyResult.error;
  if (utilityResult.error) throw utilityResult.error;
  if (serviceOrderResult.error) throw serviceOrderResult.error;
  if (documentResult.error) throw documentResult.error;
  if (legalResult.error) throw legalResult.error;

  return {
    enterprises: enterpriseResult.data.map(mapEnterpriseRow),
    stores: storeResult.data.map(mapStoreRow),
    tenants: tenantResult.data.map(mapTenantRow),
    contracts: contractResult.data.map(mapContractRow),
    receivables: receivableResult.data.map(mapReceivableRow),
    payables: payableResult.data.map(mapPayableRow),
    delinquencyRecords: delinquencyResult.data.map(mapDelinquencyRow),
    fppRecords: fppResult.data.map(mapFppRow),
    revenueAuditRecords: auditResult.data.map(mapRevenueAuditRow),
    commercialLeads: commercialResult.data.map(mapCommercialLeadRow),
    vacancyRecords: vacancyResult.data.map(mapVacancyRow),
    utilityReadings: utilityResult.data.map(mapUtilityReadingRow),
    serviceOrders: serviceOrderResult.data.map(mapServiceOrderRow),
    documentRecords: documentResult.data.map(mapDocumentRow),
    legalCases: legalResult.data.map(mapLegalCaseRow)
  };
}

export async function saveEnterprise(enterprise: Enterprise) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return enterprise;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("empreendimentos")
    .upsert({
      ...(isUuid(enterprise.id) ? { id: enterprise.id } : {}),
      nome: enterprise.nome,
      cidade: enterprise.cidade,
      estado: enterprise.estado,
      status: enterprise.status,
      abl_m2: enterprise.abl,
      numero_lojas: enterprise.lojas,
      numero_vagas: enterprise.vagas
    })
    .select()
    .single();

  if (error) throw error;
  return mapEnterpriseRow(data);
}

export async function saveStore(store: Store) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return store;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("lojas")
    .upsert({
      ...(isUuid(store.id) ? { id: store.id } : {}),
      empreendimento_id: store.empreendimentoId,
      codigo: store.codigo,
      nome: store.nome,
      segmento: store.segmento,
      status: store.status,
      area_total_m2: store.areaTotal,
      valor_aluguel: store.aluguel,
      valor_condominio: store.condominio,
      valor_fundo_promocao: store.fundo
    })
    .select()
    .single();

  if (error) throw error;
  return mapStoreRow(data);
}

export async function saveTenant(tenant: Tenant) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return tenant;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("lojistas")
    .upsert({
      ...(isUuid(tenant.id) ? { id: tenant.id } : {}),
      nome_fantasia: tenant.nomeFantasia,
      razao_social: tenant.razaoSocial,
      cnpj: tenant.cnpj,
      responsavel_legal: tenant.responsavelLegal,
      telefone: tenant.telefone,
      whatsapp: tenant.whatsapp,
      email: tenant.email,
      endereco: tenant.endereco,
      segmento: tenant.segmento,
      loja_id: tenant.lojaId || null,
      data_entrada: tenant.dataEntrada || null,
      status: tenant.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapTenantRow(data);
}

export async function saveContract(contract: Contract) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return contract;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("contratos")
    .upsert({
      ...(isUuid(contract.id) ? { id: contract.id } : {}),
      loja_id: contract.lojaId,
      lojista_id: contract.lojistaId,
      data_inicio: contract.dataInicio,
      data_termino: contract.dataTermino,
      prazo_meses: contract.prazoMeses,
      aluguel_minimo: contract.aluguelMinimo,
      indice_reajuste: contract.indiceReajuste,
      garantia: contract.garantia,
      seguro: contract.seguro,
      contrato_url: contract.contratoUrl || null,
      aditivos: contract.aditivos,
      status: contract.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapContractRow(data);
}

export async function saveReceivable(receivable: Receivable) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return receivable;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("receitas")
    .upsert({
      ...(isUuid(receivable.id) ? { id: receivable.id } : {}),
      loja_id: receivable.lojaId,
      empreendimento_id: receivable.empreendimentoId,
      competencia: receivable.competencia,
      receita: receivable.receita,
      valor: receivable.valor,
      vencimento: receivable.vencimento,
      recebimento: receivable.recebimento || null,
      status: receivable.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapReceivableRow(data);
}

export async function savePayable(payable: Payable) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return payable;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("despesas")
    .upsert({
      ...(isUuid(payable.id) ? { id: payable.id } : {}),
      empreendimento_id: payable.empreendimentoId,
      fornecedor: payable.fornecedor,
      categoria: payable.categoria,
      competencia: payable.competencia,
      valor: payable.valor,
      vencimento: payable.vencimento,
      pagamento: payable.pagamento || null,
      centro_custo: payable.centroCusto,
      status: payable.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapPayableRow(data);
}

export async function saveDelinquencyRecord(record: DelinquencyRecord) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return record;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("inadimplencias")
    .upsert({
      ...(isUuid(record.id) ? { id: record.id } : {}),
      receita_id: isUuid(record.receivableId) ? record.receivableId : null,
      loja_id: record.lojaId,
      valor: record.valor,
      dias_atraso: record.diasAtraso,
      historico: record.historico,
      negociacao: record.negociacao,
      responsavel: record.responsavel,
      status: record.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapDelinquencyRow(data);
}

export async function saveFppRecord(record: FppRecord) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return record;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("fpp")
    .upsert({
      ...(isUuid(record.id) ? { id: record.id } : {}),
      loja_id: record.lojaId,
      contrato_id: isUuid(record.contratoId) ? record.contratoId : null,
      empreendimento_id: record.empreendimentoId,
      competencia: record.competencia,
      percentual: record.percentual,
      aluguel_minimo: record.aluguelMinimo,
      faturamento_informado: record.faturamentoInformado,
      faturamento_auditado: record.faturamentoAuditado,
      status: record.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapFppRow(data);
}

export async function saveRevenueAuditRecord(record: RevenueAuditRecord) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return record;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("auditoria_faturamento")
    .upsert({
      ...(isUuid(record.id) ? { id: record.id } : {}),
      loja_id: record.lojaId,
      empreendimento_id: record.empreendimentoId,
      competencia: record.competencia,
      relatorio_erp: record.relatorioErp,
      relatorio_pdv: record.relatorioPdv,
      stone: record.stone,
      rede: record.rede,
      cielo: record.cielo,
      pix: record.pix,
      ifood: record.ifood,
      delivery: record.delivery,
      faturamento_anterior: record.faturamentoAnterior,
      status: record.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapRevenueAuditRow(data);
}

export async function saveCommercialLead(lead: CommercialLead) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return lead;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("comercial_leads")
    .upsert({
      ...(isUuid(lead.id) ? { id: lead.id } : {}),
      loja_id: isUuid(lead.lojaId) ? lead.lojaId : null,
      empreendimento_id: lead.empreendimentoId,
      empresa: lead.empresa,
      segmento: lead.segmento,
      responsavel: lead.responsavel,
      proxima_acao: lead.proximaAcao,
      data_proxima_acao: lead.dataProximaAcao || null,
      historico: lead.historico,
      etapa: lead.etapa,
      valor_proposta: lead.valorProposta
    })
    .select()
    .single();

  if (error) throw error;
  return mapCommercialLeadRow(data);
}

export async function saveVacancyRecord(record: VacancyRecord) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return record;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("vacancia")
    .upsert({
      ...(isUuid(record.id) ? { id: record.id } : {}),
      loja_id: record.lojaId,
      empreendimento_id: record.empreendimentoId,
      inicio_vacancia: record.inicioVacancia,
      motivo: record.motivo,
      criticidade: record.criticidade,
      estrategia: record.estrategia,
      receita_potencial: record.receitaPotencial,
      responsavel: record.responsavel
    })
    .select()
    .single();

  if (error) throw error;
  return mapVacancyRow(data);
}

export async function saveUtilityReading(reading: UtilityReading) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return reading;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("consumos")
    .upsert({
      ...(isUuid(reading.id) ? { id: reading.id } : {}),
      loja_id: reading.lojaId,
      empreendimento_id: reading.empreendimentoId,
      tipo: reading.tipo,
      competencia: reading.competencia,
      consumo: reading.consumo,
      consumo_anterior: reading.consumoAnterior,
      valor: reading.valor,
      medidor: reading.medidor || null,
      status: reading.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapUtilityReadingRow(data);
}

export async function saveServiceOrder(order: ServiceOrder) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return order;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("ordens_servico")
    .upsert({
      ...(isUuid(order.id) ? { id: order.id } : {}),
      empreendimento_id: order.empreendimentoId,
      loja_id: isUuid(order.lojaId) ? order.lojaId : null,
      local: order.local,
      categoria: order.categoria,
      prioridade: order.prioridade,
      status: order.status,
      responsavel: order.responsavel || null,
      prazo: order.prazo,
      custo_previsto: order.custoPrevisto,
      custo_realizado: order.custoRealizado,
      fotos_antes: order.fotosAntes || null,
      fotos_depois: order.fotosDepois || null,
      descricao: order.descricao || null
    })
    .select()
    .single();

  if (error) throw error;
  return mapServiceOrderRow(data);
}

export async function saveDocumentRecord(record: DocumentRecord) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return record;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("documentos")
    .upsert({
      ...(isUuid(record.id) ? { id: record.id } : {}),
      loja_id: record.lojaId,
      empreendimento_id: record.empreendimentoId,
      categoria: record.categoria,
      titulo: record.titulo,
      status: record.status,
      vencimento: record.vencimento || null,
      pasta_drive_url: record.pastaDriveUrl || null,
      arquivo_url: record.arquivoUrl || null,
      responsavel: record.responsavel || null,
      observacoes: record.observacoes || null
    })
    .select()
    .single();

  if (error) throw error;
  return mapDocumentRow(data);
}

export async function saveLegalCase(record: LegalCase) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return record;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("juridico")
    .upsert({
      ...(isUuid(record.id) ? { id: record.id } : {}),
      loja_id: record.lojaId,
      empreendimento_id: record.empreendimentoId,
      contrato_id: isUuid(record.contratoId) ? record.contratoId : null,
      tipo: record.tipo,
      titulo: record.titulo,
      parte_contraria: record.parteContraria || null,
      valor_causa: record.valorCausa,
      prazo: record.prazo,
      status: record.status,
      risco: record.risco,
      responsavel: record.responsavel || null,
      historico: record.historico || null,
      proxima_acao: record.proximaAcao || null
    })
    .select()
    .single();

  if (error) throw error;
  return mapLegalCaseRow(data);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
