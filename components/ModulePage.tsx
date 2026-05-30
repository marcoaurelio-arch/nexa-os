"use client";

import { AlertTriangle, Building2, Mail, Phone, Plus, Search, Users, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { contractAlerts, serviceOrders, tenants as seedTenants } from "@/lib/data";
import { brl, numberPt, percent } from "@/lib/metrics";
import type { Enterprise, Store as StoreType, Tenant, TenantStatus } from "@/lib/types";

type ModulePageProps = {
  module: string;
  enterprises: Enterprise[];
  stores: StoreType[];
  dataSource: "mock" | "supabase";
  syncError: string | null;
  onResetLocalData: () => void;
  onSaveEnterprise: (enterprise: Enterprise) => void | Promise<void>;
  onSaveStore: (store: StoreType) => void | Promise<void>;
};

const statusLabel: Record<string, string> = {
  ocupada: "Ocupada",
  disponivel: "Disponivel",
  negociacao: "Negociacao",
  implantacao: "Implantacao",
  em_obra: "Em obra",
  inativa: "Inativa"
};

const tenantStatusLabel: Record<TenantStatus, string> = {
  ativo: "Ativo",
  implantacao: "Implantacao",
  inadimplente: "Inadimplente",
  inativo: "Inativo"
};

const enterpriseSchema = z.object({
  id: z.string().min(1),
  nome: z.string().trim().min(2, "Informe o nome do empreendimento."),
  cidade: z.string().trim().min(2, "Informe a cidade."),
  estado: z.string().trim().length(2, "Use a sigla do estado com 2 letras.").transform((value) => value.toUpperCase()),
  status: z.enum(["ativo", "implantacao", "planejado"]),
  abl: z.coerce.number().min(1, "Informe uma ABL maior que zero."),
  lojas: z.coerce.number().int("Use um numero inteiro.").min(1, "Informe ao menos uma loja."),
  vagas: z.coerce.number().int("Use um numero inteiro.").min(0, "Informe zero ou mais vagas."),
  responsavel: z.string().trim().min(2, "Informe o responsavel.")
});

const storeSchema = z.object({
  id: z.string().min(1),
  codigo: z.string().trim().min(2, "Informe o codigo da loja."),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  nome: z.string().trim().min(2, "Informe o nome da loja."),
  segmento: z.string().trim().min(2, "Informe o segmento."),
  status: z.enum(["ocupada", "disponivel", "negociacao", "implantacao", "em_obra", "inativa"]),
  areaTotal: z.coerce.number().min(1, "Informe uma area maior que zero."),
  aluguel: z.coerce.number().min(0, "Informe zero ou mais."),
  condominio: z.coerce.number().min(0, "Informe zero ou mais."),
  fundo: z.coerce.number().min(0, "Informe zero ou mais.")
});

const tenantSchema = z.object({
  id: z.string().min(1),
  nomeFantasia: z.string().trim().min(2, "Informe o nome fantasia."),
  razaoSocial: z.string().trim().min(2, "Informe a razao social."),
  cnpj: z.string().trim().min(14, "Informe o CNPJ."),
  responsavelLegal: z.string().trim().min(2, "Informe o responsavel legal."),
  telefone: z.string().trim().min(8, "Informe o telefone."),
  whatsapp: z.string().trim().min(8, "Informe o WhatsApp."),
  email: z.string().trim().email("Informe um e-mail valido."),
  endereco: z.string().trim().min(4, "Informe o endereco."),
  segmento: z.string().trim().min(2, "Informe o segmento."),
  lojaId: z.string().trim().min(1, "Vincule uma loja."),
  dataEntrada: z.string().trim().min(8, "Informe a data de entrada."),
  status: z.enum(["ativo", "implantacao", "inadimplente", "inativo"])
});

type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;
type StoreFormValues = z.infer<typeof storeSchema>;
type TenantFormValues = z.infer<typeof tenantSchema>;

export function ModulePage({
  module,
  enterprises,
  stores,
  dataSource,
  syncError,
  onResetLocalData,
  onSaveEnterprise,
  onSaveStore
}: ModulePageProps) {
  if (module === "Empreendimentos") {
    return (
      <EnterprisesPage
        enterprises={enterprises}
        dataSource={dataSource}
        syncError={syncError}
        onResetLocalData={onResetLocalData}
        onSaveEnterprise={onSaveEnterprise}
      />
    );
  }

  if (module === "Lojas") {
    return (
      <StoresPage
        enterprises={enterprises}
        stores={stores}
        dataSource={dataSource}
        syncError={syncError}
        onResetLocalData={onResetLocalData}
        onSaveStore={onSaveStore}
      />
    );
  }

  if (module === "Contratos") return <ContractsPage />;
  if (module === "Lojistas") return <TenantsPage stores={stores} />;
  if (module === "Inadimplencia") return <DelinquencyPage stores={stores} />;
  if (module === "Operacoes") return <OperationsPage />;
  if (module === "Financeiro") return <FinancePage />;
  if (module === "Comercial") return <CommercialPage enterprises={enterprises} stores={stores} />;

  return (
    <Shell title={module} description="Modulo em estruturacao para a proxima sprint do Nexa OS.">
      <div className="panel brand-angle bg-brand-dark p-8 text-white">
        <h2 className="text-xl font-bold uppercase">Modulo preparado</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/75">
          A arquitetura, permissoes, schema PostgreSQL e databases do Notion ja preveem este modulo.
          A proxima etapa e conectar formularios, tabelas e automacoes ao Supabase.
        </p>
      </div>
    </Shell>
  );
}

function Shell({
  title,
  description,
  action,
  children
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="border-b border-border bg-background/95 px-4 py-4 lg:px-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-xl font-bold uppercase leading-7 text-primary">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="control inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </button>
            {action}
          </div>
        </div>
      </header>
      <div className="space-y-5 px-4 py-5 lg:px-7">{children}</div>
    </div>
  );
}

function EnterprisesPage({
  enterprises,
  dataSource,
  syncError,
  onResetLocalData,
  onSaveEnterprise
}: {
  enterprises: Enterprise[];
  dataSource: "mock" | "supabase";
  syncError: string | null;
  onResetLocalData: () => void;
  onSaveEnterprise: (enterprise: Enterprise) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<Enterprise | null>(null);
  const totalAbl = enterprises.reduce((sum, item) => sum + item.abl, 0);

  return (
    <Shell
      title="Empreendimentos"
      description="Carteira multiempreendimento da Nexa Malls."
      action={<NewButton onClick={() => setEditing(emptyEnterprise())} />}
    >
      <SyncBanner dataSource={dataSource} syncError={syncError} onResetLocalData={onResetLocalData} />
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Ativos cadastrados" value={numberPt(enterprises.length)} />
        <Kpi label="ABL total" value={`${numberPt(totalAbl)} m2`} />
        <Kpi label="Lojas planejadas" value={numberPt(enterprises.reduce((sum, item) => sum + item.lojas, 0))} />
        <Kpi label="Vagas" value={numberPt(enterprises.reduce((sum, item) => sum + item.vagas, 0))} />
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {enterprises.map((enterprise) => (
          <div key={enterprise.id} className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h2 className="font-bold uppercase">{enterprise.nome}</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {enterprise.cidade} - {enterprise.estado}
                </p>
              </div>
              <button onClick={() => setEditing(enterprise)}>
                <Badge>{enterprise.status}</Badge>
              </button>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
              <Mini label="ABL" value={`${numberPt(enterprise.abl)} m2`} />
              <Mini label="Lojas" value={numberPt(enterprise.lojas)} />
              <Mini label="Responsavel" value={enterprise.responsavel} />
            </div>
          </div>
        ))}
      </div>
      {editing ? (
        <EnterpriseForm
          enterprise={editing}
          onClose={() => setEditing(null)}
          onSave={async (enterprise) => {
            await onSaveEnterprise(enterprise);
            setEditing(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function StoresPage({
  enterprises,
  stores,
  dataSource,
  syncError,
  onResetLocalData,
  onSaveStore
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  dataSource: "mock" | "supabase";
  syncError: string | null;
  onResetLocalData: () => void;
  onSaveStore: (store: StoreType) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<StoreType | null>(null);

  return (
    <Shell
      title="Lojas"
      description="Cadastro de unidades, ABL, status e valores comerciais."
      action={<NewButton onClick={() => setEditing(emptyStore(enterprises[0]?.id ?? ""))} />}
    >
      <SyncBanner dataSource={dataSource} syncError={syncError} onResetLocalData={onResetLocalData} />
      <DataTable
        columns={["Codigo", "Loja", "Empreendimento", "Segmento", "Status", "Area", "Aluguel", "Acoes"]}
        rows={stores.map((store) => [
          store.codigo,
          store.nome,
          enterprises.find((item) => item.id === store.empreendimentoId)?.nome ?? "-",
          store.segmento,
          statusLabel[store.status],
          `${numberPt(store.areaTotal)} m2`,
          brl(store.aluguel),
          "Editar"
        ])}
        onAction={(rowIndex) => setEditing(stores[rowIndex])}
      />
      {editing ? (
        <StoreForm
          store={editing}
          enterprises={enterprises}
          onClose={() => setEditing(null)}
          onSave={async (store) => {
            await onSaveStore(store);
            setEditing(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function TenantsPage({ stores }: { stores: StoreType[] }) {
  const [tenantRows, setTenantRows] = useState<Tenant[]>(seedTenants);
  const [editing, setEditing] = useState<Tenant | null>(null);
  const activeTenants = tenantRows.filter((tenant) => tenant.status === "ativo").length;
  const linkedStores = new Set(tenantRows.map((tenant) => tenant.lojaId)).size;
  const segments = new Set(tenantRows.map((tenant) => tenant.segmento)).size;

  return (
    <Shell
      title="Lojistas"
      description="Cadastro de operadores, contatos, CNPJ, segmento e loja vinculada."
      action={<NewButton onClick={() => setEditing(emptyTenant(stores[0]?.id ?? ""))} />}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Lojistas cadastrados" value={numberPt(tenantRows.length)} />
        <Kpi label="Ativos" value={numberPt(activeTenants)} tone="success" />
        <Kpi label="Lojas vinculadas" value={numberPt(linkedStores)} />
        <Kpi label="Segmentos" value={numberPt(segments)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
        <DataTable
          columns={["Nome fantasia", "Loja", "CNPJ", "Responsavel", "Status", "Entrada", "Acoes"]}
          rows={tenantRows.map((tenant) => [
            tenant.nomeFantasia,
            storeLabel(stores, tenant.lojaId),
            tenant.cnpj,
            tenant.responsavelLegal,
            tenantStatusLabel[tenant.status],
            tenant.dataEntrada,
            "Editar"
          ])}
          onAction={(rowIndex) => setEditing(tenantRows[rowIndex])}
        />
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-bold uppercase">Relacionamento</h2>
          </div>
          <div className="mt-5 space-y-4">
            {tenantRows.slice(0, 3).map((tenant) => (
              <div key={tenant.id} className="rounded-lg border border-border p-3">
                <div className="font-bold">{tenant.nomeFantasia}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  {tenant.whatsapp}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {tenant.email}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editing ? (
        <TenantForm
          tenant={editing}
          stores={stores}
          onClose={() => setEditing(null)}
          onSave={(tenant) => {
            setTenantRows((current) => {
              const exists = current.some((item) => item.id === tenant.id);
              return exists ? current.map((item) => item.id === tenant.id ? tenant : item) : [tenant, ...current];
            });
            setEditing(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function ContractsPage() {
  return (
    <Shell title="Contratos" description="Alertas de vencimento e acompanhamento juridico-comercial.">
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Alertas ativos" value={numberPt(contractAlerts.length)} tone="danger" />
        <Kpi label="3 meses" value={numberPt(contractAlerts.filter((item) => item.meses === 3).length)} />
        <Kpi label="6 meses" value={numberPt(contractAlerts.filter((item) => item.meses === 6).length)} />
        <Kpi label="12+ meses" value={numberPt(contractAlerts.filter((item) => item.meses >= 12).length)} />
      </div>
      <DataTable
        columns={["Loja", "Lojista", "Janela", "Vencimento", "Risco"]}
        rows={contractAlerts.map((alert) => [
          alert.loja,
          alert.lojista,
          `${alert.meses} meses`,
          alert.vencimento,
          alert.risco
        ])}
      />
    </Shell>
  );
}

function FinancePage() {
  return (
    <Shell title="Financeiro" description="Contas a receber, contas a pagar, saldo e receita por ativo.">
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Receita imobiliaria" value="R$ 3.002.000" tone="success" />
        <Kpi label="A receber" value="R$ 771.000" />
        <Kpi label="Vencidas" value="R$ 253.000" tone="danger" />
        <Kpi label="Saldo operacional" value="R$ 2.312.000" tone="success" />
      </div>
      <div className="panel p-5">
        <h2 className="font-bold uppercase">Orcado x realizado</h2>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[82%] bg-primary" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Realizacao simulada em 82% para a competencia Maio/2026.</p>
      </div>
    </Shell>
  );
}

function DelinquencyPage({ stores }: { stores: StoreType[] }) {
  const lanes = ["5 dias", "15 dias", "30 dias", "60 dias", "90 dias"];

  return (
    <Shell title="Inadimplencia" description="Regua automatica e kanban de cobranca.">
      <div className="grid gap-3 xl:grid-cols-5">
        {lanes.map((lane, index) => (
          <div key={lane} className="panel min-h-[360px] p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold uppercase">{lane}</h2>
              <AlertTriangle className={index > 2 ? "h-4 w-4 text-danger" : "h-4 w-4 text-warning"} />
            </div>
            <div className="mt-4 space-y-3">
              <KanbanCard title={stores[index % stores.length].codigo} subtitle={stores[index % stores.length].nome} value={brl((index + 1) * 18500)} />
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function OperationsPage() {
  const lanes = ["Aberta", "Em execucao", "Aguardando terceiro", "Concluida"];

  return (
    <Shell title="Operacoes" description="Ordens de servico, manutencao, prioridades e prazos.">
      <div className="grid gap-3 xl:grid-cols-4">
        {lanes.map((lane) => (
          <div key={lane} className="panel min-h-[380px] p-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" />
              <h2 className="font-bold uppercase">{lane}</h2>
            </div>
            <div className="mt-4 space-y-3">
              {serviceOrders
                .filter((order) => lane === "Aberta" ? order.status === "aberta" : order.status.replaceAll("_", " ") === lane.toLowerCase())
                .map((order) => (
                  <KanbanCard key={order.id} title={order.loja} subtitle={order.categoria} value={order.prazo} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function CommercialPage({ enterprises, stores }: { enterprises: Enterprise[]; stores: StoreType[] }) {
  const pipeline = [
    {
      lane: "Disponivel",
      cards: stores
        .filter((store) => store.status === "disponivel")
        .map((store) => ({
          title: store.codigo,
          subtitle: `${store.nome} | ${store.segmento}`,
          value: brl(store.aluguel)
        }))
    },
    {
      lane: "Prospeccao",
      cards: [
        { title: "Academia boutique", subtitle: "Villa Viseu | Saude", value: "Proxima acao: contato" },
        { title: "Pet center", subtitle: "Piazza Nicomedes | Servicos", value: "Proxima acao: curadoria" }
      ]
    },
    {
      lane: "Visita",
      cards: [
        { title: "Cafeteria regional", subtitle: "Villa Viseu | Alimentacao", value: "Agendada" }
      ]
    },
    {
      lane: "Proposta",
      cards: [
        { title: "Clinica de estetica", subtitle: "Boulevard Naves | Saude", value: "R$ 18.500" },
        { title: "Wine bar", subtitle: "Bluemall Centro | Gastronomia", value: "R$ 22.000" }
      ]
    },
    {
      lane: "Negociacao",
      cards: stores
        .filter((store) => store.status === "negociacao")
        .map((store) => ({
          title: store.codigo,
          subtitle: `${store.nome} | ${store.segmento}`,
          value: brl(store.aluguel)
        }))
    },
    {
      lane: "Contrato",
      cards: [
        { title: "Mini mercado", subtitle: "Villa Viseu | Conveniencia", value: "Juridico" }
      ]
    },
    {
      lane: "Implantacao",
      cards: stores
        .filter((store) => store.status === "implantacao")
        .map((store) => ({
          title: store.codigo,
          subtitle: `${store.nome} | ${store.segmento}`,
          value: "Obra/fit-out"
        }))
    }
  ];

  const availableStores = stores.filter((store) => store.status === "disponivel").length;
  const negotiatingStores = stores.filter((store) => store.status === "negociacao").length;
  const pipelineTotal = pipeline.reduce((sum, lane) => sum + lane.cards.length, 0);

  return (
    <Shell title="Comercial" description="Pipeline de comercializacao, leads, visitas, propostas e contratos.">
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Ativos no filtro" value={numberPt(enterprises.length)} />
        <Kpi label="Lojas disponiveis" value={numberPt(availableStores)} />
        <Kpi label="Em negociacao" value={numberPt(negotiatingStores)} tone="success" />
        <Kpi label="Pipeline total" value={numberPt(pipelineTotal)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-7">
        {pipeline.map((lane) => (
          <div key={lane.lane} className="panel min-h-[380px] p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold uppercase">{lane.lane}</h2>
              <Badge>{numberPt(lane.cards.length)}</Badge>
            </div>
            <div className="mt-4 space-y-3">
              {lane.cards.length ? (
                lane.cards.map((card) => (
                  <KanbanCard key={`${lane.lane}-${card.title}`} title={card.title} subtitle={card.subtitle} value={card.value} />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium text-muted-foreground">
                  Sem oportunidades nesta etapa.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function DataTable({
  columns,
  rows,
  onAction
}: {
  columns: string[];
  rows: string[][];
  onAction?: (rowIndex: number) => void;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.join("-")} className="border-t border-border">
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className="px-4 py-3 font-medium">
                    {onAction && cellIndex === row.length - 1 ? (
                      <button className="text-xs font-bold uppercase text-primary" onClick={() => onAction(rowIndex)}>
                        {cell}
                      </button>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "danger" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";

  return (
    <div className="panel p-4">
      <div className="metric-label">{label}</div>
      <div className={`mt-2 whitespace-nowrap text-[1.35rem] font-bold ${toneClass}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="metric-label">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold uppercase text-primary">{children}</span>;
}

function KanbanCard({ title, subtitle, value }: { title: string; subtitle: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="font-bold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
      <div className="mt-3 text-sm font-bold text-primary">{value}</div>
    </div>
  );
}

function SyncBanner({
  dataSource,
  syncError,
  onResetLocalData
}: {
  dataSource: "mock" | "supabase";
  syncError: string | null;
  onResetLocalData: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
      <div>
        Fonte de dados: <span className="font-bold text-primary">{dataSource === "supabase" ? "Supabase" : "Mock local"}</span>
        {syncError ? <span className="ml-2 text-danger">Erro: {syncError}</span> : null}
      </div>
      {dataSource === "mock" ? (
        <button className="text-left text-xs font-bold uppercase text-primary" onClick={onResetLocalData}>
          Resetar dados locais
        </button>
      ) : null}
    </div>
  );
}

function NewButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={onClick}>
      <Plus className="h-4 w-4" />
      Novo registro
    </button>
  );
}

function EnterpriseForm({
  enterprise,
  onClose,
  onSave
}: {
  enterprise: Enterprise;
  onClose: () => void;
  onSave: (enterprise: Enterprise) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<EnterpriseFormValues>({
    resolver: zodResolver(enterpriseSchema),
    defaultValues: enterprise
  });

  return (
    <Modal title="Empreendimento" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput label="Nome" error={errors.nome?.message} {...register("nome")} />
          <FormInput label="Cidade" error={errors.cidade?.message} {...register("cidade")} />
          <FormInput label="Estado" maxLength={2} error={errors.estado?.message} {...register("estado")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["ativo", "implantacao", "planejado"]}
            {...register("status")}
          />
          <FormInput label="ABL" type="number" error={errors.abl?.message} {...register("abl")} />
          <FormInput label="Lojas" type="number" error={errors.lojas?.message} {...register("lojas")} />
          <FormInput label="Vagas" type="number" error={errors.vagas?.message} {...register("vagas")} />
          <FormInput label="Responsavel" error={errors.responsavel?.message} {...register("responsavel")} />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function StoreForm({
  store,
  enterprises,
  onClose,
  onSave
}: {
  store: StoreType;
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (store: StoreType) => void;
}) {
  const enterpriseOptions = useMemo(() => enterprises.map((enterprise) => enterprise.id), [enterprises]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: store
  });

  return (
    <Modal title="Loja" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput label="Codigo" error={errors.codigo?.message} {...register("codigo")} />
          <FormInput label="Nome" error={errors.nome?.message} {...register("nome")} />
          <FormSelect
            label="Empreendimento"
            error={errors.empreendimentoId?.message}
            options={enterpriseOptions}
            optionLabels={Object.fromEntries(enterprises.map((enterprise) => [enterprise.id, enterprise.nome]))}
            {...register("empreendimentoId")}
          />
          <FormInput label="Segmento" error={errors.segmento?.message} {...register("segmento")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["ocupada", "disponivel", "negociacao", "implantacao", "em_obra", "inativa"]}
            optionLabels={statusLabel}
            {...register("status")}
          />
          <FormInput label="Area total" type="number" error={errors.areaTotal?.message} {...register("areaTotal")} />
          <FormInput label="Aluguel" type="number" error={errors.aluguel?.message} {...register("aluguel")} />
          <FormInput label="Condominio" type="number" error={errors.condominio?.message} {...register("condominio")} />
          <FormInput label="Fundo" type="number" error={errors.fundo?.message} {...register("fundo")} />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function TenantForm({
  tenant,
  stores,
  onClose,
  onSave
}: {
  tenant: Tenant;
  stores: StoreType[];
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
}) {
  const storeOptions = useMemo(() => stores.map((store) => store.id), [stores]);
  const storeLabels = useMemo(
    () => Object.fromEntries(stores.map((store) => [store.id, `${store.codigo} - ${store.nome}`])),
    [stores]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: tenant
  });

  return (
    <Modal title="Lojista" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput label="Nome fantasia" error={errors.nomeFantasia?.message} {...register("nomeFantasia")} />
          <FormInput label="Razao social" error={errors.razaoSocial?.message} {...register("razaoSocial")} />
          <FormInput label="CNPJ" error={errors.cnpj?.message} {...register("cnpj")} />
          <FormInput label="Responsavel legal" error={errors.responsavelLegal?.message} {...register("responsavelLegal")} />
          <FormInput label="Telefone" error={errors.telefone?.message} {...register("telefone")} />
          <FormInput label="WhatsApp" error={errors.whatsapp?.message} {...register("whatsapp")} />
          <FormInput label="E-mail" type="email" error={errors.email?.message} {...register("email")} />
          <FormInput label="Segmento" error={errors.segmento?.message} {...register("segmento")} />
          <FormSelect
            label="Loja vinculada"
            error={errors.lojaId?.message}
            options={storeOptions}
            optionLabels={storeLabels}
            {...register("lojaId")}
          />
          <FormInput label="Data entrada" type="date" error={errors.dataEntrada?.message} {...register("dataEntrada")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["ativo", "implantacao", "inadimplente", "inativo"]}
            optionLabels={tenantStatusLabel}
            {...register("status")}
          />
          <FormInput label="Endereco" error={errors.endereco?.message} {...register("endereco")} />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="panel max-h-[90vh] w-full max-w-3xl overflow-auto p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase text-primary">{title}</h2>
          <button className="text-sm font-bold text-muted-foreground" onClick={onClose}>Fechar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="space-y-1">
      <span className="metric-label">{label}</span>
      <input
        className={`control w-full ${error ? "border-danger bg-red-50/50" : ""}`}
        {...props}
      />
      {error ? <span className="block text-xs font-semibold text-danger">{error}</span> : null}
    </label>
  );
}

function FormSelect({
  label,
  error,
  options,
  optionLabels,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: string[];
  optionLabels?: Record<string, string>;
}) {
  return (
    <label className="space-y-1">
      <span className="metric-label">{label}</span>
      <select className={`control w-full ${error ? "border-danger bg-red-50/50" : ""}`} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>{optionLabels?.[option] ?? option}</option>
        ))}
      </select>
      {error ? <span className="block text-xs font-semibold text-danger">{error}</span> : null}
    </label>
  );
}

function FormActions({ onClose, isSubmitting }: { onClose: () => void; isSubmitting?: boolean }) {
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button className="control" type="button" onClick={onClose}>Cancelar</button>
      <button className="control bg-primary text-primary-foreground" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </button>
    </div>
  );
}

function storeLabel(stores: StoreType[], lojaId: string) {
  const store = stores.find((item) => item.id === lojaId);
  return store ? `${store.codigo} - ${store.nome}` : "-";
}

function emptyEnterprise(): Enterprise {
  const id = crypto.randomUUID();

  return {
    id,
    nome: "Novo empreendimento",
    cidade: "Uberlandia",
    estado: "MG",
    status: "planejado",
    abl: 0,
    lojas: 0,
    vagas: 0,
    responsavel: "Nexa Malls"
  };
}

function emptyTenant(lojaId: string): Tenant {
  return {
    id: crypto.randomUUID(),
    nomeFantasia: "Novo lojista",
    razaoSocial: "Nova empresa Ltda",
    cnpj: "",
    responsavelLegal: "",
    telefone: "",
    whatsapp: "",
    email: "",
    endereco: "",
    segmento: "Servicos",
    lojaId,
    dataEntrada: new Date().toISOString().slice(0, 10),
    status: "implantacao"
  };
}

function emptyStore(empreendimentoId: string): StoreType {
  return {
    id: crypto.randomUUID(),
    codigo: "NOVO",
    empreendimentoId,
    nome: "Nova loja",
    segmento: "Servicos",
    status: "disponivel",
    areaTotal: 0,
    aluguel: 0,
    condominio: 0,
    fundo: 0
  };
}
