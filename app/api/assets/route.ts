import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
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
import { validateAppUser } from "@/lib/supabase/server-auth";
import type { Database } from "@/lib/supabase/types";
import type { AssetAnalytics } from "@/lib/types";

export async function GET(request: Request) {
  const auth = await validateAppUser(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const client = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;
  const enterpriseIds = auth.profile?.enterpriseIds ?? null;

  if (auth.required && enterpriseIds && enterpriseIds.length === 0) {
    return NextResponse.json({
      enterprises: [],
      stores: [],
      tenants: [],
      contracts: [],
      receivables: [],
      payables: [],
      delinquencyRecords: [],
      fppRecords: [],
      revenueAuditRecords: [],
      commercialLeads: [],
      vacancyRecords: [],
      utilityReadings: [],
      serviceOrders: [],
      documentRecords: [],
      legalCases: [],
      landBankAreas: [],
      analytics: emptyAnalytics()
    });
  }

  const scope = (query: any, column = "empreendimento_id") => {
    return enterpriseIds ? query.in(column, enterpriseIds) : query;
  };

  const [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult, landBankResult] = await Promise.all([
    scope(client.from("empreendimentos").select("*").is("deleted_at", null), "id").order("nome", { ascending: true }),
    scope(client.from("lojas").select("*").is("deleted_at", null)).order("codigo", { ascending: true }),
    scope(client.from("lojistas").select("*").is("deleted_at", null)).order("nome_fantasia", { ascending: true }),
    scope(client.from("contratos").select("*").is("deleted_at", null)).order("data_termino", { ascending: true }),
    scope(client.from("receitas").select("*").is("deleted_at", null)).order("vencimento", { ascending: true }),
    scope(client.from("despesas").select("*").is("deleted_at", null)).order("vencimento", { ascending: true }),
    client.from("inadimplencias").select("*").is("deleted_at", null).order("dias_atraso", { ascending: false }),
    scope(client.from("fpp").select("*").is("deleted_at", null)).order("competencia", { ascending: false }),
    scope(client.from("auditoria_faturamento").select("*").is("deleted_at", null)).order("competencia", { ascending: false }),
    scope(client.from("comercial_leads").select("*").is("deleted_at", null)).order("data_proxima_acao", { ascending: true }),
    scope(client.from("vacancia").select("*").is("deleted_at", null)).order("inicio_vacancia", { ascending: true }),
    scope(client.from("consumos").select("*").is("deleted_at", null)).order("competencia", { ascending: false }),
    scope(client.from("ordens_servico").select("*").is("deleted_at", null)).order("prazo", { ascending: true }),
    scope(client.from("documentos").select("*").is("deleted_at", null)).order("vencimento", { ascending: true }),
    scope(client.from("juridico").select("*").is("deleted_at", null)).order("prazo", { ascending: true }),
    scope(client.from("land_bank_areas").select("*").is("deleted_at", null)).order("prioridade", { ascending: true })
  ]);

  const failed = [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult].find((result) => result.error);

  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  if (landBankResult.error && !isMissingRelationError(landBankResult.error)) {
    return NextResponse.json({ error: landBankResult.error.message }, { status: 500 });
  }

  const scopedStoreIds = new Set((storeResult.data ?? []).map((store: { id: string }) => store.id));
  const delinquencyRows = enterpriseIds
    ? (delinquencyResult.data ?? []).filter((row: { loja_id: string }) => scopedStoreIds.has(row.loja_id))
    : delinquencyResult.data;
  const analytics = await fetchAnalytics({ url, anonKey, serviceKey, accessToken: auth.accessToken, required: auth.required });

  return NextResponse.json({
    enterprises: enterpriseResult.data.map(mapEnterpriseRow),
    stores: storeResult.data.map(mapStoreRow),
    tenants: tenantResult.data.map(mapTenantRow),
    contracts: contractResult.data.map(mapContractRow),
    receivables: receivableResult.data.map(mapReceivableRow),
    payables: payableResult.data.map(mapPayableRow),
    delinquencyRecords: delinquencyRows.map(mapDelinquencyRow),
    fppRecords: fppResult.data.map(mapFppRow),
    revenueAuditRecords: auditResult.data.map(mapRevenueAuditRow),
    commercialLeads: commercialResult.data.map(mapCommercialLeadRow),
    vacancyRecords: vacancyResult.data.map(mapVacancyRow),
    utilityReadings: utilityResult.data.map(mapUtilityReadingRow),
    serviceOrders: serviceOrderResult.data.map(mapServiceOrderRow),
    documentRecords: documentResult.data.map(mapDocumentRow),
    legalCases: legalResult.data.map(mapLegalCaseRow),
    landBankAreas: (landBankResult.data ?? []).map(mapLandBankAreaRow),
    analytics
  });
}

function isMissingRelationError(error: { code?: string; message?: string }) {
  return error.code === "42P01" || /does not exist/i.test(error.message ?? "");
}

async function fetchAnalytics({
  url,
  anonKey,
  serviceKey,
  accessToken,
  required
}: {
  url: string;
  anonKey?: string;
  serviceKey: string;
  accessToken?: string;
  required: boolean;
}): Promise<AssetAnalytics> {
  const key = required && accessToken && anonKey ? anonKey : serviceKey;
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined
  }) as any;

  try {
    const [
      occupancyResult,
      occupancyByEnterpriseResult,
      financialResult,
      agingResult,
      contractsResult,
      pipelineResult,
      alertsResult
    ] = await Promise.all([
      client.from("vw_ocupacao_consolidada").select("*").maybeSingle(),
      client.from("vw_ocupacao_empreendimento").select("*").order("nome", { ascending: true }),
      client.from("vw_kpis_financeiro").select("*").maybeSingle(),
      client.from("vw_aging_inadimplencia").select("*").maybeSingle(),
      client.from("vw_contratos_vencendo").select("*").order("dias_para_vencer", { ascending: true }),
      client.from("vw_pipeline_comercial").select("*").order("etapa", { ascending: true }),
      client.from("vw_central_alertas").select("*").order("severidade", { ascending: true }).order("dias", { ascending: true })
    ]);

    const failed = [
      occupancyResult,
      occupancyByEnterpriseResult,
      financialResult,
      agingResult,
      contractsResult,
      pipelineResult,
      alertsResult
    ].find((result) => result.error);

    if (failed?.error) {
      return { ...emptyAnalytics(), error: failed.error.message };
    }

    return {
      occupancy: occupancyResult.data ? mapOccupancyConsolidated(occupancyResult.data) : null,
      occupancyByEnterprise: (occupancyByEnterpriseResult.data ?? []).map(mapOccupancyEnterprise),
      financialKpis: financialResult.data ? mapFinancialKpis(financialResult.data) : null,
      delinquencyAging: agingResult.data ? mapDelinquencyAging(agingResult.data) : null,
      expiringContracts: (contractsResult.data ?? []).map(mapContractExpiring),
      commercialPipeline: (pipelineResult.data ?? []).map(mapCommercialPipeline),
      centralAlerts: (alertsResult.data ?? []).map(mapCentralAlert)
    };
  } catch (error) {
    return { ...emptyAnalytics(), error: error instanceof Error ? error.message : "Falha ao carregar views analiticas." };
  }
}

