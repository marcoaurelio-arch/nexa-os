# Nexa OS - Estrutura dos databases do Notion

## 1. Estrategia

O Notion sera usado como camada de acompanhamento, reuniao, cobranca de responsaveis e leitura executiva. O PostgreSQL/Supabase continua sendo a fonte oficial dos dados.

Padrao de propriedades em todas as bases:

- `ID Nexa`: texto, UUID da entidade no PostgreSQL.
- `Empreendimento`: relation com Empreendimentos, quando aplicavel.
- `Status`: select.
- `Responsavel`: person ou relation com base de usuarios, conforme configuracao.
- `Ultima sincronizacao`: date.
- `URL Nexa OS`: url para abrir o registro no sistema.

## 2. Databases

### 1. Empreendimentos

Propriedades:

- Nome: title.
- Cidade: rich_text.
- Estado: select.
- Status: select.
- ABL: number.
- Numero de lojas: number.
- Responsavel: person.
- Lojas: relation com Lojas.
- Indicadores: relation com Indicadores.
- Relatorios: relation com Relatorios.

### 2. Lojas

Propriedades:

- Codigo: title.
- Empreendimento: relation com Empreendimentos.
- Nome da loja: rich_text.
- Area privativa: number.
- Area total: number.
- Segmento: select.
- Status: select.
- Loja ancora: checkbox.
- Loja satelite: checkbox.
- Aluguel: number.
- Condominio: number.
- Fundo promocao: number.
- Lojista: relation com Lojistas.
- Contratos: relation com Contratos.
- Documentos: relation com Documentos.
- OS: relation com OS.

### 3. Lojistas

Propriedades:

- Nome fantasia: title.
- Razao social: rich_text.
- CNPJ: rich_text.
- Responsavel legal: rich_text.
- WhatsApp: phone_number.
- E-mail: email.
- Segmento: select.
- Loja vinculada: relation com Lojas.
- Contratos: relation com Contratos.
- Status: select.

### 4. Contratos

Propriedades:

- Contrato: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Lojista: relation com Lojistas.
- Data inicio: date.
- Data termino: date.
- Prazo: number.
- Aluguel minimo: number.
- Indice reajuste: select.
- Garantia: select.
- Seguro: select.
- Status: select.
- Documentos: relation com Documentos.
- Juridico: relation com Juridico.
- Alerta 24m: date.
- Alerta 12m: date.
- Alerta 6m: date.
- Alerta 3m: date.

### 5. Receitas

Propriedades:

- Receita: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Contrato: relation com Contratos.
- Competencia: date.
- Tipo receita: select.
- Valor: number.
- Vencimento: date.
- Recebimento: date.
- Status: select.
- Inadimplencia: relation com Inadimplencia.

### 6. Despesas

Propriedades:

- Despesa: title.
- Empreendimento: relation com Empreendimentos.
- Fornecedor: rich_text.
- Categoria: select.
- Competencia: date.
- Valor: number.
- Vencimento: date.
- Pagamento: date.
- Centro de custo: select.
- Status: select.

### 7. Inadimplencia

Propriedades:

- Caso: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Receita: relation com Receitas.
- Valor: number.
- Dias atraso: number.
- Regua: select.
- Historico: rich_text.
- Negociacao: rich_text.
- Responsavel: person.
- Status: select.

### 8. Condominio

Propriedades:

- Lancamento: title.
- Empreendimento: relation com Empreendimentos.
- Tipo: select.
- Categoria: select.
- Competencia: date.
- Valor: number.
- Status: select.

### 9. Fundo Promocao

Propriedades:

- Lancamento: title.
- Empreendimento: relation com Empreendimentos.
- Tipo: select.
- Categoria: select.
- Competencia: date.
- Valor: number.
- Status: select.
- Marketing: relation com Marketing.

### 10. FPP

Propriedades:

- Apuracao: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Contrato: relation com Contratos.
- Competencia: date.
- Percentual: number.
- Aluguel minimo: number.
- Faturamento informado: number.
- Faturamento auditado: number.
- Valor percentual: number.
- Valor complementar: number.
- Valor cobrado: number.

