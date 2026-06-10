# Especificacao Dashboard Executivo - Vercel

## 1. Resumo Executivo

O dashboard executivo do NEXA OS deve ser um painel simples, rapido e seguro para Marco Aurelio acompanhar ativos, pipeline, comercial, tarefas e riscos.

Primeira versao: MVP de leitura, sem edicao de dados sensiveis.

## 2. Diagnostico

Antes de desenvolver o dashboard, e necessario confirmar as fontes oficiais de dados. Sem fonte confiavel, o painel deve exibir lacunas e tarefas de saneamento, nao numeros estimados.

## 3. Oportunidades

- Reduzir tempo de consolidacao manual.
- Dar visao unica para diretoria.
- Acompanhar meta de 24 meses.
- Priorizar gargalos comerciais e operacionais.
- Criar cultura de indicadores.

## 4. Riscos

| Risco | Impacto | Controle |
|---|---|---|
| Expor dados sensiveis publicamente | Alto | Autenticacao e variaveis de ambiente |
| Mostrar dados desatualizados | Alto | Campo de ultima atualizacao |
| Misturar dados reais e estimados | Alto | Marcar premissas e lacunas |
| Criar painel bonito sem rotina | Medio | Vincular KPIs a responsaveis |

## 5. Recomendacao

Construir um dashboard MVP com cinco abas:

1. Executivo.
2. Ativos.
3. Comercial.
4. Projetos.
5. Riscos e tarefas.

## 6. Plano de Acao

| Acao | Responsavel | Prazo | Indicador |
|-------|------------|--------|------------|
| Definir fonte oficial de cada KPI | Marco / Ana Luisa / Wesley | D+5 | Dicionario de dados aprovado |
| Aprovar wireframe do dashboard | Marco | D+7 | Wireframe aprovado |
| Criar prototipo local | Tecnico | D+15 | Protótipo navegavel |
| Publicar MVP na Vercel com acesso restrito | Tecnico | D+30 | URL publicada |
| Validar uso semanal | Marco | Semanal | Dashboard revisado em reuniao |

## KPIs do MVP

| Area | Indicador | Fonte inicial | Responsavel |
|---|---|---|---|
| Meta 24 meses | ABL sob gestao | Notion/planilha | Marco |
| Meta 24 meses | Ativos operacionais | Notion | Marco |
| Receita | Receita recorrente mensal | Financeiro | Ana Luisa |
| Ativos | Ocupacao | Relatorio ativo | Wesley |
| Ativos | Vacancia | Relatorio ativo | Wesley |
| Ativos | Inadimplencia | Financeiro | Ana Luisa |
| Comercial | Leads ativos | CRM | Andre |
| Comercial | Propostas enviadas | CRM/Drive | Andre |
| Comercial | Conversao comercial | CRM | Andre |
| Projetos | Projetos por status | Pipeline | Marco |
| PMO | Tarefas vencidas | Gestao de tarefas | Lara |
| Riscos | Riscos criticos abertos | Relatorios/PMO | Marco |

## Layout Sugerido

### Aba Executivo

- Cards de meta: ABL, ativos, receita recorrente, ocupacao, vacancia.
- Semaforo de riscos criticos.
- Top 5 prioridades da semana.
- Alertas de tarefas vencidas.

### Aba Ativos

- Tabela por ativo: ocupacao, vacancia, inadimplencia, receita, NOI, ultima atualizacao.
- Plano de acao por ativo.
- Alertas de risco.

### Aba Comercial

- Funil de leads.
- Follow-ups vencidos.
- Propostas por status.
- Leads quentes e estrategicos.

### Aba Projetos

- Pipeline por status.
- Marcos proximos.
- Projetos sem proximo marco.
- Riscos por projeto.

### Aba Riscos e Tarefas

- Tarefas vencidas por responsavel.
- Decisoes pendentes.
- Riscos sem dono.
- Acoes criticas da semana.

## Requisitos de Seguranca

- Nao publicar dados financeiros sensiveis sem autenticacao.
- Usar variaveis de ambiente para chaves.
- Nao commitar tokens, senhas ou credenciais.
- Exibir ambiente claramente: local, homologacao ou producao.
- Registrar data/hora da ultima atualizacao.

## Stack Recomendada Quando o Repositorio Evoluir

Como ainda nao existe `package.json`, nao ha stack definida. Quando for criar o app, usar uma stack simples:

- Next.js ou Vite + React.
- Deploy na Vercel.
- Autenticacao antes de dados sensiveis.
- API server-side para buscar dados de Notion/Sheets.
- Componentes densos, executivos e objetivos.

## Dados Minimos para Comecar

| Dado | Obrigatorio para MVP | Observacao |
|---|---:|---|
| Lista de ativos | Sim | Villa Viseu, BlueMall e ativos em desenvolvimento |
| Ocupacao por ativo | Sim | Pode iniciar manual |
| Vacancia por ativo | Sim | Pode iniciar manual |
| Receita recorrente | Sim | Confirmar fonte financeira |
| Leads por status | Sim | Depende do CRM |
| Projetos por status | Sim | Depende do pipeline |
| Tarefas vencidas | Sim | Depende da base de tarefas |
| Riscos criticos | Sim | Pode iniciar manual |
