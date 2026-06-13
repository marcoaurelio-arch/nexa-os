import type { CommercialLead, Contract, ContractAlert, DelinquencyRecord, DocumentRecord, Enterprise, FppRecord, LandBankArea, LegalCase, Payable, Receivable, Revenue, RevenueAuditRecord, ServiceOrder, Store, Tenant, UtilityReading, VacancyRecord } from "./types";

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

export const tenants: Tenant[] = [
  {
    id: "tenant-gastro-prime",
    nomeFantasia: "Gastro Prime",
    razaoSocial: "Gastro Prime Alimentacao Ltda",
    cnpj: "12.345.678/0001-90",
    responsavelLegal: "Marina Campos",
    telefone: "(34) 3222-1001",
    whatsapp: "(34) 99991-1001",
    email: "financeiro@gastroprime.com.br",
    endereco: "Av. dos Vinhedos, 1200 - Uberlandia/MG",
    segmento: "Alimentacao",
    lojaId: "vv-01",
    dataEntrada: "2024-03-01",
    status: "ativo"
  },
  {
    id: "tenant-clinica-vida",
    nomeFantasia: "Clinica Vida",
    razaoSocial: "Clinica Vida Integrada Ltda",
    cnpj: "23.456.789/0001-10",
    responsavelLegal: "Renato Vieira",
    telefone: "(34) 3222-1002",
    whatsapp: "(34) 99991-1002",
    email: "administrativo@clinicavida.com.br",
    endereco: "Rua das Acacias, 88 - Uberlandia/MG",
    segmento: "Saude",
    lojaId: "vv-02",
    dataEntrada: "2024-07-15",
    status: "ativo"
  },
  {
    id: "tenant-smart-fit-hub",
    nomeFantasia: "Smart Fit Hub",
    razaoSocial: "Hub Fitness Rondonopolis Ltda",
    cnpj: "34.567.890/0001-55",
    responsavelLegal: "Patricia Lima",
    telefone: "(66) 3422-1003",
    whatsapp: "(66) 99991-1003",
    email: "gestao@hubfitness.com.br",
    endereco: "Av. Rondon, 455 - Rondonopolis/MT",
    segmento: "Fitness",
    lojaId: "br-01",
    dataEntrada: "2023-11-20",
    status: "ativo"
  },
  {
    id: "tenant-cafe-jardim",
    nomeFantasia: "Cafe Jardim",
    razaoSocial: "Cafe Jardim Nicomedes Ltda",
    cnpj: "45.678.901/0001-22",
    responsavelLegal: "Luiza Andrade",
    telefone: "(34) 3222-1004",
    whatsapp: "(34) 99991-1004",
    email: "luiza@cafejardim.com.br",
    endereco: "Av. Nicomedes Alves dos Santos, 1888 - Uberlandia/MG",
    segmento: "Alimentacao",
    lojaId: "pn-01",
    dataEntrada: "2026-04-10",
    status: "implantacao"
  }
];

export const contracts: Contract[] = [
  {
    id: "contract-gastro-prime",
    lojaId: "vv-01",
    lojistaId: "tenant-gastro-prime",
    dataInicio: "2024-03-01",
    dataTermino: "2026-11-30",
    prazoMeses: 33,
    aluguelMinimo: 25000,
    indiceReajuste: "IPCA",
    garantia: "Fianca bancaria",
    seguro: "Seguro empresarial ativo",
    contratoUrl: "",
    aditivos: 1,
    status: "vencendo"
  },
  {
    id: "contract-clinica-vida",
    lojaId: "vv-02",
    lojistaId: "tenant-clinica-vida",
    dataInicio: "2024-07-15",
    dataTermino: "2027-05-28",
    prazoMeses: 34,
    aluguelMinimo: 31000,
    indiceReajuste: "IGP-M",
    garantia: "Caucao",
    seguro: "Seguro empresarial ativo",
    contratoUrl: "",
    aditivos: 0,
    status: "ativo"
  },
  {
    id: "contract-smart-fit-hub",
    lojaId: "br-01",
    lojistaId: "tenant-smart-fit-hub",
    dataInicio: "2023-11-20",
    dataTermino: "2026-08-29",
    prazoMeses: 33,
    aluguelMinimo: 52000,
    indiceReajuste: "IPCA",
    garantia: "Seguro garantia",
    seguro: "Seguro empresarial ativo",
    contratoUrl: "",
    aditivos: 2,
    status: "renovacao"
  }
];

