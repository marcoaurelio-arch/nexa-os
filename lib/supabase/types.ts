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
      receitas: {
        Row: {
          id: string;
          loja_id: string;
          empreendimento_id: string;
          competencia: string;
          receita: string;
          valor: number;
          vencimento: string;
          recebimento: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          empreendimento_id: string;
          competencia: string;
          receita: string;
          valor?: number;
          vencimento: string;
          recebimento?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["receitas"]["Insert"]>;
      };
      despesas: {
        Row: {
          id: string;
          empreendimento_id: string;
          fornecedor: string;
          categoria: string;
          competencia: string;
          valor: number;
          vencimento: string;
          pagamento: string | null;
          centro_custo: string;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          fornecedor: string;
          categoria: string;
          competencia: string;
          valor?: number;
          vencimento: string;
          pagamento?: string | null;
          centro_custo: string;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["despesas"]["Insert"]>;
      };
      inadimplencias: {
        Row: {
          id: string;
          receita_id: string | null;
          loja_id: string;
          valor: number;
          dias_atraso: number;
          historico: string | null;
          negociacao: string | null;
          responsavel: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          receita_id?: string | null;
          loja_id: string;
          valor?: number;
          dias_atraso?: number;
          historico?: string | null;
          negociacao?: string | null;
          responsavel?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["inadimplencias"]["Insert"]>;
      };
      fpp: {
        Row: {
          id: string;
          loja_id: string;
          contrato_id: string | null;
          empreendimento_id: string;
          competencia: string;
          percentual: number;
          aluguel_minimo: number;
          faturamento_informado: number;
          faturamento_auditado: number;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          contrato_id?: string | null;
          empreendimento_id: string;
          competencia: string;
          percentual?: number;
          aluguel_minimo?: number;
          faturamento_informado?: number;
          faturamento_auditado?: number;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fpp"]["Insert"]>;
      };
      auditoria_faturamento: {
        Row: {
          id: string;
          loja_id: string;
          empreendimento_id: string;
          competencia: string;
          relatorio_erp: number;
          relatorio_pdv: number;
          stone: number;
          rede: number;
          cielo: number;
          pix: number;
          ifood: number;
          delivery: number;
          faturamento_anterior: number;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          empreendimento_id: string;
          competencia: string;
          relatorio_erp?: number;
          relatorio_pdv?: number;
          stone?: number;
          rede?: number;
          cielo?: number;
          pix?: number;
          ifood?: number;
          delivery?: number;
          faturamento_anterior?: number;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["auditoria_faturamento"]["Insert"]>;
      };
      comercial_leads: {
        Row: {
          id: string;
          loja_id: string | null;
          empreendimento_id: string;
          empresa: string;
          segmento: string | null;
          responsavel: string | null;
          proxima_acao: string | null;
          data_proxima_acao: string | null;
          historico: string | null;
          etapa: string;
          valor_proposta: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id?: string | null;
          empreendimento_id: string;
          empresa: string;
          segmento?: string | null;
          responsavel?: string | null;
          proxima_acao?: string | null;
          data_proxima_acao?: string | null;
          historico?: string | null;
          etapa?: string;
          valor_proposta?: number;
        };
        Update: Partial<Database["public"]["Tables"]["comercial_leads"]["Insert"]>;
      };
      vacancia: {
        Row: {
          id: string;
          loja_id: string;
          empreendimento_id: string;
          inicio_vacancia: string;
          motivo: string | null;
          criticidade: string;
          estrategia: string | null;
          receita_potencial: number;
          responsavel: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          empreendimento_id: string;
          inicio_vacancia: string;
          motivo?: string | null;
          criticidade?: string;
          estrategia?: string | null;
          receita_potencial?: number;
          responsavel?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vacancia"]["Insert"]>;
      };
      consumos: {
        Row: {
          id: string;
          loja_id: string;
          empreendimento_id: string;
          tipo: string;
          competencia: string;
          consumo: number;
          consumo_anterior: number;
          valor: number;
          medidor: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          empreendimento_id: string;
          tipo: string;
          competencia: string;
          consumo?: number;
          consumo_anterior?: number;
          valor?: number;
          medidor?: string | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["consumos"]["Insert"]>;
      };
      ordens_servico: {
        Row: {
          id: string;
          empreendimento_id: string;
          loja_id: string | null;
          local: string;
          categoria: string;
          prioridade: string;
          status: string;
          responsavel: string | null;
          prazo: string;
          custo_previsto: number;
          custo_realizado: number;
          fotos_antes: string | null;
          fotos_depois: string | null;
          descricao: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          empreendimento_id: string;
          loja_id?: string | null;
          local: string;
          categoria: string;
          prioridade?: string;
          status?: string;
          responsavel?: string | null;
          prazo: string;
          custo_previsto?: number;
          custo_realizado?: number;
          fotos_antes?: string | null;
          fotos_depois?: string | null;
          descricao?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["ordens_servico"]["Insert"]>;
      };
      documentos: {
        Row: {
          id: string;
          loja_id: string;
          empreendimento_id: string;
          categoria: string;
          titulo: string;
          status: string;
          vencimento: string | null;
          pasta_drive_url: string | null;
          arquivo_url: string | null;
          responsavel: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          empreendimento_id: string;
          categoria: string;
          titulo: string;
          status?: string;
          vencimento?: string | null;
          pasta_drive_url?: string | null;
          arquivo_url?: string | null;
          responsavel?: string | null;
          observacoes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["documentos"]["Insert"]>;
      };
      juridico: {
        Row: {
          id: string;
          loja_id: string;
          empreendimento_id: string;
          contrato_id: string | null;
          tipo: string;
          titulo: string;
          parte_contraria: string | null;
          valor_causa: number;
          prazo: string;
          status: string;
          risco: string;
          responsavel: string | null;
          historico: string | null;
          proxima_acao: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          loja_id: string;
          empreendimento_id: string;
          contrato_id?: string | null;
          tipo: string;
          titulo: string;
          parte_contraria?: string | null;
          valor_causa?: number;
          prazo: string;
          status?: string;
          risco?: string;
          responsavel?: string | null;
          historico?: string | null;
          proxima_acao?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["juridico"]["Insert"]>;
      };
      perfis_acesso: {
        Row: {
          id: string;
          nome: string;
          descricao: string;
          ativo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          descricao: string;
          ativo?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["perfis_acesso"]["Insert"]>;
      };
      perfil_modulos: {
        Row: {
          perfil_id: string;
          modulo: string;
          pode_visualizar: boolean;
          pode_editar: boolean;
          created_at: string;
        };
        Insert: {
          perfil_id: string;
          modulo: string;
          pode_visualizar?: boolean;
          pode_editar?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["perfil_modulos"]["Insert"]>;
      };
      relatorios_mensais: {
        Row: {
          id: string;
          empreendimento_id: string | null;
          competencia: string;
          titulo: string;
          status: string;
          resumo: string | null;
          secoes: Json;
          recomendacoes: Json;
          indicadores: Json;
          pdf_url: string | null;
          notion_page_id: string | null;
          gerado_por: string | null;
          gerado_em: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          empreendimento_id?: string | null;
          competencia: string;
          titulo: string;
          status?: string;
          resumo?: string | null;
          secoes?: Json;
          recomendacoes?: Json;
          indicadores?: Json;
          pdf_url?: string | null;
          notion_page_id?: string | null;
          gerado_por?: string | null;
          gerado_em?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["relatorios_mensais"]["Insert"]>;
      };
      indicadores: {
        Row: {
          id: string;
          empreendimento_id: string | null;
          relatorio_id: string | null;
          competencia: string;
          categoria: string;
          indicador: string;
          valor: number;
          unidade: string;
          origem: string;
          meta: number | null;
          variacao: number | null;
          status: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          empreendimento_id?: string | null;
          relatorio_id?: string | null;
          competencia: string;
          categoria: string;
          indicador: string;
          valor?: number;
          unidade?: string;
          origem?: string;
          meta?: number | null;
          variacao?: number | null;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["indicadores"]["Insert"]>;
      };
      notion_databases: {
        Row: {
          id: string;
          nome: string;
          slug: string;
          notion_database_id: string | null;
          notion_data_source_id: string | null;
          notion_url: string | null;
          status: string;
          schema: Json;
          relacoes: Json;
          ultima_sincronizacao: string | null;
          erro: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          slug: string;
          notion_database_id?: string | null;
          notion_data_source_id?: string | null;
          notion_url?: string | null;
          status?: string;
          schema?: Json;
          relacoes?: Json;
          ultima_sincronizacao?: string | null;
          erro?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notion_databases"]["Insert"]>;
      };
      notion_sync_jobs: {
        Row: {
          id: string;
          database_id: string | null;
          entidade: string;
          entidade_id: string | null;
          direcao: string;
          status: string;
          payload: Json;
          erro: string | null;
          iniciado_em: string | null;
          finalizado_em: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          database_id?: string | null;
          entidade: string;
          entidade_id?: string | null;
          direcao?: string;
          status?: string;
          payload?: Json;
          erro?: string | null;
          iniciado_em?: string | null;
          finalizado_em?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["notion_sync_jobs"]["Insert"]>;
      };
    };
  };
};
