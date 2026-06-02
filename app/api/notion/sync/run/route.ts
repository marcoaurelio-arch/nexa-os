import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NOTION_VERSION } from "@/lib/notion/payload";
import type { Database } from "@/lib/supabase/types";

const NOTION_API_URL = "https://api.notion.com/v1";

type EnterpriseRow = Database["public"]["Tables"]["empreendimentos"]["Row"];
type StoreRow = Database["public"]["Tables"]["lojas"]["Row"];
type TenantRow = Database["public"]["Tables"]["lojistas"]["Row"];
type ContractRow = Database["public"]["Tables"]["contratos"]["Row"];
type ReceivableRow = Database["public"]["Tables"]["receitas"]["Row"];
type PayableRow = Database["public"]["Tables"]["despesas"]["Row"];
type DelinquencyRow = Database["public"]["Tables"]["inadimplencias"]["Row"];

type SyncJob = {
  id: string;
  database_id: string | null;
  entidade: string;
  payload: {
    notion_data_source_id?: string;
    [key: string]: unknown;
  };
};

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;
}

export async function POST(request: Request) {
  const client = createAdminClient();
  const token = process.env.NOTION_API_KEY ?? process.env.NOTION_TOKEN;
  const body = await request.json().catch(() => ({})) as { limit?: number; slugs?: string[]; retryErrors?: boolean };
  const limit = Math.max(1, Math.min(body.limit ?? 1, 5));
  const supportedSlugs = body.slugs?.length ? body.slugs : ["empreendimentos", "lojas", "lojistas", "contratos", "receitas", "despesas", "inadimplencia", "condominio", "fundo-promocao"];
  const statuses = body.retryErrors ? ["pendente", "erro"] : ["pendente"];

  if (!client) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  if (!token) {
    return NextResponse.json({ error: "Configure NOTION_API_KEY ou NOTION_TOKEN para executar o sync." }, { status: 400 });
  }

  const jobsResult = await client
    .from("notion_sync_jobs")
    .select("id,database_id,entidade,payload")
    .in("status", statuses)
    .in("entidade", supportedSlugs)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (jobsResult.error) {
    return NextResponse.json({ error: jobsResult.error.message }, { status: 500 });
  }

  const jobs = (jobsResult.data ?? []) as SyncJob[];
  const results = [];

  for (const job of jobs) {
    await markJob(client, job.id, "processando");

    try {
      const result = job.entidade === "empreendimentos"
        ? await syncEnterprises(client, token, job)
        : job.entidade === "lojas"
          ? await syncStores(client, token, job)
          : job.entidade === "lojistas"
            ? await syncTenants(client, token, job)
            : job.entidade === "contratos"
              ? await syncContracts(client, token, job)
              : job.entidade === "receitas"
                ? await syncReceivables(client, token, job)
                : job.entidade === "despesas"
                  ? await syncPayables(client, token, job)
                  : job.entidade === "inadimplencia"
                    ? await syncDelinquencies(client, token, job)
                    : job.entidade === "condominio"
                      ? await syncLedger(client, token, job, "condominio")
                      : job.entidade === "fundo-promocao"
                        ? await syncLedger(client, token, job, "fundo-promocao")
                        : { ok: false, created: 0, skipped: 0, message: `Sync ainda nao implementado para ${job.entidade}.` };

      await markJob(client, job.id, result.ok ? "concluido" : "erro", {
        ...job.payload,
        processed_at: new Date().toISOString(),
        result
      }, result.ok ? null : result.message);

      results.push({ jobId: job.id, entidade: job.entidade, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha inesperada no sync Notion.";

      await markJob(client, job.id, "erro", {
        ...job.payload,
        processed_at: new Date().toISOString()
      }, message);

      results.push({ jobId: job.id, entidade: job.entidade, ok: false, created: 0, skipped: 0, message });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results
  });
}

async function syncEnterprises(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const enterprisesResult = await client
    .from("empreendimentos")
    .select("id,nome,cidade,estado,status,abl_m2,numero_lojas,numero_vagas,created_at,updated_at,deleted_at")
    .is("deleted_at", null)
    .order("nome", { ascending: true });

  if (enterprisesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesResult.error.message };
  }

  const enterprises = (enterprisesResult.data ?? []) as EnterpriseRow[];
  const existingNames = await getExistingTitleValues(token, dataSourceId, "Nome");
  let created = 0;
  let skipped = 0;

  for (const enterprise of enterprises) {
    if (existingNames.has(enterprise.nome)) {
      skipped += 1;
      continue;
    }

    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildEnterpriseProperties(enterprise)
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar empreendimento ${enterprise.nome}.`
      };
    }

    created += 1;
    existingNames.add(enterprise.nome);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Empreendimentos sincronizados: ${created} criados, ${skipped} ignorados.`
  };
}

async function syncStores(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const registryResult = await client
    .from("notion_databases")
    .select("notion_data_source_id")
    .eq("slug", "empreendimentos")
    .single();

  if (registryResult.error || !registryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: registryResult.error?.message ?? "Data source de Empreendimentos nao encontrado." };
  }

  const [storesResult, enterprisesResult] = await Promise.all([
    client
      .from("lojas")
      .select("id,empreendimento_id,codigo,nome,area_total_m2,segmento,status,valor_aluguel,valor_condominio,valor_fundo_promocao,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("codigo", { ascending: true }),
    client
      .from("empreendimentos")
      .select("id,nome")
      .is("deleted_at", null)
  ]);

  if (storesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: storesResult.error.message };
  }

  if (enterprisesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesResult.error.message };
  }

  const stores = (storesResult.data ?? []) as StoreRow[];
  const enterpriseNamesById = new Map<string, string>(
    (enterprisesResult.data ?? []).map((enterprise: { id: string; nome: string }) => [enterprise.id, enterprise.nome])
  );
  const enterprisePageIdsByName = await getTitlePageMap(token, registryResult.data.notion_data_source_id, "Nome");
  const existingCodes = await getExistingTitleValues(token, dataSourceId, "Código");
  let created = 0;
  let skipped = 0;

  for (const store of stores) {
    if (existingCodes.has(store.codigo)) {
      skipped += 1;
      continue;
    }

    const enterpriseName = enterpriseNamesById.get(store.empreendimento_id);
    const enterprisePageId = enterpriseName ? enterprisePageIdsByName.get(enterpriseName) : null;
    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildStoreProperties(store, enterprisePageId)
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar loja ${store.codigo}.`
      };
    }

    created += 1;
    existingCodes.add(store.codigo);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Lojas sincronizadas: ${created} criadas, ${skipped} ignoradas.`
  };
}

