import { enterprises, revenues, stores } from "./data";
import type { AssetAnalytics, CommercialLead, Enterprise, Payable, Receivable, Store } from "./types";

export function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(value);
}

export function numberPt(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function percent(value: number) {
  return `${(value * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: 1
  })}%`;
}

export function filterByEnterprise<T extends { empreendimentoId: string }>(
  rows: T[],
  enterpriseId: string
) {
  if (enterpriseId === "all") return rows;
  return rows.filter((row) => row.empreendimentoId === enterpriseId);
}

export function getDashboardMetrics(
  enterpriseId: string,
  enterpriseRows: Enterprise[] = enterprises,
  storeRows: Store[] = stores,
  receivableRows?: Receivable[],
  payableRows?: Payable[],
  analytics?: AssetAnalytics | null,
  commercialLeadRows?: CommercialLead[]
) {
  const selectedEnterprises =
    enterpriseId === "all"
      ? enterpriseRows
      : enterpriseRows.filter((enterprise) => enterprise.id === enterpriseId);
  const selectedEnterpriseIds = new Set(selectedEnterprises.map((item) => item.id));
  const selectedStores = storeRows.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedRevenues = revenues.filter((revenue) => selectedEnterpriseIds.has(revenue.empreendimentoId));
  const selectedReceivables = receivableRows?.filter((receivable) => selectedEnterpriseIds.has(receivable.empreendimentoId) && receivable.status !== "cancelado") ?? [];
  const selectedPayables = payableRows?.filter((payable) => selectedEnterpriseIds.has(payable.empreendimentoId) && payable.status !== "cancelado") ?? [];
  const selectedCommercialLeads = commercialLeadRows?.filter((lead) => selectedEnterpriseIds.has(lead.empreendimentoId)) ?? [];

  const totalAbl = selectedEnterprises.reduce((sum, item) => sum + item.abl, 0);
  const occupiedAbl = selectedStores
    .filter((store) => store.status === "ocupada")
    .reduce((sum, store) => sum + store.areaTotal, 0);
  const availableAbl = Math.max(totalAbl - occupiedAbl, 0);
  const potentialRevenue = selectedStores.reduce((sum, store) => sum + store.aluguel, 0);
  const lostRevenue = selectedStores
    .filter((store) => store.status !== "ocupada")
    .reduce((sum, store) => sum + store.aluguel, 0);

  const revenue = receivableRows
    ? {
        aluguel: selectedReceivables.filter((item) => item.receita === "aluguel").reduce((sum, item) => sum + item.valor, 0),
        condominio: selectedReceivables.filter((item) => item.receita === "condominio").reduce((sum, item) => sum + item.valor, 0),
        fundo: selectedReceivables.filter((item) => item.receita === "fundo_promocao").reduce((sum, item) => sum + item.valor, 0),
        fpp: selectedReceivables.filter((item) => item.receita === "fpp").reduce((sum, item) => sum + item.valor, 0),
        vencidas: selectedReceivables.filter((item) => item.status === "vencido").reduce((sum, item) => sum + item.valor, 0),
        receber: selectedReceivables.filter((item) => item.status === "aberto" || item.status === "vencido").reduce((sum, item) => sum + item.valor, 0),
        pagar: selectedPayables.filter((item) => item.status === "aberto" || item.status === "vencido").reduce((sum, item) => sum + item.valor, 0)
      }
    : selectedRevenues.reduce(
        (acc, item) => ({
          aluguel: acc.aluguel + item.aluguel,
          condominio: acc.condominio + item.condominio,
          fundo: acc.fundo + item.fundo,
          fpp: acc.fpp + item.fpp,
          vencidas: acc.vencidas + item.vencidas,
          receber: acc.receber + item.receber,
          pagar: acc.pagar + item.pagar
        }),
        { aluguel: 0, condominio: 0, fundo: 0, fpp: 0, vencidas: 0, receber: 0, pagar: 0 }
      );
  const canonicalOccupancy =
    enterpriseId === "all"
      ? analytics?.occupancy
      : analytics?.occupancyByEnterprise.find((item) => item.empreendimentoId === enterpriseId) ?? null;
  const canonicalFinance = enterpriseId === "all" ? analytics?.financialKpis : null;
  const canonicalTotalAbl = canonicalOccupancy?.ablTotalM2 ?? totalAbl;
  const canonicalOccupiedAbl = canonicalOccupancy?.ablOcupadaM2 ?? occupiedAbl;
  const canonicalAvailableAbl = Math.max(canonicalTotalAbl - canonicalOccupiedAbl, 0);
  const canonicalOccupancyPct: number = canonicalOccupancy && "ocupacaoAblPct" in canonicalOccupancy
    ? Number(canonicalOccupancy.ocupacaoAblPct)
    : canonicalOccupancy?.ocupacaoPct ?? 0;
  const canonicalOccupancyRate = canonicalOccupancy
    ? pctToRatio(canonicalOccupancyPct)
    : canonicalTotalAbl > 0
      ? canonicalOccupiedAbl / canonicalTotalAbl
      : 0;
  const aluguel = canonicalFinance?.totalAluguel ?? revenue.aluguel;
  const condominio = canonicalFinance?.totalCondominio ?? revenue.condominio;
  const fundo = canonicalFinance?.totalFundoPromocao ?? revenue.fundo;
  const fpp = revenue.fpp;
  const receber = canonicalFinance?.contasAReceber ?? revenue.receber;
  const vencidas = canonicalFinance?.contasVencidas ?? revenue.vencidas;

  return {
    totalEmpreendimentos: selectedEnterprises.length,
    totalLojas: canonicalOccupancy?.totalLojas ?? selectedStores.length,
    totalAbl: canonicalTotalAbl,
    occupiedAbl: canonicalOccupiedAbl,
    availableAbl: canonicalAvailableAbl,
    occupancyRate: canonicalOccupancyRate,
    physicalVacancyRate: canonicalTotalAbl > 0 ? canonicalAvailableAbl / canonicalTotalAbl : 0,
    financialVacancyRate: potentialRevenue > 0 ? lostRevenue / potentialRevenue : 0,
    lojasDisponiveis: selectedStores.filter((store) => store.status === "disponivel").length,
    lojasNegociacao: selectedStores.filter((store) => store.status === "negociacao").length,
    propostasEnviadas: selectedCommercialLeads.filter((lead) => lead.etapa === "proposta").length,
    contratosElaboracao: selectedCommercialLeads.filter((lead) => lead.etapa === "contrato").length,
    receitaTotal: aluguel + condominio + fundo + fpp,
    saldoOperacional: aluguel + condominio + fundo + fpp - revenue.pagar,
    ...revenue,
    aluguel,
    condominio,
    fundo,
    fpp,
    receber,
    vencidas
  };
}

export function chartRows(enterpriseRows: Enterprise[] = enterprises, storeRows: Store[] = stores, receivableRows?: Receivable[], analytics?: AssetAnalytics | null) {
  return enterpriseRows.map((enterprise) => {
    const enterpriseRevenue = revenues.find((item) => item.empreendimentoId === enterprise.id);
    const enterpriseReceivables = receivableRows?.filter((item) => item.empreendimentoId === enterprise.id && item.status !== "cancelado");
    const canonicalOccupancy = analytics?.occupancyByEnterprise.find((item) => item.empreendimentoId === enterprise.id);
    const enterpriseStores = storeRows.filter((store) => store.empreendimentoId === enterprise.id);
    const occupiedArea = enterpriseStores
      .filter((store) => store.status === "ocupada")
      .reduce((sum, store) => sum + store.areaTotal, 0);

    return {
      name: enterprise.nome.replace("Bluemall ", "BM "),
      receita: enterpriseReceivables
        ? enterpriseReceivables.reduce((sum, item) => sum + item.valor, 0)
        : enterpriseRevenue
        ? enterpriseRevenue.aluguel + enterpriseRevenue.condominio + enterpriseRevenue.fundo + enterpriseRevenue.fpp
        : 0,
      ocupacao: canonicalOccupancy ? Math.round(pctToRatio(canonicalOccupancy.ocupacaoAblPct) * 100) : enterprise.abl > 0 ? Math.round((occupiedArea / enterprise.abl) * 100) : 0,
      vacancia: canonicalOccupancy ? Math.round((1 - pctToRatio(canonicalOccupancy.ocupacaoAblPct)) * 100) : enterprise.abl > 0 ? Math.round(((enterprise.abl - occupiedArea) / enterprise.abl) * 100) : 0
    };
  });
}

export function pctToRatio(value: number) {
  return value > 1 ? value / 100 : value;
}
