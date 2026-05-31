import type { Contract, Enterprise, Store, Tenant } from "@/lib/types";
import type { Database } from "./types";

type EnterpriseRow = Database["public"]["Tables"]["empreendimentos"]["Row"];
type StoreRow = Database["public"]["Tables"]["lojas"]["Row"];
type TenantRow = Database["public"]["Tables"]["lojistas"]["Row"];
type ContractRow = Database["public"]["Tables"]["contratos"]["Row"];

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

export function mapTenantRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    nomeFantasia: row.nome_fantasia,
    razaoSocial: row.razao_social,
    cnpj: row.cnpj,
    responsavelLegal: row.responsavel_legal ?? "",
    telefone: row.telefone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    endereco: row.endereco ?? "",
    segmento: row.segmento ?? "Nao informado",
    lojaId: row.loja_id ?? "",
    dataEntrada: row.data_entrada ?? "",
    status: row.status as Tenant["status"]
  };
}

export function mapContractRow(row: ContractRow): Contract {
  return {
    id: row.id,
    lojaId: row.loja_id,
    lojistaId: row.lojista_id,
    dataInicio: row.data_inicio,
    dataTermino: row.data_termino,
    prazoMeses: row.prazo_meses,
    aluguelMinimo: row.aluguel_minimo,
    indiceReajuste: row.indice_reajuste ?? "",
    garantia: row.garantia ?? "",
    seguro: row.seguro ?? "",
    contratoUrl: row.contrato_url ?? "",
    aditivos: row.aditivos,
    status: row.status as Contract["status"]
  };
}
