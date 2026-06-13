import type { SupabaseClient } from "@supabase/supabase-js";
import type { AssetAnalytics } from "@/lib/types";

export function emptyAnalytics(): AssetAnalytics {
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

export async function fetchDashboardAnalytics(client: SupabaseClient<any>): Promise<AssetAnalytics> {
  try {
    const [occupancyResult, financialResult, alertsResult] = await Promise.all([
      client.from("vw_ocupacao_consolidada").select("*").maybeSingle(),
      client.from("vw_kpis_financeiro").select("*").maybeSingle(),
      client.from("vw_central_alertas").select("*").order("severidade", { ascending: true }).order("dias", { ascending: true })
    ]);

    const failed = [occupancyResult, financialResult, alertsResult].find((result) => result.error);

    if (failed?.error) {
      return { ...emptyAnalytics(), error: failed.error.message };
    }

    return {
      ...emptyAnalytics(),
      occupancy: occupancyResult.data ? mapOccupancyConsolidated(occupancyResult.data) : null,
      financialKpis: financialResult.data ? mapFinancialKpis(financialResult.data) : null,
      centralAlerts: (alertsResult.data ?? []).map(mapCentralAlert)
    };
  } catch (error) {
    return { ...emptyAnalytics(), error: error instanceof Error ? error.message : "Falha ao carregar views do dashboard." };
  }
}

export async function fetchAssetAnalytics(client: SupabaseClient<any>): Promise<AssetAnalytics> {
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