export const revenues: Revenue[] = [
  { empreendimentoId: "villa-viseu", competencia: "2026-05", aluguel: 812000, condominio: 244000, fundo: 78000, fpp: 52000, vencidas: 126000, receber: 318000, pagar: 274000 },
  { empreendimentoId: "piazza-nicomedes", competencia: "2026-05", aluguel: 438000, condominio: 132000, fundo: 41000, fpp: 22000, vencidas: 52000, receber: 176000, pagar: 149000 },
  { empreendimentoId: "bluemall-rondon", competencia: "2026-05", aluguel: 352000, condominio: 101000, fundo: 36000, fpp: 18000, vencidas: 44000, receber: 139000, pagar: 118000 },
  { empreendimentoId: "bluemall-centro", competencia: "2026-05", aluguel: 298000, condominio: 85000, fundo: 26000, fpp: 12000, vencidas: 31000, receber: 96000, pagar: 88000 },
  { empreendimentoId: "boulevard-naves", competencia: "2026-05", aluguel: 184000, condominio: 52000, fundo: 19000, fpp: 0, vencidas: 0, receber: 42000, pagar: 61000 }
];

export const receivables: Receivable[] = [
  { id: "rec-vv-01-aluguel", lojaId: "vv-01", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "aluguel", valor: 25000, vencimento: "2026-05-10", recebimento: "2026-05-09", status: "pago" },
  { id: "rec-vv-01-condominio", lojaId: "vv-01", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "condominio", valor: 6800, vencimento: "2026-05-10", recebimento: "", status: "aberto" },
  { id: "rec-vv-01-fundo", lojaId: "vv-01", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "fundo_promocao", valor: 2500, vencimento: "2026-05-10", recebimento: "2026-05-09", status: "pago" },
  { id: "rec-vv-02-aluguel", lojaId: "vv-02", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "aluguel", valor: 31000, vencimento: "2026-05-10", recebimento: "", status: "vencido" },
  { id: "rec-vv-02-condominio", lojaId: "vv-02", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "condominio", valor: 7600, vencimento: "2026-05-10", recebimento: "2026-05-10", status: "pago" },
  { id: "rec-vv-02-fundo", lojaId: "vv-02", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "fundo_promocao", valor: 3100, vencimento: "2026-05-10", recebimento: "", status: "aberto" },
  { id: "rec-vv-02-juros", lojaId: "vv-02", empreendimentoId: "villa-viseu", competencia: "2026-05", receita: "juros", valor: 620, vencimento: "2026-05-24", recebimento: "", status: "aberto" },
  { id: "rec-br-01-aluguel", lojaId: "br-01", empreendimentoId: "bluemall-rondon", competencia: "2026-05", receita: "aluguel", valor: 52000, vencimento: "2026-05-12", recebimento: "2026-05-12", status: "pago" },
  { id: "rec-br-01-condominio", lojaId: "br-01", empreendimentoId: "bluemall-rondon", competencia: "2026-05", receita: "condominio", valor: 12800, vencimento: "2026-05-12", recebimento: "2026-05-12", status: "pago" },
  { id: "rec-br-01-fundo", lojaId: "br-01", empreendimentoId: "bluemall-rondon", competencia: "2026-05", receita: "fundo_promocao", valor: 4400, vencimento: "2026-05-12", recebimento: "2026-05-12", status: "pago" },
  { id: "rec-pn-01-fundo", lojaId: "pn-01", empreendimentoId: "piazza-nicomedes", competencia: "2026-05", receita: "fundo_promocao", valor: 1800, vencimento: "2026-05-15", recebimento: "", status: "aberto" }
];

