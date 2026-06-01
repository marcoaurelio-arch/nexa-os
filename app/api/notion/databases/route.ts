import { NextResponse } from "next/server";
import { buildNotionCreationPlan, NOTION_VERSION } from "@/lib/notion/payload";
import { notionDatabases } from "@/lib/notion/schema";

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
      response: data
    });

    if (!response.ok) break;
  }

  return NextResponse.json({ dryRun: false, version: NOTION_VERSION, results }, { status: results.every((item) => item.ok) ? 200 : 207 });
}
