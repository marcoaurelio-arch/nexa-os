import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runNotionSync } from "@/app/api/notion/sync/run/route";
import type { Database } from "@/lib/supabase/types";

type NotionDatabaseRegistry = {
  id: string;
  nome: string;
  slug: string;
  notion_database_id: string | null;
  notion_data_source_id: string | null;
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

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const client = createAdminClient();

  if (!client) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const url = new URL(request.url);
  const slugs = parseSlugs(url.searchParams.get("slugs"));
  const limit = clampNumber(Number(url.searchParams.get("limit") ?? 5), 1, 5);
  const maxBatches = clampNumber(Number(url.searchParams.get("batches") ?? 5), 1, 5);
  const queued = await queueScheduledSyncJobs(client, slugs);
  const runs = [];

  if (!queued.ok) {
    return NextResponse.json({
      ok: false,
      queued,
      error: queued.error ?? "Falha ao enfileirar sync Notion."
    }, { status: 500 });
  }

  for (let batch = 0; batch < maxBatches; batch += 1) {
    const result = await runNotionSync({
      limit,
      retryErrors: true,
      slugs
    });

    runs.push(result.body);

    if (result.status >= 400) {
      return NextResponse.json({
        ok: false,
        queued,
        runs,
        error: result.body.error ?? "Falha ao executar sync Notion."
      }, { status: result.status });
    }

    if (Number(result.body.processed ?? 0) === 0) break;
  }

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    queued,
    runs
  });
}

function isAuthorizedCronRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) return process.env.NODE_ENV !== "production";

  return request.headers.get("authorization") === `Bearer ${secret}`;
}

function parseSlugs(value: string | null) {
  return value
    ? value.split(",").map((slug) => slug.trim()).filter(Boolean)
    : undefined;
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(value, max));
}

async function queueScheduledSyncJobs(client: any, slugs?: string[]) {
  const query = client
    .from("notion_databases")
    .select("id,nome,slug,notion_database_id,notion_data_source_id")
    .not("notion_data_source_id", "is", null)
    .order("slug", { ascending: true });

  const databasesResult = slugs?.length
    ? await query.in("slug", slugs)
    : await query;

  if (databasesResult.error) {
    return {
      ok: false,
      queued: 0,
      skipped: 0,
      slugs: [],
      error: databasesResult.error.message
    };
  }

  const databases = (databasesResult.data ?? []) as NotionDatabaseRegistry[];
  const databaseSlugs = databases.map((database) => database.slug);
  const activeJobsResult = databaseSlugs.length
    ? await client
      .from("notion_sync_jobs")
      .select("entidade,status")
      .in("entidade", databaseSlugs)
      .in("status", ["pendente", "processando"])
    : { data: [], error: null };

  if (activeJobsResult.error) {
    return {
      ok: false,
      queued: 0,
      skipped: 0,
      slugs: [],
      error: activeJobsResult.error.message
    };
  }

  const activeJobSlugs = new Set((activeJobsResult.data ?? []).map((job: { entidade: string }) => job.entidade));
  const requestedAt = new Date().toISOString();
  const databasesToQueue = databases.filter((database) => !activeJobSlugs.has(database.slug));
  const jobs = databasesToQueue.map((database) => ({
    database_id: database.id,
    entidade: database.slug,
    entidade_id: null,
    direcao: "push",
    status: "pendente",
    payload: {
      tipo: "scheduled_sync",
      slug: database.slug,
      nome: database.nome,
      notion_database_id: database.notion_database_id,
      notion_data_source_id: database.notion_data_source_id,
      requested_at: requestedAt
    }
  }));

  if (!jobs.length) {
    return {
      ok: true,
      queued: 0,
      skipped: activeJobSlugs.size,
      slugs: []
    };
  }

  const { error } = await client
    .from("notion_sync_jobs")
    .insert(jobs);

  if (error) {
    return {
      ok: false,
      queued: 0,
      skipped: activeJobSlugs.size,
      slugs: [],
      error: error.message
    };
  }

  return {
    ok: true,
    queued: jobs.length,
    skipped: activeJobSlugs.size,
    slugs: databasesToQueue.map((database) => database.slug)
  };
}
