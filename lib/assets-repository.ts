import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  mapCommercialLeadRow,
  mapContractRow,
  mapDelinquencyRow,
  mapDocumentRow,
  mapEnterpriseRow,
  mapFppRow,
  mapLandBankAreaRow,
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
import type { AssetAnalytics, CommercialLead, Contract, DelinquencyRecord, DocumentRecord, Enterprise, FppRecord, LandBankArea, LegalCase, Payable, Receivable, RevenueAuditRecord, ServiceOrder, Store, Tenant, UtilityReading, VacancyRecord } from "@/lib/types";

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
  landBankAreas: LandBankArea[];
  analytics: AssetAnalytics | null;
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
      legalCases: Array.isArray(parsed.legalCases) ? parsed.legalCases : [],
      landBankAreas: Array.isArray(parsed.landBankAreas) ? parsed.landBankAreas.map(normalizeStoredLandBankArea) : [],
      analytics: parsed.analytics ?? null
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

function normalizeStoredLandBankArea(area: LandBankArea): LandBankArea {
  return {
    ...area,
    etapa: area.etapa ?? fallbackLandBankStage(area.status),
    contatoNome: area.contatoNome ?? "",
    contatoTipo: area.contatoTipo ?? "proprietario",
    contatoTelefone: area.contatoTelefone ?? "",
    contatoWhatsapp: area.contatoWhatsapp ?? "",
    contatoEmail: area.contatoEmail ?? ""
  };
}

function fallbackLandBankStage(status: LandBankArea["status"]): LandBankArea["etapa"] {
  if (status === "em_negociacao") return "negociacao";
  if (status === "contrato_assinado") return "contrato";
  if (status === "descartada") return "cancelado";
  return "lead";
}

