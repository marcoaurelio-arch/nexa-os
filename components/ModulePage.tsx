"use client";

import { AlertTriangle, Building2, FileText, Mail, Phone, Plus, Search, Users, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { buildContractAlerts } from "@/lib/contracts";
import { serviceOrders } from "@/lib/data";
import { brl, numberPt, percent } from "@/lib/metrics";
import type {
  Contract,
  ContractStatus,
  DelinquencyRecord,
  Enterprise,
  FinancialStatus,
  Payable,
  Receivable,
  RevenueType,
  Store as StoreType,
  Tenant,
  TenantStatus
} from "@/lib/types";

type ModulePageProps = {
  module: string;
  enterprises: Enterprise[];
  stores: StoreType[];
  tenants: Tenant[];
  contracts: Contract[];
  receivables: Receivable[];
  payables: Payable[];
  delinquencyRecords: DelinquencyRecord[];
  dataSource: "mock" | "supabase";
  syncError: string | null;
  onResetLocalData: () => void;
  onSaveEnterprise: (enterprise: Enterprise) => void | Promise<void>;
  onSaveStore: (store: StoreType) => void | Promise<void>;
  onSaveTenant: (tenant: Tenant) => void | Promise<void>;
  onSaveContract: (contract: Contract) => void | Promise<void>;
  onSaveReceivable: (receivable: Receivable) => void | Promise<void>;
  onSavePayable: (payable: Payable) => void | Promise<void>;
  onSaveDelinquencyRecord: (record: DelinquencyRecord) => void | Promise<void>;
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

const contractStatusLabel: Record<ContractStatus, string> = {
  ativo: "Ativo",
  vencendo: "Vencendo",
  renovacao: "Renovacao",
  encerrado: "Encerrado",
  minuta: "Minuta"
};

const financialStatusLabel: Record<FinancialStatus, string> = {
  aberto: "Aberto",
  vencido: "Vencido",
  pago: "Pago",
  cancelado: "Cancelado"
};

const revenueTypeLabel: Record<RevenueType, string> = {
  aluguel: "Aluguel",
  condominio: "Condominio",
  fundo_promocao: "Fundo promocao",
  fpp: "FPP",
  multa: "Multa",
  juros: "Juros"
};

const delinquencyStatusLabel: Record<DelinquencyRecord["status"], string> = {
  regua: "Regua",
  negociacao: "Negociacao",
  juridico: "Juridico",
  regularizado: "Regularizado"
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

const contractSchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim().min(1, "Selecione a loja."),
  lojistaId: z.string().trim().min(1, "Selecione o lojista."),
  dataInicio: z.string().trim().min(8, "Informe a data de inicio."),
  dataTermino: z.string().trim().min(8, "Informe a data de termino."),
  prazoMeses: z.coerce.number().int("Use um numero inteiro.").min(1, "Informe o prazo."),
  aluguelMinimo: z.coerce.number().min(0, "Informe zero ou mais."),
  indiceReajuste: z.string().trim().min(2, "Informe o indice."),
  garantia: z.string().trim().min(2, "Informe a garantia."),
  seguro: z.string().trim().min(2, "Informe o seguro."),
  contratoUrl: z.string().trim(),
  aditivos: z.coerce.number().int("Use um numero inteiro.").min(0, "Informe zero ou mais."),
  status: z.enum(["ativo", "vencendo", "renovacao", "encerrado", "minuta"])
});

const receivableSchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim().min(1, "Selecione a loja."),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  competencia: z.string().trim().min(7, "Informe a competencia."),
  receita: z.enum(["aluguel", "condominio", "fundo_promocao", "fpp", "multa", "juros"]),
  valor: z.coerce.number().min(0, "Informe zero ou mais."),
  vencimento: z.string().trim().min(8, "Informe o vencimento."),
  recebimento: z.string().trim(),
  status: z.enum(["aberto", "vencido", "pago", "cancelado"])
});

const payableSchema = z.object({
  id: z.string().min(1),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  fornecedor: z.string().trim().min(2, "Informe o fornecedor."),
  categoria: z.string().trim().min(2, "Informe a categoria."),
  competencia: z.string().trim().min(7, "Informe a competencia."),
  valor: z.coerce.number().min(0, "Informe zero ou mais."),
  vencimento: z.string().trim().min(8, "Informe o vencimento."),
  pagamento: z.string().trim(),
  centroCusto: z.string().trim().min(2, "Informe o centro de custo."),
  status: z.enum(["aberto", "vencido", "pago", "cancelado"])
});

const delinquencySchema = z.object({
  id: z.string().min(1),
  receivableId: z.string().min(1),
  lojaId: z.string().min(1),
  valor: z.coerce.number().min(0),
  diasAtraso: z.coerce.number().int().min(0),
  historico: z.string().trim(),
  negociacao: z.string().trim(),
  responsavel: z.string().trim().min(2, "Informe o responsavel."),
  status: z.enum(["regua", "negociacao", "juridico", "regularizado"])
});

