import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const env = { ...readEnvFile(path.join(cwd, ".env.local")), ...process.env };
const requireUserJwt = process.argv.includes("--require-user-jwt");

const supabaseUrl = stripTrailingSlash(env.NEXT_PUBLIC_SUPABASE_URL ?? "");
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const userJwt = env.SUPABASE_USER_JWT;

const tableChecks = [
  { table: "land_bank_areas", select: "id" },
  { table: "land_bank_pipeline", select: "id" },
  { table: "land_bank_scores", select: "id" },
  { table: "land_bank_proprietarios", select: "id" },
  { table: "land_bank_area_proprietarios", select: "area_id" }
];

const failures = [];
const warnings = [];

console.log("Nexa OS Land Bank Supabase verification");
console.log(`Authenticated JWT required: ${requireUserJwt ? "yes" : "no"}`);
console.log("");

if (!supabaseUrl) {
  fail("NEXT_PUBLIC_SUPABASE_URL nao configurado.");
}

if (!serviceRoleKey) {
  fail("SUPABASE_SERVICE_ROLE_KEY nao configurado.");
}

if (failures.length === 0) {
  await runChecks("service_role", serviceRoleHeaders());
}

if (userJwt) {
  if (!anonKey) {
    fail("SUPABASE_USER_JWT configurado, mas NEXT_PUBLIC_SUPABASE_ANON_KEY ausente.");
  } else if (failures.length === 0) {
    await runChecks("authenticated", authenticatedHeaders());
  }
} else if (requireUserJwt) {
  fail("SUPABASE_USER_JWT ausente. Gere um JWT de usuario vinculado a empreendimento e repita a verificacao.");
} else {
  warn("SUPABASE_USER_JWT ausente. Validacao RLS com usuario autenticado foi pulada.");
}

console.log("");

if (warnings.length) {
  console.log(`Warnings: ${warnings.join("; ")}`);
}

if (failures.length) {
  console.log(`Failures: ${failures.join("; ")}`);
  process.exit(1);
}

console.log("Land Bank Supabase verification passed.");

async function runChecks(label, headers) {
  for (const check of tableChecks) {
    const url = `${supabaseUrl}/rest/v1/${check.table}?select=${encodeURIComponent(check.select)}&limit=1`;
    const response = await fetch(url, { headers });
    const payload = await response.text();

    if (!response.ok) {
      fail(`${label} ${check.table}: HTTP ${response.status} ${compactPayload(payload)}`);
      continue;
    }

    console.log(`OK   ${label} can query ${check.table}`);
  }
}

function serviceRoleHeaders() {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`
  };
}

function authenticatedHeaders() {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${userJwt}`
  };
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const parsed = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function stripTrailingSlash(value) {
  return value.trim().replace(/\/+$/, "");
}

function compactPayload(payload) {
  return payload.replace(/\s+/g, " ").slice(0, 240);
}

function fail(message) {
  console.log(`FAIL ${message}`);
  failures.push(message);
}

function warn(message) {
  console.log(`WARN ${message}`);
  warnings.push(message);
}
