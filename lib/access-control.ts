export type AccessProfileId =
  | "diretoria"
  | "administrativo"
  | "financeiro"
  | "comercial"
  | "operacoes"
  | "marketing"
  | "juridico";

export type AccessProfile = {
  id: AccessProfileId;
  label: string;
  description: string;
  modules: string[];
};

export const accessProfiles: AccessProfile[] = [
  {
    id: "diretoria",
    label: "Diretoria",
    description: "Visao completa da carteira, indicadores, governanca e configuracoes.",
    modules: [
      "Dashboard",
      "BI",
      "Empreendimentos",
      "Lojas",
      "Lojistas",
      "Contratos",
      "Financeiro",
      "Inadimplencia",
      "Condominio",
      "Fundo",
      "FPP",
      "Auditoria",
      "Comercial",
      "Banco de Areas",
      "Vacancia",
      "Operacoes",
      "Energia e Agua",
      "Documentos",
      "Juridico",
      "Relatorios",
      "Configuracoes"
    ]
  },
  {
    id: "administrativo",
    label: "Administrativo",
    description: "Cadastro, documentos, contratos operacionais e fechamento gerencial.",
    modules: ["Dashboard", "BI", "Empreendimentos", "Lojas", "Lojistas", "Contratos", "Condominio", "Banco de Areas", "Documentos", "Relatorios", "Configuracoes"]
  },
  {
    id: "financeiro",
    label: "Financeiro",
    description: "Recebiveis, despesas, inadimplencia, FPP, auditoria e relatorios.",
    modules: ["Dashboard", "BI", "Financeiro", "Inadimplencia", "Condominio", "Fundo", "FPP", "Auditoria", "Relatorios"]
  },
  {
    id: "comercial",
    label: "Comercial",
    description: "Lojas, lojistas, contratos comerciais, pipeline e vacancia.",
    modules: ["Dashboard", "BI", "Lojas", "Lojistas", "Contratos", "Comercial", "Banco de Areas", "Vacancia", "Relatorios"]
  },
  {
    id: "operacoes",
    label: "Operacoes",
    description: "Ordens de servico, consumo, documentos tecnicos e indicadores operacionais.",
    modules: ["Dashboard", "BI", "Operacoes", "Energia e Agua", "Documentos", "Relatorios"]
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Fundo de promocao, auditoria de campanhas, BI e reportes mensais.",
    modules: ["Dashboard", "BI", "Fundo", "Auditoria", "Comercial", "Relatorios"]
  },
  {
    id: "juridico",
    label: "Juridico",
    description: "Contratos, notificacoes, garantias, documentos e relatorios executivos.",
    modules: ["Dashboard", "BI", "Contratos", "Inadimplencia", "Documentos", "Juridico", "Relatorios"]
  }
];

export function modulesForProfile(profileId: AccessProfileId) {
  return accessProfiles.find((profile) => profile.id === profileId)?.modules ?? accessProfiles[0].modules;
}
