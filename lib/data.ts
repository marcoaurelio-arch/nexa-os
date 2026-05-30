import type { ContractAlert, Enterprise, Revenue, ServiceOrder, Store } from "./types";

export const enterprises: Enterprise[] = [
  {
    id: "villa-viseu",
    nome: "Villa Viseu",
    cidade: "Uberlandia",
    estado: "MG",
    status: "ativo",
    abl: 8420,
    lojas: 62,
    vagas: 238,
    responsavel: "Diretoria Nexa"
  },
  {
    id: "piazza-nicomedes",
    nome: "Piazza Nicomedes",
    cidade: "Uberlandia",
    estado: "MG",
    status: "implantacao",
    abl: 6140,
    lojas: 44,
    vagas: 176,
    responsavel: "Comercial"
  },
  {
    id: "bluemall-rondon",
    nome: "Bluemall Rondon",
    cidade: "Rondonopolis",
    estado: "MT",
    status: "ativo",
    abl: 5100,
    lojas: 38,
    vagas: 151,
    responsavel: "Operacoes"
  },
  {
    id: "bluemall-centro",
    nome: "Bluemall Centro",
    cidade: "Uberlandia",
    estado: "MG",
    status: "ativo",
    abl: 3750,
    lojas: 31,
    vagas: 96,
    responsavel: "Administrativo"
  },
  {
    id: "boulevard-naves",
    nome: "Boulevard Naves",
    cidade: "Uberlandia",
    estado: "MG",
    status: "planejado",
    abl: 4720,
    lojas: 29,
    vagas: 122,
    responsavel: "Diretoria Nexa"
  }
];

export const stores: Store[] = [
  { id: "vv-01", codigo: "VV-01", empreendimentoId: "villa-viseu", nome: "Gastro Prime", segmento: "Alimentacao", status: "ocupada", areaTotal: 180, aluguel: 25000, condominio: 6800, fundo: 2500 },
  { id: "vv-02", codigo: "VV-02", empreendimentoId: "villa-viseu", nome: "Clinica Vida", segmento: "Saude", status: "ocupada", areaTotal: 220, aluguel: 31000, condominio: 7600, fundo: 3100 },
  { id: "vv-03", codigo: "VV-03", empreendimentoId: "villa-viseu", nome: "Loja 03", segmento: "Servicos", status: "negociacao", areaTotal: 96, aluguel: 11800, condominio: 3400, fundo: 950 },
  { id: "vv-04", codigo: "VV-04", empreendimentoId: "villa-viseu", nome: "Loja 04", segmento: "Moda", status: "disponivel", areaTotal: 134, aluguel: 16200, condominio: 4100, fundo: 1300 },
  { id: "pn-01", codigo: "PN-01", empreendimentoId: "piazza-nicomedes", nome: "Cafe Jardim", segmento: "Alimentacao", status: "implantacao", areaTotal: 140, aluguel: 19000, condominio: 5200, fundo: 1800 },
  { id: "br-01", codigo: "BR-01", empreendimentoId: "bluemall-rondon", nome: "Smart Fit Hub", segmento: "Fitness", status: "ocupada", areaTotal: 620, aluguel: 52000, condominio: 12800, fundo: 4400 },
  { id: "bc-01", codigo: "BC-01", empreendimentoId: "bluemall-centro", nome: "Odonto Mais", segmento: "Saude", status: "ocupada", areaTotal: 150, aluguel: 18400, condominio: 4500, fundo: 1200 },
  { id: "bn-01", codigo: "BN-01", empreendimentoId: "boulevard-naves", nome: "Loja ancora", segmento: "Mercado", status: "negociacao", areaTotal: 900, aluguel: 73000, condominio: 18000, fundo: 6500 }
];

export const revenues: Revenue[] = [
  { empreendimentoId: "villa-viseu", competencia: "2026-05", aluguel: 812000, condominio: 244000, fundo: 78000, fpp: 52000, vencidas: 126000, receber: 318000, pagar: 274000 },
  { empreendimentoId: "piazza-nicomedes", competencia: "2026-05", aluguel: 438000, condominio: 132000, fundo: 41000, fpp: 22000, vencidas: 52000, receber: 176000, pagar: 149000 },
  { empreendimentoId: "bluemall-rondon", competencia: "2026-05", aluguel: 352000, condominio: 101000, fundo: 36000, fpp: 18000, vencidas: 44000, receber: 139000, pagar: 118000 },
  { empreendimentoId: "bluemall-centro", competencia: "2026-05", aluguel: 298000, condominio: 85000, fundo: 26000, fpp: 12000, vencidas: 31000, receber: 96000, pagar: 88000 },
  { empreendimentoId: "boulevard-naves", competencia: "2026-05", aluguel: 184000, condominio: 52000, fundo: 19000, fpp: 0, vencidas: 0, receber: 42000, pagar: 61000 }
];

export const serviceOrders: ServiceOrder[] = [
  { id: "os-1024", empreendimentoId: "villa-viseu", loja: "VV-02", categoria: "Ar condicionado", prioridade: "alta", status: "aberta", prazo: "2026-06-03" },
  { id: "os-1025", empreendimentoId: "villa-viseu", loja: "Area comum", categoria: "Hidraulica", prioridade: "critica", status: "em_execucao", prazo: "2026-05-31" },
  { id: "os-1026", empreendimentoId: "piazza-nicomedes", loja: "PN-01", categoria: "Civil", prioridade: "media", status: "aguardando_terceiro", prazo: "2026-06-09" },
  { id: "os-1027", empreendimentoId: "bluemall-rondon", loja: "BR-01", categoria: "Eletrica", prioridade: "media", status: "aberta", prazo: "2026-06-05" }
];

export const contractAlerts: ContractAlert[] = [
  { id: "ct-01", empreendimentoId: "villa-viseu", loja: "VV-01", lojista: "Gastro Prime", meses: 6, vencimento: "2026-11-30", risco: "medio" },
  { id: "ct-02", empreendimentoId: "villa-viseu", loja: "VV-02", lojista: "Clinica Vida", meses: 12, vencimento: "2027-05-28", risco: "baixo" },
  { id: "ct-03", empreendimentoId: "bluemall-rondon", loja: "BR-01", lojista: "Smart Fit Hub", meses: 3, vencimento: "2026-08-29", risco: "alto" },
  { id: "ct-04", empreendimentoId: "bluemall-centro", loja: "BC-01", lojista: "Odonto Mais", meses: 24, vencimento: "2028-05-30", risco: "baixo" }
];
