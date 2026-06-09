# Autenticacao e Acesso - Nexa OS

O Nexa OS suporta login com Supabase Auth por e-mail/senha, recuperacao de senha, link magico e provedores OAuth opcionais. A tabela `usuarios` define perfil, permissao e vinculos por empreendimento.

## Fluxo

1. Criar ou confirmar o registro do usuario em `public.usuarios`.
2. Criar ou atualizar o usuario em **Configuracoes > Usuarios e senhas** ou pelo Supabase Auth.
3. O primeiro login vincula automaticamente `usuarios.auth_uid` ao usuario autenticado quando o e-mail coincide.
4. Ativar `NEXT_PUBLIC_AUTH_REQUIRED=true` na Vercel.
5. Fazer redeploy de producao.

## Configuracao no Supabase

No painel Supabase do projeto `nexa-os`, configure:

1. **Authentication > URL Configuration**
   - Site URL: `https://app.nexamalls.com.br`
   - Redirect URLs:
     - `https://app.nexamalls.com.br`
     - `https://app.nexamalls.com.br/**`
     - `http://localhost:3001/**`
     - `http://127.0.0.1:3001/**`

2. **Authentication > Sign In / Providers > Email**
   - Email provider: habilitado.
   - Password login: habilitado.
   - Confirm email: recomendado para usuarios externos; pode ficar desabilitado se os usuarios forem criados manualmente pela Diretoria/Admin.
   - Leaked password protection: habilitar quando disponivel no plano.

3. **Authentication > Sign In / Providers > Social Login (OAuth)**
   - Habilite apenas provedores corporativos aprovados, como Google ou Microsoft/Azure.
   - Cadastre no provedor o callback do Supabase: `https://<project-ref>.supabase.co/auth/v1/callback`.
   - Depois adicione a variavel `NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS` na Vercel.

Exemplos:

```txt
NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS=google
NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS=google,azure
```

Se a variavel ficar vazia, o app mostra apenas e-mail/senha, link magico e recuperacao de senha.

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
NEXT_PUBLIC_APP_URL=https://app.nexamalls.com.br
NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS=
```

Depois rode novo deploy de producao.

## Comportamento

- Com `NEXT_PUBLIC_AUTH_REQUIRED=false` ou ausente, o app continua aberto para operacao assistida.
- Com `NEXT_PUBLIC_AUTH_REQUIRED=true`, o app exige sessao Supabase Auth.
- A API `/api/assets` exige token quando a autenticacao esta ativa.
- O perfil real controla os modulos exibidos na navegacao.
- O cliente Supabase usa fluxo PKCE para OAuth e recuperacao de sessao pelo navegador.
