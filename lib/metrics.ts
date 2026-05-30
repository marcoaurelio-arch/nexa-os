import { enterprises, revenues, stores } from "./data";
import type { Enterprise, Store } from "./types";

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
  storeRows: Store[] = stores
) {
  const selectedEnterprises =
    enterpriseId === "all"
      ? enterpriseRows
      : enterpriseRows.filter((enterprise) => enterprise.id === enterpriseId);
  const selectedEnterpriseIds = new Set(selectedEnterprises.map((item) => item.id));
  const selectedStores = storeRows.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedRevenues = revenues.filter((revenue) => selectedEnterpriseIds.has(revenue.empreendimentoId));

  const totalAbl = selectedEnterprises.reduce((sum, item) => sum + item.abl, 0);
  const occupiedAbl = selectedStores
    .filter((store) => store.status === "ocupada")
    .reduce((sum, store) => sum + store.areaTotal, 0);
  const availableAbl = Math.max(totalAbl - occupiedAbl, 0);
  const potentialRevenue = selectedStores.reduce((sum, store) => sum + store.aluguel, 0);
  const lostRevenue = selectedStores
    .filter((store) => store.status !== "ocupada")
    .reduce((sum, store) => sum + store.aluguel, 0);

  const revenue = selectedRevenues.reduce(
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

  return {
    totalEmpreendimentos: selectedEnterprises.length,
    totalLojas: selectedStores.length,
    totalAbl,
    occupiedAbl,
    availableAbl,
    occupancyRate: totalAbl > 0 ? occupiedAbl / totalAbl : 0,
    physicalVacancyRate: totalAbl > 0 ? availableAbl / totalAbl : 0,
    financialVacancyRate: potentialRevenue > 0 ? lostRevenue / potentialRevenue : 0,
    lojasDisponiveis: selectedStores.filter((store) => store.status === "disponivel").length,
    lojasNegociacao: selectedStores.filter((store) => store.status === "negociacao").length,
    propostasEnviadas: 14,
    contratosElaboracao: 5,
    receitaTotal: revenue.aluguel + revenue.condominio + revenue.fundo + revenue.fpp,
    saldoOperacional: revenue.aluguel + revenue.condominio + revenue.fundo + revenue.fpp - revenue.pagar,
    ...revenue
  };
}

export function chartRows(enterpriseRows: Enterprise[] = enterprises, storeRows: Store[] = stores) {
  return enterpriseRows.map((enterprise) => {
    const enterpriseRevenue = revenues.find((item) => item.empreendimentoId === enterprise.id);
    const enterpriseStores = storeRows.filter((store) => store.empreendimentoId === enterprise.id);
    const occupiedArea = enterpriseStores
      .filter((store) => store.status === "ocupada")
      .reduce((sum, store) => sum + store.areaTotal, 0);

    return {
      name: enterprise.nome.replace("Bluemall ", "BM "),
      receita: enterpriseRevenue
        ? enterpriseRevenue.aluguel + enterpriseRevenue.condominio + enterpriseRevenue.fundo + enterpriseRevenue.fpp
        : 0,
      ocupacao: enterprise.abl > 0 ? Math.round((occupiedArea / enterprise.abl) * 100) : 0,
      vacancia: enterprise.abl > 0 ? Math.round(((enterprise.abl - occupiedArea) / enterprise.abl) * 100) : 0
    };
  });
}
