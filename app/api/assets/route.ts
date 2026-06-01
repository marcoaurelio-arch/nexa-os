import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  mapCommercialLeadRow,
  mapContractRow,
  mapDelinquencyRow,
  mapDocumentRow,
  mapEnterpriseRow,
  mapFppRow,
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
import type { Database } from "@/lib/supabase/types";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
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

  const [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult] = await Promise.all([
    client.from("empreendimentos").select("*").is("deleted_at", null).order("nome", { ascending: true }),
    client.from("lojas").select("*").is("deleted_at", null).order("codigo", { ascending: true }),
    client.from("lojistas").select("*").is("deleted_at", null).order("nome_fantasia", { ascending: true }),
    client.from("contratos").select("*").is("deleted_at", null).order("data_termino", { ascending: true }),
    client.from("receitas").select("*").is("deleted_at", null).order("vencimento", { ascending: true }),
    client.from("despesas").select("*").is("deleted_at", null).order("vencimento", { ascending: true }),
    client.from("inadimplencias").select("*").is("deleted_at", null).order("dias_atraso", { ascending: false }),
    client.from("fpp").select("*").is("deleted_at", null).order("competencia", { ascending: false }),
    client.from("auditoria_faturamento").select("*").is("deleted_at", null).order("competencia", { ascending: false }),
    client.from("comercial_leads").select("*").is("deleted_at", null).order("data_proxima_acao", { ascending: true }),
    client.from("vacancia").select("*").is("deleted_at", null).order("inicio_vacancia", { ascending: true }),
    client.from("consumos").select("*").is("deleted_at", null).order("competencia", { ascending: false }),
    client.from("ordens_servico").select("*").is("deleted_at", null).order("prazo", { ascending: true }),
    client.from("documentos").select("*").is("deleted_at", null).order("vencimento", { ascending: true }),
    client.from("juridico").select("*").is("deleted_at", null).order("prazo", { ascending: true })
  ]);

  const failed = [enterpriseResult, storeResult, tenantResult, contractResult, receivableResult, payableResult, delinquencyResult, fppResult, auditResult, commercialResult, vacancyResult, utilityResult, serviceOrderResult, documentResult, legalResult].find((result) => result.error);

  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 });
  }

  return NextResponse.json({
    enterprises: enterpriseResult.data.map(mapEnterpriseRow),
    stores: storeResult.data.map(mapStoreRow),
    tenants: tenantResult.data.map(mapTenantRow),
    contracts: contractResult.data.map(mapContractRow),
    receivables: receivableResult.data.map(mapReceivableRow),
    payables: payableResult.data.map(mapPayableRow),
    delinquencyRecords: delinquencyResult.data.map(mapDelinquencyRow),
    fppRecords: fppResult.data.map(mapFppRow),
    revenueAuditRecords: auditResult.data.map(mapRevenueAuditRow),
    commercialLeads: commercialResult.data.map(mapCommercialLeadRow),
    vacancyRecords: vacancyResult.data.map(mapVacancyRow),
    utilityReadings: utilityResult.data.map(mapUtilityReadingRow),
    serviceOrders: serviceOrderResult.data.map(mapServiceOrderRow),
    documentRecords: documentResult.data.map(mapDocumentRow),
    legalCases: legalResult.data.map(mapLegalCaseRow)
  });
}
