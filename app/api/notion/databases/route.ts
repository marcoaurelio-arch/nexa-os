import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildNotionCreationPlan, NOTION_VERSION } from "@/lib/notion/payload";
import { notionDatabases } from "@/lib/notion/schema";
import type { Database } from "@/lib/supabase/types";

const NOTION_API_URL = "https://api.notion.com/v1/databases";

export async function GET() {
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID ?? "NOTION_PARENT_PAGE_ID";

  return NextResponse.json({
    version: NOTION_VERSION,
    totalDatabases: notionDatabases.length,
    creationOrder: notionDatabases.map((database) => database.slug),
    plan: buildNotionCreationPlan(parentPageId)
  });
}

export async function POST(request: Request) {
  const token = process.env.NOTION_API_KEY ?? process.env.NOTION_TOKEN;
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  const body = await request.json().catch(() => ({})) as { dryRun?: boolean; relationDatabaseIds?: Record<string, string> };
  const dryRun = body.dryRun ?? true;
  const relationDatabaseIds = body.relationDatabaseIds ?? {};

  if (!parentPageId) {
    return NextResponse.json({ error: "Configure NOTION_PARENT_PAGE_ID para criar as bases." }, { status: 400 });
  }

  const plan = buildNotionCreationPlan(parentPageId, relationDatabaseIds);

  if (dryRun) {
    return NextResponse.json({ dryRun: true, version: NOTION_VERSION, plan });
  }

  if (!token) {
    return NextResponse.json({ error: "Configure NOTION_API_KEY ou NOTION_TOKEN para chamar a Notion API." }, { status: 400 });
  }

  const results = [];
  const upserts = [];

  for (const item of plan) {
    const response = await fetch(NOTION_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": NOTION_VERSION
      },
      body: JSON.stringify(item.payload)
    });
    const data = await response.json();

    results.push({
      slug: item.slug,
      name: item.name,
      ok: response.ok,
      status: response.status,
      notionDatabaseId: data?.id ?? null,
      notionDataSourceId: data?.data_sources?.[0]?.id ?? null,
      notionUrl: data?.url ?? null,
      response: data
    });

    if (response.ok && data?.id) {
      upserts.push({
        slug: item.slug,
        nome: item.name,
        notion_database_id: data.id,
        notion_data_source_id: data?.data_sources?.[0]?.id ?? null,
        notion_url: data?.url ?? null,
        status: "criado",
        ultima_sincronizacao: new Date().toISOString(),
        erro: null
      });
    }

    if (!response.ok) break;
  }

  const registry = await registerCreatedDatabases(upserts);

  return NextResponse.json(
    { dryRun: false, version: NOTION_VERSION, results, registry },
    { status: results.every((item) => item.ok) && registry.ok ? 200 : 207 }
  );
}

async function registerCreatedDatabases(rows: Array<{
  slug: string;
  nome: string;
  notion_database_id: string;
  notion_data_source_id: string | null;
  notion_url: string | null;
  status: string;
  ultima_sincronizacao: string;
  erro: null;
}>) {
  if (!rows.length) return { ok: true, count: 0 };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return { ok: false, count: 0, error: "Supabase server env not configured." };
  }

  const client = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;

  const { error } = await client
    .from("notion_databases")
    .upsert(rows, { onConflict: "slug" });

  if (error) return { ok: false, count: 0, error: error.message };

  return { ok: true, count: rows.length };
}