async function syncTenants(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const [storesRegistryResult, enterprisesRegistryResult] = await Promise.all([
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "lojas")
      .single(),
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "empreendimentos")
      .single()
  ]);

  if (storesRegistryResult.error || !storesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: storesRegistryResult.error?.message ?? "Data source de Lojas nao encontrado." };
  }

  if (enterprisesRegistryResult.error || !enterprisesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesRegistryResult.error?.message ?? "Data source de Empreendimentos nao encontrado." };
  }

  const [tenantsResult, storesResult, enterprisesResult] = await Promise.all([
    client
      .from("lojistas")
      .select("id,nome_fantasia,razao_social,cnpj,responsavel_legal,telefone,whatsapp,email,endereco,segmento,loja_id,data_entrada,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("nome_fantasia", { ascending: true }),
    client
      .from("lojas")
      .select("id,codigo,empreendimento_id")
      .is("deleted_at", null),
    client
      .from("empreendimentos")
      .select("id,nome")
      .is("deleted_at", null)
  ]);

  if (tenantsResult.error) {
    return { ok: false, created: 0, skipped: 0, message: tenantsResult.error.message };
  }

  if (storesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: storesResult.error.message };
  }

  if (enterprisesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesResult.error.message };
  }

  const tenants = (tenantsResult.data ?? []) as TenantRow[];
  const storesById = new Map<string, { codigo: string; empreendimento_id: string }>(
    (storesResult.data ?? []).map((store: { id: string; codigo: string; empreendimento_id: string }) => [
      store.id,
      { codigo: store.codigo, empreendimento_id: store.empreendimento_id }
    ])
  );
  const enterpriseNamesById = new Map<string, string>(
    (enterprisesResult.data ?? []).map((enterprise: { id: string; nome: string }) => [enterprise.id, enterprise.nome])
  );
  const storePageIdsByCode = await getTitlePageMap(token, storesRegistryResult.data.notion_data_source_id, "Código");
  const enterprisePageIdsByName = await getTitlePageMap(token, enterprisesRegistryResult.data.notion_data_source_id, "Nome");
  const existingNames = await getExistingTitleValues(token, dataSourceId, "Nome Fantasia");
  let created = 0;
  let skipped = 0;

  for (const tenant of tenants) {
    if (existingNames.has(tenant.nome_fantasia)) {
      skipped += 1;
      continue;
    }

    const store = tenant.loja_id ? storesById.get(tenant.loja_id) : null;
    const storePageId = store ? storePageIdsByCode.get(store.codigo) : null;
    const enterpriseName = store ? enterpriseNamesById.get(store.empreendimento_id) : null;
    const enterprisePageId = enterpriseName ? enterprisePageIdsByName.get(enterpriseName) : null;
    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildTenantProperties(tenant, storePageId, enterprisePageId)
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar lojista ${tenant.nome_fantasia}.`
      };
    }

    created += 1;
    existingNames.add(tenant.nome_fantasia);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Lojistas sincronizados: ${created} criados, ${skipped} ignorados.`
  };
}

async function syncContracts(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const [storesRegistryResult, tenantsRegistryResult] = await Promise.all([
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "lojas")
      .single(),
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "lojistas")
      .single()
  ]);

  if (storesRegistryResult.error || !storesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: storesRegistryResult.error?.message ?? "Data source de Lojas nao encontrado." };
  }

  if (tenantsRegistryResult.error || !tenantsRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: tenantsRegistryResult.error?.message ?? "Data source de Lojistas nao encontrado." };
  }

  const [contractsResult, storesResult, tenantsResult] = await Promise.all([
    client
      .from("contratos")
      .select("id,loja_id,lojista_id,data_inicio,data_termino,prazo_meses,aluguel_minimo,indice_reajuste,garantia,seguro,contrato_url,aditivos,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("data_termino", { ascending: true }),
    client
      .from("lojas")
      .select("id,codigo")
      .is("deleted_at", null),
    client
      .from("lojistas")
      .select("id,nome_fantasia")
      .is("deleted_at", null)
  ]);

  if (contractsResult.error) {
    return { ok: false, created: 0, skipped: 0, message: contractsResult.error.message };
  }

  if (storesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: storesResult.error.message };
  }

  if (tenantsResult.error) {
    return { ok: false, created: 0, skipped: 0, message: tenantsResult.error.message };
  }

  const contracts = (contractsResult.data ?? []) as ContractRow[];
  const storeCodesById = new Map<string, string>(
    (storesResult.data ?? []).map((store: { id: string; codigo: string }) => [store.id, store.codigo])
  );
  const tenantNamesById = new Map<string, string>(
    (tenantsResult.data ?? []).map((tenant: { id: string; nome_fantasia: string }) => [tenant.id, tenant.nome_fantasia])
  );
  const storePageIdsByCode = await getTitlePageMap(token, storesRegistryResult.data.notion_data_source_id, "Código");
  const tenantPageIdsByName = await getTitlePageMap(token, tenantsRegistryResult.data.notion_data_source_id, "Nome Fantasia");
  const existingIdentifiers = await getExistingTitleValues(token, dataSourceId, "Identificador");
  let created = 0;
  let skipped = 0;

  for (const contract of contracts) {
    const storeCode = storeCodesById.get(contract.loja_id);
    const tenantName = tenantNamesById.get(contract.lojista_id);
    const identifier = buildContractIdentifier(contract, storeCode, tenantName);

    if (existingIdentifiers.has(identifier)) {
      skipped += 1;
      continue;
    }

    const storePageId = storeCode ? storePageIdsByCode.get(storeCode) : null;
    const tenantPageId = tenantName ? tenantPageIdsByName.get(tenantName) : null;
    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildContractProperties(contract, identifier, storePageId, tenantPageId)
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar contrato ${identifier}.`
      };
    }

    created += 1;
    existingIdentifiers.add(identifier);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Contratos sincronizados: ${created} criados, ${skipped} ignorados.`
  };
}