export const payables: Payable[] = [
  { id: "pay-vv-limpeza", empreendimentoId: "villa-viseu", fornecedor: "Limpeza Triangulo", categoria: "Limpeza", competencia: "2026-05", valor: 28400, vencimento: "2026-05-18", pagamento: "2026-05-18", centroCusto: "Condominio", status: "pago" },
  { id: "pay-vv-seguranca", empreendimentoId: "villa-viseu", fornecedor: "Seguranca Prime", categoria: "Seguranca", competencia: "2026-05", valor: 42000, vencimento: "2026-05-25", pagamento: "", centroCusto: "Condominio", status: "aberto" },
  { id: "pay-vv-agua", empreendimentoId: "villa-viseu", fornecedor: "DMAE", categoria: "Agua", competencia: "2026-05", valor: 9600, vencimento: "2026-05-23", pagamento: "", centroCusto: "Condominio", status: "aberto" },
  { id: "pay-vv-jardinagem", empreendimentoId: "villa-viseu", fornecedor: "Verde Jardins", categoria: "Jardinagem", competencia: "2026-05", valor: 7400, vencimento: "2026-05-17", pagamento: "2026-05-17", centroCusto: "Condominio", status: "pago" },
  { id: "pay-vv-manutencao", empreendimentoId: "villa-viseu", fornecedor: "Manutencao Master", categoria: "Manutencao", competencia: "2026-05", valor: 13800, vencimento: "2026-05-27", pagamento: "", centroCusto: "Condominio", status: "aberto" },
  { id: "pay-vv-marketing", empreendimentoId: "villa-viseu", fornecedor: "Agencia Criar", categoria: "Marketing", competencia: "2026-05", valor: 18500, vencimento: "2026-05-20", pagamento: "", centroCusto: "Fundo promocao", status: "vencido" },
  { id: "pay-vv-eventos", empreendimentoId: "villa-viseu", fornecedor: "Eventos Triangulo", categoria: "Eventos", competencia: "2026-05", valor: 9600, vencimento: "2026-05-28", pagamento: "", centroCusto: "Fundo promocao", status: "aberto" },
  { id: "pay-vv-trafego", empreendimentoId: "villa-viseu", fornecedor: "Performance Ads", categoria: "Trafego pago", competencia: "2026-05", valor: 4200, vencimento: "2026-05-16", pagamento: "2026-05-16", centroCusto: "Fundo promocao", status: "pago" },
  { id: "pay-br-redes", empreendimentoId: "bluemall-rondon", fornecedor: "Social Lab", categoria: "Redes sociais", competencia: "2026-05", valor: 3800, vencimento: "2026-05-19", pagamento: "2026-05-19", centroCusto: "Fundo promocao", status: "pago" },
  { id: "pay-pn-decoracao", empreendimentoId: "piazza-nicomedes", fornecedor: "Decor Mais", categoria: "Decoracao", competencia: "2026-05", valor: 5200, vencimento: "2026-05-30", pagamento: "", centroCusto: "Fundo promocao", status: "aberto" },
  { id: "pay-br-energia", empreendimentoId: "bluemall-rondon", fornecedor: "Concessionaria energia", categoria: "Energia", competencia: "2026-05", valor: 31500, vencimento: "2026-05-22", pagamento: "2026-05-22", centroCusto: "Operacoes", status: "pago" }
];

export const delinquencyRecords: DelinquencyRecord[] = [
  {
    id: "del-rec-vv-01-condominio",
    receivableId: "rec-vv-01-condominio",
    lojaId: "vv-01",
    valor: 6800,
    diasAtraso: 21,
    historico: "Boleto reenviado e contato realizado por WhatsApp.",
    negociacao: "Promessa de pagamento em 03/06/2026.",
    responsavel: "Financeiro",
    status: "negociacao"
  },
  {
    id: "del-rec-vv-02-aluguel",
    receivableId: "rec-vv-02-aluguel",
    lojaId: "vv-02",
    valor: 31000,
    diasAtraso: 21,
    historico: "Notificacao preventiva enviada.",
    negociacao: "Aguardando retorno do responsavel legal.",
    responsavel: "Administrativo",
    status: "regua"
  },
  {
    id: "del-rec-pn-01-fundo",
    receivableId: "rec-pn-01-fundo",
    lojaId: "pn-01",
    valor: 1800,
    diasAtraso: 16,
    historico: "Primeiro lembrete enviado.",
    negociacao: "A acompanhar na proxima semana.",
    responsavel: "Financeiro",
    status: "regua"
  }
];

export const fppRecords: FppRecord[] = [
  {
    id: "fpp-vv-01-2026-05",
    lojaId: "vv-01",
    contratoId: "contract-gastro-prime",
    empreendimentoId: "villa-viseu",
    competencia: "2026-05",
    percentual: 6,
    aluguelMinimo: 25000,
    faturamentoInformado: 520000,
    faturamentoAuditado: 548000,
    status: "aberto"
  },
  {
    id: "fpp-vv-02-2026-05",
    lojaId: "vv-02",
    contratoId: "contract-clinica-vida",
    empreendimentoId: "villa-viseu",
    competencia: "2026-05",
    percentual: 4.5,
    aluguelMinimo: 31000,
    faturamentoInformado: 610000,
    faturamentoAuditado: 604000,
    status: "pago"
  },
  {
    id: "fpp-br-01-2026-05",
    lojaId: "br-01",
    contratoId: "contract-smart-fit-hub",
    empreendimentoId: "bluemall-rondon",
    competencia: "2026-05",
    percentual: 7,
    aluguelMinimo: 52000,
    faturamentoInformado: 880000,
    faturamentoAuditado: 912000,
    status: "aberto"
  }
];

