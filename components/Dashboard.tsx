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
import type { Contract, Enterprise, ServiceOrder, Store, Tenant } from "@/lib/types";

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

function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-base font-bold leading-6">{title}</h2>
      {action ? <button className="text-xs font-semibold text-primary">{action}</button> : null}
    </div>
  );
}

export function Dashboard({
  enterpriseRows = enterprises,
  storeRows,
  tenantRows = tenants,
  contractRows = contracts,
  serviceOrderRows = serviceOrders
}: {
  enterpriseRows?: Enterprise[];
  storeRows: Store[];
  tenantRows?: Tenant[];
  contractRows?: Contract[];
  serviceOrderRows?: ServiceOrder[];
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const metrics = useMemo(() => getDashboardMetrics(enterpriseId, enterpriseRows, storeRows), [enterpriseId, enterpriseRows, storeRows]);
  const filteredOrders = filterByEnterprise(serviceOrderRows, enterpriseId);
  const filteredAlerts = filterByEnterprise(buildContractAlerts(contractRows, storeRows, tenantRows), enterpriseId);
  const charts = chartRows(enterpriseRows, storeRows);

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
            <button className="control inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Maio/2026
            </button>
            <button className="control inline-flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground">
              <Plus className="h-4 w-4" />
              Novo registro
            </button>
          </div>
        </div>
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
            <SectionTitle title="Receita imobiliaria" action="Ver financeiro" />
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">
              <MetricCard label="Aluguel" value={brl(metrics.aluguel)} />
              <MetricCard label="Condominio" value={brl(metrics.condominio)} />
              <MetricCard label="Fundo" value={brl(metrics.fundo)} />
              <MetricCard label="FPP" value={brl(metrics.fpp)} />
              <MetricCard label="Total" value={brl(metrics.receitaTotal)} tone="success" />
            </div>
          </div>
          <div className="panel p-4">
            <SectionTitle title="Financeiro" action="Exportar" />
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
            <SectionTitle title="Receita por empreendimento" action="Detalhar" />
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
            <SectionTitle title="Ocupacao x vacancia" action="Ver ranking" />
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
                <button className="control inline-flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </button>
                <button className="control inline-flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  CSV
                </button>
              </div>
            </div>
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
                  {filteredAlerts.map((alert) => (
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
                  {filteredOrders.slice(0, 3).map((order) => (
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
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppViewport>
  );
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
