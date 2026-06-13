# Checklist de Aceite - NEXA OS Fase 1

## Notion

- [x] Pagina raiz `NEXA OS` confirmada.
- [x] Subpagina `Fase 1 - Secretaria Virtual Assistida` confirmada.
- [x] 7 bases criadas.
- [ ] Propriedades obrigatorias configuradas.
- [ ] Status dos pipelines configurados.
- [ ] Relations criadas.
- [ ] Rollups principais criados.
- [ ] Views operacionais criadas.
- [x] Painel executivo/status executivo atualizado na pagina Fase 1.
- [x] Projetos iniciais cadastrados.
- [x] Tarefas iniciais cadastradas.
- [x] Relatorio PMO de implantacao criado.

## Google Drive

- [x] Pasta raiz criada.
- [x] Primeira camada do Drive criada: `00_Admin` a `08_NEXA_OS`.
- [x] Arvore de subpastas criada.
- [x] Templates criados em Google Docs.
- [x] Politica de aprovacao publicada em Google Docs.
- [x] Planilhas `Mapa_Credenciais_n8n` e `LOG_Execucoes_Criticas` criadas.
- [x] Permissoes do Drive validadas: raiz, primeira camada, documentos sensiveis e modelos sem compartilhamento publico.
- [x] Nenhuma credencial ou segredo salvo em texto aberto nos artefatos criados nesta rodada.
- [x] Conector Google Drive com escrita validada.
- [x] Links dos documentos de templates registrados no sistema.

## n8n

- [ ] Credenciais Notion configuradas.
- [ ] Credenciais Google Drive configuradas.
- [ ] Credenciais Gmail configuradas.
- [ ] Credenciais Calendar configuradas.
- [ ] Credencial Zaper/WhatsApp configurada.
- [x] Workflow 01 scaffold importavel criado.
- [x] Fixtures do Workflow 01 criadas.
- [x] Runbook de importacao e homologacao do Workflow 01 criado.
- [x] Workflow 01 testado manualmente com lead novo completo.
- [x] Workflow 01 testado manualmente com lead incompleto.
- [x] Workflow 01 testado manualmente com lead existente.
- [ ] Workflow 01 importado no n8n real com `active = false`.
- [ ] Workflow 01 homologado no n8n real com as 3 fixtures.
- [x] Log do teste manual do Workflow 01 registrado.
- [x] Log complementar do Workflow 01 registrado.
- [x] `Envio externo = Nao` validado no teste manual do Workflow 01.
- [x] Workflow 02 scaffold importavel criado.
- [x] Fixtures do Workflow 02 criadas.
- [x] Runbook de importacao e homologacao do Workflow 02 criado.
- [x] Workflow 02 testado manualmente com follow-up hoje.
- [x] Workflow 02 testado manualmente com follow-up vencido.
- [ ] Workflow 02 importado no n8n real com `active = false`.
- [ ] Workflow 02 homologado no n8n real com follow-up hoje/vencido.
- [ ] Workflow 03 gera pauta semanal.
- [x] Log do teste manual do Workflow 02 registrado.
- [x] Homologacao tecnica local dos Workflows 01 e 02 aprovada com 58 checks e 0 reprovados.
- [ ] Logs registram sucesso e erro no n8n real.
- [ ] `Envio externo = Nao` em todos os workflows da Fase 1.

## Supabase

- [x] Migration `011_nexa_land_bank.sql` criada para Banco de Terrenos.
- [x] Migration `012_land_bank_data_api_grants.sql` criada para grants explicitos da Data API sem liberar `anon`.
- [ ] Migrations `011` e `012` aplicadas no projeto Supabase real.
- [ ] Acesso Data API validado para `land_bank_areas`, `land_bank_pipeline`, `land_bank_scores`, `land_bank_proprietarios` e `land_bank_area_proprietarios`.
- [ ] RLS validado com usuario autenticado vinculado a empreendimento.

## Governanca

- [ ] Nenhuma proposta enviada sem aprovacao humana.
- [x] Nenhuma mensagem externa enviada nos testes manuais dos Workflows 01 e 02.
- [ ] Toda tarefa tem responsavel, prazo, status, prioridade e criterio de conclusao.
- [x] Lead de teste tem origem, segmento, responsavel, proximo follow-up, ultimo resumo, proxima acao e aprovacao pendente.
- [ ] Toda reuniao encerrada tem decisoes, riscos, proximos passos e tarefas.
- [ ] Todo relatorio tem resumo executivo, riscos, oportunidades e proximos passos.
