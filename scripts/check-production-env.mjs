import fs from "node:fs";
import path from "node:path";

const strict = process.argv.includes("--strict");
const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");

function parseEnvFile(filePath) {
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

function hasValue(env, key) {
  return typeof env[key] === "string" && env[key].trim().length > 0;
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

const localEnv = parseEnvFile(envPath);
const env = { ...localEnv, ...process.env };

const requiredKeys = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NOTION_PARENT_PAGE_ID",
  "CRON_SECRET",
];

const optionalKeys = ["NEXT_PUBLIC_APP_URL", "NEXT_PUBLIC_AUTH_REQUIRED"];
const failures = [];
const warnings = [];

console.log("Nexa OS production environment check");
console.log(`Mode: ${strict ? "strict" : "advisory"}`);
console.log(`Source: ${fs.existsSync(envPath) ? ".env.local + process.env" : "process.env"}`);
console.log("");

for (const key of requiredKeys) {
  if (hasValue(env, key)) {
    console.log(`OK   ${key}`);
  } else {
    console.log(`MISS ${key}`);
    failures.push(key);
  }
}

if (hasValue(env, "NOTION_API_KEY") || hasValue(env, "NOTION_TOKEN")) {
  console.log("OK   NOTION_API_KEY or NOTION_TOKEN");
} else {
  console.log("MISS NOTION_API_KEY or NOTION_TOKEN");
  failures.push("NOTION_API_KEY or NOTION_TOKEN");
}

for (const key of optionalKeys) {
  if (hasValue(env, key)) {
    console.log(`OK   ${key}`);
  } else {
    console.log(`WARN ${key} is not set`);
    warnings.push(key);
  }
}

if (hasValue(env, "NEXT_PUBLIC_SUPABASE_URL") && !isValidUrl(env.NEXT_PUBLIC_SUPABASE_URL)) {
  console.log("WARN NEXT_PUBLIC_SUPABASE_URL is not a valid URL");
  warnings.push("NEXT_PUBLIC_SUPABASE_URL");
}

if (hasValue(env, "NEXT_PUBLIC_APP_URL") && !isValidUrl(env.NEXT_PUBLIC_APP_URL)) {
  console.log("WARN NEXT_PUBLIC_APP_URL is not a valid URL");
  warnings.push("NEXT_PUBLIC_APP_URL");
}

if (hasValue(env, "CRON_SECRET") && env.CRON_SECRET.length < 24) {
  console.log("WARN CRON_SECRET should have at least 24 characters");
  warnings.push("CRON_SECRET length");
}

console.log("");

if (failures.length === 0) {
  console.log("Environment is ready for production deploy.");
} else {
  console.log(`Missing required variables: ${failures.join(", ")}`);
}

if (warnings.length > 0) {
  console.log(`Warnings: ${warnings.join(", ")}`);
}

if (strict && failures.length > 0) {
  process.exit(1);
}