function emptyAnalytics(): AssetAnalytics {
  return {
    occupancy: null,
    occupancyByEnterprise: [],
    financialKpis: null,
    delinquencyAging: null,
    expiringContracts: [],
    commercialPipeline: [],
    centralAlerts: []
  };
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function mapOccupancyConsolidated(row: any) {
  return {
    totalLojas: toNumber(row.total_lojas),
    lojasOcupadas: toNumber(row.lojas_ocupadas),
    lojasVagas: toNumber(row.lojas_vagas),
    ocupacaoPct: toNumber(row.ocupacao_pct),
    ablTotalM2: toNumber(row.abl_total_m2),
    ablOcupadaM2: toNumber(row.abl_ocupada_m2)
  };
}

function mapOccupancyEnterprise(row: any) {
  return {
    ...mapOccupancyConsolidated(row),
    empreendimentoId: row.empreendimento_id ?? "",
    nome: row.nome ?? "",
    ocupacaoLojasPct: toNumber(row.ocupacao_lojas_pct ?? row.ocupacao_pct),
    ocupacaoAblPct: toNumber(row.ocupacao_abl_pct ?? row.ocupacao_pct)
  };
}

function mapFinancialKpis(row: any) {
  return {
    contasAReceber: toNumber(row.contas_a_receber),
    contasVencidas: toNumber(row.contas_vencidas),
    recebido: toNumber(row.recebido),
    totalAluguel: toNumber(row.total_aluguel),
    totalCondominio: toNumber(row.total_condominio),
    totalFundoPromocao: toNumber(row.total_fundo_promocao)
  };
}

function mapDelinquencyAging(row: any) {
  return {
    casos: toNumber(row.casos),
    total: toNumber(row.total),
    faixa0A5: toNumber(row.faixa_0_5),
    faixa6A15: toNumber(row.faixa_6_15),
    faixa16A30: toNumber(row.faixa_16_30),
    faixa31A60: toNumber(row.faixa_31_60),
    faixa61A90: toNumber(row.faixa_61_90),
    faixa90Mais: toNumber(row.faixa_90_mais),
    maiorAtrasoDias: toNumber(row.maior_atraso_dias)
  };
}

function mapContractExpiring(row: any) {
  return {
    id: row.id ?? "",
    status: row.status ?? "",
    dataTermino: row.data_termino ?? "",
    lojaCodigo: row.loja_codigo ?? "",
    lojista: row.lojista ?? "",
    empreendimento: row.empreendimento ?? "",
    aluguelMinimo: toNumber(row.aluguel_minimo),
    diasParaVencer: toNumber(row.dias_para_vencer),
    receitaAnualEmRisco: toNumber(row.receita_anual_em_risco)
  };
}

function mapCommercialPipeline(row: any) {
  return {
    etapa: row.etapa ?? "",
    oportunidades: toNumber(row.oportunidades),
    valorTotal: toNumber(row.valor_total)
  };
}

function mapCentralAlert(row: any) {
  return {
    tipo: row.tipo ?? "",
    empreendimento: row.empreendimento ?? "",
    referencia: row.referencia ?? "",
    detalhe: row.detalhe ?? "",
    prazoData: row.prazo_data ?? "",
    dias: toNumber(row.dias),
    valor: toNumber(row.valor),
    risco: row.risco ?? "",
    severidade: row.severidade ?? ""
  };
}