export const revenueAuditRecords: RevenueAuditRecord[] = [
  {
    id: "audit-vv-01-2026-05",
    lojaId: "vv-01",
    empreendimentoId: "villa-viseu",
    competencia: "2026-05",
    relatorioErp: 548000,
    relatorioPdv: 543500,
    stone: 212000,
    rede: 148500,
    cielo: 96000,
    pix: 64500,
    ifood: 18500,
    delivery: 7600,
    faturamentoAnterior: 502000,
    status: "divergente"
  },
  {
    id: "audit-vv-02-2026-05",
    lojaId: "vv-02",
    empreendimentoId: "villa-viseu",
    competencia: "2026-05",
    relatorioErp: 604000,
    relatorioPdv: 607800,
    stone: 184000,
    rede: 171000,
    cielo: 140500,
    pix: 112000,
    ifood: 0,
    delivery: 0,
    faturamentoAnterior: 790000,
    status: "critico"
  },
  {
    id: "audit-br-01-2026-05",
    lojaId: "br-01",
    empreendimentoId: "bluemall-rondon",
    competencia: "2026-05",
    relatorioErp: 912000,
    relatorioPdv: 908000,
    stone: 315000,
    rede: 246000,
    cielo: 180000,
    pix: 127500,
    ifood: 0,
    delivery: 39500,
    faturamentoAnterior: 874000,
    status: "conciliado"
  },
  {
    id: "audit-pn-01-2026-05",
    lojaId: "pn-01",
    empreendimentoId: "piazza-nicomedes",
    competencia: "2026-05",
    relatorioErp: 98000,
    relatorioPdv: 104000,
    stone: 35500,
    rede: 28100,
    cielo: 18400,
    pix: 14200,
    ifood: 6800,
    delivery: 5200,
    faturamentoAnterior: 110000,
    status: "divergente"
  }
];

export const commercialLeads: CommercialLead[] = [
  {
    id: "lead-academia-boutique",
    lojaId: "vv-03",
    empreendimentoId: "villa-viseu",
    empresa: "Academia Boutique",
    segmento: "Fitness",
    responsavel: "Comercial",
    proximaAcao: "Enviar estudo de mix e fluxo",
    dataProximaAcao: "2026-06-04",
    historico: "Prospect mapeado para ocupar loja satelite proxima a servicos.",
    etapa: "prospeccao",
    valorProposta: 18500
  },
  {
    id: "lead-pet-center",
    lojaId: "pn-01",
    empreendimentoId: "piazza-nicomedes",
    empresa: "Pet Center Prime",
    segmento: "Servicos",
    responsavel: "Marina",
    proximaAcao: "Validar restricoes tecnicas com operacoes",
    dataProximaAcao: "2026-06-05",
    historico: "Lead indicado pela diretoria para sinergia com conveniencia.",
    etapa: "lead",
    valorProposta: 14200
  },
  {
    id: "lead-cafeteria-regional",
    lojaId: "vv-04",
    empreendimentoId: "villa-viseu",
    empresa: "Cafeteria Regional",
    segmento: "Alimentacao",
    responsavel: "Comercial",
    proximaAcao: "Visita tecnica agendada",
    dataProximaAcao: "2026-06-03",
    historico: "Operador quer vitrine para avenida e area externa.",
    etapa: "visita",
    valorProposta: 16800
  },
  {
    id: "lead-clinica-estetica",
    lojaId: "bn-01",
    empreendimentoId: "boulevard-naves",
    empresa: "Clinica de Estetica",
    segmento: "Saude",
    responsavel: "Renata",
    proximaAcao: "Revisar proposta com carencia de implantacao",
    dataProximaAcao: "2026-06-06",
    historico: "Proposta enviada com aluguel minimo e fundo reduzido nos 90 dias iniciais.",
    etapa: "proposta",
    valorProposta: 18500
  },
  {
    id: "lead-wine-bar",
    lojaId: "bc-01",
    empreendimentoId: "bluemall-centro",
    empresa: "Wine Bar",
    segmento: "Gastronomia",
    responsavel: "Comercial",
    proximaAcao: "Negociar luvas e prazo contratual",
    dataProximaAcao: "2026-06-07",
    historico: "Operador aceita condominio, negocia carencia de obra.",
    etapa: "negociacao",
    valorProposta: 22000
  },
  {
    id: "lead-mini-mercado",
    lojaId: "vv-03",
    empreendimentoId: "villa-viseu",
    empresa: "Mini Mercado",
    segmento: "Conveniencia",
    responsavel: "Juridico",
    proximaAcao: "Enviar minuta para assinatura",
    dataProximaAcao: "2026-06-02",
    historico: "Aprovado comercialmente e em elaboracao contratual.",
    etapa: "contrato",
    valorProposta: 24000
  }
];

