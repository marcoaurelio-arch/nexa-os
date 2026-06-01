import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;
const migrationsDir = join(process.cwd(), "supabase", "migrations");

if (!token) {
  console.error("SUPABASE_ACCESS_TOKEN nao configurado.");
  process.exit(1);
}

if (!projectRef) {
  console.error("SUPABASE_PROJECT_REF nao configurado.");
  process.exit(1);
}

const migrations = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

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
