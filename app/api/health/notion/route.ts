import { NextResponse } from "next/server";
import { NOTION_VERSION } from "@/lib/notion/payload";
import { notionDatabases } from "@/lib/notion/schema";

export async function GET() {
  const token = process.env.NOTION_API_KEY ?? process.env.NOTION_TOKEN;
  const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
  const checkedAt = new Date().toISOString();

  if (!token || !parentPageId) {
    return NextResponse.json({
      status: "not_configured",
      configured: false,
      checkedAt,
      databaseCount: notionDatabases.length,
      parentPageConfigured: Boolean(parentPageId),
      message: parentPageId
        ? "Pagina mae configurada. Preencha NOTION_API_KEY para validar a API oficial do Notion."
        : "Notion ainda nao configurado. Preencha NOTION_API_KEY e NOTION_PARENT_PAGE_ID."
    });
  }

  try {
    const response = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION
      }
    });
    const payload = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        status: "error",
        configured: true,
        checkedAt,
        databaseCount: notionDatabases.length,
        parentPageConfigured: true,
        message: payload?.message ?? "Falha ao consultar Notion."
      }, { status: response.status });
    }

    return NextResponse.json({
      status: "ok",
      configured: true,
      checkedAt,
      databaseCount: notionDatabases.length,
      parentPageConfigured: true,
      botName: payload?.name ?? payload?.bot?.owner?.workspace_name ?? "Notion",
      message: "Notion respondeu com sucesso."
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      configured: true,
      checkedAt,
      databaseCount: notionDatabases.length,
      parentPageConfigured: true,
      message: error instanceof Error ? error.message : "Falha inesperada ao consultar Notion."
    }, { status: 500 });
  }
}
