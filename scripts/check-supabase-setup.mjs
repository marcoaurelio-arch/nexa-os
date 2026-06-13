import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const migrationsDir = join(root, "supabase", "migrations");
const expectedMigrationPrefixes = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(3, "0"));
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
  const missing = expectedMigrationPrefixes
    .filter((prefix) => !migrations.some((file) => file.startsWith(prefix)));

  if (missing.length) {
    fail(`Migrations ausentes: ${missing.join(", ")}`);
  } else {
    ok(`Migrations 001 a ${expectedMigrationPrefixes.at(-1)} encontradas (${migrations.length} arquivos SQL).`);
  }

  const landBankMigration = readMigration(migrationsDir, migrations, "011");
  const landBankGrantsMigration = readMigration(migrationsDir, migrations, "012");

  if (!landBankMigration) {
    fail("Migration 011 do Banco de Terrenos nao encontrada.");
  } else {
    const requiredLandBankTables = [
      "land_bank_areas",
      "land_bank_proprietarios",
      "land_bank_area_proprietarios",
      "land_bank_scores",
      "land_bank_pipeline"
    ];
    const missingLandBankTables = requiredLandBankTables.filter((table) => !landBankMigration.includes(`create table if not exists ${table}`));
    const missingLandBankRls = requiredLandBankTables.filter((table) => !landBankMigration.includes(`alter table ${table} enable row level security`));

    if (missingLandBankTables.length) {
      fail(`Migration 011 sem tabelas Land Bank: ${missingLandBankTables.join(", ")}`);
    } else if (missingLandBankRls.length) {
      fail(`Migration 011 sem RLS Land Bank: ${missingLandBankRls.join(", ")}`);
    } else {
      ok("Migration 011 contem tabelas e RLS do Banco de Terrenos.");
    }
  }

  if (!landBankGrantsMigration) {
    fail("Migration 012 de grants Data API do Banco de Terrenos nao encontrada.");
  } else if (
    !landBankGrantsMigration.includes("to authenticated, service_role") ||
    !landBankGrantsMigration.includes("land_bank_areas") ||
    !landBankGrantsMigration.includes("land_bank_pipeline") ||
    !landBankGrantsMigration.includes("land_bank_permissoes_usuario")
  ) {
    fail("Migration 012 nao cobre grants minimos do Banco de Terrenos.");
  } else {
    ok("Migration 012 contem grants explicitos para Data API do Banco de Terrenos.");
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

function readMigration(migrationsDir, migrations, prefix) {
  const file = migrations.find((migration) => migration.startsWith(prefix));
  return file ? readFileSync(join(migrationsDir, file), "utf8") : null;
}