export async function fetchAssetData(accessToken?: string): Promise<AssetData | null> {
  if (typeof window !== "undefined") {
    const headers = await getAuthHeaders(accessToken);
    const response = await fetch("/api/assets", { cache: "no-store", headers });

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

  const [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult, landBankResult, landPipelineResult, landScoreResult, landOwnerResult, landOwnerLinkResult] = await Promise.all([
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
      .order("prazo", { ascending: true }),
    client
      .from("land_bank_areas")
      .select("*")
      .is("deleted_at", null)
      .order("prioridade", { ascending: true }),
    client
      .from("land_bank_pipeline")
      .select("*")
      .is("deleted_at", null)
      .order("posicao", { ascending: true }),
    client
      .from("land_bank_scores")
      .select("*")
      .order("created_at", { ascending: false }),
    client
      .from("land_bank_proprietarios")
      .select("*")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    client
      .from("land_bank_area_proprietarios")
      .select("*")
      .order("principal", { ascending: false })
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
  if (landBankResult.error && !isMissingRelationError(landBankResult.error)) throw landBankResult.error;
  if (landPipelineResult.error && !isMissingRelationError(landPipelineResult.error)) throw landPipelineResult.error;
  if (landScoreResult.error && !isMissingRelationError(landScoreResult.error)) throw landScoreResult.error;
  if (landOwnerResult.error && !isMissingRelationError(landOwnerResult.error)) throw landOwnerResult.error;
  if (landOwnerLinkResult.error && !isMissingRelationError(landOwnerLinkResult.error)) throw landOwnerLinkResult.error;

  const landPipelineByArea = new Map<string, any>((landPipelineResult.data ?? []).map((row: { area_id: string }) => [row.area_id, row]));
  const landScoreByArea = latestLandScoresByArea(landScoreResult.data ?? []);
  const landOwnerByArea = landOwnersByArea(landOwnerResult.data ?? [], landOwnerLinkResult.data ?? []);

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
    legalCases: legalResult.data.map(mapLegalCaseRow),
    landBankAreas: (landBankResult.data ?? []).map((row: any) => mapLandBankAreaRow(row, landPipelineByArea.get(row.id), landScoreByArea.get(row.id), landOwnerByArea.get(row.id))),
    analytics: null
  };
}

async function getAuthHeaders(accessToken?: string) {
  if (process.env.NEXT_PUBLIC_AUTH_REQUIRED !== "true") {
    return undefined;
  }

  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
  const token = data.session?.access_token;

  return token ? { Authorization: `Bearer ${token}` } : undefined;
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

export async function saveLandBankArea(area: LandBankArea) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return area;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("land_bank_areas")
    .upsert({
      ...(isUuid(area.id) ? { id: area.id } : {}),
      empreendimento_id: area.empreendimentoId,
      codigo: area.codigo,
      nome: area.nome,
      cidade: area.cidade,
      estado: area.estado,
      bairro: area.bairro || null,
      endereco_completo: area.enderecoCompleto,
      latitude: area.latitude,
      longitude: area.longitude,
      area_total_m2: area.areaTotalM2,
      frente_m: area.frenteM || null,
      zoneamento: area.zoneamento || null,
      status: area.status,
      valor_pedido: area.valorPedido || null,
      valor_m2: area.valorM2 || null,
      valor_potencial: area.valorPotencial || null,
      viavel_bts: area.viavelBts,
      viavel_strip_mall: area.viavelStripMall,
      viavel_sale_leaseback: area.viavelSaleLeaseback,
      prioridade: area.prioridade,
      origem: area.origem || null,
      observacoes: area.observacoes || null
    })
    .select()
    .single();

  if (error) throw error;
  const pipelineResult = await client
    .from("land_bank_pipeline")
    .upsert({
      area_id: data.id,
      empreendimento_id: area.empreendimentoId,
      etapa: area.etapa,
      titulo: area.nome,
      valor_potencial: area.valorPotencial || null,
      proxima_acao: area.proximaAcao || null,
      data_proxima_acao: area.dataProximaAcao || null,
      metadata: {
        responsavel: area.responsavel,
        origem: area.origem,
        classificacao: area.classificacao,
        score: area.score
      }
    }, { onConflict: "area_id" })
    .select()
    .single();

  if (pipelineResult.error && !isMissingRelationError(pipelineResult.error)) throw pipelineResult.error;
  const scoreValue = Math.max(0, Math.min(100, Math.round(area.score)));
  const scoreResult = await client
    .from("land_bank_scores")
    .insert({
      area_id: data.id,
      empreendimento_id: area.empreendimentoId,
      fluxo_score: scoreValue,
      renda_score: scoreValue,
      densidade_score: scoreValue,
      concorrencia_score: scoreValue,
      acesso_score: scoreValue,
      visibilidade_score: scoreValue,
      urbanistico_score: scoreValue,
      score_total: scoreValue,
      classificacao: normalizeLandBankScoreClassification(area.classificacao, scoreValue),
      confidence_score: 70,
      fontes: ["nexa-os"],
      premissas: {
        classificacao_operacional: area.classificacao,
        score_operacional: area.score
      },
      calculado_por: "nexa-os"
    })
    .select()
    .single();

  if (scoreResult.error && !isMissingRelationError(scoreResult.error)) throw scoreResult.error;
  const ownerData = await saveLandBankOwner(client, data.id, area);
  const mapped = mapLandBankAreaRow(data, pipelineResult.data ?? null, scoreResult.data ?? null, ownerData);

  return {
    ...mapped,
    responsavel: area.responsavel,
    contatoNome: area.contatoNome,
    contatoTipo: area.contatoTipo,
    contatoTelefone: area.contatoTelefone,
    contatoWhatsapp: area.contatoWhatsapp,
    contatoEmail: area.contatoEmail,
    proximaAcao: area.proximaAcao,
    dataProximaAcao: area.dataProximaAcao,
    score: area.score,
    classificacao: area.classificacao,
    etapa: area.etapa
  };
}

function isMissingRelationError(error: { code?: string; message?: string }) {
  return error.code === "42P01" || /does not exist/i.test(error.message ?? "");
}

function latestLandScoresByArea(rows: any[]) {
  const scoresByArea = new Map<string, any>();

  for (const row of rows) {
    if (!scoresByArea.has(row.area_id)) {
      scoresByArea.set(row.area_id, row);
    }
  }

  return scoresByArea;
}

function landOwnersByArea(owners: any[], links: any[]) {
  const ownersById = new Map<string, any>(owners.map((owner) => [owner.id, owner]));
  const ownersByArea = new Map<string, any>();

  for (const link of links) {
    const owner = ownersById.get(link.proprietario_id);
    if (owner && !ownersByArea.has(link.area_id)) {
      ownersByArea.set(link.area_id, owner);
    }
  }

  return ownersByArea;
}

async function saveLandBankOwner(client: any, areaId: string, area: LandBankArea) {
  if (!area.contatoNome.trim()) {
    return null;
  }

  const payload = {
    empreendimento_id: area.empreendimentoId,
    nome: area.contatoNome,
    telefone: area.contatoTelefone || null,
    whatsapp: area.contatoWhatsapp || null,
    email: area.contatoEmail || null,
    tipo: area.contatoTipo,
    observacoes: `Contato principal da area ${area.codigo}`
  };

  const existingLink = await client
    .from("land_bank_area_proprietarios")
    .select("proprietario_id")
    .eq("area_id", areaId)
    .order("principal", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingLink.error) {
    if (isMissingRelationError(existingLink.error)) return null;
    throw existingLink.error;
  }

  if (existingLink.data?.proprietario_id) {
    const ownerResult = await client
      .from("land_bank_proprietarios")
      .update(payload)
      .eq("id", existingLink.data.proprietario_id)
      .select()
      .single();

    if (ownerResult.error) {
      if (isMissingRelationError(ownerResult.error)) return null;
      throw ownerResult.error;
    }

    return ownerResult.data;
  }

  const ownerResult = await client
    .from("land_bank_proprietarios")
    .insert(payload)
    .select()
    .single();

  if (ownerResult.error) {
    if (isMissingRelationError(ownerResult.error)) return null;
    throw ownerResult.error;
  }

  const linkResult = await client
    .from("land_bank_area_proprietarios")
    .insert({
      area_id: areaId,
      proprietario_id: ownerResult.data.id,
      empreendimento_id: area.empreendimentoId,
      percentual_posse: 100,
      papel: area.contatoTipo,
      principal: true
    });

  if (linkResult.error && !isMissingRelationError(linkResult.error)) throw linkResult.error;

  return ownerResult.data;
}

function normalizeLandBankScoreClassification(classificacao: string, score: number) {
  const value = classificacao.toLowerCase().trim();
  if (["excelente", "boa", "media", "baixa", "descartar"].includes(value)) return value;
  if (score >= 85) return "excelente";
  if (score >= 70) return "boa";
  if (score >= 50) return "media";
  if (score >= 35) return "baixa";
  return "descartar";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
