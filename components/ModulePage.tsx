"use client";

import { AlertTriangle, Building2, Droplets, FileText, Mail, Phone, Plus, Search, Users, Wrench, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { buildContractAlerts } from "@/lib/contracts";
import { brl, numberPt, percent } from "@/lib/metrics";
import type {
  CommercialLead,
  CommercialStage,
  Contract,
  ContractStatus,
  DelinquencyRecord,
  Enterprise,
  FinancialStatus,
  FppRecord,
  Payable,
  Receivable,
  RevenueAuditRecord,
  RevenueAuditStatus,
  RevenueType,
  ServiceOrder,
  ServiceOrderCategory,
  ServiceOrderPriority,
  ServiceOrderStatus,
  Store as StoreType,
  Tenant,
  TenantStatus,
  UtilityKind,
  UtilityReading,
  UtilityStatus,
  VacancyCriticality,
  VacancyRecord
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
  fppRecords: FppRecord[];
  revenueAuditRecords: RevenueAuditRecord[];
  commercialLeads: CommercialLead[];
  vacancyRecords: VacancyRecord[];
  utilityReadings: UtilityReading[];
  serviceOrders: ServiceOrder[];
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
  onSaveFppRecord: (record: FppRecord) => void | Promise<void>;
  onSaveRevenueAuditRecord: (record: RevenueAuditRecord) => void | Promise<void>;
  onSaveCommercialLead: (lead: CommercialLead) => void | Promise<void>;
  onSaveVacancyRecord: (record: VacancyRecord) => void | Promise<void>;
  onSaveUtilityReading: (reading: UtilityReading) => void | Promise<void>;
  onSaveServiceOrder: (order: ServiceOrder) => void | Promise<void>;
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

const revenueAuditStatusLabel: Record<RevenueAuditStatus, string> = {
  pendente: "Pendente",
  conciliado: "Conciliado",
  divergente: "Divergente",
  critico: "Critico"
};

const commercialStageLabel: Record<CommercialStage, string> = {
  prospeccao: "Prospeccao",
  lead: "Lead",
  visita: "Visita",
  proposta: "Proposta",
  negociacao: "Negociacao",
  contrato: "Contrato",
  implantacao: "Implantacao",
  inauguracao: "Inauguracao"
};

const commercialStages: CommercialStage[] = ["prospeccao", "lead", "visita", "proposta", "negociacao", "contrato", "implantacao", "inauguracao"];

const vacancyCriticalityLabel: Record<VacancyCriticality, string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
  estrategica: "Estrategica"
};

const utilityKindLabel: Record<UtilityKind, string> = {
  energia: "Energia",
  agua: "Agua"
};

const utilityStatusLabel: Record<UtilityStatus, string> = {
  normal: "Normal",
  atencao: "Atencao",
  critico: "Critico"
};

const serviceOrderCategoryLabel: Record<ServiceOrderCategory, string> = {
  eletrica: "Eletrica",
  hidraulica: "Hidraulica",
  civil: "Civil",
  limpeza: "Limpeza",
  seguranca: "Seguranca",
  jardinagem: "Jardinagem",
  comunicacao_visual: "Comunicacao visual",
  ar_condicionado: "Ar condicionado"
};

const serviceOrderPriorityLabel: Record<ServiceOrderPriority, string> = {
  baixa: "Baixa",
  media: "Media",
  alta: "Alta",
  critica: "Critica"
};

const serviceOrderStatusLabel: Record<ServiceOrderStatus, string> = {
  aberta: "Aberta",
  em_execucao: "Em execucao",
  aguardando_terceiro: "Aguardando terceiro",
  concluida: "Concluida"
};

const serviceOrderStatuses: ServiceOrderStatus[] = ["aberta", "em_execucao", "aguardando_terceiro", "concluida"];
const serviceOrderCategories: ServiceOrderCategory[] = ["eletrica", "hidraulica", "civil", "limpeza", "seguranca", "jardinagem", "comunicacao_visual", "ar_condicionado"];

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

const fppSchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim().min(1, "Selecione a loja."),
  contratoId: z.string().trim().min(1, "Selecione o contrato."),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  competencia: z.string().trim().min(7, "Informe a competencia."),
  percentual: z.coerce.number().min(0, "Informe zero ou mais."),
  aluguelMinimo: z.coerce.number().min(0, "Informe zero ou mais."),
  faturamentoInformado: z.coerce.number().min(0, "Informe zero ou mais."),
  faturamentoAuditado: z.coerce.number().min(0, "Informe zero ou mais."),
  status: z.enum(["aberto", "vencido", "pago", "cancelado"])
});

const revenueAuditSchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim().min(1, "Selecione a loja."),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  competencia: z.string().trim().min(7, "Informe a competencia."),
  relatorioErp: z.coerce.number().min(0, "Informe zero ou mais."),
  relatorioPdv: z.coerce.number().min(0, "Informe zero ou mais."),
  stone: z.coerce.number().min(0, "Informe zero ou mais."),
  rede: z.coerce.number().min(0, "Informe zero ou mais."),
  cielo: z.coerce.number().min(0, "Informe zero ou mais."),
  pix: z.coerce.number().min(0, "Informe zero ou mais."),
  ifood: z.coerce.number().min(0, "Informe zero ou mais."),
  delivery: z.coerce.number().min(0, "Informe zero ou mais."),
  faturamentoAnterior: z.coerce.number().min(0, "Informe zero ou mais."),
  status: z.enum(["pendente", "conciliado", "divergente", "critico"])
});

const commercialLeadSchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim(),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  empresa: z.string().trim().min(2, "Informe a empresa."),
  segmento: z.string().trim().min(2, "Informe o segmento."),
  responsavel: z.string().trim().min(2, "Informe o responsavel."),
  proximaAcao: z.string().trim().min(2, "Informe a proxima acao."),
  dataProximaAcao: z.string().trim().min(8, "Informe a data da proxima acao."),
  historico: z.string().trim(),
  etapa: z.enum(["prospeccao", "lead", "visita", "proposta", "negociacao", "contrato", "implantacao", "inauguracao"]),
  valorProposta: z.coerce.number().min(0, "Informe zero ou mais.")
});

const vacancySchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim().min(1, "Selecione a loja."),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  inicioVacancia: z.string().trim().min(8, "Informe o inicio da vacancia."),
  motivo: z.string().trim().min(2, "Informe o motivo."),
  criticidade: z.enum(["baixa", "media", "alta", "estrategica"]),
  estrategia: z.string().trim().min(2, "Informe a estrategia."),
  receitaPotencial: z.coerce.number().min(0, "Informe zero ou mais."),
  responsavel: z.string().trim().min(2, "Informe o responsavel.")
});

const utilityReadingSchema = z.object({
  id: z.string().min(1),
  lojaId: z.string().trim().min(1, "Selecione a loja."),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  tipo: z.enum(["energia", "agua"]),
  competencia: z.string().trim().min(7, "Informe a competencia."),
  consumo: z.coerce.number().min(0, "Informe zero ou mais."),
  consumoAnterior: z.coerce.number().min(0, "Informe zero ou mais."),
  valor: z.coerce.number().min(0, "Informe zero ou mais."),
  medidor: z.string().trim().min(2, "Informe o medidor."),
  status: z.enum(["normal", "atencao", "critico"])
});

