# Autenticacao e Acesso - Nexa OS

O Nexa OS suporta login com Supabase Auth e usa a tabela `usuarios` para definir perfil e permissao.

## Fluxo

1. Criar ou confirmar o registro do usuario em `public.usuarios`.
2. Convidar o usuario pelo Supabase Auth.
3. O primeiro login vincula automaticamente `usuarios.auth_uid` ao usuario autenticado quando o e-mail coincide.
4. Ativar `NEXT_PUBLIC_AUTH_REQUIRED=true` na Vercel.
5. Fazer redeploy de producao.

## Usuario inicial

A migration `002_rls_enums_tenant.sql` cria o perfil inicial:

```txt
diretoria@nexamalls.com
Perfil: diretoria
```

Antes de ativar o bloqueio, envie o convite:

```bash
npm run auth:invite -- diretoria@nexamalls.com
```

Se preferir usar outro e-mail, crie primeiro o registro correspondente em `usuarios`, com perfil e vinculos em `user_empreendimentos`.

## Ativar em producao

Na Vercel, cadastre:

```txt
NEXT_PUBLIC_AUTH_REQUIRED=true
```

Depois rode novo deploy de producao.

## Comportamento

- Com `NEXT_PUBLIC_AUTH_REQUIRED=false` ou ausente, o app continua aberto para operacao assistida.
- Com `NEXT_PUBLIC_AUTH_REQUIRED=true`, o app exige sessao Supabase Auth.
- A API `/api/assets` exige token quando a autenticacao esta ativa.
- O perfil real controla os modulos exibidos na navegacao.
