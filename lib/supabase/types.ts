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
    };
  };
};