const serviceOrderSchema = z.object({
  id: z.string().min(1),
  empreendimentoId: z.string().trim().min(1, "Selecione o empreendimento."),
  lojaId: z.string().trim(),
  local: z.string().trim().min(2, "Informe o local."),
  categoria: z.enum(["eletrica", "hidraulica", "civil", "limpeza", "seguranca", "jardinagem", "comunicacao_visual", "ar_condicionado"]),
  prioridade: z.enum(["baixa", "media", "alta", "critica"]),
  status: z.enum(["aberta", "em_execucao", "aguardando_terceiro", "concluida"]),
  responsavel: z.string().trim().min(2, "Informe o responsavel."),
  prazo: z.string().trim().min(8, "Informe o prazo."),
  custoPrevisto: z.coerce.number().min(0, "Informe zero ou mais."),
  custoRealizado: z.coerce.number().min(0, "Informe zero ou mais."),
  fotosAntes: z.string().trim(),
  fotosDepois: z.string().trim(),
  descricao: z.string().trim().min(2, "Informe a descricao.")
});

type EnterpriseFormValues = z.infer<typeof enterpriseSchema>;
type StoreFormValues = z.infer<typeof storeSchema>;
type TenantFormValues = z.infer<typeof tenantSchema>;
type ContractFormValues = z.infer<typeof contractSchema>;
type ReceivableFormValues = z.infer<typeof receivableSchema>;
type PayableFormValues = z.infer<typeof payableSchema>;
type DelinquencyFormValues = z.infer<typeof delinquencySchema>;
type FppFormValues = z.infer<typeof fppSchema>;
type RevenueAuditFormValues = z.infer<typeof revenueAuditSchema>;
type CommercialLeadFormValues = z.infer<typeof commercialLeadSchema>;
type VacancyFormValues = z.infer<typeof vacancySchema>;
type UtilityReadingFormValues = z.infer<typeof utilityReadingSchema>;
type ServiceOrderFormValues = z.infer<typeof serviceOrderSchema>;

