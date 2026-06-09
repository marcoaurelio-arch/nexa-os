import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

const canonicalViews = [
  "vw_ocupacao_consolidada",
  "vw_ocupacao_empreendimento",
  "vw_kpis_financeiro",
  "vw_aging_inadimplencia",
  "vw_contratos_vencendo",
  "vw_pipeline_comercial",
  "vw_central_alertas"
];

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceKey || anonKey;
  const checkedAt = new Date().toISOString();

  if (!url || !key) {
    return NextResponse.json({
      status: "not_configured",
      configured: false,
      checkedAt,
      message: "Supabase ainda nao configurado. Preencha .env.local e reinicie o servidor."
    });
  }

  try {
    const supabase = createClient<Database>(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    const { count, error } = await supabase
      .from("empreendimentos")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);
    const viewChecks = await Promise.all(
      canonicalViews.map(async (view) => {
        const result = await (supabase as any).from(view).select("*", { count: "exact", head: true });
        return {
          view,
          ok: !result.error,
          message: result.error?.message ?? null
        };
      })
    );
    const okViews = viewChecks.filter((check) => check.ok).length;

    if (error) {
      return NextResponse.json({
        status: "error",
        configured: true,
        checkedAt,
        message: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "ok",
      configured: true,
      checkedAt,
      enterpriseCount: count ?? 0,
      canonicalViews: {
        ok: okViews,
        total: canonicalViews.length,
        checks: viewChecks
      },
      message: "Supabase respondeu com sucesso."
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      configured: true,
      checkedAt,
      message: error instanceof Error ? error.message : "Falha inesperada ao consultar Supabase."
    }, { status: 500 });
  }
}