### 11. Auditoria Faturamento

Propriedades:

- Auditoria: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Competencia: date.
- ERP: number.
- PDV: number.
- Stone: number.
- Rede: number.
- Cielo: number.
- PIX: number.
- iFood: number.
- Delivery: number.
- Divergencia: number.
- Queda: number.
- Alerta: select.

### 12. Leads

Propriedades:

- Empresa: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Segmento: select.
- Responsavel: person.
- Etapa: select.
- Proxima acao: rich_text.
- Propostas: relation com Propostas.
- Historico: rich_text.

### 13. Propostas

Propriedades:

- Proposta: title.
- Empreendimento: relation com Empreendimentos.
- Lead: relation com Leads.
- Loja: relation com Lojas.
- Aluguel: number.
- Condominio: number.
- Fundo promocao: number.
- Data envio: date.
- Validade: date.
- Status: select.

### 14. Vacancia

Propriedades:

- Registro: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Inicio vacancia: date.
- Dias vaga: number.
- Receita perdida: number.
- Criticidade: select.
- Estrategica: checkbox.
- Observacoes: rich_text.

### 15. Ocupacao

Propriedades:

- Snapshot: title.
- Empreendimento: relation com Empreendimentos.
- Competencia: date.
- Total lojas: number.
- Lojas ocupadas: number.
- Lojas vagas: number.
- ABL total: number.
- ABL ocupada: number.
- Taxa ocupacao: number.
- Taxa vacancia: number.

### 16. Energia

Propriedades:

- Medicao: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Competencia: date.
- Consumo: number.
- Valor: number.
- Variacao: number.
- Alerta: select.

### 17. Agua

Propriedades:

- Medicao: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Competencia: date.
- Consumo: number.
- Valor: number.
- Variacao: number.
- Alerta: select.

### 18. OS

Propriedades:

- Ordem: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Categoria: select.
- Prioridade: select.
- Status: select.
- Responsavel: person.
- Prazo: date.
- Custo previsto: number.
- Custo realizado: number.
- Documentos: relation com Documentos.

### 19. Juridico

Propriedades:

- Caso: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Lojista: relation com Lojistas.
- Contrato: relation com Contratos.
- Tipo: select.
- Status: select.
- Responsavel: person.
- Prazo: date.
- Pendencias: rich_text.

### 20. Documentos

Propriedades:

- Documento: title.
- Empreendimento: relation com Empreendimentos.
- Loja: relation com Lojas.
- Lojista: relation com Lojistas.
- Contrato: relation com Contratos.
- OS: relation com OS.
- Categoria: select.
- Arquivo: files.
- Google Drive URL: url.
- Validade: date.
- Status: select.

### 21. Marketing

Propriedades:

- Acao: title.
- Empreendimento: relation com Empreendimentos.
- Categoria: select.
- Data inicio: date.
- Data fim: date.
- Orcamento: number.
- Realizado: number.
- Fundo promocao: relation com Fundo Promocao.
- Status: select.

### 22. Relatorios

Propriedades:

- Relatorio: title.
- Empreendimento: relation com Empreendimentos.
- Competencia: date.
- PDF: files.
- Status: select.
- Recomendacoes: rich_text.
- Indicadores: relation com Indicadores.

### 23. Indicadores

Propriedades:

- Indicador: title.
- Empreendimento: relation com Empreendimentos.
- Competencia: date.
- Categoria: select.
- Valor: number.
- Unidade: select.
- Relatorio: relation com Relatorios.

## 3. Ordem de criacao recomendada

1. Empreendimentos.
2. Lojas.
3. Lojistas.
4. Contratos.
5. Receitas.
6. Despesas.
7. Inadimplencia.
8. Documentos.
9. OS.
10. Demais bases analiticas e de apoio.

Essa ordem reduz retrabalho porque as relacoes principais ja existem quando as bases dependentes forem criadas.
