import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  mapCommercialLeadRow,
  mapContractRow,
  mapDelinquencyRow,
  mapDocumentRow,
  mapEnterpriseRow,
  mapFppRow,
  mapLandBankAreaRow,
  mapLegalCaseRow,
  mapPayableRow,
  mapReceivableRow,
  mapRevenueAuditRow,
  mapServiceOrderRow,
  mapStoreRow,
  mapTenantRow,
  mapUtilityReadingRow,
  mapVacancyRow
} from "@/lib/supabase/mappers";
import { emptyAnalytics, fetchAssetAnalytics } from "@/lib/supabase/analytics";
import { validateAppUser } from "@/lib/supabase/server-auth";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
  const auth = await validateAppUser(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const client = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;
  const enterpriseIds = auth.profile?.enterpriseIds ?? null;

  if (auth.required && enterpriseIds && enterpriseIds.length === 0) {
    return NextResponse.json({
      enterprises: [],
      stores: [],
      tenants: [],
      contracts: [],
      receivables: [],
      payables: [],
      delinquencyRecords: [],
      fppRecords: [],
      revenueAuditRecords: [],
      commercialLeads: [],
      vacancyRecords: [],
      utilityReadings: [],
      serviceOrders: [],
      documentRecords: [],
      legalCases: [],
      landBankAreas: [],
      analytics: emptyAnalytics()
    });
  }

  const scope = (query: any, column = "empreendimento_id") => {
    return enterpriseIds ? query.in(column, enterpriseIds) : query;
  };

  const [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult, landBankResult, landPipelineResult, landScoreResult, landOwnerResult, landOwnerLinkResult] = await Promise.all([
    scope(client.from("empreendimentos").select("*").is("deleted_at", null), "id").order("nome", { ascending: true }),
    scope(client.from("lojas").select("*").is("deleted_at", null)).order("codigo", { ascending: true }),
    scope(client.from("lojistas").select("*").is("deleted_at", null)).order("nome_fantasia", { ascending: true }),
    scope(client.from("contratos").select("*").is("deleted_at", null)).order("data_termino", { ascending: true }),
    scope(client.from("receitas").select("*").is("deleted_at", null)).order("vencimento", { ascending: true }),
    scope(client.from("despesas").select("*").is("deleted_at", null)).order("vencimento", { ascending: true }),
    client.from("inadimplencias").select("*").is("deleted_at", null).order("dias_atraso", { ascending: false }),
    scope(client.from("fpp").select("*").is("deleted_at", null)).order("competencia", { ascending: false }),
    scope(client.from("auditoria_faturamento").select("*").is("deleted_at", null)).order("competencia", { ascending: false }),
    scope(client.from("comercial_leads").select("*").is("deleted_at", null)).order("data_proxima_acao", { ascending: true }),
    scope(client.from("vacancia").select("*").is("deleted_at", null)).order("inicio_vacancia", { ascending: true }),
    scope(client.from("consumos").select("*").is("deleted_at", null)).order("competencia", { ascending: false }),
    scope(client.from("ordens_servico").select("*").is("deleted_at", null)).order("prazo", { ascending: true }),
    scope(client.from("documentos").select("*").is("deleted_at", null)).order("vencimento", { ascending: true }),
    scope(client.from("juridico").select("*").is("deleted_at", null)).order("prazo", { ascending: true }),
    scope(client.from("land_bank_areas").select("*").is("deleted_at", null)).order("prioridade", { ascending: true }),
    scope(client.from("land_bank_pipeline").select("*").is("deleted_at", null)).order("posicao", { ascending: true }),
    scope(client.from("land_bank_scores").select("*")).order("created_at", { ascending: false }),
    scope(client.from("land_bank_proprietarios").select("*").is("deleted_at", null)).order("nome", { ascending: true }),
    scope(client.from("land_bank_area_proprietarios").select("*")).order("principal", { ascending: false })
  ]);

  const failed = [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult].find((result) => result.error);

  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  if (landBankResult.error && !isMissingRelationError(landBankResult.error)) {
    return NextResponse.json({ error: landBankResult.error.message }, { status: 500 });
  }
  if (landPipelineResult.error && !isMissingRelationError(landPipelineResult.error)) {
    return NextResponse.json({ error: landPipelineResult.error.message }, { status: 500 });
  }
  if (landScoreResult.error && !isMissingRelationError(landScoreResult.error)) {
    return NextResponse.json({ error: landScoreResult.error.message }, { status: 500 });
  }
  if (landOwnerResult.error && !isMissingRelationError(landOwnerResult.error)) {
    return NextResponse.json({ error: landOwnerResult.error.message }, { status: 500 });
  }
  if (landOwnerLinkResult.error && !isMissingRelationError(landOwnerLinkResult.error)) {
    return NextResponse.json({ error: landOwnerLinkResult.error.message }, { status: 500 });
  }

  const scopedStoreIds = new Set((storeResult.data ?? []).map((store: { id: string }) => store.id));
  const delinquencyRows = enterpriseIds
    ? (delinquencyResult.data ?? []).filter((row: { loja_id: string }) => scopedStoreIds.has(row.loja_id))
    : delinquencyResult.data;
  const landPipelineByArea = new Map<string, any>((landPipelineResult.data ?? []).map((row: { area_id: string }) => [row.area_id, row]));
  const landScoreByArea = latestLandScoresByArea(landScoreResult.data ?? []);
  const landOwnerByArea = landOwnersByArea(landOwnerResult.data ?? [], landOwnerLinkResult.data ?? []);
  const analyticsKey = auth.required && auth.accessToken && anonKey ? anonKey : serviceKey;
  const analyticsClient = createClient(url, analyticsKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: auth.accessToken ? { headers: { Authorization: `Bearer ${auth.accessToken}` } } : undefined
  }) as any;
  const analytics = await fetchAssetAnalytics(analyticsClient);

  return NextResponse.json({
    enterprises: enterpriseResult.data.map(mapEnterpriseRow),
    stores: storeResult.data.map(mapStoreRow),
    tenants: tenantResult.data.map(mapTenantRow),
    contracts: contractResult.data.map(mapContractRow),
    receivables: receivableResult.data.map(mapReceivableRow),
    payables: payableResult.data.map(mapPayableRow),
    delinquencyRecords: delinquencyRows.map(mapDelinquencyRow),
    fppRecords: fppResult.data.map(mapFppRow),
    revenueAuditRecords: auditResult.data.map(mapRevenueAuditRow),
    commercialLeads: commercialResult.data.map(mapCommercialLeadRow),
    vacancyRecords: vacancyResult.data.map(mapVacancyRow),
    utilityReadings: utilityResult.data.map(mapUtilityReadingRow),
    serviceOrders: serviceOrderResult.data.map(mapServiceOrderRow),
    documentRecords: documentResult.data.map(mapDocumentRow),
    legalCases: legalResult.data.map(mapLegalCaseRow),
    landBankAreas: (landBankResult.data ?? []).map((row: any) => mapLandBankAreaRow(row, landPipelineByArea.get(row.id), landScoreByArea.get(row.id), landOwnerByArea.get(row.id))),
    analytics
  });
}
function isMissingRelationError(error: { code?: string; message?: string }) {
  return error.code === "42P01" || /does not exist/i.test(error.message ?? "");
}

function latestLandScoresByArea(rows: any[]) {
  const scoresByArea = new Map<string, any>();

  for (const row of rows) {
    if (!scoresByArea.has(row.area_id)) {
      scoresByArea.set(row.area_id, row);
    }
  }

  return scoresByArea;
}

function landOwnersByArea(owners: any[], links: any[]) {
  const ownersById = new Map<string, any>(owners.map((owner) => [owner.id, owner]));
  const ownersByArea = new Map<string, any>();

  for (const link of links) {
    const owner = ownersById.get(link.proprietario_id);
    if (owner && !ownersByArea.has(link.area_id)) {
      ownersByArea.set(link.area_id, owner);
    }
  }

  return ownersByArea;
}
