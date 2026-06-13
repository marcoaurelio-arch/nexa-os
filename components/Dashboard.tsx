"use client";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Filter,
  Plus,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { buildContractAlerts } from "@/lib/contracts";
import { contracts, enterprises, serviceOrders, tenants } from "@/lib/data";
import { brl, chartRows, filterByEnterprise, getDashboardMetrics, numberPt, percent } from "@/lib/metrics";
import type { AssetAnalytics, CentralAlertView, CommercialLead, Contract, Enterprise, Payable, Receivable, ServiceOrder, Store, Tenant } from "@/lib/types";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

function MetricCard({ label, value, helper, tone = "default" }: MetricCardProps) {
  const toneClass = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger"
  }[tone];

  return (
    <div className="panel p-4">
      <div className="metric-label">{label}</div>
      <div className={`mt-2 whitespace-nowrap text-[1.35rem] font-bold leading-8 tracking-normal ${toneClass}`}>
        {value}
      </div>
      {helper ? <div className="mt-1 text-xs text-muted-foreground">{helper}</div> : null}
    </div>
  );
}

function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold leading-6">{title}</h2>
      {action ? (
        <button className="text-xs font-semibold text-primary" type="button" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}

export function Dashboard({
  enterpriseRows = enterprises,
  storeRows,
  tenantRows = tenants,
  contractRows = contracts,
  receivableRows,
  payableRows,
  serviceOrderRows = serviceOrders,
  commercialLeadRows,
  analytics,
  onNavigate
}: {
  enterpriseRows?: Enterprise[];
  storeRows: Store[];
  tenantRows?: Tenant[];
  contractRows?: Contract[];
  receivableRows?: Receivable[];
  payableRows?: Payable[];
  serviceOrderRows?: ServiceOrder[];
  commercialLeadRows?: CommercialLead[];
  analytics?: AssetAnalytics | null;
  onNavigate?: (module: string) => void;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [alertSearchOpen, setAlertSearchOpen] = useState(false);
  const [alertSearch, setAlertSearch] = useState("");
  const metrics = useMemo(() => getDashboardMetrics(enterpriseId, enterpriseRows, storeRows, receivableRows, payableRows, analytics, commercialLeadRows), [analytics, commercialLeadRows, enterpriseId, enterpriseRows, payableRows, receivableRows, storeRows]);
  const filteredOrders = filterByEnterprise(serviceOrderRows, enterpriseId);
  const filteredAlerts = filterByEnterprise(buildContractAlerts(contractRows, storeRows, tenantRows), enterpriseId);
  const selectedEnterpriseNames = new Set(
    (enterpriseId === "all" ? enterpriseRows : enterpriseRows.filter((enterprise) => enterprise.id === enterpriseId)).map((enterprise) => enterprise.nome)
  );
  const centralAlerts = (analytics?.centralAlerts ?? []).filter((alert) => enterpriseId === "all" || selectedEnterpriseNames.has(alert.empreendimento));
  const charts = chartRows(enterpriseRows, storeRows, receivableRows, analytics);
  const normalizedAlertSearch = alertSearch.trim().toLowerCase();
  const visibleCentralAlerts = centralAlerts.filter((alert) => matchesSearch([alert.tipo, alert.empreendimento, alert.referencia, alert.detalhe, alert.prazoData, alert.risco, alert.severidade], normalizedAlertSearch));
  const visibleContractAlerts = filteredAlerts.filter((alert) => matchesSearch([alert.loja, alert.lojista, alert.risco, `${alert.meses} meses`], normalizedAlertSearch));
  const visibleOrders = filteredOrders.filter((order) => matchesSearch([serviceOrderLocation(order, storeRows), serviceOrderCategoryLabel(order.categoria), order.prazo, order.prioridade], normalizedAlertSearch));

  return (
    <AppViewport>
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-7">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase leading-7 text-primary">Dashboard Executivo</h1>
            <p className="text-sm text-muted-foreground">Villa Viseu e carteira multiempreendimento Nexa Malls</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="enterprise">
              Empreendimento
            </label>
            <select
              id="enterprise"
              className="control min-w-[190px]"
              value={enterpriseId}
              onChange={(event) => setEnterpriseId(event.target.value)}
            >
              <option value="all">Todos os empreendimentos</option>
              {enterpriseRows.map((enterprise) => (
                <option key={enterprise.id} value={enterprise.id}>
                  {enterprise.nome}
                </option>
              ))}
            </select>
            <button className="control inline-flex items-center gap-2" type="button" onClick={() => setFiltersOpen((current) => !current)}>
              <CalendarDays className="h-4 w-4" />
              Maio/2026
            </button>
            <button className="control inline-flex items-center gap-2" type="button" onClick={() => setFiltersOpen((current) => !current)} aria-expanded={filtersOpen}>
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" type="button" onClick={() => onNavigate?.("Comercial")}>
              <Plus className="h-4 w-4" />
              Novo registro
            </button>
          </div>
        </div>
        {filtersOpen ? (
          <div className="mt-3 grid gap-3 rounded-lg border border-border bg-white p-3 text-sm shadow-sm md:grid-cols-3">
            <div>
              <div className="metric-label">Periodo</div>
              <div className="mt-1 font-semibold text-primary">Maio/2026</div>
            </div>
            <div>
              <div className="metric-label">Empreendimento</div>
              <div className="mt-1 font-semibold text-primary">
                {enterpriseId === "all" ? "Todos os empreendimentos" : enterpriseRows.find((enterprise) => enterprise.id === enterpriseId)?.nome ?? "Selecionado"}
              </div>
            </div>
            <div>
              <div className="metric-label">Fonte</div>
              <div className="mt-1 font-semibold text-primary">{analytics?.error ? "Supabase com alerta" : analytics ? "Supabase/views" : "Dados locais"}</div>
            </div>
          </div>
        ) : null}
      </header>

      <div className="space-y-6 px-4 py-5 lg:px-7">
        <section className="brand-angle grid gap-3 rounded-lg border border-primary bg-brand-dark p-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Empreendimentos" value={numberPt(metrics.totalEmpreendimentos)} helper="ativos e em implantacao" />
          <MetricCard label="Total de lojas" value={numberPt(metrics.totalLojas)} helper="unidades cadastradas" />
          <MetricCard label="ABL total" value={`${numberPt(metrics.totalAbl)} m2`} helper={`${numberPt(metrics.occupiedAbl)} m2 ocupados`} />
          <MetricCard label="Taxa de ocupacao" value={percent(metrics.occupancyRate)} helper={`${percent(metrics.physicalVacancyRate)} vacancia fisica`} tone="success" />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="panel p-4">
            <SectionTitle title="Receita imobiliaria" action="Ver financeiro" onAction={() => onNavigate?.("Financeiro")} />
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
              <MetricCard label="Aluguel" value={brl(metrics.aluguel)} />
              <MetricCard label="Condominio" value={brl(metrics.condominio)} />
              <MetricCard label="Fundo" value={brl(metrics.fundo)} />
              <MetricCard label="FPP" value={brl(metrics.fpp)} />
              <MetricCard label="Total" value={brl(metrics.receitaTotal)} tone="success" />
            </div>
          </div>
          <div className="panel p-4">
            <SectionTitle title="Financeiro" action="Exportar" onAction={() => exportDashboardCsv(metrics, enterpriseId, enterpriseRows)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="Contas a receber" value={brl(metrics.receber)} />
              <MetricCard label="Contas vencidas" value={brl(metrics.vencidas)} tone="danger" />
              <MetricCard label="Contas a pagar" value={brl(metrics.pagar)} />
              <MetricCard label="Saldo operacional" value={brl(metrics.saldoOperacional)} tone="success" />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <div className="panel min-h-[330px] p-4">
            <SectionTitle title="Receita por empreendimento" action="Detalhar" onAction={() => onNavigate?.("BI")} />
            <div className="h-[265px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts}>
                  <CartesianGrid stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                  <Tooltip formatter={(value) => brl(Number(value))} />
                  <Bar dataKey="receita" fill="#1E329B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="panel min-h-[330px] p-4">
            <SectionTitle title="Ocupacao x vacancia" action="Ver ranking" onAction={() => onNavigate?.("Vacancia")} />
            <div className="h-[265px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts}>
                  <CartesianGrid stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="ocupacao" stroke="#2B47B0" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="vacancia" stroke="#4FC3F7" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="panel p-4">
            <SectionTitle title="Operacao e comercial" />
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="OS abertas" value={numberPt(filteredOrders.filter((item) => item.status !== "concluida").length)} helper="manutencao e operacao" tone="warning" />
              <MetricCard label="Contratos vencendo" value={numberPt(filteredAlerts.length)} helper="24, 12, 6 e 3 meses" tone="danger" />
              <MetricCard label="Lojas disponiveis" value={numberPt(metrics.lojasDisponiveis)} helper="prontas para comercializacao" />
              <MetricCard label="Lojas em negociacao" value={numberPt(metrics.lojasNegociacao)} helper={`${metrics.propostasEnviadas} propostas enviadas`} />
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="text-base font-bold">Central de alertas</h2>
                <p className="text-xs text-muted-foreground">Contratos, inadimplencia, OS e divergencias</p>
              </div>
              <div className="flex gap-2">
                <button className="control inline-flex items-center gap-2" type="button" onClick={() => setAlertSearchOpen((current) => !current)} aria-expanded={alertSearchOpen}>
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
                <button className="control inline-flex items-center gap-2" type="button" onClick={() => exportAlertsCsv(visibleCentralAlerts, visibleContractAlerts, visibleOrders, storeRows)}>
                  <Download className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>
            {alertSearchOpen ? (
              <div className="border-b border-border p-4">
                <label className="sr-only" htmlFor="alert-search">Buscar alertas</label>
                <input
                  id="alert-search"
                  className="control w-full"
                  value={alertSearch}
                  onChange={(event) => setAlertSearch(event.target.value)}
                  placeholder="Buscar por tipo, ativo, referencia ou risco"
                />
              </div>
            ) : null}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead className="bg-muted text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Ativo</th>
                    <th className="px-4 py-3">Referencia</th>
                    <th className="px-4 py-3">Prazo</th>
                    <th className="px-4 py-3">Risco</th>
                  </tr>
                </thead>
                <tbody>
                  {centralAlerts.length ? visibleCentralAlerts.slice(0, 8).map((alert) => <CentralAlertRow key={`${alert.tipo}-${alert.referencia}-${alert.prazoData}`} alert={alert} />) : visibleContractAlerts.map((alert) => (
                    <tr key={alert.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          Contrato
                        </span>
                      </td>
                      <td className="px-4 py-3">{alert.loja}</td>
                      <td className="px-4 py-3">{alert.lojista}</td>
                      <td className="px-4 py-3">{alert.meses} meses</td>
                      <td className="px-4 py-3">
                        <RiskBadge risk={alert.risco} />
                      </td>
                    </tr>
                  ))}
                  {visibleOrders.slice(0, 3).map((order) => (
                    <tr key={order.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                          OS
                        </span>
                      </td>
                      <td className="px-4 py-3">{serviceOrderLocation(order, storeRows)}</td>
                      <td className="px-4 py-3">{serviceOrderCategoryLabel(order.categoria)}</td>
                      <td className="px-4 py-3">{order.prazo}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={order.prioridade} />
                      </td>
                    </tr>
                  ))}
                  {((centralAlerts.length ? visibleCentralAlerts.length : visibleContractAlerts.length) + visibleOrders.length) === 0 ? (
                    <tr className="border-t border-border">
                      <td className="px-4 py-6 text-sm text-muted-foreground" colSpan={5}>
                        Nenhum alerta encontrado.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppViewport>
  );
}

function matchesSearch(values: Array<string | number | null | undefined>, search: string) {
  if (!search) return true;
  return values.some((value) => String(value ?? "").toLowerCase().includes(search));
}

function exportDashboardCsv(metrics: ReturnType<typeof getDashboardMetrics>, enterpriseId: string, enterpriseRows: Enterprise[]) {
  const enterprise = enterpriseId === "all" ? "Todos os empreendimentos" : enterpriseRows.find((item) => item.id === enterpriseId)?.nome ?? "Selecionado";
  downloadCsv("nexa-os-dashboard-financeiro.csv", [
    {
      empreendimento: enterprise,
      aluguel: metrics.aluguel,
      condominio: metrics.condominio,
      fundo_promocao: metrics.fundo,
      fpp: metrics.fpp,
      receita_total: metrics.receitaTotal,
      contas_a_receber: metrics.receber,
      contas_vencidas: metrics.vencidas,
      contas_a_pagar: metrics.pagar,
      saldo_operacional: metrics.saldoOperacional
    }
  ]);
}

function exportAlertsCsv(
  centralAlerts: CentralAlertView[],
  contractAlerts: ReturnType<typeof buildContractAlerts>,
  orders: ServiceOrder[],
  stores: Store[]
) {
  const centralRows = centralAlerts.map((alert) => ({
    tipo: alert.tipo || "Alerta",
    ativo: alert.empreendimento,
    referencia: alert.referencia || alert.detalhe,
    prazo: alert.dias ? `${alert.dias} dias` : alert.prazoData,
    risco: alert.risco || alert.severidade
  }));
  const contractRows = contractAlerts.map((alert) => ({
    tipo: "Contrato",
    ativo: alert.loja,
    referencia: alert.lojista,
    prazo: `${alert.meses} meses`,
    risco: alert.risco
  }));
  const orderRows = orders.slice(0, 20).map((order) => ({
    tipo: "OS",
    ativo: serviceOrderLocation(order, stores),
    referencia: serviceOrderCategoryLabel(order.categoria),
    prazo: order.prazo,
    risco: order.prioridade
  }));

  downloadCsv("nexa-os-central-alertas.csv", [...centralRows, ...contractRows, ...orderRows]);
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [headers.join(";"), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(";"))].join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function RiskBadge({ risk }: { risk: "baixo" | "medio" | "alto" }) {
  const config = {
    baixo: { label: "Baixo", className: "bg-emerald-50 text-emerald-700", icon: ArrowDownRight },
    medio: { label: "Medio", className: "bg-amber-50 text-amber-700", icon: AlertTriangle },
    alto: { label: "Alto", className: "bg-red-50 text-red-700", icon: ArrowUpRight }
  }[risk];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function CentralAlertRow({ alert }: { alert: CentralAlertView }) {
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2 font-medium">
          <AlertTriangle className={alert.severidade === "critica" ? "h-4 w-4 text-danger" : "h-4 w-4 text-warning"} />
          {alert.tipo || "Alerta"}
        </span>
      </td>
      <td className="px-4 py-3">{alert.empreendimento}</td>
      <td className="px-4 py-3">{alert.referencia || alert.detalhe}</td>
      <td className="px-4 py-3">{alert.dias ? `${numberPt(alert.dias)} dias` : alert.prazoData}</td>
      <td className="px-4 py-3">
        <RiskBadge risk={normalizeRisk(alert.risco || alert.severidade)} />
      </td>
    </tr>
  );
}

function normalizeRisk(value: string): "baixo" | "medio" | "alto" {
  const normalized = value.toLowerCase();
  if (normalized.includes("alto") || normalized.includes("crit")) return "alto";
  if (normalized.includes("medio") || normalized.includes("médio") || normalized.includes("aten")) return "medio";
  return "baixo";
}

function PriorityBadge({ priority }: { priority: "baixa" | "media" | "alta" | "critica" }) {
  const className =
    priority === "critica"
      ? "bg-red-50 text-red-700"
      : priority === "alta"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return <span className={`rounded-md px-2 py-1 text-xs font-semibold ${className}`}>{priority}</span>;
}

function serviceOrderLocation(order: ServiceOrder, stores: Store[]) {
  const store = stores.find((item) => item.id === order.lojaId);
  return store ? `${store.codigo} - ${store.nome}` : order.local;
}

function serviceOrderCategoryLabel(category: ServiceOrder["categoria"]) {
  const labels: Record<ServiceOrder["categoria"], string> = {
    eletrica: "Eletrica",
    hidraulica: "Hidraulica",
    civil: "Civil",
    limpeza: "Limpeza",
    seguranca: "Seguranca",
    jardinagem: "Jardinagem",
    comunicacao_visual: "Comunicacao visual",
    ar_condicionado: "Ar condicionado"
  };

  return labels[category];
}

function AppViewport({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen min-w-0">{children}</div>;
}
