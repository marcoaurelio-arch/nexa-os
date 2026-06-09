# Nexa OS - Backend Supabase Implantado

Registro de handoff do backend aplicado no projeto Supabase `nexa-os` em 2026-06-08.

## Escopo Aplicado

- RLS habilitado nas tabelas financeiras e de negocio.
- Escrita protegida por tenant e pela matriz `perfil_modulos`.
- Funcoes auxiliares de permissao com grants restritos a `authenticated` e `service_role`.
- Indices de performance para FKs e policies otimizadas.
- Views canonicas para indicadores executivos e operacionais.

## Views Canonicas

- `vw_ocupacao_consolidada`
- `vw_ocupacao_empreendimento`
- `vw_kpis_financeiro`
- `vw_aging_inadimplencia`
- `vw_contratos_vencendo`
- `vw_pipeline_comercial`
- `vw_central_alertas`

## Consumo no App

O endpoint `/api/assets` carrega as views canonicas no bloco `analytics` e preserva fallback para os registros base.

Telas que consomem `analytics`:

- Dashboard
- BI
- Financeiro
- Inadimplencia
- Comercial
- Vacancia
- Configuracoes

## Pendencias Operacionais

- Ativar no painel Supabase: Authentication -> Leaked password protection.
- Reconciliar origem da inadimplencia: preferir derivar de `receitas` com status `vencido`.
- Avaliar ponderacao de risco da central de alertas por valor, alem de dias de atraso.

## Versionamento Futuro

As migrations foram aplicadas diretamente no Supabase. Para trazer o historico para o repo, usar a CLI Supabase autenticada:

```bash
supabase link --project-ref vsugexyjbgeqmwgyrrte
supabase db pull
```