export const vacancyRecords: VacancyRecord[] = [
  {
    id: "vac-vv-03",
    lojaId: "vv-03",
    empreendimentoId: "villa-viseu",
    inicioVacancia: "2026-02-10",
    motivo: "Loja em negociacao apos troca de mix.",
    criticidade: "estrategica",
    estrategia: "Priorizar operador de conveniencia para reforcar fluxo diario.",
    receitaPotencial: 11800,
    responsavel: "Comercial"
  },
  {
    id: "vac-vv-04",
    lojaId: "vv-04",
    empreendimentoId: "villa-viseu",
    inicioVacancia: "2026-03-18",
    motivo: "Espaco disponivel para moda ou servicos leves.",
    criticidade: "alta",
    estrategia: "Ofertar pacote com carencia curta e contrato padrao.",
    receitaPotencial: 16200,
    responsavel: "Marina"
  },
  {
    id: "vac-bn-01",
    lojaId: "bn-01",
    empreendimentoId: "boulevard-naves",
    inicioVacancia: "2026-01-05",
    motivo: "Ancora em negociacao com impacto financeiro relevante.",
    criticidade: "estrategica",
    estrategia: "Negociar operador ancora com prazo longo e ativacao de marketing.",
    receitaPotencial: 73000,
    responsavel: "Diretoria"
  },
  {
    id: "vac-bc-02",
    lojaId: "bc-01",
    empreendimentoId: "bluemall-centro",
    inicioVacancia: "2026-04-02",
    motivo: "Risco de vacancia futura em renovacao.",
    criticidade: "media",
    estrategia: "Monitorar renovacao e preparar substitutos por segmento.",
    receitaPotencial: 18400,
    responsavel: "Comercial"
  }
];

export const utilityReadings: UtilityReading[] = [
  {
    id: "ene-vv-01-2026-05",
    lojaId: "vv-01",
    empreendimentoId: "villa-viseu",
    tipo: "energia",
    competencia: "2026-05",
    consumo: 12800,
    consumoAnterior: 11800,
    valor: 14200,
    medidor: "CEMIG-VV-001",
    status: "normal"
  },
  {
    id: "ene-vv-02-2026-05",
    lojaId: "vv-02",
    empreendimentoId: "villa-viseu",
    tipo: "energia",
    competencia: "2026-05",
    consumo: 9200,
    consumoAnterior: 7100,
    valor: 10120,
    medidor: "CEMIG-VV-002",
    status: "atencao"
  },
  {
    id: "ene-br-01-2026-05",
    lojaId: "br-01",
    empreendimentoId: "bluemall-rondon",
    tipo: "energia",
    competencia: "2026-05",
    consumo: 44000,
    consumoAnterior: 40200,
    valor: 48900,
    medidor: "CEMIG-BR-001",
    status: "normal"
  },
  {
    id: "ene-pn-01-2026-05",
    lojaId: "pn-01",
    empreendimentoId: "piazza-nicomedes",
    tipo: "energia",
    competencia: "2026-05",
    consumo: 6400,
    consumoAnterior: 5400,
    valor: 7040,
    medidor: "CEMIG-PN-001",
    status: "normal"
  },
  {
    id: "agua-vv-01-2026-05",
    lojaId: "vv-01",
    empreendimentoId: "villa-viseu",
    tipo: "agua",
    competencia: "2026-05",
    consumo: 420,
    consumoAnterior: 390,
    valor: 3600,
    medidor: "DMAE-VV-001",
    status: "normal"
  },
  {
    id: "agua-vv-02-2026-05",
    lojaId: "vv-02",
    empreendimentoId: "villa-viseu",
    tipo: "agua",
    competencia: "2026-05",
    consumo: 610,
    consumoAnterior: 340,
    valor: 5200,
    medidor: "DMAE-VV-002",
    status: "critico"
  },
  {
    id: "agua-pn-01-2026-05",
    lojaId: "pn-01",
    empreendimentoId: "piazza-nicomedes",
    tipo: "agua",
    competencia: "2026-05",
    consumo: 220,
    consumoAnterior: 210,
    valor: 1850,
    medidor: "DMAE-PN-001",
    status: "normal"
  },
  {
    id: "agua-bc-01-2026-05",
    lojaId: "bc-01",
    empreendimentoId: "bluemall-centro",
    tipo: "agua",
    competencia: "2026-05",
    consumo: 280,
    consumoAnterior: 230,
    valor: 2420,
    medidor: "DMAE-BC-001",
    status: "atencao"
  }
];

