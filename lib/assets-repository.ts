import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { mapEnterpriseRow, mapStoreRow } from "@/lib/supabase/mappers";
import type { Enterprise, Store } from "@/lib/types";

export type AssetData = {
  enterprises: Enterprise[];
  stores: Store[];
};

const LOCAL_ASSET_DATA_KEY = "nexa-os.asset-data.v1";

export function loadLocalAssetData(): AssetData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(LOCAL_ASSET_DATA_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AssetData;
    if (!Array.isArray(parsed.enterprises) || !Array.isArray(parsed.stores)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveLocalAssetData(data: AssetData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCAL_ASSET_DATA_KEY, JSON.stringify(data));
}

export function resetLocalAssetData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(LOCAL_ASSET_DATA_KEY);
}

export async function fetchAssetData(): Promise<AssetData | null> {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return null;
  }

  const client = supabase as any;

  const [enterpriseResult, storeResult] = await Promise.all([
    client
      .from("empreendimentos")
      .select("*")
      .is("deleted_at", null)
      .order("nome", { ascending: true }),
    client
      .from("lojas")
      .select("*")
      .is("deleted_at", null)
      .order("codigo", { ascending: true })
  ]);

  if (enterpriseResult.error) throw enterpriseResult.error;
  if (storeResult.error) throw storeResult.error;

  return {
    enterprises: enterpriseResult.data.map(mapEnterpriseRow),
    stores: storeResult.data.map(mapStoreRow)
  };
}

export async function saveEnterprise(enterprise: Enterprise) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return enterprise;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("empreendimentos")
    .upsert({
      ...(isUuid(enterprise.id) ? { id: enterprise.id } : {}),
      nome: enterprise.nome,
      cidade: enterprise.cidade,
      estado: enterprise.estado,
      status: enterprise.status,
      abl_m2: enterprise.abl,
      numero_lojas: enterprise.lojas,
      numero_vagas: enterprise.vagas
    })
    .select()
    .single();

  if (error) throw error;
  return mapEnterpriseRow(data);
}

export async function saveStore(store: Store) {
  const supabase = createBrowserSupabaseClient();

  if (!supabase) {
    return store;
  }
  const client = supabase as any;

  const { data, error } = await client
    .from("lojas")
    .upsert({
      ...(isUuid(store.id) ? { id: store.id } : {}),
      empreendimento_id: store.empreendimentoId,
      codigo: store.codigo,
      nome: store.nome,
      segmento: store.segmento,
      status: store.status,
      area_total_m2: store.areaTotal,
      valor_aluguel: store.aluguel,
      valor_condominio: store.condominio,
      valor_fundo_promocao: store.fundo
    })
    .select()
    .single();

  if (error) throw error;
  return mapStoreRow(data);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
