import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mapContractRow, mapEnterpriseRow, mapPayableRow, mapReceivableRow, mapStoreRow, mapTenantRow } from "@/lib/supabase/mappers";
import type { Contract, Enterprise, Payable, Receivable, Store, Tenant } from "@/lib/types";

export type AssetData = {
  enterprises: Enterprise[];
  stores: Store[];
  tenants: Tenant[];
  contracts: Contract[];
  receivables: Receivable[];
  payables: Payable[];
};

const LOCAL_ASSET_DATA_KEY = "nexa-os.asset-data.v1";

export function loadLocalAssetData(): AssetData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_ASSET_DATA_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AssetData;
    if (!Array.isArray(parsed.enterprises) || !Array.isArray(parsed.stores)) {
      return null;
    }

    return {
      enterprises: parsed.enterprises,
      stores: parsed.stores,
      tenants: Array.isArray(parsed.tenants) ? parsed.tenants : [],
      contracts: Array.isArray(parsed.contracts) ? parsed.contracts : [],
      receivables: Array.isArray(parsed.receivables) ? parsed.receivables : [],
      payables: Array.isArray(parsed.payables) ? parsed.payables : []
    };
  } catch {
    return null;
  }
}

export function saveLocalAssetData(data: AssetData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_ASSET_DATA_KEY, JSON.stringify(data));
}

export function resetLocalAssetData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_ASSET_DATA_KEY);
}

export async function fetchAssetData(): Promise<AssetData | null> {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return null;
  }

  const client = supabase as any;

  const [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult] = await Promise.all([
    client
      .from("empreendimentos")
      .select("*")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    client
      .from("lojas")
      .select("*")
      .is("deleted_at", null)
      .order("codigo", { ascending: true }),
    client
      .from("lojistas")
      .select("*")
      .is("deleted_at", null)
      .order("nome_fantasia", { ascending: true }),
    client
      .from("contratos")
      .select("*")
      .is("deleted_at", null)
      .order("data_termino", { ascending: true }),
    client
      .from("receitas")
      .select("*")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("despesas")
      .select("*")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true })
  ]);

  if (enterpriseResult.error) throw enterpriseResult.error;
  if (storeResult.error) throw storeResult.error;
  if (tenantResult.error) throw tenantResult.error;
  if (contractResult.error) throw contractResult.error;
  if (receivableResult.error) throw receivableResult.error;
  if (payableResult.error) throw payableResult.error;

  return {
    enterprises: enterpriseResult.data.map(mapEnterpriseRow),
    stores: storeResult.data.map(mapStoreRow),
    tenants: tenantResult.data.map(mapTenantRow),
    contracts: contractResult.data.map(mapContractRow),
    receivables: receivableResult.data.map(mapReceivableRow),
    payables: payableResult.data.map(mapPayableRow)
  };
}

export async function saveEnterprise(enterprise: Enterprise) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return enterprise;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("empreendimentos")
    .upsert({
      ...(isUuid(enterprise.id) ? { id: enterprise.id } : {}),
      nome: enterprise.nome,
      cidade: enterprise.cidade,
      estado: enterprise.estado,
      status: enterprise.status,
      abl_m2: enterprise.abl,
      numero_lojas: enterprise.lojas,
      numero_vagas: enterprise.vagas
    })
    .select()
    .single();

  if (error) throw error;
  return mapEnterpriseRow(data);
}

export async function saveStore(store: Store) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return store;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("lojas")
    .upsert({
      ...(isUuid(store.id) ? { id: store.id } : {}),
      empreendimento_id: store.empreendimentoId,
      codigo: store.codigo,
      nome: store.nome,
      segmento: store.segmento,
      status: store.status,
      area_total_m2: store.areaTotal,
      valor_aluguel: store.aluguel,
      valor_condominio: store.condominio,
      valor_fundo_promocao: store.fundo
    })
    .select()
    .single();

  if (error) throw error;
  return mapStoreRow(data);
}

export async function saveTenant(tenant: Tenant) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return tenant;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("lojistas")
    .upsert({
      ...(isUuid(tenant.id) ? { id: tenant.id } : {}),
      nome_fantasia: tenant.nomeFantasia,
      razao_social: tenant.razaoSocial,
      cnpj: tenant.cnpj,
      responsavel_legal: tenant.responsavelLegal,
      telefone: tenant.telefone,
      whatsapp: tenant.whatsapp,
      email: tenant.email,
      endereco: tenant.endereco,
      segmento: tenant.segmento,
      loja_id: tenant.lojaId || null,
      data_entrada: tenant.dataEntrada || null,
      status: tenant.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapTenantRow(data);
}

export async function saveContract(contract: Contract) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return contract;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("contratos")
    .upsert({
      ...(isUuid(contract.id) ? { id: contract.id } : {}),
      loja_id: contract.lojaId,
      lojista_id: contract.lojistaId,
      data_inicio: contract.dataInicio,
      data_termino: contract.dataTermino,
      prazo_meses: contract.prazoMeses,
      aluguel_minimo: contract.aluguelMinimo,
      indice_reajuste: contract.indiceReajuste,
      garantia: contract.garantia,
      seguro: contract.seguro,
      contrato_url: contract.contratoUrl || null,
      aditivos: contract.aditivos,
      status: contract.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapContractRow(data);
}

export async function saveReceivable(receivable: Receivable) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return receivable;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("receitas")
    .upsert({
      ...(isUuid(receivable.id) ? { id: receivable.id } : {}),
      loja_id: receivable.lojaId,
      empreendimento_id: receivable.empreendimentoId,
      competencia: receivable.competencia,
      receita: receivable.receita,
      valor: receivable.valor,
      vencimento: receivable.vencimento,
      recebimento: receivable.recebimento || null,
      status: receivable.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapReceivableRow(data);
}

export async function savePayable(payable: Payable) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return payable;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("despesas")
    .upsert({
      ...(isUuid(payable.id) ? { id: payable.id } : {}),
      empreendimento_id: payable.empreendimentoId,
      fornecedor: payable.fornecedor,
      categoria: payable.categoria,
      competencia: payable.competencia,
      valor: payable.valor,
      vencimento: payable.vencimento,
      pagamento: payable.pagamento || null,
      centro_custo: payable.centroCusto,
      status: payable.status
    })
    .select()
    .single();

  if (error) throw error;
  return mapPayableRow(data);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
