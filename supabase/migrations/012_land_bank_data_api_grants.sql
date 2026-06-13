-- NEXA OS - 012 - Land Bank Data API grants
-- Complementa a 011 para projetos Supabase em que novas tabelas nao sao expostas
-- automaticamente pela Data API.
-- RLS permanece habilitado na 011; estes GRANTs apenas permitem que PostgREST
-- enxergue as tabelas para usuarios autenticados e para rotas server-side.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on table
  land_bank_areas,
  land_bank_proprietarios,
  land_bank_area_proprietarios,
  land_bank_anexos,
  land_bank_scores,
  land_bank_pipeline,
  land_bank_interacoes,
  land_bank_relatorios_ia,
  land_bank_eventos_automacao
to authenticated, service_role;

grant select on table land_bank_permissoes_usuario to authenticated;
grant select, insert, update, delete on table land_bank_permissoes_usuario to service_role;

grant execute on function land_bank_set_ponto() to authenticated, service_role;
