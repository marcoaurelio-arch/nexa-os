import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/supabase/types";

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
