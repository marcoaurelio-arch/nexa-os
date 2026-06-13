import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;
const migrationsDir = join(process.cwd(), "supabase", "migrations");
const fromArg = process.argv.find((arg) => arg.startsWith("--from="));
const fromPrefix = fromArg?.split("=")[1] ?? process.env.SUPABASE_MIGRATION_FROM ?? null;
const normalizedFromPrefix = fromPrefix ? fromPrefix.padStart(3, "0") : null;
const dryRun = process.argv.includes("--dry-run");

if (!token && !dryRun) {
  console.error("SUPABASE_ACCESS_TOKEN nao configurado.");
  process.exit(1);
}

if (!projectRef && !dryRun) {
  console.error("SUPABASE_PROJECT_REF nao configurado.");
  process.exit(1);
}

if (normalizedFromPrefix && !/^\d{3}$/.test(normalizedFromPrefix)) {
  console.error("Prefixo --from invalido. Use formato numerico, por exemplo: --from=011.");
  process.exit(1);
}

const migrations = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .filter((file) => !normalizedFromPrefix || file.slice(0, 3) >= normalizedFromPrefix)
  .sort();

if (migrations.length === 0) {
  console.error("Nenhuma migration encontrada para aplicar.");
  process.exit(1);
}

if (fromPrefix) {
  console.log(`Aplicando migrations a partir de ${normalizedFromPrefix}...`);
}

if (dryRun) {
  console.log("Dry run habilitado. Nenhuma migration sera enviada ao Supabase.");
  for (const file of migrations) {
    console.log(`DRY ${file}`);
  }
  process.exit(0);
}

for (const file of migrations) {
  const query = readFileSync(join(migrationsDir, file), "utf8");
  const name = file.replace(/\.sql$/, "");

  console.log(`Aplicando ${file}...`);

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/migrations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, query })
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(JSON.stringify({ file, status: response.status, payload }, null, 2));
    process.exit(1);
  }

  console.log(`OK ${file}`);
}

console.log("Migrations aplicadas com sucesso.");
