import type { Enterprise, Store } from "@/lib/types";
import type { Database } from "./types";

type EnterpriseRow = Database["public"]["Tables"]["empreendimentos"]["Row"];
type StoreRow = Database["public"]["Tables"]["lojas"]["Row"];

export function mapEnterpriseRow(row: EnterpriseRow): Enterprise {
  return {
    id: row.id,
    nome: row.nome,
    cidade: row.cidade,
    estado: row.estado,
    status: row.status as Enterprise["status"],
    abl: row.abl_m2,
    lojas: row.numero_lojas,
    vagas: row.numero_vagas ?? 0,
    responsavel: "Nexa Malls"
  };
}

export function mapStoreRow(row: StoreRow): Store {
  return {
    id: row.id,
    codigo: row.codigo,
    empreendimentoId: row.empreendimento_id,
    nome: row.nome ?? row.codigo,
    segmento: row.segmento ?? "Nao informado",
    status: row.status as Store["status"],
    areaTotal: row.area_total_m2,
    aluguel: row.valor_aluguel,
    condominio: row.valor_condominio,
    fundo: row.valor_fundo_promocao
  };
}