async function syncReceivables(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const [storesRegistryResult, enterprisesRegistryResult, contractsRegistryResult] = await Promise.all([
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "lojas")
      .single(),
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "empreendimentos")
      .single(),
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "contratos")
      .single()
  ]);

  if (storesRegistryResult.error || !storesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: storesRegistryResult.error?.message ?? "Data source de Lojas nao encontrado." };
  }

  if (enterprisesRegistryResult.error || !enterprisesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesRegistryResult.error?.message ?? "Data source de Empreendimentos nao encontrado." };
  }

  if (contractsRegistryResult.error || !contractsRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: contractsRegistryResult.error?.message ?? "Data source de Contratos nao encontrado." };
  }

  const [receivablesResult, storesResult, enterprisesResult, contractsResult, tenantsResult] = await Promise.all([
    client
      .from("receitas")
      .select("id,loja_id,empreendimento_id,competencia,receita,valor,vencimento,recebimento,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("lojas")
      .select("id,codigo")
      .is("deleted_at", null),
    client
      .from("empreendimentos")
      .select("id,nome")
      .is("deleted_at", null),
    client
      .from("contratos")
      .select("id,loja_id,lojista_id,data_inicio")
      .is("deleted_at", null),
    client
      .from("lojistas")
      .select("id,nome_fantasia")
      .is("deleted_at", null)
  ]);

  if (receivablesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: receivablesResult.error.message };
  }

  if (storesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: storesResult.error.message };
  }

  if (enterprisesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesResult.error.message };
  }

  if (contractsResult.error) {
    return { ok: false, created: 0, skipped: 0, message: contractsResult.error.message };
  }

  if (tenantsResult.error) {
    return { ok: false, created: 0, skipped: 0, message: tenantsResult.error.message };
  }

  const receivables = (receivablesResult.data ?? []) as ReceivableRow[];
  const storeCodesById = new Map<string, string>(
    (storesResult.data ?? []).map((store: { id: string; codigo: string }) => [store.id, store.codigo])
  );
  const enterpriseNamesById = new Map<string, string>(
    (enterprisesResult.data ?? []).map((enterprise: { id: string; nome: string }) => [enterprise.id, enterprise.nome])
  );
  const tenantNamesById = new Map<string, string>(
    (tenantsResult.data ?? []).map((tenant: { id: string; nome_fantasia: string }) => [tenant.id, tenant.nome_fantasia])
  );
  const contractByStoreId = new Map<string, { identifier: string }>();

  for (const contract of (contractsResult.data ?? []) as Array<Pick<ContractRow, "loja_id" | "lojista_id" | "data_inicio">>) {
    const storeCode = storeCodesById.get(contract.loja_id);
    const tenantName = tenantNamesById.get(contract.lojista_id);
    const identifier = [storeCode ?? "Loja", tenantName ?? "Lojista", contract.data_inicio].join(" | ");
    contractByStoreId.set(contract.loja_id, { identifier });
  }

  const storePageIdsByCode = await getTitlePageMap(token, storesRegistryResult.data.notion_data_source_id, "Código");
  const enterprisePageIdsByName = await getTitlePageMap(token, enterprisesRegistryResult.data.notion_data_source_id, "Nome");
  const contractPageIdsByIdentifier = await getTitlePageMap(token, contractsRegistryResult.data.notion_data_source_id, "Identificador");
  const existingLaunches = await getExistingTitleValues(token, dataSourceId, "Lançamento");
  let created = 0;
  let skipped = 0;

  for (const receivable of receivables) {
    const storeCode = storeCodesById.get(receivable.loja_id);
    const enterpriseName = enterpriseNamesById.get(receivable.empreendimento_id);
    const contract = contractByStoreId.get(receivable.loja_id);
    const launch = buildReceivableLaunch(receivable, storeCode);

    if (existingLaunches.has(launch)) {
      skipped += 1;
      continue;
    }

    const storePageId = storeCode ? storePageIdsByCode.get(storeCode) : null;
    const enterprisePageId = enterpriseName ? enterprisePageIdsByName.get(enterpriseName) : null;
    const contractPageId = contract ? contractPageIdsByIdentifier.get(contract.identifier) : null;
    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildReceivableProperties(receivable, launch, storePageId, enterprisePageId, contractPageId)
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar receita ${launch}.`
      };
    }

    created += 1;
    existingLaunches.add(launch);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Receitas sincronizadas: ${created} criadas, ${skipped} ignoradas.`
  };
}

