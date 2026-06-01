import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type NotionDatabaseRegistry = {
  id: string;
  nome: string;
  slug: string;
  status: string;
  notion_database_id: string | null;
  notion_data_source_id: string | null;
  notion_url: string | null;
  ultima_sincronizacao: string | null;
  erro: string | null;
};

type NotionSyncJob = {
  id: string;
  entidade: string;
  entidade_id: string | null;
  direcao: string;
  status: string;
  erro: string | null;
  created_at: string;
  iniciado_em: string | null;
  finalizado_em: string | null;
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

export async function GET() {
  const client = createAdminClient();

  if (!client) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const [databasesResult, jobsResult] = await Promise.all([
    client
      .from("notion_databases")
      .select("id,nome,slug,status,notion_database_id,notion_data_source_id,notion_url,ultima_sincronizacao,erro")
      .order("slug", { ascending: true }),
    client
      .from("notion_sync_jobs")
      .select("id,entidade,entidade_id,direcao,status,erro,created_at,iniciado_em,finalizado_em")
      .order("created_at", { ascending: false })
      .limit(25)
  ]);

  if (databasesResult.error) {
    return NextResponse.json({ error: databasesResult.error.message }, { status: 500 });
  }

  if (jobsResult.error) {
    return NextResponse.json({ error: jobsResult.error.message }, { status: 500 });
  }

  const databases = (databasesResult.data ?? []) as NotionDatabaseRegistry[];
  const jobs = (jobsResult.data ?? []) as NotionSyncJob[];
  const jobStatus: Record<string, number> = {};

  for (const job of jobs) {
    jobStatus[job.status] = (jobStatus[job.status] ?? 0) + 1;
  }

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    totalDatabases: databases.length,
    registeredDatabases: databases.filter((database) => Boolean(database.notion_database_id)).length,
    dataSources: databases.filter((database) => Boolean(database.notion_data_source_id)).length,
    pendingJobs: jobStatus.pendente ?? 0,
    processingJobs: jobStatus.processando ?? 0,
    completedJobs: jobStatus.concluido ?? 0,
    failedJobs: jobStatus.erro ?? 0,
    databases,
    recentJobs: jobs
  });
}

export async function POST(request: Request) {
  const client = createAdminClient();

  if (!client) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as { slugs?: string[] };
  const query = client
    .from("notion_databases")
    .select("id,nome,slug,status,notion_database_id,notion_data_source_id")
    .not("notion_data_source_id", "is", null)
    .order("slug", { ascending: true });

  const databasesResult = body.slugs?.length
    ? await query.in("slug", body.slugs)
    : await query;

  if (databasesResult.error) {
    return NextResponse.json({ error: databasesResult.error.message }, { status: 500 });
  }

  const databases = (databasesResult.data ?? []) as Array<Pick<
    NotionDatabaseRegistry,
    "id" | "nome" | "slug" | "status" | "notion_database_id" | "notion_data_source_id"
  >>;
  const requestedAt = new Date().toISOString();
  const slugs = databases.map((database) => database.slug);
  const activeJobsResult = slugs.length
    ? await client
      .from("notion_sync_jobs")
      .select("entidade,status")
      .in("entidade", slugs)
      .in("status", ["pendente", "processando"])
    : { data: [], error: null };

  if (activeJobsResult.error) {
    return NextResponse.json({ error: activeJobsResult.error.message }, { status: 500 });
  }

  const activeJobSlugs = new Set((activeJobsResult.data ?? []).map((job: { entidade: string }) => job.entidade));
  const databasesToQueue = databases.filter((database) => !activeJobSlugs.has(database.slug));
  const jobs = databasesToQueue.map((database) => ({
    database_id: database.id,
    entidade: database.slug,
    entidade_id: null,
    direcao: "push",
    status: "pendente",
    payload: {
      tipo: "initial_sync",
      slug: database.slug,
      nome: database.nome,
      notion_database_id: database.notion_database_id,
      notion_data_source_id: database.notion_data_source_id,
      requested_at: requestedAt
    }
  }));

  if (!jobs.length) {
    return NextResponse.json({
      queued: 0,
      skipped: activeJobSlugs.size,
      message: databases.length
        ? "As bases Notion ja possuem jobs pendentes ou em processamento."
        : "Nenhuma base Notion com data_source_id encontrada para enfileirar."
    });
  }

  const { error } = await client
    .from("notion_sync_jobs")
    .insert(jobs);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    queued: jobs.length,
    skipped: activeJobSlugs.size,
    requestedAt,
    slugs: databasesToQueue.map((database) => database.slug)
  });
}
