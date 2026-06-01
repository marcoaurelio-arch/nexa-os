import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const migrationsDir = join(root, "supabase", "migrations");
const requiredEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NOTION_API_KEY",
  "NOTION_PARENT_PAGE_ID"
];

function ok(label) {
  console.log(`OK   ${label}`);
}

function warn(label) {
  console.log(`WARN ${label}`);
}

function fail(label) {
  console.log(`FAIL ${label}`);
  process.exitCode = 1;
}

if (!existsSync(migrationsDir)) {
  fail("Diretorio supabase/migrations nao encontrado.");
} else {
  const migrations = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
  const missing = Array.from({ length: 9 }, (_, index) => String(index + 1).padStart(3, "0"))
    .filter((prefix) => !migrations.some((file) => file.startsWith(prefix)));

  if (missing.length) {
    fail(`Migrations ausentes: ${missing.join(", ")}`);
  } else {
    ok(`Migrations 001 a 009 encontradas (${migrations.length} arquivos SQL).`);
  }
}

const envExamplePath = join(root, ".env.example");
if (!existsSync(envExamplePath)) {
  fail(".env.example nao encontrado.");
} else {
  const envExample = readFileSync(envExamplePath, "utf8");
  const missingEnv = requiredEnv.filter((key) => !envExample.includes(`${key}=`));

  if (missingEnv.length) {
    fail(`Variaveis ausentes no .env.example: ${missingEnv.join(", ")}`);
  } else {
    ok(".env.example contem Supabase e Notion.");
  }
}

const envLocalPath = join(root, ".env.local");
if (!existsSync(envLocalPath)) {
  warn(".env.local ainda nao existe. Crie com: cp .env.example .env.local");
} else {
  const envLocal = readFileSync(envLocalPath, "utf8");
  const missingLocal = requiredEnv.filter((key) => !new RegExp(`^${key}=.+`, "m").test(envLocal));

  if (missingLocal.length) {
    warn(`.env.local existe, mas ainda faltam valores: ${missingLocal.join(", ")}`);
  } else {
    ok(".env.local contem as variaveis principais preenchidas.");
  }
}

if (existsSync(join(root, "lib", "notion", "schema.ts"))) {
  ok("Manifesto Notion encontrado em lib/notion/schema.ts.");
} else {
  fail("Manifesto Notion nao encontrado.");
}

if (existsSync(join(root, "app", "api", "notion", "databases", "route.ts"))) {
  ok("API de manifesto Notion encontrada.");
} else {
  fail("API de manifesto Notion nao encontrada.");
}