async function syncPayables(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const enterprisesRegistryResult = await client
    .from("notion_databases")
    .select("notion_data_source_id")
    .eq("slug", "empreendimentos")
    .single();

  if (enterprisesRegistryResult.error || !enterprisesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesRegistryResult.error?.message ?? "Data source de Empreendimentos nao encontrado." };
  }

  const [payablesResult, enterprisesResult] = await Promise.all([
    client
      .from("despesas")
      .select("id,empreendimento_id,fornecedor,categoria,competencia,valor,vencimento,pagamento,centro_custo,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("empreendimentos")
      .select("id,nome")
      .is("deleted_at", null)
  ]);

  if (payablesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: payablesResult.error.message };
  }

  if (enterprisesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesResult.error.message };
  }

  const payables = (payablesResult.data ?? []) as PayableRow[];
  const enterpriseNamesById = new Map<string, string>(
    (enterprisesResult.data ?? []).map((enterprise: { id: string; nome: string }) => [enterprise.id, enterprise.nome])
  );
  const enterprisePageIdsByName = await getTitlePageMap(token, enterprisesRegistryResult.data.notion_data_source_id, "Nome");
  const existingLaunches = await getExistingTitleValues(token, dataSourceId, "Lançamento");
  let created = 0;
  let skipped = 0;

  for (const payable of payables) {
    const enterpriseName = enterpriseNamesById.get(payable.empreendimento_id);
    const launch = buildPayableLaunch(payable, enterpriseName);

    if (existingLaunches.has(launch)) {
      skipped += 1;
      continue;
    }

    const enterprisePageId = enterpriseName ? enterprisePageIdsByName.get(enterpriseName) : null;
    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildPayableProperties(payable, launch, enterprisePageId)
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar despesa ${launch}.`
      };
    }

    created += 1;
    existingLaunches.add(launch);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Despesas sincronizadas: ${created} criadas, ${skipped} ignoradas.`
  };
}