export const serviceOrders: ServiceOrder[] = [
  {
    id: "os-1024",
    empreendimentoId: "villa-viseu",
    lojaId: "vv-02",
    local: "Sala tecnica da Clinica Vida",
    categoria: "ar_condicionado",
    prioridade: "alta",
    status: "aberta",
    responsavel: "Operacoes",
    prazo: "2026-06-03",
    custoPrevisto: 3200,
    custoRealizado: 0,
    fotosAntes: "drive://nexa/os-1024/antes",
    fotosDepois: "",
    descricao: "Ajuste preventivo em evaporadora com ruido acima do padrao."
  },
  {
    id: "os-1025",
    empreendimentoId: "villa-viseu",
    lojaId: "",
    local: "Area comum - bloco central",
    categoria: "hidraulica",
    prioridade: "critica",
    status: "em_execucao",
    responsavel: "Manutencao",
    prazo: "2026-06-01",
    custoPrevisto: 5800,
    custoRealizado: 2100,
    fotosAntes: "drive://nexa/os-1025/antes",
    fotosDepois: "",
    descricao: "Vazamento em prumada com risco de impacto em lojas vizinhas."
  },
  {
    id: "os-1026",
    empreendimentoId: "piazza-nicomedes",
    lojaId: "pn-01",
    local: "PN-01 - Cafe Jardim",
    categoria: "civil",
    prioridade: "media",
    status: "aguardando_terceiro",
    responsavel: "Engenharia",
    prazo: "2026-06-09",
    custoPrevisto: 7400,
    custoRealizado: 0,
    fotosAntes: "drive://nexa/os-1026/antes",
    fotosDepois: "",
    descricao: "Regularizacao de acabamento em fachada antes da vistoria final."
  },
  {
    id: "os-1027",
    empreendimentoId: "bluemall-rondon",
    lojaId: "br-01",
    local: "BR-01 - Smart Fit Hub",
    categoria: "eletrica",
    prioridade: "media",
    status: "aberta",
    responsavel: "Eletrica",
    prazo: "2026-06-05",
    custoPrevisto: 1900,
    custoRealizado: 0,
    fotosAntes: "drive://nexa/os-1027/antes",
    fotosDepois: "",
    descricao: "Inspecao em quadro dedicado apos oscilacao informada pelo lojista."
  },
  {
    id: "os-1028",
    empreendimentoId: "bluemall-centro",
    lojaId: "bc-01",
    local: "BC-01 - Odonto Mais",
    categoria: "comunicacao_visual",
    prioridade: "baixa",
    status: "concluida",
    responsavel: "Marketing",
    prazo: "2026-05-29",
    custoPrevisto: 1200,
    custoRealizado: 1080,
    fotosAntes: "drive://nexa/os-1028/antes",
    fotosDepois: "drive://nexa/os-1028/depois",
    descricao: "Substituicao de adesivo de vitrine e padronizacao de fachada."
  }
];

export const documentRecords: DocumentRecord[] = [
  {
    id: "doc-vv-01-contrato",
    lojaId: "vv-01",
    empreendimentoId: "villa-viseu",
    categoria: "contratos",
    titulo: "Contrato de locacao - Gastro Prime",
    status: "vigente",
    vencimento: "2026-11-30",
    pastaDriveUrl: "drive://nexa/documentos/villa-viseu/vv-01/contratos",
    arquivoUrl: "drive://nexa/documentos/villa-viseu/vv-01/contratos/contrato.pdf",
    responsavel: "Juridico",
    observacoes: "Contrato principal assinado e validado."
  },
  {
    id: "doc-vv-01-seguro",
    lojaId: "vv-01",
    empreendimentoId: "villa-viseu",
    categoria: "seguros",
    titulo: "Seguro empresarial - Gastro Prime",
    status: "vencendo",
    vencimento: "2026-07-15",
    pastaDriveUrl: "drive://nexa/documentos/villa-viseu/vv-01/seguros",
    arquivoUrl: "drive://nexa/documentos/villa-viseu/vv-01/seguros/apolice.pdf",
    responsavel: "Administrativo",
    observacoes: "Solicitar renovacao com 30 dias de antecedencia."
  },
  {
    id: "doc-vv-02-avcb",
    lojaId: "vv-02",
    empreendimentoId: "villa-viseu",
    categoria: "avcb",
    titulo: "AVCB loja Clinica Vida",
    status: "vigente",
    vencimento: "2027-03-20",
    pastaDriveUrl: "drive://nexa/documentos/villa-viseu/vv-02/avcb",
    arquivoUrl: "drive://nexa/documentos/villa-viseu/vv-02/avcb/avcb.pdf",
    responsavel: "Operacoes",
    observacoes: "Documento conferido na ultima vistoria."
  },
  {
    id: "doc-vv-03-projeto",
    lojaId: "vv-03",
    empreendimentoId: "villa-viseu",
    categoria: "projetos",
    titulo: "Projeto preliminar de implantacao",
    status: "pendente",
    vencimento: "",
    pastaDriveUrl: "drive://nexa/documentos/villa-viseu/vv-03/projetos",
    arquivoUrl: "",
    responsavel: "Comercial",
    observacoes: "Aguardando operador definir layout final."
  },
  {
    id: "doc-pn-01-alvara",
    lojaId: "pn-01",
    empreendimentoId: "piazza-nicomedes",
    categoria: "alvaras",
    titulo: "Alvara de funcionamento - Cafe Jardim",
    status: "vencendo",
    vencimento: "2026-08-10",
    pastaDriveUrl: "drive://nexa/documentos/piazza-nicomedes/pn-01/alvaras",
    arquivoUrl: "drive://nexa/documentos/piazza-nicomedes/pn-01/alvaras/alvara.pdf",
    responsavel: "Administrativo",
    observacoes: "Renovacao prevista para o inicio da operacao."
  },
  {
    id: "doc-br-01-vistoria",
    lojaId: "br-01",
    empreendimentoId: "bluemall-rondon",
    categoria: "vistorias",
    titulo: "Relatorio de vistoria anual",
    status: "vigente",
    vencimento: "2027-01-15",
    pastaDriveUrl: "drive://nexa/documentos/bluemall-rondon/br-01/vistorias",
    arquivoUrl: "drive://nexa/documentos/bluemall-rondon/br-01/vistorias/relatorio.pdf",
    responsavel: "Operacoes",
    observacoes: "Sem pendencias estruturais."
  },
  {
    id: "doc-bc-01-fotos",
    lojaId: "bc-01",
    empreendimentoId: "bluemall-centro",
    categoria: "fotos",
    titulo: "Fotos de fachada e loja",
    status: "vigente",
    vencimento: "",
    pastaDriveUrl: "drive://nexa/documentos/bluemall-centro/bc-01/fotos",
    arquivoUrl: "drive://nexa/documentos/bluemall-centro/bc-01/fotos/fachada",
    responsavel: "Marketing",
    observacoes: "Acervo atualizado apos troca de comunicacao visual."
  }
];