type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;
type StoreFormValues = z.infer<typeof storeSchema>;
type TenantFormValues = z.infer<typeof tenantSchema>;
type ContractFormValues = z.infer<typeof contractSchema>;
type ReceivableFormValues = z.infer<typeof receivableSchema>;
type PayableFormValues = z.infer<typeof payableSchema>;
type DelinquencyFormValues = z.infer<typeof delinquencySchema>;

export function ModulePage({
  module,
  enterprises,
  stores,
  tenants,
  contracts,
  receivables,
  payables,
  delinquencyRecords,
  dataSource,
  syncError,
  onResetLocalData,
  onSaveEnterprise,
  onSaveStore,
  onSaveTenant,
  onSaveContract,
  onSaveReceivable,
  onSavePayable,
  onSaveDelinquencyRecord
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

  if (module === "Contratos") return <ContractsPage stores={stores} tenants={tenants} contracts={contracts} onSaveContract={onSaveContract} />;
  if (module === "Lojistas") return <TenantsPage stores={stores} tenants={tenants} onSaveTenant={onSaveTenant} />;
  if (module === "Inadimplencia") {
    return (
      <DelinquencyPage
        stores={stores}
        tenants={tenants}
        receivables={receivables}
        records={delinquencyRecords}
        onSaveDelinquencyRecord={onSaveDelinquencyRecord}
      />
    );
  }
  if (module === "Condominio") {
    return (
      <CondominiumPage
        enterprises={enterprises}
        stores={stores}
        receivables={receivables}
        payables={payables}
        onSaveReceivable={onSaveReceivable}
        onSavePayable={onSavePayable}
      />
    );
  }
  if (module === "Fundo") {
    return (
      <PromotionFundPage
        enterprises={enterprises}
        stores={stores}
        receivables={receivables}
        payables={payables}
        onSaveReceivable={onSaveReceivable}
        onSavePayable={onSavePayable}
      />
    );
  }
  if (module === "Operacoes") return <OperationsPage />;
  if (module === "Financeiro") {
    return (
      <FinancePage
        enterprises={enterprises}
        stores={stores}
        receivables={receivables}
        payables={payables}
        onSaveReceivable={onSaveReceivable}
        onSavePayable={onSavePayable}
      />
    );
  }
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

function TenantsPage({
  stores,
  tenants,
  onSaveTenant
}: {
  stores: StoreType[];
  tenants: Tenant[];
  onSaveTenant: (tenant: Tenant) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<Tenant | null>(null);
  const activeTenants = tenants.filter((tenant) => tenant.status === "ativo").length;
  const linkedStores = new Set(tenants.map((tenant) => tenant.lojaId)).size;
  const segments = new Set(tenants.map((tenant) => tenant.segmento)).size;

  return (
    <Shell
      title="Lojistas"
      description="Cadastro de operadores, contatos, CNPJ, segmento e loja vinculada."
      action={<NewButton onClick={() => setEditing(emptyTenant(stores[0]?.id ?? ""))} />}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Lojistas cadastrados" value={numberPt(tenants.length)} />
        <Kpi label="Ativos" value={numberPt(activeTenants)} tone="success" />
        <Kpi label="Lojas vinculadas" value={numberPt(linkedStores)} />
        <Kpi label="Segmentos" value={numberPt(segments)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_340px]">
        <DataTable
          columns={["Nome fantasia", "Loja", "CNPJ", "Responsavel", "Status", "Entrada", "Acoes"]}
          rows={tenants.map((tenant) => [
            tenant.nomeFantasia,
            storeLabel(stores, tenant.lojaId),
            tenant.cnpj,
            tenant.responsavelLegal,
            tenantStatusLabel[tenant.status],
            tenant.dataEntrada,
            "Editar"
          ])}
          onAction={(rowIndex) => setEditing(tenants[rowIndex])}
        />
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="font-bold uppercase">Relacionamento</h2>
          </div>
          <div className="mt-5 space-y-4">
            {tenants.slice(0, 3).map((tenant) => (
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
          onSave={async (tenant) => {
            await onSaveTenant(tenant);
            setEditing(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function ContractsPage({
  stores,
  tenants,
  contracts,
  onSaveContract
}: {
  stores: StoreType[];
  tenants: Tenant[];
  contracts: Contract[];
  onSaveContract: (contract: Contract) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<Contract | null>(null);
  const alerts = buildContractAlerts(contracts, stores, tenants);
  const activeContracts = contracts.filter((contract) => contract.status === "ativo").length;

  return (
    <Shell
      title="Contratos"
      description="Alertas de vencimento, renovacoes, garantias e acompanhamento juridico-comercial."
      action={<NewButton onClick={() => setEditing(emptyContract(stores[0]?.id ?? "", tenants[0]?.id ?? ""))} />}
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Contratos" value={numberPt(contracts.length)} />
        <Kpi label="Ativos" value={numberPt(activeContracts)} tone="success" />
        <Kpi label="Alertas ativos" value={numberPt(alerts.length)} tone="danger" />
        <Kpi label="3 meses" value={numberPt(alerts.filter((item) => item.meses === 3).length)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <DataTable
          columns={["Loja", "Lojista", "Inicio", "Termino", "Aluguel", "Status", "Acoes"]}
          rows={contracts.map((contract) => [
            storeLabel(stores, contract.lojaId),
            tenantLabel(tenants, contract.lojistaId),
            contract.dataInicio,
            contract.dataTermino,
            brl(contract.aluguelMinimo),
            contractStatusLabel[contract.status],
            "Editar"
          ])}
          onAction={(rowIndex) => setEditing(contracts[rowIndex])}
        />
        <div className="panel p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="font-bold uppercase">Alertas automaticos</h2>
          </div>
          <div className="mt-5 space-y-3">
            {alerts.length ? (
              alerts.map((alert) => (
                <KanbanCard
                  key={alert.id}
                  title={`${alert.meses} meses | ${alert.loja}`}
                  subtitle={alert.lojista}
                  value={`${alert.vencimento} | risco ${alert.risco}`}
                />
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium text-muted-foreground">
                Nenhum contrato dentro das janelas de alerta.
              </div>
            )}
          </div>
        </div>
      </div>
      {editing ? (
        <ContractForm
          contract={editing}
          stores={stores}
          tenants={tenants}
          onClose={() => setEditing(null)}
          onSave={async (contract) => {
            await onSaveContract(contract);
            setEditing(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function FinancePage({
  enterprises,
  stores,
  receivables,
  payables,
  onSaveReceivable,
  onSavePayable
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  receivables: Receivable[];
  payables: Payable[];
  onSaveReceivable: (receivable: Receivable) => void | Promise<void>;
  onSavePayable: (payable: Payable) => void | Promise<void>;
}) {
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const receivableTotal = receivables.filter((item) => item.status !== "cancelado").reduce((sum, item) => sum + item.valor, 0);
  const receivedTotal = receivables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.valor, 0);
  const openReceivables = receivables
    .filter((item) => item.status === "aberto" || item.status === "vencido")
    .reduce((sum, item) => sum + item.valor, 0);
  const overdueReceivables = receivables.filter((item) => item.status === "vencido").reduce((sum, item) => sum + item.valor, 0);
  const paidPayables = payables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.valor, 0);
  const openPayables = payables
    .filter((item) => item.status === "aberto" || item.status === "vencido")
    .reduce((sum, item) => sum + item.valor, 0);
  const progress = receivableTotal > 0 ? Math.round((receivedTotal / receivableTotal) * 100) : 0;

  return (
    <Shell
      title="Financeiro"
      description="Contas a receber, contas a pagar, saldo e receita por ativo."
      action={
        <div className="flex gap-2">
          <button
            className="control inline-flex items-center gap-2 bg-primary text-primary-foreground"
            onClick={() => setEditingReceivable(emptyReceivable(stores[0]))}
          >
            <Plus className="h-4 w-4" />
            Receita
          </button>
          <button className="control inline-flex items-center gap-2" onClick={() => setEditingPayable(emptyPayable(enterprises[0]?.id ?? ""))}>
            <Plus className="h-4 w-4" />
            Despesa
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Recebido" value={brl(receivedTotal)} tone="success" />
        <Kpi label="A receber" value={brl(openReceivables)} />
        <Kpi label="Vencidas" value={brl(overdueReceivables)} tone="danger" />
        <Kpi label="A pagar" value={brl(openPayables)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div>
            <h2 className="mb-3 font-bold uppercase">Contas a receber</h2>
            <DataTable
              columns={["Loja", "Competencia", "Receita", "Valor", "Vencimento", "Status", "Acoes"]}
              rows={receivables.map((item) => [
                storeLabel(stores, item.lojaId),
                item.competencia,
                revenueTypeLabel[item.receita],
                brl(item.valor),
                item.vencimento,
                financialStatusLabel[item.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingReceivable(receivables[rowIndex])}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Contas a pagar</h2>
            <DataTable
              columns={["Fornecedor", "Empreendimento", "Categoria", "Valor", "Vencimento", "Status", "Acoes"]}
              rows={payables.map((item) => [
                item.fornecedor,
                enterpriseLabel(enterprises, item.empreendimentoId),
                item.categoria,
                brl(item.valor),
                item.vencimento,
                financialStatusLabel[item.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingPayable(payables[rowIndex])}
            />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Orcado x realizado</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {progress}% realizado sobre receitas cadastradas para a carteira.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Receita prevista" value={brl(receivableTotal)} />
            <Mini label="Despesas pagas" value={brl(paidPayables)} />
            <Mini label="Saldo operacional" value={brl(receivedTotal - paidPayables)} />
          </div>
        </div>
      </div>
      {editingReceivable ? (
        <ReceivableForm
          receivable={editingReceivable}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingReceivable(null)}
          onSave={async (receivable) => {
            await onSaveReceivable(receivable);
            setEditingReceivable(null);
          }}
        />
      ) : null}
      {editingPayable ? (
        <PayableForm
          payable={editingPayable}
          enterprises={enterprises}
          onClose={() => setEditingPayable(null)}
          onSave={async (payable) => {
            await onSavePayable(payable);
            setEditingPayable(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function DelinquencyPage({
  stores,
  tenants,
  receivables,
  records,
  onSaveDelinquencyRecord
}: {
  stores: StoreType[];
  tenants: Tenant[];
  receivables: Receivable[];
  records: DelinquencyRecord[];
  onSaveDelinquencyRecord: (record: DelinquencyRecord) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState<DelinquencyRecord | null>(null);
  const cases = buildDelinquencyCases(receivables, records);
  const totalValue = cases.reduce((sum, item) => sum + item.record.valor, 0);
  const inNegotiation = cases.filter((item) => item.record.status === "negociacao").length;
  const lanes: Array<5 | 15 | 30 | 60 | 90> = [5, 15, 30, 60, 90];

  return (
    <Shell title="Inadimplencia" description="Regua automatica e kanban de cobranca.">
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Valor inadimplente" value={brl(totalValue)} tone="danger" />
        <Kpi label="Casos ativos" value={numberPt(cases.length)} />
        <Kpi label="Em negociacao" value={numberPt(inNegotiation)} tone="success" />
        <Kpi label="Maior atraso" value={`${numberPt(Math.max(0, ...cases.map((item) => item.record.diasAtraso)))} dias`} />
      </div>
      <div className="grid gap-3 xl:grid-cols-5">
        {lanes.map((lane) => {
          const laneCases = cases.filter((item) => item.lane === lane);

          return (
          <div key={lane} className="panel min-h-[360px] p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold uppercase">{lane} dias</h2>
              <AlertTriangle className={lane >= 60 ? "h-4 w-4 text-danger" : "h-4 w-4 text-warning"} />
            </div>
            <div className="mt-4 space-y-3">
              {laneCases.length ? (
                laneCases.map((item) => (
                  <button key={item.record.id} className="w-full text-left" onClick={() => setEditing(item.record)}>
                    <KanbanCard
                      title={`${storeLabel(stores, item.record.lojaId)} | ${numberPt(item.record.diasAtraso)} dias`}
                      subtitle={`${tenantByStore(tenants, item.record.lojaId)} | ${item.record.responsavel || "Sem responsavel"}`}
                      value={`${brl(item.record.valor)} | ${delinquencyStatusLabel[item.record.status]}`}
                    />
                  </button>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium text-muted-foreground">
                  Sem casos nesta etapa.
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
      {editing ? (
        <DelinquencyForm
          record={editing}
          stores={stores}
          onClose={() => setEditing(null)}
          onSave={async (record) => {
            await onSaveDelinquencyRecord(record);
            setEditing(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function CondominiumPage({
  enterprises,
  stores,
  receivables,
  payables,
  onSaveReceivable,
  onSavePayable
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  receivables: Receivable[];
  payables: Payable[];
  onSaveReceivable: (receivable: Receivable) => void | Promise<void>;
  onSavePayable: (payable: Payable) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedAbl = enterprises
    .filter((enterprise) => selectedEnterpriseIds.has(enterprise.id))
    .reduce((sum, enterprise) => sum + enterprise.abl, 0);
  const condominiumReceivables = receivables.filter(
    (item) => selectedEnterpriseIds.has(item.empreendimentoId) && ["condominio", "multa", "juros"].includes(item.receita)
  );
  const condominiumPayables = payables.filter(
    (item) => selectedEnterpriseIds.has(item.empreendimentoId) && item.centroCusto.toLowerCase().includes("condominio")
  );
  const received = condominiumReceivables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.valor, 0);
  const openRevenue = condominiumReceivables
    .filter((item) => item.status === "aberto" || item.status === "vencido")
    .reduce((sum, item) => sum + item.valor, 0);
  const expenses = condominiumPayables.filter((item) => item.status !== "cancelado").reduce((sum, item) => sum + item.valor, 0);
  const paidExpenses = condominiumPayables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.valor, 0);
  const budget = Math.max(expenses * 1.12, expenses + 1);
  const budgetProgress = Math.round((expenses / budget) * 100);
  const categoryRows = condominiumExpenseCategories(condominiumPayables);
  const firstStore = selectedStores[0] ?? stores[0];
  const firstEnterpriseId = enterpriseId === "all" ? enterprises[0]?.id ?? "" : enterpriseId;

  return (
    <Shell
      title="Condominio"
      description="Receitas, despesas, custo por m2, orcado x realizado e saldo acumulado."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingReceivable(emptyCondominiumReceivable(firstStore))}>
            <Plus className="h-4 w-4" />
            Receita
          </button>
          <button className="control inline-flex items-center gap-2" onClick={() => setEditingPayable(emptyCondominiumPayable(firstEnterpriseId))}>
            <Plus className="h-4 w-4" />
            Despesa
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Arrecadado" value={brl(received)} tone="success" />
        <Kpi label="A receber" value={brl(openRevenue)} />
        <Kpi label="Despesas" value={brl(expenses)} />
        <Kpi label="Custo por m2" value={brl(selectedAbl > 0 ? expenses / selectedAbl : 0)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div>
            <h2 className="mb-3 font-bold uppercase">Receitas condominiais</h2>
            <DataTable
              columns={["Loja", "Competencia", "Receita", "Valor", "Vencimento", "Status", "Acoes"]}
              rows={condominiumReceivables.map((item) => [
                storeLabel(stores, item.lojaId),
                item.competencia,
                revenueTypeLabel[item.receita],
                brl(item.valor),
                item.vencimento,
                financialStatusLabel[item.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingReceivable(condominiumReceivables[rowIndex])}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Despesas condominiais</h2>
            <DataTable
              columns={["Fornecedor", "Categoria", "Valor", "Vencimento", "Status", "Acoes"]}
              rows={condominiumPayables.map((item) => [
                item.fornecedor,
                item.categoria,
                brl(item.valor),
                item.vencimento,
                financialStatusLabel[item.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingPayable(condominiumPayables[rowIndex])}
            />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Orcado x realizado</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${Math.min(budgetProgress, 100)}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {budgetProgress}% realizado sobre orcamento condominial estimado.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Orcado" value={brl(budget)} />
            <Mini label="Despesas pagas" value={brl(paidExpenses)} />
            <Mini label="Saldo acumulado" value={brl(received - paidExpenses)} />
          </div>
          <h3 className="mt-6 text-sm font-bold uppercase">Categorias</h3>
          <div className="mt-3 space-y-2">
            {categoryRows.map((row) => (
              <div key={row.category} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-medium">{row.category}</span>
                <span className="font-bold text-primary">{brl(row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editingReceivable ? (
        <ReceivableForm
          receivable={editingReceivable}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingReceivable(null)}
          onSave={async (receivable) => {
            await onSaveReceivable(receivable);
            setEditingReceivable(null);
          }}
        />
      ) : null}
      {editingPayable ? (
        <PayableForm
          payable={editingPayable}
          enterprises={enterprises}
          onClose={() => setEditingPayable(null)}
          onSave={async (payable) => {
            await onSavePayable(payable);
            setEditingPayable(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function PromotionFundPage({
  enterprises,
  stores,
  receivables,
  payables,
  onSaveReceivable,
  onSavePayable
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  receivables: Receivable[];
  payables: Payable[];
  onSaveReceivable: (receivable: Receivable) => void | Promise<void>;
  onSavePayable: (payable: Payable) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null);
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const fundReceivables = receivables.filter(
    (item) => selectedEnterpriseIds.has(item.empreendimentoId) && item.receita === "fundo_promocao"
  );
  const fundPayables = payables.filter(
    (item) => selectedEnterpriseIds.has(item.empreendimentoId) && item.centroCusto.toLowerCase().includes("fundo")
  );
  const collected = fundReceivables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.valor, 0);
  const openRevenue = fundReceivables
    .filter((item) => item.status === "aberto" || item.status === "vencido")
    .reduce((sum, item) => sum + item.valor, 0);
  const expenses = fundPayables.filter((item) => item.status !== "cancelado").reduce((sum, item) => sum + item.valor, 0);
  const paidExpenses = fundPayables.filter((item) => item.status === "pago").reduce((sum, item) => sum + item.valor, 0);
  const balance = collected - paidExpenses;
  const utilization = collected > 0 ? Math.round((paidExpenses / collected) * 100) : 0;
  const categoryRows = promotionFundExpenseCategories(fundPayables);
  const firstStore = selectedStores[0] ?? stores[0];
  const firstEnterpriseId = enterpriseId === "all" ? enterprises[0]?.id ?? "" : enterpriseId;

  return (
    <Shell
      title="Fundo de Promocao"
      description="Arrecadacao, utilizacao, saldo e despesas de marketing por empreendimento."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingReceivable(emptyPromotionFundReceivable(firstStore))}>
            <Plus className="h-4 w-4" />
            Receita
          </button>
          <button className="control inline-flex items-center gap-2" onClick={() => setEditingPayable(emptyPromotionFundPayable(firstEnterpriseId))}>
            <Plus className="h-4 w-4" />
            Despesa
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Arrecadacao" value={brl(collected)} tone="success" />
        <Kpi label="A receber" value={brl(openRevenue)} />
        <Kpi label="Utilizacao" value={`${utilization}%`} />
        <Kpi label="Saldo" value={brl(balance)} tone={balance >= 0 ? "success" : "danger"} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div>
            <h2 className="mb-3 font-bold uppercase">Arrecadacao do fundo</h2>
            <DataTable
              columns={["Loja", "Competencia", "Valor", "Vencimento", "Status", "Acoes"]}
              rows={fundReceivables.map((item) => [
                storeLabel(stores, item.lojaId),
                item.competencia,
                brl(item.valor),
                item.vencimento,
                financialStatusLabel[item.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingReceivable(fundReceivables[rowIndex])}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Despesas promocionais</h2>
            <DataTable
              columns={["Fornecedor", "Categoria", "Valor", "Vencimento", "Status", "Acoes"]}
              rows={fundPayables.map((item) => [
                item.fornecedor,
                item.categoria,
                brl(item.valor),
                item.vencimento,
                financialStatusLabel[item.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingPayable(fundPayables[rowIndex])}
            />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Utilizacao do fundo</h2>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${Math.min(utilization, 100)}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {utilization}% do fundo arrecadado ja foi utilizado em acoes promocionais pagas.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Arrecadado" value={brl(collected)} />
            <Mini label="Despesas lancadas" value={brl(expenses)} />
            <Mini label="Despesas pagas" value={brl(paidExpenses)} />
          </div>
          <h3 className="mt-6 text-sm font-bold uppercase">Categorias</h3>
          <div className="mt-3 space-y-2">
            {categoryRows.map((row) => (
              <div key={row.category} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="font-medium">{row.category}</span>
                <span className="font-bold text-primary">{brl(row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editingReceivable ? (
        <ReceivableForm
          receivable={editingReceivable}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingReceivable(null)}
          onSave={async (receivable) => {
            await onSaveReceivable(receivable);
            setEditingReceivable(null);
          }}
        />
      ) : null}
      {editingPayable ? (
        <PayableForm
          payable={editingPayable}
          enterprises={enterprises}
          onClose={() => setEditingPayable(null)}
          onSave={async (payable) => {
            await onSavePayable(payable);
            setEditingPayable(null);
          }}
        />
      ) : null}
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

function ContractForm({
  contract,
  stores,
  tenants,
  onClose,
  onSave
}: {
  contract: Contract;
  stores: StoreType[];
  tenants: Tenant[];
  onClose: () => void;
  onSave: (contract: Contract) => void;
}) {
  const storeOptions = useMemo(() => stores.map((store) => store.id), [stores]);
  const tenantOptions = useMemo(() => tenants.map((tenant) => tenant.id), [tenants]);
  const storeLabels = useMemo(
    () => Object.fromEntries(stores.map((store) => [store.id, `${store.codigo} - ${store.nome}`])),
    [stores]
  );
  const tenantLabels = useMemo(
    () => Object.fromEntries(tenants.map((tenant) => [tenant.id, tenant.nomeFantasia])),
    [tenants]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: contract
  });

  return (
    <Modal title="Contrato" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormSelect
            label="Loja"
            error={errors.lojaId?.message}
            options={storeOptions}
            optionLabels={storeLabels}
            {...register("lojaId")}
          />
          <FormSelect
            label="Lojista"
            error={errors.lojistaId?.message}
            options={tenantOptions}
            optionLabels={tenantLabels}
            {...register("lojistaId")}
          />
          <FormInput label="Data inicio" type="date" error={errors.dataInicio?.message} {...register("dataInicio")} />
          <FormInput label="Data termino" type="date" error={errors.dataTermino?.message} {...register("dataTermino")} />
          <FormInput label="Prazo meses" type="number" error={errors.prazoMeses?.message} {...register("prazoMeses")} />
          <FormInput label="Aluguel minimo" type="number" error={errors.aluguelMinimo?.message} {...register("aluguelMinimo")} />
          <FormInput label="Indice reajuste" error={errors.indiceReajuste?.message} {...register("indiceReajuste")} />
          <FormInput label="Garantia" error={errors.garantia?.message} {...register("garantia")} />
          <FormInput label="Seguro" error={errors.seguro?.message} {...register("seguro")} />
          <FormInput label="Aditivos" type="number" error={errors.aditivos?.message} {...register("aditivos")} />
          <FormInput label="Contrato URL" error={errors.contratoUrl?.message} {...register("contratoUrl")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["ativo", "vencendo", "renovacao", "encerrado", "minuta"]}
            optionLabels={contractStatusLabel}
            {...register("status")}
          />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function ReceivableForm({
  receivable,
  stores,
  enterprises,
  onClose,
  onSave
}: {
  receivable: Receivable;
  stores: StoreType[];
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (receivable: Receivable) => void;
}) {
  const storeOptions = useMemo(() => stores.map((store) => store.id), [stores]);
  const storeLabels = useMemo(
    () => Object.fromEntries(stores.map((store) => [store.id, `${store.codigo} - ${store.nome}`])),
    [stores]
  );
  const enterpriseOptions = useMemo(() => enterprises.map((enterprise) => enterprise.id), [enterprises]);
  const enterpriseLabels = useMemo(
    () => Object.fromEntries(enterprises.map((enterprise) => [enterprise.id, enterprise.nome])),
    [enterprises]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<ReceivableFormValues>({
    resolver: zodResolver(receivableSchema),
    defaultValues: receivable
  });

  return (
    <Modal title="Conta a receber" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormSelect label="Loja" error={errors.lojaId?.message} options={storeOptions} optionLabels={storeLabels} {...register("lojaId")} />
          <FormSelect
            label="Empreendimento"
            error={errors.empreendimentoId?.message}
            options={enterpriseOptions}
            optionLabels={enterpriseLabels}
            {...register("empreendimentoId")}
          />
          <FormInput label="Competencia" placeholder="2026-05" error={errors.competencia?.message} {...register("competencia")} />
          <FormSelect
            label="Receita"
            error={errors.receita?.message}
            options={["aluguel", "condominio", "fundo_promocao", "fpp", "multa", "juros"]}
            optionLabels={revenueTypeLabel}
            {...register("receita")}
          />
          <FormInput label="Valor" type="number" error={errors.valor?.message} {...register("valor")} />
          <FormInput label="Vencimento" type="date" error={errors.vencimento?.message} {...register("vencimento")} />
          <FormInput label="Recebimento" type="date" error={errors.recebimento?.message} {...register("recebimento")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["aberto", "vencido", "pago", "cancelado"]}
            optionLabels={financialStatusLabel}
            {...register("status")}
          />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function PayableForm({
  payable,
  enterprises,
  onClose,
  onSave
}: {
  payable: Payable;
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (payable: Payable) => void;
}) {
  const enterpriseOptions = useMemo(() => enterprises.map((enterprise) => enterprise.id), [enterprises]);
  const enterpriseLabels = useMemo(
    () => Object.fromEntries(enterprises.map((enterprise) => [enterprise.id, enterprise.nome])),
    [enterprises]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<PayableFormValues>({
    resolver: zodResolver(payableSchema),
    defaultValues: payable
  });

  return (
    <Modal title="Conta a pagar" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormSelect
            label="Empreendimento"
            error={errors.empreendimentoId?.message}
            options={enterpriseOptions}
            optionLabels={enterpriseLabels}
            {...register("empreendimentoId")}
          />
          <FormInput label="Fornecedor" error={errors.fornecedor?.message} {...register("fornecedor")} />
          <FormInput label="Categoria" error={errors.categoria?.message} {...register("categoria")} />
          <FormInput label="Competencia" placeholder="2026-05" error={errors.competencia?.message} {...register("competencia")} />
          <FormInput label="Valor" type="number" error={errors.valor?.message} {...register("valor")} />
          <FormInput label="Vencimento" type="date" error={errors.vencimento?.message} {...register("vencimento")} />
          <FormInput label="Pagamento" type="date" error={errors.pagamento?.message} {...register("pagamento")} />
          <FormInput label="Centro de custo" error={errors.centroCusto?.message} {...register("centroCusto")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["aberto", "vencido", "pago", "cancelado"]}
            optionLabels={financialStatusLabel}
            {...register("status")}
          />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function DelinquencyForm({
  record,
  stores,
  onClose,
  onSave
}: {
  record: DelinquencyRecord;
  stores: StoreType[];
  onClose: () => void;
  onSave: (record: DelinquencyRecord) => void;
}) {
  const storeLabels = useMemo(
    () => Object.fromEntries(stores.map((store) => [store.id, `${store.codigo} - ${store.nome}`])),
    [stores]
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<DelinquencyFormValues>({
    resolver: zodResolver(delinquencySchema),
    defaultValues: record
  });

  return (
    <Modal title="Inadimplencia" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <input type="hidden" {...register("receivableId")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormSelect label="Loja" error={errors.lojaId?.message} options={Object.keys(storeLabels)} optionLabels={storeLabels} {...register("lojaId")} />
          <FormInput label="Valor" type="number" error={errors.valor?.message} {...register("valor")} />
          <FormInput label="Dias atraso" type="number" error={errors.diasAtraso?.message} {...register("diasAtraso")} />
          <FormInput label="Responsavel" error={errors.responsavel?.message} {...register("responsavel")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["regua", "negociacao", "juridico", "regularizado"]}
            optionLabels={delinquencyStatusLabel}
            {...register("status")}
          />
          <div className="hidden md:block" />
          <FormInput label="Historico" error={errors.historico?.message} {...register("historico")} />
          <FormInput label="Negociacao" error={errors.negociacao?.message} {...register("negociacao")} />
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

function enterpriseLabel(enterprises: Enterprise[], empreendimentoId: string) {
  return enterprises.find((item) => item.id === empreendimentoId)?.nome ?? "-";
}

function tenantLabel(tenants: Tenant[], lojistaId: string) {
  const tenant = tenants.find((item) => item.id === lojistaId);
  return tenant?.nomeFantasia ?? "-";
}

function tenantByStore(tenants: Tenant[], lojaId: string) {
  return tenants.find((tenant) => tenant.lojaId === lojaId)?.nomeFantasia ?? "Sem lojista";
}

function buildDelinquencyCases(receivables: Receivable[], records: DelinquencyRecord[]) {
  const today = new Date();

  return receivables
    .filter((receivable) => receivable.status !== "pago" && receivable.status !== "cancelado" && !receivable.recebimento)
    .map((receivable) => {
      const diasAtraso = daysBetween(new Date(`${receivable.vencimento}T00:00:00`), today);

      if (diasAtraso <= 0) return null;

      const record = records.find((item) => item.receivableId === receivable.id);
      const merged: DelinquencyRecord = {
        id: record?.id ?? `del-${receivable.id}`,
        receivableId: receivable.id,
        lojaId: receivable.lojaId,
        valor: receivable.valor,
        diasAtraso,
        historico: record?.historico ?? "Caso gerado automaticamente pela conta a receber vencida.",
        negociacao: record?.negociacao ?? "",
        responsavel: record?.responsavel ?? "Financeiro",
        status: record?.status ?? "regua"
      };

      if (merged.status === "regularizado") return null;

      return {
        record: merged,
        lane: delinquencyLane(diasAtraso)
      };
    })
    .filter((item): item is { record: DelinquencyRecord; lane: 5 | 15 | 30 | 60 | 90 } => Boolean(item));
}

function daysBetween(start: Date, end: Date) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / millisecondsPerDay));
}

function delinquencyLane(days: number): 5 | 15 | 30 | 60 | 90 {
  if (days <= 5) return 5;
  if (days <= 15) return 15;
  if (days <= 30) return 30;
  if (days <= 60) return 60;
  return 90;
}

function condominiumExpenseCategories(payables: Payable[]) {
  const categories = ["Limpeza", "Seguranca", "Energia", "Agua", "Jardinagem", "Administracao", "Juridico", "Seguro", "Manutencao"];

  return categories
    .map((category) => ({
      category,
      value: payables
        .filter((payable) => payable.categoria.toLowerCase() === category.toLowerCase())
        .reduce((sum, payable) => sum + payable.valor, 0)
    }))
    .filter((row) => row.value > 0);
}

function promotionFundExpenseCategories(payables: Payable[]) {
  const categories = ["Marketing", "Eventos", "Trafego pago", "Redes sociais", "Producao audiovisual", "Decoracao", "Material grafico"];

  return categories
    .map((category) => ({
      category,
      value: payables
        .filter((payable) => payable.categoria.toLowerCase() === category.toLowerCase())
        .reduce((sum, payable) => sum + payable.valor, 0)
    }))
    .filter((row) => row.value > 0);
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

function emptyContract(lojaId: string, lojistaId: string): Contract {
  const now = new Date();
  const termination = new Date(now);
  termination.setMonth(termination.getMonth() + 60);

  return {
    id: crypto.randomUUID(),
    lojaId,
    lojistaId,
    dataInicio: now.toISOString().slice(0, 10),
    dataTermino: termination.toISOString().slice(0, 10),
    prazoMeses: 60,
    aluguelMinimo: 0,
    indiceReajuste: "IPCA",
    garantia: "",
    seguro: "",
    contratoUrl: "",
    aditivos: 0,
    status: "minuta"
  };
}

function emptyReceivable(store?: StoreType): Receivable {
  return {
    id: crypto.randomUUID(),
    lojaId: store?.id ?? "",
    empreendimentoId: store?.empreendimentoId ?? "",
    competencia: new Date().toISOString().slice(0, 7),
    receita: "aluguel",
    valor: 0,
    vencimento: new Date().toISOString().slice(0, 10),
    recebimento: "",
    status: "aberto"
  };
}

function emptyPayable(empreendimentoId: string): Payable {
  return {
    id: crypto.randomUUID(),
    empreendimentoId,
    fornecedor: "",
    categoria: "Administracao",
    competencia: new Date().toISOString().slice(0, 7),
    valor: 0,
    vencimento: new Date().toISOString().slice(0, 10),
    pagamento: "",
    centroCusto: "Condominio",
    status: "aberto"
  };
}

function emptyCondominiumReceivable(store?: StoreType): Receivable {
  return {
    ...emptyReceivable(store),
    receita: "condominio",
    valor: store?.condominio ?? 0
  };
}

function emptyCondominiumPayable(empreendimentoId: string): Payable {
  return {
    ...emptyPayable(empreendimentoId),
    categoria: "Limpeza",
    centroCusto: "Condominio"
  };
}

function emptyPromotionFundReceivable(store?: StoreType): Receivable {
  return {
    ...emptyReceivable(store),
    receita: "fundo_promocao",
    valor: store?.fundo ?? 0
  };
}

function emptyPromotionFundPayable(empreendimentoId: string): Payable {
  return {
    ...emptyPayable(empreendimentoId),
    categoria: "Marketing",
    centroCusto: "Fundo promocao"
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