export function ModulePage({
  module,
  enterprises,
  stores,
  tenants,
  contracts,
  receivables,
  payables,
  delinquencyRecords,
  fppRecords,
  revenueAuditRecords,
  commercialLeads,
  vacancyRecords,
  utilityReadings,
  serviceOrders,
  dataSource,
  syncError,
  onResetLocalData,
  onSaveEnterprise,
  onSaveStore,
  onSaveTenant,
  onSaveContract,
  onSaveReceivable,
  onSavePayable,
  onSaveDelinquencyRecord,
  onSaveFppRecord,
  onSaveRevenueAuditRecord,
  onSaveCommercialLead,
  onSaveVacancyRecord,
  onSaveUtilityReading,
  onSaveServiceOrder
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
  if (module === "FPP") {
    return (
      <FppPage
        enterprises={enterprises}
        stores={stores}
        contracts={contracts}
        tenants={tenants}
        fppRecords={fppRecords}
        onSaveFppRecord={onSaveFppRecord}
      />
    );
  }
  if (module === "Auditoria") {
    return (
      <RevenueAuditPage
        enterprises={enterprises}
        stores={stores}
        contracts={contracts}
        records={revenueAuditRecords}
        onSaveRecord={onSaveRevenueAuditRecord}
      />
    );
  }
  if (module === "Operacoes") {
    return (
      <OperationsPage
        enterprises={enterprises}
        stores={stores}
        serviceOrders={serviceOrders}
        onSaveServiceOrder={onSaveServiceOrder}
      />
    );
  }
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
  if (module === "Comercial") {
    return (
      <CommercialPage
        enterprises={enterprises}
        stores={stores}
        leads={commercialLeads}
        onSaveLead={onSaveCommercialLead}
      />
    );
  }
  if (module === "Vacancia") {
    return (
      <VacancyPage
        enterprises={enterprises}
        stores={stores}
        records={vacancyRecords}
        onSaveRecord={onSaveVacancyRecord}
      />
    );
  }
  if (module === "Energia e Agua") {
    return (
      <UtilitiesPage
        enterprises={enterprises}
        stores={stores}
        readings={utilityReadings}
        onSaveReading={onSaveUtilityReading}
      />
    );
  }

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

function FppPage({
  enterprises,
  stores,
  contracts,
  tenants,
  fppRecords,
  onSaveFppRecord
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  contracts: Contract[];
  tenants: Tenant[];
  fppRecords: FppRecord[];
  onSaveFppRecord: (record: FppRecord) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingRecord, setEditingRecord] = useState<FppRecord | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedRecords = fppRecords.filter((record) => selectedEnterpriseIds.has(record.empreendimentoId));
  const billingRows = selectedRecords.map((record) => ({ record, billing: fppBilling(record) }));
  const auditedRevenue = selectedRecords.reduce((sum, record) => sum + fppRevenueBase(record), 0);
  const percentageRevenue = billingRows.reduce((sum, item) => sum + item.billing.valorPercentual, 0);
  const complementaryRevenue = billingRows.reduce((sum, item) => sum + item.billing.valorComplementar, 0);
  const billingTotal = billingRows.reduce((sum, item) => sum + item.billing.valorCobrado, 0);
  const percentageRuleCount = billingRows.filter((item) => item.billing.regra === "percentual").length;
  const firstStore = selectedStores[0] ?? stores[0];

  return (
    <Shell
      title="FPP"
      description="Aluguel complementar com faturamento informado, auditado e cobranca automatica entre percentual e minimo."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingRecord(emptyFppRecord(firstStore, contracts))}>
            <Plus className="h-4 w-4" />
            Lancamento
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Faturamento auditado" value={brl(auditedRevenue)} />
        <Kpi label="Valor percentual" value={brl(percentageRevenue)} />
        <Kpi label="Complementar" value={brl(complementaryRevenue)} tone="success" />
        <Kpi label="Cobranca FPP" value={brl(billingTotal)} tone="success" />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-3 font-bold uppercase">Contratos percentuais</h2>
          <DataTable
            columns={["Loja", "Lojista", "%", "Minimo", "Fat. auditado", "Valor %", "Complementar", "Cobrar", "Status", "Acoes"]}
            rows={billingRows.map(({ record, billing }) => [
              storeLabel(stores, record.lojaId),
              tenantByStore(tenants, record.lojaId),
              `${numberPt(record.percentual)}%`,
              brl(record.aluguelMinimo),
              brl(fppRevenueBase(record)),
              brl(billing.valorPercentual),
              brl(billing.valorComplementar),
              brl(billing.valorCobrado),
              financialStatusLabel[record.status],
              "Editar"
            ])}
            onAction={(rowIndex) => setEditingRecord(billingRows[rowIndex].record)}
          />
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Regra de cobranca</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            O sistema compara o valor percentual sobre o faturamento auditado com o aluguel minimo e cobra o maior valor.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Base auditada" value={brl(auditedRevenue)} />
            <Mini label="Regra percentual" value={`${percentageRuleCount} contratos`} />
            <Mini label="Regra minimo" value={`${Math.max(billingRows.length - percentageRuleCount, 0)} contratos`} />
          </div>
          <h3 className="mt-6 text-sm font-bold uppercase">Alertas</h3>
          <div className="mt-3 space-y-2">
            {billingRows
              .filter(({ record }) => Math.abs(record.faturamentoAuditado - record.faturamentoInformado) / Math.max(record.faturamentoInformado, 1) > 0.05)
              .map(({ record }) => (
                <div key={record.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  <p className="font-bold text-primary">{storeLabel(stores, record.lojaId)}</p>
                  <p className="text-muted-foreground">Divergencia acima de 5% entre informado e auditado.</p>
                </div>
              ))}
          </div>
        </div>
      </div>
      {editingRecord ? (
        <FppForm
          record={editingRecord}
          stores={stores}
          enterprises={enterprises}
          contracts={contracts}
          onClose={() => setEditingRecord(null)}
          onSave={async (record) => {
            await onSaveFppRecord(record);
            setEditingRecord(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function RevenueAuditPage({
  enterprises,
  stores,
  contracts,
  records,
  onSaveRecord
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  contracts: Contract[];
  records: RevenueAuditRecord[];
  onSaveRecord: (record: RevenueAuditRecord) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingRecord, setEditingRecord] = useState<RevenueAuditRecord | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedRecords = records.filter((record) => selectedEnterpriseIds.has(record.empreendimentoId));
  const auditedRevenue = selectedRecords.reduce((sum, record) => sum + auditPaymentTotal(record), 0);
  const erpRevenue = selectedRecords.reduce((sum, record) => sum + record.relatorioErp, 0);
  const rentRevenue = selectedRecords.reduce((sum, record) => sum + (stores.find((store) => store.id === record.lojaId)?.aluguel ?? 0), 0);
  const averageDivergence = erpRevenue > 0 ? Math.abs(erpRevenue - auditedRevenue) / erpRevenue : 0;
  const selectedArea = selectedRecords.reduce((sum, record) => sum + (stores.find((store) => store.id === record.lojaId)?.areaTotal ?? 0), 0);
  const revenuePerSquareMeter = selectedArea > 0 ? auditedRevenue / selectedArea : 0;
  const occupancyRent = auditedRevenue > 0 ? rentRevenue / auditedRevenue : 0;
  const alerts = selectedRecords.flatMap((record) => auditAlerts(record, stores));
  const segmentRows = auditRevenueBySegment(selectedRecords, stores);
  const firstStore = selectedStores[0] ?? stores[0];

  return (
    <Shell
      title="Auditoria de Faturamento"
      description="Concilia ERP, PDV, adquirentes, PIX e delivery com alertas de divergencia e queda."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingRecord(emptyRevenueAuditRecord(firstStore))}>
            <Plus className="h-4 w-4" />
            Auditoria
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Divergencia media" value={percent(averageDivergence)} tone={averageDivergence > 0.1 ? "danger" : averageDivergence <= 0.05 ? "success" : "default"} />
        <Kpi label="Faturamento auditado" value={brl(auditedRevenue)} tone="success" />
        <Kpi label="Faturamento por m2" value={brl(revenuePerSquareMeter)} />
        <Kpi label="Aluguel ocupacional" value={percent(occupancyRent)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div>
            <h2 className="mb-3 font-bold uppercase">Conferencia de fontes</h2>
            <DataTable
              columns={["Loja", "ERP", "PDV", "Cartoes/PIX", "iFood", "Delivery", "Divergencia", "Queda", "Status", "Acoes"]}
              rows={selectedRecords.map((record) => {
                const alert = auditAlertLevel(record);
                return [
                  storeLabel(stores, record.lojaId),
                  brl(record.relatorioErp),
                  brl(record.relatorioPdv),
                  brl(auditCardPixTotal(record)),
                  brl(record.ifood),
                  brl(record.delivery),
                  percent(auditDivergence(record)),
                  percent(auditDrop(record)),
                  alert === "critico" ? "Critico" : revenueAuditStatusLabel[record.status],
                  "Editar"
                ];
              })}
              onAction={(rowIndex) => setEditingRecord(selectedRecords[rowIndex])}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Receita por segmento</h2>
            <DataTable
              columns={["Segmento", "Lojas", "Faturamento", "Faturamento por m2"]}
              rows={segmentRows.map((row) => [
                row.segmento,
                String(row.lojas),
                brl(row.faturamento),
                brl(row.area > 0 ? row.faturamento / row.area : 0)
              ])}
            />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Alertas automaticos</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Divergencias acima de 5% entram em atencao, acima de 10% viram criticas e quedas acima de 20% entram na pauta comercial.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Lojas auditadas" value={`${selectedRecords.length}`} />
            <Mini label="Alertas ativos" value={`${alerts.length}`} />
            <Mini label="Contratos vinculados" value={`${contracts.filter((contract) => selectedRecords.some((record) => record.lojaId === contract.lojaId)).length}`} />
          </div>
          <div className="mt-5 space-y-2">
            {alerts.map((alert) => (
              <div key={`${alert.recordId}-${alert.label}`} className="rounded-lg border border-border px-3 py-2 text-sm">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{alert.label}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{alert.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {editingRecord ? (
        <RevenueAuditForm
          record={editingRecord}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingRecord(null)}
          onSave={async (record) => {
            await onSaveRecord(record);
            setEditingRecord(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function OperationsPage({
  enterprises,
  stores,
  serviceOrders,
  onSaveServiceOrder
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  serviceOrders: ServiceOrder[];
  onSaveServiceOrder: (order: ServiceOrder) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedOrders = serviceOrders.filter((order) => selectedEnterpriseIds.has(order.empreendimentoId));
  const openOrders = selectedOrders.filter((order) => order.status !== "concluida");
  const criticalOrders = selectedOrders.filter((order) => order.prioridade === "critica" && order.status !== "concluida");
  const plannedCost = selectedOrders.reduce((sum, order) => sum + order.custoPrevisto, 0);
  const realizedCost = selectedOrders.reduce((sum, order) => sum + order.custoRealizado, 0);
  const firstStore = selectedStores[0] ?? stores[0];

  return (
    <Shell
      title="Operacoes"
      description="Ordens de servico, manutencao, prioridades, prazos, custos e evidencias antes/depois."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingOrder(emptyServiceOrder(firstStore, enterpriseId === "all" ? enterprises[0]?.id ?? "" : enterpriseId))}>
            <Plus className="h-4 w-4" />
            Ordem de servico
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="OS abertas" value={numberPt(openOrders.length)} tone={openOrders.length ? "danger" : "success"} />
        <Kpi label="Criticas" value={numberPt(criticalOrders.length)} tone={criticalOrders.length ? "danger" : "success"} />
        <Kpi label="Custo previsto" value={brl(plannedCost)} />
        <Kpi label="Custo realizado" value={brl(realizedCost)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-4">
        {serviceOrderStatuses.map((status) => {
          const laneOrders = selectedOrders.filter((order) => order.status === status);

          return (
            <div key={status} className="panel min-h-[430px] p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h2 className="font-bold uppercase">{serviceOrderStatusLabel[status]}</h2>
                </div>
                <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold text-primary">{laneOrders.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {laneOrders.length ? (
                  laneOrders.map((order) => (
                    <button key={order.id} className="w-full text-left" onClick={() => setEditingOrder(order)}>
                      <KanbanCard
                        title={serviceOrderLocation(order, stores)}
                        subtitle={`${serviceOrderCategoryLabel[order.categoria]} | ${serviceOrderPriorityLabel[order.prioridade]} | ${order.responsavel}`}
                        value={`${order.prazo} | ${brl(order.custoPrevisto)}`}
                      />
                    </button>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium text-muted-foreground">
                    Sem ordens nesta etapa.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <DataTable
          columns={["Local", "Categoria", "Prioridade", "Prazo", "Previsto", "Realizado", "Fotos", "Acoes"]}
          rows={selectedOrders.map((order) => [
            serviceOrderLocation(order, stores),
            serviceOrderCategoryLabel[order.categoria],
            serviceOrderPriorityLabel[order.prioridade],
            order.prazo,
            brl(order.custoPrevisto),
            brl(order.custoRealizado),
            serviceOrderEvidence(order),
            "Editar"
          ])}
          onAction={(rowIndex) => setEditingOrder(selectedOrders[rowIndex])}
        />
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Custos e evidencias</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Controle de responsavel, prazo, custo previsto, custo realizado e pastas de fotos antes/depois.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Ordens monitoradas" value={numberPt(selectedOrders.length)} />
            <Mini label="Com foto antes" value={numberPt(selectedOrders.filter((order) => order.fotosAntes).length)} />
            <Mini label="Com foto depois" value={numberPt(selectedOrders.filter((order) => order.fotosDepois).length)} />
          </div>
          <h3 className="mt-6 text-sm font-bold uppercase">Prazos criticos</h3>
          <div className="mt-3 space-y-2">
            {selectedOrders
              .filter((order) => order.status !== "concluida")
              .slice()
              .sort((a, b) => a.prazo.localeCompare(b.prazo))
              .slice(0, 4)
              .map((order) => (
                <button key={order.id} className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm" onClick={() => setEditingOrder(order)}>
                  <p className="font-bold text-primary">{serviceOrderLocation(order, stores)}</p>
                  <p className="text-muted-foreground">{order.prazo} | {serviceOrderCategoryLabel[order.categoria]} | {serviceOrderPriorityLabel[order.prioridade]}</p>
                </button>
              ))}
          </div>
        </div>
      </div>
      {editingOrder ? (
        <ServiceOrderForm
          order={editingOrder}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingOrder(null)}
          onSave={async (order) => {
            await onSaveServiceOrder(order);
            setEditingOrder(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function CommercialPage({
  enterprises,
  stores,
  leads,
  onSaveLead
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  leads: CommercialLead[];
  onSaveLead: (lead: CommercialLead) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingLead, setEditingLead] = useState<CommercialLead | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedEnterprises = enterprises.filter((enterprise) => selectedEnterpriseIds.has(enterprise.id));
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedLeads = leads.filter((lead) => selectedEnterpriseIds.has(lead.empreendimentoId));
  const availableStores = selectedStores.filter((store) => store.status === "disponivel");
  const proposalCount = selectedLeads.filter((lead) => lead.etapa === "proposta").length;
  const contractCount = selectedLeads.filter((lead) => lead.etapa === "contrato").length;
  const pipelineValue = selectedLeads.reduce((sum, lead) => sum + lead.valorProposta, 0);
  const firstStore = selectedStores[0] ?? stores[0];

  return (
    <Shell
      title="Comercial"
      description="Pipeline de comercializacao, leads, visitas, propostas, negociacao, contrato e implantacao."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingLead(emptyCommercialLead(firstStore))}>
            <Plus className="h-4 w-4" />
            Oportunidade
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Ativos no filtro" value={numberPt(selectedEnterprises.length)} />
        <Kpi label="Lojas disponiveis" value={numberPt(availableStores.length)} />
        <Kpi label="Propostas enviadas" value={numberPt(proposalCount)} tone="success" />
        <Kpi label="Valor pipeline" value={brl(pipelineValue)} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto pb-2">
          <div className="grid min-w-[1300px] gap-3 xl:grid-cols-9">
            <CommercialLane title="Disponivel" count={availableStores.length}>
              {availableStores.map((store) => (
                <KanbanCard
                  key={store.id}
                  title={`${store.codigo} - ${store.nome}`}
                  subtitle={`${enterpriseLabel(enterprises, store.empreendimentoId)} | ${store.segmento}`}
                  value={brl(store.aluguel)}
                />
              ))}
            </CommercialLane>
            {commercialStages.map((stage) => {
              const stageLeads = selectedLeads.filter((lead) => lead.etapa === stage);
              return (
                <CommercialLane key={stage} title={commercialStageLabel[stage]} count={stageLeads.length}>
                  {stageLeads.map((lead) => (
                    <KanbanCard
                      key={lead.id}
                      title={lead.empresa}
                      subtitle={`${storeLabel(stores, lead.lojaId)} | ${lead.segmento}`}
                      value={lead.proximaAcao}
                      onClick={() => setEditingLead(lead)}
                    />
                  ))}
                </CommercialLane>
              );
            })}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Resumo comercial</h2>
          <div className="mt-5 grid gap-3">
            <Mini label="Oportunidades" value={numberPt(selectedLeads.length)} />
            <Mini label="Contratos em elaboracao" value={numberPt(contractCount)} />
            <Mini label="Ticket medio" value={brl(selectedLeads.length ? pipelineValue / selectedLeads.length : 0)} />
          </div>
          <h3 className="mt-6 text-sm font-bold uppercase">Proximas acoes</h3>
          <div className="mt-3 space-y-2">
            {selectedLeads
              .slice()
              .sort((a, b) => a.dataProximaAcao.localeCompare(b.dataProximaAcao))
              .slice(0, 5)
              .map((lead) => (
                <button
                  key={lead.id}
                  className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm"
                  onClick={() => setEditingLead(lead)}
                >
                  <p className="font-bold text-primary">{lead.empresa}</p>
                  <p className="text-muted-foreground">{lead.dataProximaAcao} | {lead.proximaAcao}</p>
                </button>
              ))}
          </div>
        </div>
      </div>
      {editingLead ? (
        <CommercialLeadForm
          lead={editingLead}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingLead(null)}
          onSave={async (lead) => {
            await onSaveLead(lead);
            setEditingLead(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function VacancyPage({
  enterprises,
  stores,
  records,
  onSaveRecord
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  records: VacancyRecord[];
  onSaveRecord: (record: VacancyRecord) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingRecord, setEditingRecord] = useState<VacancyRecord | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedRecords = records.filter((record) => selectedEnterpriseIds.has(record.empreendimentoId));
  const occupiedStores = selectedStores.filter((store) => ["ocupada", "implantacao", "em_obra"].includes(store.status));
  const vacantStores = selectedStores.filter((store) => ["disponivel", "negociacao", "inativa"].includes(store.status));
  const totalArea = selectedStores.reduce((sum, store) => sum + store.areaTotal, 0);
  const vacantArea = vacantStores.reduce((sum, store) => sum + store.areaTotal, 0);
  const potentialRent = selectedStores.reduce((sum, store) => sum + store.aluguel, 0);
  const lostRevenue = selectedRecords.length
    ? selectedRecords.reduce((sum, record) => sum + record.receitaPotencial, 0)
    : vacantStores.reduce((sum, store) => sum + store.aluguel, 0);
  const averageVacancyDays = selectedRecords.length
    ? Math.round(selectedRecords.reduce((sum, record) => sum + vacancyDays(record), 0) / selectedRecords.length)
    : 0;
  const strategicRecords = selectedRecords.filter((record) => record.criticidade === "estrategica");
  const firstVacantStore = vacantStores[0] ?? selectedStores[0] ?? stores[0];

  return (
    <Shell
      title="Ocupacao e Vacancia"
      description="Indicadores de ocupacao, vacancia fisica e financeira, receita perdida e ranking de lojas criticas."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingRecord(emptyVacancyRecord(firstVacantStore))}>
            <Plus className="h-4 w-4" />
            Vacancia
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Total lojas" value={numberPt(selectedStores.length)} />
        <Kpi label="Lojas ocupadas" value={numberPt(occupiedStores.length)} tone="success" />
        <Kpi label="Lojas vagas" value={numberPt(vacantStores.length)} tone={vacantStores.length ? "danger" : "success"} />
        <Kpi label="Taxa ocupacao" value={percent(selectedStores.length ? occupiedStores.length / selectedStores.length : 0)} />
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Vacancia fisica" value={percent(totalArea > 0 ? vacantArea / totalArea : 0)} />
        <Kpi label="Vacancia financeira" value={percent(potentialRent > 0 ? lostRevenue / potentialRent : 0)} tone={lostRevenue > 0 ? "danger" : "success"} />
        <Kpi label="Receita perdida" value={brl(lostRevenue)} tone={lostRevenue > 0 ? "danger" : "success"} />
        <Kpi label="Tempo medio vacancia" value={`${numberPt(averageVacancyDays)} dias`} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div>
            <h2 className="mb-3 font-bold uppercase">Maiores vacancias</h2>
            <DataTable
              columns={["Loja", "Empreendimento", "ABL", "Aluguel", "Status"]}
              rows={vacantStores
                .slice()
                .sort((a, b) => b.areaTotal - a.areaTotal)
                .map((store) => [
                  `${store.codigo} - ${store.nome}`,
                  enterpriseLabel(enterprises, store.empreendimentoId),
                  `${numberPt(store.areaTotal)} m2`,
                  brl(store.aluguel),
                  statusLabel[store.status]
                ])}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Lojas criticas</h2>
            <DataTable
              columns={["Loja", "Dias", "Criticidade", "Receita perdida", "Responsavel", "Acoes"]}
              rows={selectedRecords
                .slice()
                .sort((a, b) => criticalityWeight(b.criticidade) - criticalityWeight(a.criticidade) || b.receitaPotencial - a.receitaPotencial)
                .map((record) => [
                  storeLabel(stores, record.lojaId),
                  numberPt(vacancyDays(record)),
                  vacancyCriticalityLabel[record.criticidade],
                  brl(record.receitaPotencial),
                  record.responsavel,
                  "Editar"
                ])}
              onAction={(rowIndex) => {
                const ordered = selectedRecords
                  .slice()
                  .sort((a, b) => criticalityWeight(b.criticidade) - criticalityWeight(a.criticidade) || b.receitaPotencial - a.receitaPotencial);
                setEditingRecord(ordered[rowIndex]);
              }}
            />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Lojas estrategicas</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Ranking de espacos com maior impacto financeiro, ABL ou relevancia de mix.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Registros monitorados" value={numberPt(selectedRecords.length)} />
            <Mini label="Estrategicas" value={numberPt(strategicRecords.length)} />
            <Mini label="ABL vaga" value={`${numberPt(vacantArea)} m2`} />
          </div>
          <div className="mt-5 space-y-2">
            {strategicRecords.map((record) => (
              <button key={record.id} className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm" onClick={() => setEditingRecord(record)}>
                <p className="font-bold text-primary">{storeLabel(stores, record.lojaId)}</p>
                <p className="text-muted-foreground">{record.estrategia}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      {editingRecord ? (
        <VacancyForm
          record={editingRecord}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingRecord(null)}
          onSave={async (record) => {
            await onSaveRecord(record);
            setEditingRecord(null);
          }}
        />
      ) : null}
    </Shell>
  );
}

function UtilitiesPage({
  enterprises,
  stores,
  readings,
  onSaveReading
}: {
  enterprises: Enterprise[];
  stores: StoreType[];
  readings: UtilityReading[];
  onSaveReading: (reading: UtilityReading) => void | Promise<void>;
}) {
  const [enterpriseId, setEnterpriseId] = useState("all");
  const [editingReading, setEditingReading] = useState<UtilityReading | null>(null);
  const selectedEnterpriseIds = new Set(enterpriseId === "all" ? enterprises.map((item) => item.id) : [enterpriseId]);
  const selectedStores = stores.filter((store) => selectedEnterpriseIds.has(store.empreendimentoId));
  const selectedReadings = readings.filter((reading) => selectedEnterpriseIds.has(reading.empreendimentoId));
  const energyReadings = selectedReadings.filter((reading) => reading.tipo === "energia");
  const waterReadings = selectedReadings.filter((reading) => reading.tipo === "agua");
  const energyConsumption = energyReadings.reduce((sum, reading) => sum + reading.consumo, 0);
  const waterConsumption = waterReadings.reduce((sum, reading) => sum + reading.consumo, 0);
  const energyValue = energyReadings.reduce((sum, reading) => sum + reading.valor, 0);
  const waterValue = waterReadings.reduce((sum, reading) => sum + reading.valor, 0);
  const alerts = utilityAlerts(selectedReadings, stores);
  const firstStore = selectedStores[0] ?? stores[0];

  return (
    <Shell
      title="Energia e Agua"
      description="Controle de consumo CEMIG e DMAE por loja, competencia, medidor, variacao e alertas operacionais."
      action={
        <div className="flex flex-wrap gap-2">
          <select className="control min-w-[190px]" value={enterpriseId} onChange={(event) => setEnterpriseId(event.target.value)}>
            <option value="all">Todos os empreendimentos</option>
            {enterprises.map((enterprise) => (
              <option key={enterprise.id} value={enterprise.id}>{enterprise.nome}</option>
            ))}
          </select>
          <button className="control inline-flex items-center gap-2 bg-primary text-primary-foreground" onClick={() => setEditingReading(emptyUtilityReading(firstStore, "energia"))}>
            <Zap className="h-4 w-4" />
            Energia
          </button>
          <button className="control inline-flex items-center gap-2" onClick={() => setEditingReading(emptyUtilityReading(firstStore, "agua"))}>
            <Droplets className="h-4 w-4" />
            Agua
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Consumo energia" value={`${numberPt(energyConsumption)} kWh`} />
        <Kpi label="Valor energia" value={brl(energyValue)} />
        <Kpi label="Consumo agua" value={`${numberPt(waterConsumption)} m3`} />
        <Kpi label="Alertas" value={numberPt(alerts.length)} tone={alerts.length ? "danger" : "success"} />
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div>
            <h2 className="mb-3 font-bold uppercase">Energia (CEMIG)</h2>
            <DataTable
              columns={["Loja", "Competencia", "Medidor", "Consumo", "Valor", "Variacao", "Status", "Acoes"]}
              rows={energyReadings.map((reading) => [
                storeLabel(stores, reading.lojaId),
                reading.competencia,
                reading.medidor,
                `${numberPt(reading.consumo)} kWh`,
                brl(reading.valor),
                percent(utilityVariation(reading)),
                utilityStatusLabel[reading.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingReading(energyReadings[rowIndex])}
            />
          </div>
          <div>
            <h2 className="mb-3 font-bold uppercase">Agua (DMAE)</h2>
            <DataTable
              columns={["Loja", "Competencia", "Medidor", "Consumo", "Valor", "Variacao", "Status", "Acoes"]}
              rows={waterReadings.map((reading) => [
                storeLabel(stores, reading.lojaId),
                reading.competencia,
                reading.medidor,
                `${numberPt(reading.consumo)} m3`,
                brl(reading.valor),
                percent(utilityVariation(reading)),
                utilityStatusLabel[reading.status],
                "Editar"
              ])}
              onAction={(rowIndex) => setEditingReading(waterReadings[rowIndex])}
            />
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="font-bold uppercase">Alertas de consumo</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Monitoramento automatico de consumo acima da media, consumo anormal e possiveis vazamentos.
          </p>
          <div className="mt-5 grid gap-3">
            <Mini label="Leituras energia" value={numberPt(energyReadings.length)} />
            <Mini label="Leituras agua" value={numberPt(waterReadings.length)} />
            <Mini label="Custo total" value={brl(energyValue + waterValue)} />
          </div>
          <div className="mt-5 space-y-2">
            {alerts.length ? (
              alerts.map((alert) => (
                <button key={alert.reading.id} className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm" onClick={() => setEditingReading(alert.reading)}>
                  <p className="font-bold text-primary">{alert.title}</p>
                  <p className="text-muted-foreground">{alert.detail}</p>
                </button>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium text-muted-foreground">
                Nenhum alerta ativo para o filtro selecionado.
              </div>
            )}
          </div>
        </div>
      </div>
      {editingReading ? (
        <UtilityReadingForm
          reading={editingReading}
          stores={stores}
          enterprises={enterprises}
          onClose={() => setEditingReading(null)}
          onSave={async (reading) => {
            await onSaveReading(reading);
            setEditingReading(null);
          }}
        />
      ) : null}
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

function CommercialLane({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="panel min-h-[420px] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase">{title}</h2>
        <Badge>{numberPt(count)}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {count ? children : (
          <div className="rounded-lg border border-dashed border-border p-3 text-xs font-medium text-muted-foreground">
            Sem oportunidades nesta etapa.
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ title, subtitle, value, onClick }: { title: string; subtitle: string; value: string; onClick?: () => void }) {
  const content = (
    <>
      <div className="font-bold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
      <div className="mt-3 text-sm font-bold text-primary">{value}</div>
    </>
  );

  if (onClick) {
    return (
      <button className="w-full rounded-lg border border-border bg-white p-3 text-left shadow-sm transition hover:border-primary/40" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
      {content}
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

function FppForm({
  record,
  stores,
  enterprises,
  contracts,
  onClose,
  onSave
}: {
  record: FppRecord;
  stores: StoreType[];
  enterprises: Enterprise[];
  contracts: Contract[];
  onClose: () => void;
  onSave: (record: FppRecord) => void;
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
  const contractOptions = useMemo(() => contracts.map((contract) => contract.id), [contracts]);
  const contractLabels = useMemo(
    () => Object.fromEntries(contracts.map((contract) => [contract.id, `${storeLabel(stores, contract.lojaId)} - ${contract.indiceReajuste}`])),
    [contracts, stores]
  );
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FppFormValues>({
    resolver: zodResolver(fppSchema),
    defaultValues: record
  });
  const preview = fppBilling({
    ...record,
    percentual: Number(watch("percentual") ?? record.percentual),
    aluguelMinimo: Number(watch("aluguelMinimo") ?? record.aluguelMinimo),
    faturamentoInformado: Number(watch("faturamentoInformado") ?? record.faturamentoInformado),
    faturamentoAuditado: Number(watch("faturamentoAuditado") ?? record.faturamentoAuditado)
  });

  return (
    <Modal title="Aluguel complementar FPP" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormSelect label="Loja" error={errors.lojaId?.message} options={storeOptions} optionLabels={storeLabels} {...register("lojaId")} />
          <FormSelect
            label="Contrato"
            error={errors.contratoId?.message}
            options={contractOptions}
            optionLabels={contractLabels}
            {...register("contratoId")}
          />
          <FormSelect
            label="Empreendimento"
            error={errors.empreendimentoId?.message}
            options={enterpriseOptions}
            optionLabels={enterpriseLabels}
            {...register("empreendimentoId")}
          />
          <FormInput label="Competencia" placeholder="2026-05" error={errors.competencia?.message} {...register("competencia")} />
          <FormInput label="Percentual" type="number" step="0.01" error={errors.percentual?.message} {...register("percentual")} />
          <FormInput label="Aluguel minimo" type="number" error={errors.aluguelMinimo?.message} {...register("aluguelMinimo")} />
          <FormInput label="Faturamento informado" type="number" error={errors.faturamentoInformado?.message} {...register("faturamentoInformado")} />
          <FormInput label="Faturamento auditado" type="number" error={errors.faturamentoAuditado?.message} {...register("faturamentoAuditado")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["aberto", "vencido", "pago", "cancelado"]}
            optionLabels={financialStatusLabel}
            {...register("status")}
          />
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="metric-label">Previa de cobranca</p>
            <p className="mt-1 font-bold text-primary">{brl(preview.valorCobrado)}</p>
            <p className="text-muted-foreground">Complementar: {brl(preview.valorComplementar)}</p>
          </div>
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function RevenueAuditForm({
  record,
  stores,
  enterprises,
  onClose,
  onSave
}: {
  record: RevenueAuditRecord;
  stores: StoreType[];
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (record: RevenueAuditRecord) => void;
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
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RevenueAuditFormValues>({
    resolver: zodResolver(revenueAuditSchema),
    defaultValues: record
  });
  const previewRecord: RevenueAuditRecord = {
    ...record,
    relatorioErp: Number(watch("relatorioErp") ?? record.relatorioErp),
    relatorioPdv: Number(watch("relatorioPdv") ?? record.relatorioPdv),
    stone: Number(watch("stone") ?? record.stone),
    rede: Number(watch("rede") ?? record.rede),
    cielo: Number(watch("cielo") ?? record.cielo),
    pix: Number(watch("pix") ?? record.pix),
    ifood: Number(watch("ifood") ?? record.ifood),
    delivery: Number(watch("delivery") ?? record.delivery),
    faturamentoAnterior: Number(watch("faturamentoAnterior") ?? record.faturamentoAnterior)
  };

  return (
    <Modal title="Auditoria de faturamento" onClose={onClose}>
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
          <FormInput label="Relatorio ERP" type="number" error={errors.relatorioErp?.message} {...register("relatorioErp")} />
          <FormInput label="Relatorio PDV" type="number" error={errors.relatorioPdv?.message} {...register("relatorioPdv")} />
          <FormInput label="Stone" type="number" error={errors.stone?.message} {...register("stone")} />
          <FormInput label="Rede" type="number" error={errors.rede?.message} {...register("rede")} />
          <FormInput label="Cielo" type="number" error={errors.cielo?.message} {...register("cielo")} />
          <FormInput label="PIX" type="number" error={errors.pix?.message} {...register("pix")} />
          <FormInput label="iFood" type="number" error={errors.ifood?.message} {...register("ifood")} />
          <FormInput label="Delivery" type="number" error={errors.delivery?.message} {...register("delivery")} />
          <FormInput label="Faturamento anterior" type="number" error={errors.faturamentoAnterior?.message} {...register("faturamentoAnterior")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["pendente", "conciliado", "divergente", "critico"]}
            optionLabels={revenueAuditStatusLabel}
            {...register("status")}
          />
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <p className="metric-label">Previa da auditoria</p>
            <p className="mt-1 font-bold text-primary">{brl(auditPaymentTotal(previewRecord))}</p>
            <p className="text-muted-foreground">Divergencia: {percent(auditDivergence(previewRecord))}</p>
            <p className="text-muted-foreground">Queda: {percent(auditDrop(previewRecord))}</p>
          </div>
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function CommercialLeadForm({
  lead,
  stores,
  enterprises,
  onClose,
  onSave
}: {
  lead: CommercialLead;
  stores: StoreType[];
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (lead: CommercialLead) => void;
}) {
  const storeOptions = useMemo(() => ["", ...stores.map((store) => store.id)], [stores]);
  const storeLabels = useMemo(
    () => ({
      "": "Sem loja definida",
      ...Object.fromEntries(stores.map((store) => [store.id, `${store.codigo} - ${store.nome}`]))
    }),
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
  } = useForm<CommercialLeadFormValues>({
    resolver: zodResolver(commercialLeadSchema),
    defaultValues: lead
  });

  return (
    <Modal title="Oportunidade comercial" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => onSave(values))}>
        <input type="hidden" {...register("id")} />
        <div className="grid gap-3 md:grid-cols-2">
          <FormInput label="Empresa" error={errors.empresa?.message} {...register("empresa")} />
          <FormInput label="Segmento" error={errors.segmento?.message} {...register("segmento")} />
          <FormSelect
            label="Etapa"
            error={errors.etapa?.message}
            options={commercialStages}
            optionLabels={commercialStageLabel}
            {...register("etapa")}
          />
          <FormSelect
            label="Loja"
            error={errors.lojaId?.message}
            options={storeOptions}
            optionLabels={storeLabels}
            {...register("lojaId")}
          />
          <FormSelect
            label="Empreendimento"
            error={errors.empreendimentoId?.message}
            options={enterpriseOptions}
            optionLabels={enterpriseLabels}
            {...register("empreendimentoId")}
          />
          <FormInput label="Responsavel" error={errors.responsavel?.message} {...register("responsavel")} />
          <FormInput label="Proxima acao" error={errors.proximaAcao?.message} {...register("proximaAcao")} />
          <FormInput label="Data proxima acao" type="date" error={errors.dataProximaAcao?.message} {...register("dataProximaAcao")} />
          <FormInput label="Valor proposta" type="number" error={errors.valorProposta?.message} {...register("valorProposta")} />
          <FormInput label="Historico" error={errors.historico?.message} {...register("historico")} />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function VacancyForm({
  record,
  stores,
  enterprises,
  onClose,
  onSave
}: {
  record: VacancyRecord;
  stores: StoreType[];
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (record: VacancyRecord) => void;
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
  } = useForm<VacancyFormValues>({
    resolver: zodResolver(vacancySchema),
    defaultValues: record
  });

  return (
    <Modal title="Registro de vacancia" onClose={onClose}>
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
          <FormInput label="Inicio vacancia" type="date" error={errors.inicioVacancia?.message} {...register("inicioVacancia")} />
          <FormSelect
            label="Criticidade"
            error={errors.criticidade?.message}
            options={["baixa", "media", "alta", "estrategica"]}
            optionLabels={vacancyCriticalityLabel}
            {...register("criticidade")}
          />
          <FormInput label="Receita potencial" type="number" error={errors.receitaPotencial?.message} {...register("receitaPotencial")} />
          <FormInput label="Responsavel" error={errors.responsavel?.message} {...register("responsavel")} />
          <FormInput label="Motivo" error={errors.motivo?.message} {...register("motivo")} />
          <FormInput label="Estrategia" error={errors.estrategia?.message} {...register("estrategia")} />
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function UtilityReadingForm({
  reading,
  stores,
  enterprises,
  onClose,
  onSave
}: {
  reading: UtilityReading;
  stores: StoreType[];
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (reading: UtilityReading) => void;
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
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UtilityReadingFormValues>({
    resolver: zodResolver(utilityReadingSchema),
    defaultValues: reading
  });
  const watchedReading = watch();
  const previewVariation = utilityVariation({
    ...reading,
    consumo: Number(watchedReading.consumo) || 0,
    consumoAnterior: Number(watchedReading.consumoAnterior) || 0
  });

  return (
    <Modal title="Leitura de consumo" onClose={onClose}>
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
          <FormSelect
            label="Tipo"
            error={errors.tipo?.message}
            options={["energia", "agua"]}
            optionLabels={utilityKindLabel}
            {...register("tipo")}
          />
          <FormInput label="Competencia" type="month" error={errors.competencia?.message} {...register("competencia")} />
          <FormInput label="Medidor" error={errors.medidor?.message} {...register("medidor")} />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={["normal", "atencao", "critico"]}
            optionLabels={utilityStatusLabel}
            {...register("status")}
          />
          <FormInput label="Consumo" type="number" error={errors.consumo?.message} {...register("consumo")} />
          <FormInput label="Consumo anterior" type="number" error={errors.consumoAnterior?.message} {...register("consumoAnterior")} />
          <FormInput label="Valor" type="number" error={errors.valor?.message} {...register("valor")} />
          <div className="rounded-lg border border-border bg-muted/35 px-3 py-2">
            <span className="metric-label">Variacao</span>
            <p className="mt-1 text-lg font-bold text-primary">{percent(previewVariation)}</p>
          </div>
        </div>
        <FormActions onClose={onClose} isSubmitting={isSubmitting} />
      </form>
    </Modal>
  );
}

function ServiceOrderForm({
  order,
  stores,
  enterprises,
  onClose,
  onSave
}: {
  order: ServiceOrder;
  stores: StoreType[];
  enterprises: Enterprise[];
  onClose: () => void;
  onSave: (order: ServiceOrder) => void;
}) {
  const storeOptions = useMemo(() => ["", ...stores.map((store) => store.id)], [stores]);
  const storeLabels = useMemo(
    () => ({
      "": "Area comum / sem loja vinculada",
      ...Object.fromEntries(stores.map((store) => [store.id, `${store.codigo} - ${store.nome}`]))
    }),
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
  } = useForm<ServiceOrderFormValues>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: order
  });

  return (
    <Modal title="Ordem de servico" onClose={onClose}>
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
          <FormSelect label="Loja" error={errors.lojaId?.message} options={storeOptions} optionLabels={storeLabels} {...register("lojaId")} />
          <FormInput label="Local" error={errors.local?.message} {...register("local")} />
          <FormSelect
            label="Categoria"
            error={errors.categoria?.message}
            options={serviceOrderCategories}
            optionLabels={serviceOrderCategoryLabel}
            {...register("categoria")}
          />
          <FormSelect
            label="Prioridade"
            error={errors.prioridade?.message}
            options={["baixa", "media", "alta", "critica"]}
            optionLabels={serviceOrderPriorityLabel}
            {...register("prioridade")}
          />
          <FormSelect
            label="Status"
            error={errors.status?.message}
            options={serviceOrderStatuses}
            optionLabels={serviceOrderStatusLabel}
            {...register("status")}
          />
          <FormInput label="Responsavel" error={errors.responsavel?.message} {...register("responsavel")} />
          <FormInput label="Prazo" type="date" error={errors.prazo?.message} {...register("prazo")} />
          <FormInput label="Custo previsto" type="number" error={errors.custoPrevisto?.message} {...register("custoPrevisto")} />
          <FormInput label="Custo realizado" type="number" error={errors.custoRealizado?.message} {...register("custoRealizado")} />
          <FormInput label="Fotos antes" error={errors.fotosAntes?.message} {...register("fotosAntes")} />
          <FormInput label="Fotos depois" error={errors.fotosDepois?.message} {...register("fotosDepois")} />
          <div className="md:col-span-2">
            <FormInput label="Descricao" error={errors.descricao?.message} {...register("descricao")} />
          </div>
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

function fppRevenueBase(record: FppRecord) {
  return record.faturamentoAuditado > 0 ? record.faturamentoAuditado : record.faturamentoInformado;
}

function fppBilling(record: FppRecord) {
  const valorPercentual = fppRevenueBase(record) * (record.percentual / 100);
  const valorCobrado = Math.max(valorPercentual, record.aluguelMinimo);

  return {
    valorPercentual,
    valorComplementar: Math.max(valorPercentual - record.aluguelMinimo, 0),
    valorCobrado,
    regra: valorPercentual > record.aluguelMinimo ? "percentual" : "minimo"
  };
}

function auditCardPixTotal(record: RevenueAuditRecord) {
  return record.stone + record.rede + record.cielo + record.pix;
}

function auditPaymentTotal(record: RevenueAuditRecord) {
  return auditCardPixTotal(record) + record.ifood + record.delivery;
}

function auditDivergence(record: RevenueAuditRecord) {
  return record.relatorioErp > 0 ? Math.abs(record.relatorioErp - auditPaymentTotal(record)) / record.relatorioErp : 0;
}

function auditDrop(record: RevenueAuditRecord) {
  const current = auditPaymentTotal(record);
  return record.faturamentoAnterior > 0 ? Math.max((record.faturamentoAnterior - current) / record.faturamentoAnterior, 0) : 0;
}

function auditAlertLevel(record: RevenueAuditRecord) {
  const divergence = auditDivergence(record);
  const drop = auditDrop(record);

  if (divergence > 0.1 || drop > 0.2) return "critico";
  if (divergence > 0.05) return "atencao";
  return "ok";
}

function auditAlerts(record: RevenueAuditRecord, stores: StoreType[]) {
  const label = storeLabel(stores, record.lojaId);
  const divergence = auditDivergence(record);
  const drop = auditDrop(record);
  const alerts: { recordId: string; label: string; detail: string }[] = [];

  if (divergence > 0.1) {
    alerts.push({
      recordId: record.id,
      label: `${label} - divergencia acima de 10%`,
      detail: `Divergencia de ${percent(divergence)} entre ERP e meios de pagamento.`
    });
  } else if (divergence > 0.05) {
    alerts.push({
      recordId: record.id,
      label: `${label} - divergencia acima de 5%`,
      detail: `Divergencia de ${percent(divergence)} exige conferencia operacional.`
    });
  }

  if (drop > 0.2) {
    alerts.push({
      recordId: record.id,
      label: `${label} - queda acima de 20%`,
      detail: `Queda de ${percent(drop)} contra a competencia anterior.`
    });
  }

  return alerts;
}

function auditRevenueBySegment(records: RevenueAuditRecord[], stores: StoreType[]) {
  const rows = new Map<string, { segmento: string; lojas: number; faturamento: number; area: number }>();

  records.forEach((record) => {
    const store = stores.find((item) => item.id === record.lojaId);
    const segmento = store?.segmento ?? "Nao informado";
    const current = rows.get(segmento) ?? { segmento, lojas: 0, faturamento: 0, area: 0 };
    rows.set(segmento, {
      segmento,
      lojas: current.lojas + 1,
      faturamento: current.faturamento + auditPaymentTotal(record),
      area: current.area + (store?.areaTotal ?? 0)
    });
  });

  return [...rows.values()].sort((a, b) => b.faturamento - a.faturamento);
}

function vacancyDays(record: VacancyRecord) {
  return daysBetween(new Date(`${record.inicioVacancia}T00:00:00`), new Date());
}

function criticalityWeight(criticality: VacancyCriticality) {
  const weights: Record<VacancyCriticality, number> = {
    baixa: 1,
    media: 2,
    alta: 3,
    estrategica: 4
  };

  return weights[criticality];
}

function utilityVariation(reading: Pick<UtilityReading, "consumo" | "consumoAnterior">) {
  return reading.consumoAnterior > 0 ? (reading.consumo - reading.consumoAnterior) / reading.consumoAnterior : 0;
}

function utilityAlerts(readings: UtilityReading[], stores: StoreType[]) {
  return readings
    .map((reading) => {
      const variation = utilityVariation(reading);
      const highVariation = reading.tipo === "agua" ? variation > 0.25 : variation > 0.2;
      const activeStatus = reading.status !== "normal";

      if (!highVariation && !activeStatus) return null;

      const label = storeLabel(stores, reading.lojaId);
      const title = reading.tipo === "agua" && (reading.status === "critico" || variation > 0.25)
        ? `${label} - possivel vazamento`
        : `${label} - consumo acima da media`;

      return {
        reading,
        title,
        detail: `${utilityKindLabel[reading.tipo]} ${reading.competencia}: variacao de ${percent(variation)} e status ${utilityStatusLabel[reading.status]}.`
      };
    })
    .filter((alert): alert is { reading: UtilityReading; title: string; detail: string } => Boolean(alert));
}

function serviceOrderLocation(order: ServiceOrder, stores: StoreType[]) {
  const store = stores.find((item) => item.id === order.lojaId);
  return store ? `${store.codigo} - ${store.nome}` : order.local;
}

function serviceOrderEvidence(order: ServiceOrder) {
  if (order.fotosAntes && order.fotosDepois) return "Antes e depois";
  if (order.fotosAntes) return "Antes";
  if (order.fotosDepois) return "Depois";
  return "Pendente";
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

function emptyFppRecord(store: StoreType | undefined, contracts: Contract[]): FppRecord {
  const contract = contracts.find((item) => item.lojaId === store?.id) ?? contracts[0];

  return {
    id: crypto.randomUUID(),
    lojaId: store?.id ?? contract?.lojaId ?? "",
    contratoId: contract?.id ?? "",
    empreendimentoId: store?.empreendimentoId ?? "",
    competencia: new Date().toISOString().slice(0, 7),
    percentual: 6,
    aluguelMinimo: contract?.aluguelMinimo ?? store?.aluguel ?? 0,
    faturamentoInformado: 0,
    faturamentoAuditado: 0,
    status: "aberto"
  };
}

function emptyRevenueAuditRecord(store?: StoreType): RevenueAuditRecord {
  return {
    id: crypto.randomUUID(),
    lojaId: store?.id ?? "",
    empreendimentoId: store?.empreendimentoId ?? "",
    competencia: new Date().toISOString().slice(0, 7),
    relatorioErp: 0,
    relatorioPdv: 0,
    stone: 0,
    rede: 0,
    cielo: 0,
    pix: 0,
    ifood: 0,
    delivery: 0,
    faturamentoAnterior: 0,
    status: "pendente"
  };
}

function emptyCommercialLead(store?: StoreType): CommercialLead {
  return {
    id: crypto.randomUUID(),
    lojaId: store?.id ?? "",
    empreendimentoId: store?.empreendimentoId ?? "",
    empresa: "Nova oportunidade",
    segmento: store?.segmento ?? "Servicos",
    responsavel: "Comercial",
    proximaAcao: "Realizar primeiro contato",
    dataProximaAcao: new Date().toISOString().slice(0, 10),
    historico: "",
    etapa: "lead",
    valorProposta: store?.aluguel ?? 0
  };
}

function emptyVacancyRecord(store?: StoreType): VacancyRecord {
  return {
    id: crypto.randomUUID(),
    lojaId: store?.id ?? "",
    empreendimentoId: store?.empreendimentoId ?? "",
    inicioVacancia: new Date().toISOString().slice(0, 10),
    motivo: "Novo monitoramento de vacancia.",
    criticidade: "media",
    estrategia: "Definir operador alvo e politica comercial.",
    receitaPotencial: store?.aluguel ?? 0,
    responsavel: "Comercial"
  };
}

function emptyUtilityReading(store: StoreType | undefined, tipo: UtilityKind): UtilityReading {
  return {
    id: crypto.randomUUID(),
    lojaId: store?.id ?? "",
    empreendimentoId: store?.empreendimentoId ?? "",
    tipo,
    competencia: new Date().toISOString().slice(0, 7),
    consumo: 0,
    consumoAnterior: 0,
    valor: 0,
    medidor: tipo === "energia" ? "CEMIG-" : "DMAE-",
    status: "normal"
  };
}

function emptyServiceOrder(store: StoreType | undefined, empreendimentoId: string): ServiceOrder {
  const resolvedEnterpriseId = store?.empreendimentoId ?? empreendimentoId;

  return {
    id: crypto.randomUUID(),
    empreendimentoId: resolvedEnterpriseId,
    lojaId: store?.id ?? "",
    local: store ? `${store.codigo} - ${store.nome}` : "Area comum",
    categoria: "eletrica",
    prioridade: "media",
    status: "aberta",
    responsavel: "Operacoes",
    prazo: new Date().toISOString().slice(0, 10),
    custoPrevisto: 0,
    custoRealizado: 0,
    fotosAntes: "",
    fotosDepois: "",
    descricao: "Nova ordem de servico."
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