export const legalCases: LegalCase[] = [
  {
    id: "legal-vv-01-renovacao",
    lojaId: "vv-01",
    empreendimentoId: "villa-viseu",
    contratoId: "contract-gastro-prime",
    tipo: "renovacao",
    titulo: "Renovacao contratual Gastro Prime",
    parteContraria: "Gastro Prime Alimentacao Ltda",
    valorCausa: 0,
    prazo: "2026-08-30",
    status: "em_andamento",
    risco: "medio",
    responsavel: "Juridico",
    historico: "Contrato vence em 2026-11-30 e requer alinhamento de garantia e novo indice.",
    proximaAcao: "Preparar minuta de renovacao com Comercial."
  },
  {
    id: "legal-vv-02-notificacao",
    lojaId: "vv-02",
    empreendimentoId: "villa-viseu",
    contratoId: "contract-clinica-vida",
    tipo: "notificacao",
    titulo: "Notificacao por atraso de aluguel",
    parteContraria: "Clinica Vida Integrada Ltda",
    valorCausa: 31000,
    prazo: "2026-06-07",
    status: "critico",
    risco: "alto",
    responsavel: "Financeiro/Juridico",
    historico: "Receita de aluguel vencida, contato administrativo sem retorno conclusivo.",
    proximaAcao: "Enviar notificacao extrajudicial e registrar comprovante."
  },
  {
    id: "legal-br-01-acao",
    lojaId: "br-01",
    empreendimentoId: "bluemall-rondon",
    contratoId: "contract-smart-fit-hub",
    tipo: "acao_judicial",
    titulo: "Acao revisional em acompanhamento",
    parteContraria: "Hub Fitness Rondonopolis Ltda",
    valorCausa: 125000,
    prazo: "2026-06-20",
    status: "aguardando",
    risco: "alto",
    responsavel: "Escritorio parceiro",
    historico: "Processo em fase de manifestacao sobre documentos apresentados.",
    proximaAcao: "Revisar manifestacao e atualizar diretoria."
  },
  {
    id: "legal-pn-01-garantia",
    lojaId: "pn-01",
    empreendimentoId: "piazza-nicomedes",
    contratoId: "",
    tipo: "garantia",
    titulo: "Garantia pendente para implantacao",
    parteContraria: "Cafe Jardim Nicomedes Ltda",
    valorCausa: 19000,
    prazo: "2026-06-12",
    status: "aberto",
    risco: "medio",
    responsavel: "Administrativo",
    historico: "Operador em implantacao ainda nao apresentou garantia final.",
    proximaAcao: "Cobrar comprovante de caucao antes da liberacao final."
  },
  {
    id: "legal-vv-03-minuta",
    lojaId: "vv-03",
    empreendimentoId: "villa-viseu",
    contratoId: "",
    tipo: "contrato",
    titulo: "Minuta para nova operacao",
    parteContraria: "Mini Mercado",
    valorCausa: 24000,
    prazo: "2026-06-05",
    status: "em_andamento",
    risco: "baixo",
    responsavel: "Juridico",
    historico: "Oportunidade aprovada comercialmente e enviada para minuta.",
    proximaAcao: "Concluir minuta e enviar para assinatura."
  },
  {
    id: "legal-bc-01-pendencia",
    lojaId: "bc-01",
    empreendimentoId: "bluemall-centro",
    contratoId: "",
    tipo: "pendencia",
    titulo: "Regularizacao de seguro complementar",
    parteContraria: "Odonto Mais",
    valorCausa: 0,
    prazo: "2026-07-01",
    status: "aberto",
    risco: "baixo",
    responsavel: "Administrativo",
    historico: "Pendencia documental identificada no checklist mensal.",
    proximaAcao: "Solicitar apolice complementar atualizada."
  }
];

