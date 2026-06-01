import { notionDatabases } from "@/lib/notion/schema";
import type { NotionDatabaseDefinition, NotionPropertyDefinition } from "@/lib/notion/schema";

export const NOTION_VERSION = "2026-03-11";

export type NotionDatabaseCreatePayload = {
  parent: { type: "page_id"; page_id: string };
  title: Array<{ type: "text"; text: { content: string } }>;
  initial_data_source: {
    properties: Record<string, unknown>;
  };
  description?: Array<{ type: "text"; text: { content: string } }>;
};

export function buildNotionDatabasePayload(
  database: NotionDatabaseDefinition,
  parentPageId: string,
  relationDatabaseIds: Record<string, string> = {}
): NotionDatabaseCreatePayload {
  const properties = database.properties.reduce<Record<string, unknown>>((result, property) => {
    const notionProperty = toNotionProperty(property, relationDatabaseIds);
    if (notionProperty) {
      result[property.name] = notionProperty;
    }

    return result;
  }, {});

  return {
    parent: { type: "page_id", page_id: parentPageId },
    title: [{ type: "text", text: { content: database.name } }],
    description: [
      {
        type: "text",
        text: { content: `Nexa OS | ${database.slug} | fonte: ${database.sourceTable ?? "analitica"}` }
      }
    ],
    initial_data_source: {
      properties
    }
  };
}

export function buildNotionCreationPlan(parentPageId: string, relationDatabaseIds: Record<string, string> = {}) {
  return notionDatabases.map((database) => ({
    id: database.id,
    name: database.name,
    slug: database.slug,
    sourceTable: database.sourceTable,
    relations: database.properties
      .filter((property) => property.type === "relation" && property.relationTo)
      .map((property) => ({ property: property.name, target: property.relationTo })),
    payload: buildNotionDatabasePayload(database, parentPageId, relationDatabaseIds)
  }));
}

function toNotionProperty(property: NotionPropertyDefinition, relationDatabaseIds: Record<string, string>) {
  if (property.type === "title") return { title: {} };
  if (property.type === "rich_text") return { rich_text: {} };
  if (property.type === "number") return { number: { format: "number" } };
  if (property.type === "select") return { select: { options: toOptions(property.options) } };
  if (property.type === "multi_select") return { multi_select: { options: toOptions(property.options) } };
  if (property.type === "status") return { status: {} };
  if (property.type === "date") return { date: {} };
  if (property.type === "checkbox") return { checkbox: {} };
  if (property.type === "phone_number") return { phone_number: {} };
  if (property.type === "email") return { email: {} };
  if (property.type === "url") return { url: {} };
  if (property.type === "files") return { files: {} };
  if (property.type === "people") return { people: {} };

  if (property.type === "relation" && property.relationTo) {
    const databaseId = relationDatabaseIds[property.relationTo];
    if (!databaseId) return null;
    return { relation: { database_id: databaseId, type: "dual_property", dual_property: {} } };
  }

  return null;
}

function toOptions(options?: string[]) {
  return (options ?? []).map((name) => ({ name }));
}
