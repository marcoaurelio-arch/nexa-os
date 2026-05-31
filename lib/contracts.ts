import type { Contract, ContractAlert, Store, Tenant } from "@/lib/types";

export function buildContractAlerts(contracts: Contract[], stores: Store[], tenants: Tenant[]): ContractAlert[] {
  const today = new Date();

  return contracts
    .map((contract) => {
      const monthsUntil = monthsBetween(today, new Date(`${contract.dataTermino}T00:00:00`));
      const alertWindow = contractAlertWindow(monthsUntil);
      const store = stores.find((item) => item.id === contract.lojaId);

      if (!alertWindow) return null;

      return {
        id: `alert-${contract.id}`,
        empreendimentoId: store?.empreendimentoId ?? "",
        loja: store ? `${store.codigo} - ${store.nome}` : "-",
        lojista: tenants.find((item) => item.id === contract.lojistaId)?.nomeFantasia ?? "-",
        meses: alertWindow,
        vencimento: contract.dataTermino,
        risco: alertWindow <= 3 ? "alto" : alertWindow <= 6 ? "medio" : "baixo"
      } satisfies ContractAlert;
    })
    .filter((alert): alert is ContractAlert => Boolean(alert));
}

function monthsBetween(start: Date, end: Date) {
  const fullMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  return end.getDate() >= start.getDate() ? fullMonths : fullMonths - 1;
}

function contractAlertWindow(monthsUntil: number): ContractAlert["meses"] | null {
  if (monthsUntil < 0) return null;
  if (monthsUntil <= 3) return 3;
  if (monthsUntil <= 6) return 6;
  if (monthsUntil <= 12) return 12;
  if (monthsUntil <= 24) return 24;
  return null;
}
