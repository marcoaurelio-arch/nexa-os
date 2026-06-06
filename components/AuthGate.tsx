"use client";

import { Lock, Mail, ShieldCheck } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import type { AccessProfileId } from "@/lib/access-control";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export type AuthenticatedUser = {
  id: string;
  nome: string;
  email: string;
  perfil: AccessProfileId;
  authenticated: boolean;
};

type AuthGateProps = {
  children: (user: AuthenticatedUser, signOut: (() => Promise<void>) | null) => ReactNode;
};

type ProfileResponse = {
  profile: {
    id: string;
    nome: string;
    email: string;
    perfil: AccessProfileId;
  } | null;
  error?: string;
};

const openAccessUser: AuthenticatedUser = {
  id: "open-access",
  nome: "Diretoria Nexa",
  email: "ambiente aberto",
  perfil: "diretoria",
  authenticated: false
};

export function AuthGate({ children }: AuthGateProps) {
  const authRequired = process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"checking" | "ready" | "login">("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(authRequired ? null : openAccessUser);
  const [submitting, setSubmitting] = useState(false);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    if (!authRequired) {
      setUser(openAccessUser);
      setStatus("ready");
      return;
    }

    if (!supabase) {
      setMessage("Supabase nao esta configurado para autenticacao.");
      setStatus("login");
      return;
    }

    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;

      if (!data.session?.access_token) {
        setStatus("login");
        return;
      }

      await loadProfile(data.session.access_token);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;

      if (!session?.access_token) {
        setUser(null);
        setStatus("login");
        return;
      }

      await loadProfile(session.access_token);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [authRequired, supabase]);

  async function loadProfile(accessToken: string) {
    setStatus("checking");
    setMessage(null);

    try {
      const response = await fetch("/api/auth/profile", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      const payload = await response.json() as ProfileResponse;

      if (!response.ok || !payload.profile) {
        setUser(null);
        setMessage(payload.error ?? "Usuario sem permissao no Nexa OS.");
        setStatus("login");
        return;
      }

      setUser({
        id: payload.profile.id,
        nome: payload.profile.nome,
        email: payload.profile.email,
        perfil: payload.profile.perfil,
        authenticated: true
      });
      setStatus("ready");
    } catch (error) {
      setUser(null);
      setMessage(error instanceof Error ? error.message : "Falha ao carregar perfil.");
      setStatus("login");
    }
  }

  async function handlePasswordLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Supabase nao esta configurado.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  async function handleMagicLink() {
    if (!supabase) {
      setMessage("Supabase nao esta configurado.");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin
      }
    });

    setSubmitting(false);
    setMessage(error ? error.message : "Link de acesso enviado para o e-mail informado.");
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setUser(null);
    setStatus("login");
  }

  if (!authRequired && user) {
    return children(user, null);
  }

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="panel max-w-sm p-6 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-4 text-sm font-bold uppercase text-primary">Validando acesso</p>
          <p className="mt-2 text-sm text-muted-foreground">Carregando sessao e permissoes.</p>
        </div>
      </div>
    );
  }

  if (status === "ready" && user) {
    return children(user, signOut);
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_460px]">
      <section className="hidden bg-brand-dark p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <img src="/nexa-malls-logo.png" alt="Nexa Malls" className="h-10 w-[180px] bg-white object-contain object-left p-1" />
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase text-white/60">Nexa OS</p>
          <h1 className="mt-3 text-4xl font-bold uppercase leading-tight">Gestao proprietaria de ativos comerciais.</h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Acesso restrito para diretoria, administrativo, financeiro, comercial, operacoes, marketing e juridico.
          </p>
        </div>
        <p className="text-xs text-white/50">app.nexamalls.com.br</p>
      </section>
      <section className="flex items-center justify-center p-5">
        <div className="panel w-full max-w-md p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold uppercase text-primary">Acesso Nexa OS</h1>
              <p className="text-sm text-muted-foreground">Entre com seu e-mail corporativo autorizado.</p>
            </div>
          </div>
          <form className="mt-6 space-y-3" onSubmit={(event) => void handlePasswordLogin(event)}>
            <label className="block text-sm font-semibold text-primary">
              E-mail
              <input
                className="control mt-2 w-full"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-semibold text-primary">
              Senha
              <input
                className="control mt-2 w-full"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {message ? (
              <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                {message}
              </div>
            ) : null}
            <button className="control w-full bg-primary text-primary-foreground" type="submit" disabled={submitting}>
              {submitting ? "Entrando" : "Entrar"}
            </button>
            <button className="control inline-flex w-full items-center justify-center gap-2" type="button" onClick={() => void handleMagicLink()} disabled={submitting || !email}>
              <Mail className="h-4 w-4" />
              Enviar link magico
            </button>
          </form>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            O acesso depende de cadastro previo no Nexa OS e vinculo com o usuario autorizado.
          </p>
        </div>
      </section>
    </div>
  );
}