export const landBankAreas: LandBankArea[] = [
  {
    id: "land-rondon-pacheco",
    empreendimentoId: "boulevard-naves",
    codigo: "UDI-RP-001",
    nome: "Terreno Rondon Pacheco",
    cidade: "Uberlandia",
    estado: "MG",
    bairro: "Tibery",
    enderecoCompleto: "Av. Rondon Pacheco, Uberlandia/MG",
    latitude: -18.91264,
    longitude: -48.25794,
    areaTotalM2: 4200,
    frenteM: 68,
    zoneamento: "Eixo comercial",
    status: "disponivel",
    valorPedido: 5800000,
    valorM2: 1381,
    valorPotencial: 92000,
    viavelBts: true,
    viavelStripMall: true,
    viavelSaleLeaseback: false,
    prioridade: "alta",
    etapa: "estudo",
    origem: "Prospeccao ativa",
    responsavel: "Desenvolvimento",
    proximaAcao: "Validar zoneamento e premissas de acesso",
    dataProximaAcao: "2026-06-18",
    score: 86,
    classificacao: "excelente",
    observacoes: "Frente estrategica em corredor de fluxo, com vocacao para strip mall e BTS."
  },
  {
    id: "land-nicomedes-bts",
    empreendimentoId: "piazza-nicomedes",
    codigo: "UDI-NIC-002",
    nome: "Area Nicomedes BTS Saude",
    cidade: "Uberlandia",
    estado: "MG",
    bairro: "Morada da Colina",
    enderecoCompleto: "Av. Nicomedes Alves dos Santos, Uberlandia/MG",
    latitude: -18.94482,
    longitude: -48.29112,
    areaTotalM2: 2600,
    frenteM: 42,
    zoneamento: "Uso misto",
    status: "em_negociacao",
    valorPedido: 3900000,
    valorM2: 1500,
    valorPotencial: 64000,
    viavelBts: true,
    viavelStripMall: false,
    viavelSaleLeaseback: false,
    prioridade: "media",
    etapa: "negociacao",
    origem: "Corretor parceiro",
    responsavel: "Comercial",
    proximaAcao: "Solicitar matricula e confirmar disponibilidade",
    dataProximaAcao: "2026-06-20",
    score: 74,
    classificacao: "boa",
    observacoes: "Boa aderencia para clinicas, servicos de saude e operadores de conveniencia."
  },
  {
    id: "land-rondonopolis-ancora",
    empreendimentoId: "bluemall-rondon",
    codigo: "ROO-ANC-003",
    nome: "Area expansao ancora Rondonopolis",
    cidade: "Rondonopolis",
    estado: "MT",
    bairro: "Vila Aurora",
    enderecoCompleto: "Regiao central de Rondonopolis/MT",
    latitude: -16.46932,
    longitude: -54.63711,
    areaTotalM2: 6100,
    frenteM: 80,
    zoneamento: "Comercial",
    status: "disponivel",
    valorPedido: 7200000,
    valorM2: 1180,
    valorPotencial: 115000,
    viavelBts: true,
    viavelStripMall: true,
    viavelSaleLeaseback: true,
    prioridade: "alta",
    etapa: "visita",
    origem: "Indicacao",
    responsavel: "Diretoria Nexa",
    proximaAcao: "Agendar visita tecnica e mapear concorrencia",
    dataProximaAcao: "2026-06-24",
    score: 81,
    classificacao: "boa",
    observacoes: "Area com potencial para expansao regional e composicao com operador ancora."
  }
];

export const contractAlerts: ContractAlert[] = [
  { id: "ct-01", empreendimentoId: "villa-viseu", loja: "VV-01", lojista: "Gastro Prime", meses: 6, vencimento: "2026-11-30", risco: "medio" },
  { id: "ct-02", empreendimentoId: "villa-viseu", loja: "VV-02", lojista: "Clinica Vida", meses: 12, vencimento: "2027-05-28", risco: "baixo" },
  { id: "ct-03", empreendimentoId: "bluemall-rondon", loja: "BR-01", lojista: "Smart Fit Hub", meses: 3, vencimento: "2026-08-29", risco: "alto" },
  { id: "ct-04", empreendimentoId: "bluemall-centro", loja: "BC-01", lojista: "Odonto Mais", meses: 24, vencimento: "2028-05-30", risco: "baixo" }
];
