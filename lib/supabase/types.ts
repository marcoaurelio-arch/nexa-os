export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      empreendimentos: {
        Row: {
          id: string;
          nome: string;
          cidade: string;
          estado: string;
          status: string;
          abl_m2: number;
          numero_lojas: number;
          numero_vagas: number | null;
          responsavel_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          nome: string;
          cidade: string;
          estado: string;
          status?: string;
          abl_m2?: number;
          numero_lojas?: number;
          numero_vagas?: number | null;
          responsavel_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["empreendimentos"]["Insert"]>;
      };
      lojas: {
        Row: {
          id: string;
          empreendimento_id: string;
          codigo: string;
          nome: string | null;
          area_total_m2: number;
          segmento: string | null;
          status: string;
          valor_aluguel: number;
          valor_condominio: number;
          valor_fundo_promocao: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          codigo: string;
          nome?: string | null;
          area_total_m2?: number;
          segmento?: string | null;
          status?: string;
          valor_aluguel?: number;
          valor_condominio?: number;
          valor_fundo_promocao?: number;
        };
        Update: Partial<Database["public"]["Tables"]["lojas"]["Insert"]>;
      };
      lojistas: {
        Row: {
          id: string;
          nome_fantasia: string;
          razao_social: string;
          cnpj: string;
          responsavel_legal: string | null;
          telefone: string | null;
          whatsapp: string | null;
          email: string | null;
          endereco: string | null;
          segmento: string | null;
          loja_id: string | null;
          data_entrada: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          nome_fantasia: string;
          razao_social: string;
          cnpj: string;
          responsavel_legal?: string | null;
          telefone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          endereco?: string | null;
          segmento?: string | null;
          loja_id?: string | null;
          data_entrada?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lojistas"]["Insert"]>;
      };
      contratos: {
        Row: {
          id: string;
          loja_id: string;
          lojista_id: string;
          data_inicio: string;
          data_termino: string;
          prazo_meses: number;
          aluguel_minimo: number;
          indice_reajuste: string | null;
          garantia: string | null;
          seguro: string | null;
          contrato_url: string | null;
          aditivos: number;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          lojista_id: string;
          data_inicio: string;
          data_termino: string;
          prazo_meses?: number;
          aluguel_minimo?: number;
          indice_reajuste?: string | null;
          garantia?: string | null;
          seguro?: string | null;
          contrato_url?: string | null;
          aditivos?: number;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contratos"]["Insert"]>;
      };
    };
  };
};
