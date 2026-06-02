import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { NOTION_VERSION } from "@/lib/notion/payload";
import type { Database } from "@/lib/supabase/types";

const NOTION_API_URL = "https://api.notion.com/v1";

type EnterpriseRow = Database["public"]["Tables"]["empreendimentos"]["Row"];

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
  const supportedSlugs = body.slugs?.length ? body.slugs : ["empreendimentos"];
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

async function getExistingTitleValues(token: string, dataSourceId: string, titleProperty: string) {
  const values = new Set<string>();
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
      if (title) values.add(title);
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

function toNotionEnterpriseStatus(status: string) {
  const map: Record<string, string> = {
    ativo: "Operação",
    implantacao: "Obra",
    planejado: "Planejamento"
  };

  return map[status] ?? "Planejamento";
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