async function syncDelinquencies(client: any, token: string, job: SyncJob) {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const [storesRegistryResult, receivablesRegistryResult, tenantsRegistryResult] = await Promise.all([
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "lojas")
      .single(),
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "receitas")
      .single(),
    client
      .from("notion_databases")
      .select("notion_data_source_id")
      .eq("slug", "lojistas")
      .single()
  ]);

  if (storesRegistryResult.error || !storesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: storesRegistryResult.error?.message ?? "Data source de Lojas nao encontrado." };
  }

  if (receivablesRegistryResult.error || !receivablesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: receivablesRegistryResult.error?.message ?? "Data source de Receitas nao encontrado." };
  }

  if (tenantsRegistryResult.error || !tenantsRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: tenantsRegistryResult.error?.message ?? "Data source de Lojistas nao encontrado." };
  }

  const [delinquenciesResult, storesResult, receivablesResult, tenantsResult] = await Promise.all([
    client
      .from("inadimplencias")
      .select("id,receita_id,loja_id,valor,dias_atraso,historico,negociacao,responsavel,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("dias_atraso", { ascending: false }),
    client
      .from("lojas")
      .select("id,codigo")
      .is("deleted_at", null),
    client
      .from("receitas")
      .select("id,loja_id,competencia,receita,vencimento")
      .is("deleted_at", null),
    client
      .from("lojistas")
      .select("id,nome_fantasia,loja_id")
      .is("deleted_at", null)
  ]);

  if (delinquenciesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: delinquenciesResult.error.message };
  }

  if (storesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: storesResult.error.message };
  }

  if (receivablesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: receivablesResult.error.message };
  }

  if (tenantsResult.error) {
    return { ok: false, created: 0, skipped: 0, message: tenantsResult.error.message };
  }

  const delinquencies = (delinquenciesResult.data ?? []) as DelinquencyRow[];
  const storeCodesById = new Map<string, string>(
    (storesResult.data ?? []).map((store: { id: string; codigo: string }) => [store.id, store.codigo])
  );
  const receivablesById = new Map<string, Pick<ReceivableRow, "loja_id" | "competencia" | "receita" | "vencimento">>(
    (receivablesResult.data ?? []).map((receivable: Pick<ReceivableRow, "id" | "loja_id" | "competencia" | "receita" | "vencimento">) => [
      receivable.id,
      receivable
    ])
  );
  const tenantNamesByStoreId = new Map<string, string>(
    (tenantsResult.data ?? [])
      .filter((tenant: { loja_id: string | null }) => tenant.loja_id)
      .map((tenant: { nome_fantasia: string; loja_id: string }) => [tenant.loja_id, tenant.nome_fantasia])
  );

  const storePageIdsByCode = await getTitlePageMap(token, storesRegistryResult.data.notion_data_source_id, "Código");
  const receivablePageIdsByLaunch = await getTitlePageMap(token, receivablesRegistryResult.data.notion_data_source_id, "Lançamento");
  const tenantPageIdsByName = await getTitlePageMap(token, tenantsRegistryResult.data.notion_data_source_id, "Nome Fantasia");
  const existingCases = await getExistingTitleValues(token, dataSourceId, "Caso");
  let created = 0;
  let skipped = 0;

  for (const delinquency of delinquencies) {
    const storeCode = storeCodesById.get(delinquency.loja_id);
    const receivable = delinquency.receita_id ? receivablesById.get(delinquency.receita_id) : null;
    const receivableStoreCode = receivable ? storeCodesById.get(receivable.loja_id) : storeCode;
    const receivableLaunch = receivable ? buildReceivableLaunch(receivable as ReceivableRow, receivableStoreCode) : null;
    const tenantName = tenantNamesByStoreId.get(delinquency.loja_id);
    const caseName = buildDelinquencyCase(delinquency, storeCode, receivable);

    if (existingCases.has(caseName)) {
      skipped += 1;
      continue;
    }

    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: buildDelinquencyProperties(
          delinquency,
          caseName,
          storeCode ? storePageIdsByCode.get(storeCode) : null,
          receivableLaunch ? receivablePageIdsByLaunch.get(receivableLaunch) : null,
          tenantName ? tenantPageIdsByName.get(tenantName) : null
        )
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar inadimplencia ${caseName}.`
      };
    }

    created += 1;
    existingCases.add(caseName);
  }

  return {
    ok: true,
    created,
    skipped,
    message: `Inadimplencia sincronizada: ${created} casos criados, ${skipped} ignorados.`
  };
}

async function syncLedger(client: any, token: string, job: SyncJob, ledger: "condominio" | "fundo-promocao") {
  const dataSourceId = job.payload.notion_data_source_id;

  if (!dataSourceId) {
    return { ok: false, created: 0, skipped: 0, message: "Job sem notion_data_source_id." };
  }

  const enterprisesRegistryResult = await client
    .from("notion_databases")
    .select("notion_data_source_id")
    .eq("slug", "empreendimentos")
    .single();

  if (enterprisesRegistryResult.error || !enterprisesRegistryResult.data?.notion_data_source_id) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesRegistryResult.error?.message ?? "Data source de Empreendimentos nao encontrado." };
  }

  const [receivablesResult, payablesResult, enterprisesResult] = await Promise.all([
    client
      .from("receitas")
      .select("id,loja_id,empreendimento_id,competencia,receita,valor,vencimento,recebimento,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("despesas")
      .select("id,empreendimento_id,fornecedor,categoria,competencia,valor,vencimento,pagamento,centro_custo,status,created_at,updated_at,deleted_at")
      .is("deleted_at", null)
      .order("vencimento", { ascending: true }),
    client
      .from("empreendimentos")
      .select("id,nome")
      .is("deleted_at", null)
  ]);

  if (receivablesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: receivablesResult.error.message };
  }

  if (payablesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: payablesResult.error.message };
  }

  if (enterprisesResult.error) {
    return { ok: false, created: 0, skipped: 0, message: enterprisesResult.error.message };
  }

  const enterpriseNamesById = new Map<string, string>(
    (enterprisesResult.data ?? []).map((enterprise: { id: string; nome: string }) => [enterprise.id, enterprise.nome])
  );
  const enterprisePageIdsByName = await getTitlePageMap(token, enterprisesRegistryResult.data.notion_data_source_id, "Nome");
  const existingLaunches = await getExistingTitleValues(token, dataSourceId, "Lançamento");
  const receivables = ((receivablesResult.data ?? []) as ReceivableRow[]).filter((receivable) => ledgerReceivableFilter(receivable, ledger));
  const payables = ((payablesResult.data ?? []) as PayableRow[]).filter((payable) => ledgerPayableFilter(payable, ledger));
  const entries = [
    ...receivables.map((receivable) => ({
      launch: buildLedgerReceivableLaunch(receivable, ledger, enterpriseNamesById.get(receivable.empreendimento_id)),
      enterpriseId: receivable.empreendimento_id,
      properties: (enterprisePageId?: string | null) => buildLedgerReceivableProperties(receivable, ledger, enterprisePageId)
    })),
    ...payables.map((payable) => ({
      launch: buildLedgerPayableLaunch(payable, ledger, enterpriseNamesById.get(payable.empreendimento_id)),
      enterpriseId: payable.empreendimento_id,
      properties: (enterprisePageId?: string | null) => buildLedgerPayableProperties(payable, ledger, enterprisePageId)
    }))
  ];
  let created = 0;
  let skipped = 0;

  for (const entry of entries) {
    if (existingLaunches.has(entry.launch)) {
      skipped += 1;
      continue;
    }

    const enterpriseName = enterpriseNamesById.get(entry.enterpriseId);
    const enterprisePageId = enterpriseName ? enterprisePageIdsByName.get(enterpriseName) : null;
    const response = await notionFetch(token, "/pages", {
      method: "POST",
      body: JSON.stringify({
        parent: { data_source_id: dataSourceId },
        properties: {
          "Lançamento": title(entry.launch),
          ...entry.properties(enterprisePageId)
        }
      })
    });

    if (!response.ok) {
      return {
        ok: false,
        created,
        skipped,
        message: response.message ?? `Falha ao criar lancamento ${entry.launch}.`
      };
    }

    created += 1;
    existingLaunches.add(entry.launch);
  }

  const label = ledger === "condominio" ? "Condominio" : "Fundo de promocao";

  return {
    ok: true,
    created,
    skipped,
    message: `${label} sincronizado: ${created} lancamentos criados, ${skipped} ignorados.`
  };
}

async function getExistingTitleValues(token: string, dataSourceId: string, titleProperty: string) {
  const pageMap = await getTitlePageMap(token, dataSourceId, titleProperty);
  return new Set(pageMap.keys());
}

async function getTitlePageMap(token: string, dataSourceId: string, titleProperty: string) {
  const values = new Map<string, string>();
  let startCursor: string | null = null;

  do {
    const response = await notionFetch(token, `/data_sources/${dataSourceId}/query`, {
      method: "POST",
      body: JSON.stringify({
        page_size: 100,
        start_cursor: startCursor ?? undefined
      })
    });

    if (!response.ok) {
      throw new Error(response.message ?? "Falha ao consultar data source do Notion.");
    }

    for (const page of response.results ?? []) {
      const title = page?.properties?.[titleProperty]?.title?.[0]?.plain_text;
      if (title && page?.id) values.set(title, page.id);
    }

    startCursor = response.has_more ? response.next_cursor : null;
  } while (startCursor);

  return values;
}

function buildEnterpriseProperties(enterprise: EnterpriseRow) {
  return {
    Nome: title(enterprise.nome),
    Cidade: richText(enterprise.cidade),
    Estado: select(enterprise.estado),
    Status: select(toNotionEnterpriseStatus(enterprise.status)),
    "ABL m2": number(enterprise.abl_m2),
    "Nº Lojas": number(enterprise.numero_lojas),
    "Nº Vagas": number(enterprise.numero_vagas ?? 0)
  };
}

function buildStoreProperties(store: StoreRow, enterprisePageId?: string | null) {
  return {
    "Código": title(store.codigo),
    Nome: richText(store.nome ?? store.codigo),
    Empreendimento: relation(enterprisePageId),
    Segmento: select(toNotionStoreSegment(store.segmento)),
    Status: select(toNotionStoreStatus(store.status)),
    Tipo: select(toNotionStoreType(store)),
    "Área Privativa m2": number(store.area_total_m2),
    "Área Total m2": number(store.area_total_m2),
    Aluguel: number(store.valor_aluguel),
    "Condomínio": number(store.valor_condominio),
    "Fundo Promoção": number(store.valor_fundo_promocao)
  };
}

function buildTenantProperties(tenant: TenantRow, storePageId?: string | null, enterprisePageId?: string | null) {
  return {
    "Nome Fantasia": title(tenant.nome_fantasia),
    "Razão Social": richText(tenant.razao_social),
    CNPJ: richText(tenant.cnpj),
    "Responsável Legal": richText(tenant.responsavel_legal ?? ""),
    Telefone: phone(tenant.telefone),
    WhatsApp: phone(tenant.whatsapp),
    "E-mail": email(tenant.email),
    "Endereço": richText(tenant.endereco ?? ""),
    Segmento: select(toNotionStoreSegment(tenant.segmento)),
    Status: select(toNotionTenantStatus(tenant.status)),
    "Data Entrada": date(tenant.data_entrada),
    "Loja Vinculada": relation(storePageId),
    Empreendimento: relation(enterprisePageId)
  };
}

function buildContractProperties(contract: ContractRow, identifier: string, storePageId?: string | null, tenantPageId?: string | null) {
  return {
    Identificador: title(identifier),
    Loja: relation(storePageId),
    Lojista: relation(tenantPageId),
    "Início": date(contract.data_inicio),
    "Término": date(contract.data_termino),
    "Prazo meses": number(contract.prazo_meses),
    "Aluguel Mínimo": number(contract.aluguel_minimo),
    "Índice Reajuste": select(toNotionContractIndex(contract.indice_reajuste)),
    Garantia: richText(contract.garantia ?? ""),
    Seguro: richText(contract.seguro ?? ""),
    Status: select(toNotionContractStatus(contract.status)),
    Contrato: files(contract.contrato_url, "Contrato")
  };
}

function buildReceivableProperties(
  receivable: ReceivableRow,
  launch: string,
  storePageId?: string | null,
  enterprisePageId?: string | null,
  contractPageId?: string | null
) {
  return {
    "Lançamento": title(launch),
    Empreendimento: relation(enterprisePageId),
    Loja: relation(storePageId),
    Contrato: relation(contractPageId),
    "Competência": date(toCompetenceDate(receivable.competencia)),
    Tipo: select(toNotionRevenueType(receivable.receita)),
    Valor: number(receivable.valor),
    Vencimento: date(receivable.vencimento),
    Recebimento: date(receivable.recebimento),
    Status: select(toNotionFinancialStatus(receivable.status))
  };
}

function buildPayableProperties(payable: PayableRow, launch: string, enterprisePageId?: string | null) {
  return {
    "Lançamento": title(launch),
    Empreendimento: relation(enterprisePageId),
    Fornecedor: richText(payable.fornecedor),
    Categoria: select(toNotionExpenseCategory(payable.categoria)),
    "Competência": date(toCompetenceDate(payable.competencia)),
    Valor: number(payable.valor),
    Vencimento: date(payable.vencimento),
    Pagamento: date(payable.pagamento),
    "Centro de Custo": select(toNotionCostCenter(payable.centro_custo)),
    Status: select(toNotionPayableStatus(payable.status))
  };
}

function buildDelinquencyProperties(
  delinquency: DelinquencyRow,
  caseName: string,
  storePageId?: string | null,
  receivablePageId?: string | null,
  tenantPageId?: string | null
) {
  return {
    Caso: title(caseName),
    Loja: relation(storePageId),
    Receita: relation(receivablePageId),
    Lojista: relation(tenantPageId),
    Valor: number(delinquency.valor),
    "Dias Atraso": number(delinquency.dias_atraso),
    "Histórico": richText(delinquency.historico ?? ""),
    Etapa: select(toNotionDelinquencyStage(delinquency.status, delinquency.dias_atraso))
  };
}

function buildLedgerReceivableProperties(receivable: ReceivableRow, ledger: "condominio" | "fundo-promocao", enterprisePageId?: string | null) {
  return {
    Empreendimento: relation(enterprisePageId),
    Natureza: select("Receita"),
    Categoria: select(ledger === "condominio" ? toNotionCondominiumRevenueCategory(receivable.receita) : "Arrecadado"),
    "Competência": date(toCompetenceDate(receivable.competencia)),
    Valor: number(receivable.valor),
    Status: select(toNotionLedgerStatus(receivable.status))
  };
}

function buildLedgerPayableProperties(payable: PayableRow, ledger: "condominio" | "fundo-promocao", enterprisePageId?: string | null) {
  return {
    Empreendimento: relation(enterprisePageId),
    Natureza: select("Despesa"),
    Categoria: select(ledger === "condominio" ? toNotionExpenseCategory(payable.categoria) : toNotionPromotionExpenseCategory(payable.categoria)),
    "Competência": date(toCompetenceDate(payable.competencia)),
    Valor: number(payable.valor),
    Status: select(toNotionLedgerStatus(payable.status))
  };
}

function title(content: string) {
  return { title: [{ text: { content } }] };
}

function richText(content: string) {
  return { rich_text: [{ text: { content } }] };
}

function select(name: string) {
  return { select: { name } };
}

function number(value: number) {
  return { number: value };
}

function relation(pageId?: string | null) {
  return { relation: pageId ? [{ id: pageId }] : [] };
}

function phone(value?: string | null) {
  return { phone_number: value || null };
}

function email(value?: string | null) {
  return { email: value || null };
}

function date(value?: string | null) {
  return value ? { date: { start: value } } : { date: null };
}

function files(url?: string | null, name = "Arquivo") {
  return { files: url ? [{ name, external: { url } }] : [] };
}

function toNotionEnterpriseStatus(status: string) {
  const map: Record<string, string> = {
    ativo: "Operação",
    implantacao: "Obra",
    planejado: "Planejamento"
  };

  return map[status] ?? "Planejamento";
}

function toNotionStoreStatus(status: string) {
  const map: Record<string, string> = {
    ocupada: "Ocupada",
    disponivel: "Disponível",
    negociacao: "Negociação",
    implantacao: "Implantação",
    em_obra: "Em obra",
    inativa: "Inativa"
  };

  return map[status] ?? "Disponível";
}

function toNotionStoreSegment(segment?: string | null) {
  const normalized = (segment ?? "").toLowerCase();
  const map: Record<string, string> = {
    alimentacao: "Alimentação",
    alimentação: "Alimentação",
    servicos: "Serviços",
    serviços: "Serviços",
    saude: "Serviços",
    saúde: "Serviços",
    mercado: "Supermercado",
    supermercado: "Supermercado",
    fitness: "Fitness",
    moda: "Moda",
    farmacia: "Farmácia",
    farmácia: "Farmácia",
    "fast food": "Fast Food"
  };

  return map[normalized] ?? "Outro";
}

function toNotionStoreType(store: StoreRow) {
  if (store.area_total_m2 >= 800) return "Âncora";
  return "Satélite";
}

function toNotionTenantStatus(status: string) {
  const map: Record<string, string> = {
    ativo: "Ativo",
    implantacao: "Prospecto",
    inadimplente: "Ativo",
    inativo: "Inativo"
  };

  return map[status] ?? "Ativo";
}

function buildContractIdentifier(contract: ContractRow, storeCode?: string, tenantName?: string) {
  return [
    storeCode ?? "Loja",
    tenantName ?? "Lojista",
    contract.data_inicio
  ].join(" | ");
}

function buildReceivableLaunch(receivable: ReceivableRow, storeCode?: string) {
  return [
    storeCode ?? "Loja",
    toNotionRevenueType(receivable.receita),
    receivable.competencia,
    receivable.vencimento
  ].join(" | ");
}

function buildPayableLaunch(payable: PayableRow, enterpriseName?: string) {
  return [
    enterpriseName ?? "Empreendimento",
    toNotionExpenseCategory(payable.categoria),
    payable.fornecedor,
    payable.competencia,
    payable.vencimento
  ].join(" | ");
}

function buildDelinquencyCase(
  delinquency: DelinquencyRow,
  storeCode?: string,
  receivable?: Pick<ReceivableRow, "competencia" | "receita" | "vencimento"> | null
) {
  return [
    storeCode ?? "Loja",
    receivable ? toNotionRevenueType(receivable.receita) : "Receita",
    receivable?.competencia ?? "Competencia",
    `${delinquency.dias_atraso} dias`,
    toNotionDelinquencyStage(delinquency.status, delinquency.dias_atraso)
  ].join(" | ");
}

function buildLedgerReceivableLaunch(receivable: ReceivableRow, ledger: "condominio" | "fundo-promocao", enterpriseName?: string) {
  const category = ledger === "condominio" ? toNotionCondominiumRevenueCategory(receivable.receita) : "Arrecadado";

  return [
    enterpriseName ?? "Empreendimento",
    "Receita",
    category,
    receivable.competencia,
    receivable.vencimento,
    receivable.id.slice(0, 8)
  ].join(" | ");
}

function buildLedgerPayableLaunch(payable: PayableRow, ledger: "condominio" | "fundo-promocao", enterpriseName?: string) {
  const category = ledger === "condominio" ? toNotionExpenseCategory(payable.categoria) : toNotionPromotionExpenseCategory(payable.categoria);

  return [
    enterpriseName ?? "Empreendimento",
    "Despesa",
    category,
    payable.fornecedor,
    payable.competencia,
    payable.vencimento
  ].join(" | ");
}

function toCompetenceDate(competence: string) {
  return competence.length === 7 ? `${competence}-01` : competence;
}

function toNotionContractStatus(status: string) {
  const map: Record<string, string> = {
    ativo: "Vigente",
    vencendo: "Vencendo",
    renovacao: "Renovado",
    encerrado: "Encerrado",
    minuta: "Em elaboração",
    vencido: "Vencido",
    distrato: "Distrato"
  };

  return map[status] ?? "Vigente";
}

function toNotionContractIndex(index?: string | null) {
  const normalized = (index ?? "").toLowerCase().replace("-", "");
  const map: Record<string, string> = {
    igpm: "IGPM",
    ipca: "IPCA"
  };

  return map[normalized] ?? "Outro";
}

function toNotionRevenueType(type: string) {
  const map: Record<string, string> = {
    aluguel: "Aluguel",
    condominio: "Condomínio",
    fundo_promocao: "Fundo Promoção",
    fpp: "FPP",
    multa: "Multa",
    juros: "Juros"
  };

  return map[type] ?? "Outros";
}

function toNotionFinancialStatus(status: string) {
  const map: Record<string, string> = {
    aberto: "Aberto",
    vencido: "Vencido",
    pago: "Recebido",
    cancelado: "Cancelado",
    previsto: "Previsto"
  };

  return map[status] ?? "Aberto";
}

function toNotionPayableStatus(status: string) {
  const map: Record<string, string> = {
    aberto: "Aberto",
    vencido: "Vencido",
    pago: "Pago",
    cancelado: "Cancelado",
    previsto: "Previsto"
  };

  return map[status] ?? "Aberto";
}

function toNotionExpenseCategory(category: string) {
  const normalized = category.toLowerCase();
  const map: Record<string, string> = {
    limpeza: "Limpeza",
    seguranca: "Segurança",
    segurança: "Segurança",
    energia: "Energia",
    agua: "Água",
    água: "Água",
    jardinagem: "Jardinagem",
    administracao: "Administração",
    administração: "Administração",
    juridico: "Jurídico",
    jurídico: "Jurídico",
    seguro: "Seguro",
    seguros: "Seguro",
    manutencao: "Manutenção",
    manutenção: "Manutenção"
  };

  return map[normalized] ?? "Outro";
}

function toNotionCostCenter(costCenter: string) {
  const normalized = costCenter.toLowerCase();
  const map: Record<string, string> = {
    condominio: "Condomínio",
    condomínio: "Condomínio",
    "fundo promocao": "Fundo Promoção",
    "fundo promoção": "Fundo Promoção",
    operacoes: "Operação",
    operações: "Operação",
    operacao: "Operação",
    operação: "Operação",
    administrativo: "Administrativo"
  };

  return map[normalized] ?? "Administrativo";
}

function toNotionDelinquencyStage(status: string, daysLate: number) {
  const map: Record<string, string> = {
    negociacao: "Negociação",
    juridico: "Jurídico",
    jurídico: "Jurídico",
    regularizado: "Quitado",
    quitado: "Quitado"
  };

  if (map[status]) return map[status];
  if (daysLate >= 90) return "90 dias";
  if (daysLate >= 60) return "60 dias";
  if (daysLate >= 30) return "30 dias";
  if (daysLate >= 15) return "15 dias";
  return "5 dias";
}

function ledgerReceivableFilter(receivable: ReceivableRow, ledger: "condominio" | "fundo-promocao") {
  if (ledger === "condominio") return ["condominio", "multa", "juros"].includes(receivable.receita);
  return receivable.receita === "fundo_promocao";
}

function ledgerPayableFilter(payable: PayableRow, ledger: "condominio" | "fundo-promocao") {
  const costCenter = payable.centro_custo.toLowerCase();
  if (ledger === "condominio") return ["condominio", "condomínio"].includes(costCenter);
  return ["fundo promocao", "fundo promoção"].includes(costCenter);
}

function toNotionCondominiumRevenueCategory(type: string) {
  const map: Record<string, string> = {
    condominio: "Condomínio",
    multa: "Multa",
    juros: "Juros"
  };

  return map[type] ?? "Condomínio";
}

function toNotionPromotionExpenseCategory(category: string) {
  const normalized = category.toLowerCase();
  const map: Record<string, string> = {
    marketing: "Marketing",
    eventos: "Eventos",
    "trafego pago": "Tráfego Pago",
    "tráfego pago": "Tráfego Pago",
    "redes sociais": "Redes Sociais",
    "producao audiovisual": "Audiovisual",
    "produção audiovisual": "Audiovisual",
    audiovisual: "Audiovisual",
    decoracao: "Decoração",
    decoração: "Decoração",
    "material grafico": "Material Gráfico",
    "material gráfico": "Material Gráfico"
  };

  return map[normalized] ?? "Marketing";
}

function toNotionLedgerStatus(status: string) {
  const map: Record<string, string> = {
    pago: "Realizado",
    recebido: "Realizado",
    cancelado: "Cancelado"
  };

  return map[status] ?? "Previsto";
}

async function notionFetch(token: string, path: string, init: RequestInit) {
  const response = await fetch(`${NOTION_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
      ...(init.headers ?? {})
    }
  });
  const payload = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    ...payload
  };
}

async function markJob(client: any, id: string, status: string, payload?: Record<string, unknown>, erro?: string | null) {
  const patch: Record<string, unknown> = { status };

  if (status === "processando") patch.iniciado_em = new Date().toISOString();
  if (status === "concluido" || status === "erro") patch.finalizado_em = new Date().toISOString();
  if (payload) patch.payload = payload;
  if (erro !== undefined) patch.erro = erro;

  await client
    .from("notion_sync_jobs")
    .update(patch)
    .eq("id", id);
}
