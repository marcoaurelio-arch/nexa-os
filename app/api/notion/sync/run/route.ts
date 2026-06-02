import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NOTION_VERSION } from "@/lib/notion/payload";
import type { Database } from "@/lib/supabase/types";

const NOTION_API_URL = "https://api.notion.com/v1";

type EnterpriseRow = Database["public"]["Tables"]["empreendimentos"]["Row"];
type StoreRow = Database["public"]["Tables"]["lojas"]["Row"];
type TenantRow = Database["public"]["Tables"]["lojistas"]["Row"];
type ContractRow = Database["public"]["Tables"]["contratos"]["Row"];

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
  const supportedSlugs = body.slugs?.length ? body.slugs : ["empreendimentos", "lojas", "lojistas", "contratos"];
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
