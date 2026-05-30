# Arquitetura recomendada

## 1. Visão geral

Para a Nexa Malls, a melhor abordagem continua sendo manter este CRM local e simples no curto prazo, mas agora com mais disciplina operacional:

- `Frontend local`: interface web para diretoria, comercial e novos negocios.
- `Persistencia local`: `localStorage` para uso imediato sem infraestrutura.
- `Importacao/exportacao`: Google Sheets, CSV e backup JSON.
- `Alertas`: notificacoes do navegador e webhook para n8n.
- `Historico local`: trilha de alteracoes gravada no navegador.
- `Listas padronizadas`: status, segmentos, responsaveis e empreendimentos definidos localmente.
- `Evolucao futura`: API, autenticacao e banco relacional quando a operacao pedir.

## 2. Arquitetura sugerida para esta fase

- `Frontend`: HTML, CSS e JavaScript puro.
- `Servidor local`: Node.js servindo arquivos estaticos.
- `Persistencia`: `localStorage` no navegador.
- `Google Sheets`: importacao por URL CSV ou arquivo CSV.
- `Backup`: exportacao e restauracao de pacotes JSON.
- `Alertas`: Notification API + webhook manual para n8n.
- `Auditoria`: historico local de criacao, edicao, exclusao e importacao.
- `Padronizacao`: listas configuraveis para manter consistencia do time.

## 3. Estrutura de telas

### Tela 1. Dashboard executivo

- KPIs comerciais e ponderados;
- central de alertas com filtro por responsavel;
- exportacao de follow-ups criticos.

### Tela 2. CRM de empresas

- lista de empresas, redes e operadores prospectados;
- dados como segmento, decisor, cargo, contatos, cidade de interesse e empreendimento indicado;
- filtros, busca rapida, filtros operacionais e duplicacao de lead;
- edicao rapida.

### Tela 3. Integracoes

- importacao de Google Sheets;
- configuracao de estrategia de duplicados;
- configuracao de webhook para alertas;
- resumo de importacao e erros;
- exportacao e restauracao de backup;
- edicao de listas padronizadas.

### Tela 4. Historico

- trilha local de alteracoes;
- data/hora, acao, responsavel, empresa e campos alterados;
- apoio a rotina comercial e conferencias operacionais.

## 4. Modelo de dados local

### Estruturas persistidas

- `records`
  - dados comerciais dos leads

- `history`
  - trilha de alteracoes

- `settings`
  - preferencias da interface
  - configuracoes de importacao
  - webhook
  - listas padronizadas

- `alerts history`
  - datas de importacao
  - envio de webhook
  - backup e restauracao

## 5. Estratégia de integrações

- `Google Forms`: entrada simples de indicacao de redes, leads e oportunidades.
- `Google Sheets`: importacao de listas de prospeccao por CSV publicado ou exportado.
- `Notion`: espelhamento futuro de pipeline, reunioes e resumos comerciais.
- `WhatsApp/n8n`: alertas de follow-up, distribuicao de leads e avisos internos por webhook.

Padrao operacional da importacao:

- validacao de campos obrigatorios;
- deduplicacao por `empresa + decisor + cidade`;
- estrategia configuravel para duplicados: ignorar, atualizar ou importar mesmo assim;
- validacao de status contra lista padronizada;
- resumo final com lidos, importados, atualizados, duplicados, invalidos, ignorados e avisos.

## 6. Segurança

- autenticação obrigatória com perfis por área em uma fase futura;
- controle de acesso por função quando houver backend;
- validação de uploads e webhooks;
- proteção contra exportação excessiva de dados;
- revisao de LGPD para dados de contatos, decisores e parceiros.

Observacao importante desta fase:

- como os dados ficam em `localStorage`, cada navegador tem sua propria copia;
- isso simplifica a instalacao, mas nao substitui uma base central compartilhada;
- o backup JSON reduz risco operacional local;
- o historico tambem fica local, entao a auditoria reflete o navegador em uso.

## 7. Estratégia de rollout

- `Fase 1`: MVP interno com CRM, filtros, follow-up e CSV.
- `Fase 2`: Google Sheets, alertas locais e webhook de follow-up.
- `Fase 3`: historico local, qualidade de dados e rotina de follow-up por responsavel.
- `Fase 4`: backup local, listas padronizadas e produtividade operacional.
- `Fase 5`: autenticacao, base compartilhada e auditoria centralizada.
