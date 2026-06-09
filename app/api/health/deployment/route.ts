import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type CheckStatus = "ok" | "warning" | "missing";

type DeploymentCheck = {
  key: string;
  label: string;
  status: CheckStatus;
  required: boolean;
  message: string;
};

function hasValue(key: string) {
  return typeof process.env[key] === "string" && process.env[key]?.trim().length > 0;
}

function validUrl(key: string) {
  const value = process.env[key];
  if (!value) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function checkEnv(key: string, label: string, message: string): DeploymentCheck {
  return {
    key,
    label,
    status: hasValue(key) ? "ok" : "missing",
    required: true,
    message
  };
}

function checkOptionalEnv(key: string, label: string, message: string): DeploymentCheck {
  return {
    key,
    label,
    status: hasValue(key) ? "ok" : "warning",
    required: false,
    message
  };
}

export async function GET() {
  const checkedAt = new Date().toISOString();
  const notionAuthConfigured = hasValue("NOTION_API_KEY") || hasValue("NOTION_TOKEN");
  const cronSecret = process.env.CRON_SECRET ?? "";

  const checks: DeploymentCheck[] = [
    checkEnv("NEXT_PUBLIC_SUPABASE_URL", "URL Supabase", "Conecta o frontend e as rotas server-side ao projeto Supabase."),
    checkEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "Anon key Supabase", "Permite leitura autenticada pelo cliente quando aplicavel."),
    checkEnv("SUPABASE_SERVICE_ROLE_KEY", "Service role Supabase", "Permite operacoes server-side, migrations auxiliares e sync."),
    {
      key: "NOTION_API_KEY",
      label: "Token Notion",
      status: notionAuthConfigured ? "ok" : "missing",
      required: true,
      message: "Autoriza criacao, leitura e sincronizacao das bases Notion."
    },
    checkEnv("NOTION_PARENT_PAGE_ID", "Pagina mae Notion", "Define onde as 23 bases do Nexa OS ficam organizadas."),
    {
      key: "CRON_SECRET",
      label: "Segredo do cron",
      status: !cronSecret ? "missing" : cronSecret.length >= 24 ? "ok" : "warning",
      required: true,
      message: "Protege a rotina automatica de sync Notion em producao."
    },
    {
      key: "NEXT_PUBLIC_APP_URL",
      label: "URL publica",
      status: !hasValue("NEXT_PUBLIC_APP_URL") ? "missing" : validUrl("NEXT_PUBLIC_APP_URL") ? "ok" : "warning",
      required: true,
      message: "Usada para referencias publicas, links e validacoes pos-deploy."
    },
    checkOptionalEnv("NEXT_PUBLIC_AUTH_OAUTH_PROVIDERS", "OAuth providers", "Lista opcional de provedores OAuth exibidos no login, como google ou azure.")
  ];

  const missingRequired = checks.filter((check) => check.required && check.status === "missing").length;
  const warnings = checks.filter((check) => check.status === "warning").length;
  const status = missingRequired > 0 ? "not_ready" : warnings > 0 ? "warning" : "ready";

  return NextResponse.json({
    status,
    checkedAt,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "local",
    vercelDetected: hasValue("VERCEL"),
    requiredChecks: checks.length,
    okChecks: checks.filter((check) => check.status === "ok").length,
    warningChecks: warnings,
    missingChecks: missingRequired,
    checks
  });
}
