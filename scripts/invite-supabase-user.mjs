import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.log("Usage: npm run auth:invite -- email@nexamalls.com.br");
  process.exit(1);
}

const env = {
  ...parseEnvFile(path.join(process.cwd(), ".env.local")),
  ...process.env
};
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const redirectTo = env.NEXT_PUBLIC_APP_URL || "https://app.nexamalls.com.br";

if (!url || !serviceKey) {
  console.log("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const existingProfile = await supabase
  .from("usuarios")
  .select("id,email,perfil,ativo")
  .eq("email", email)
  .maybeSingle();

if (existingProfile.error) {
  console.log(`Profile lookup failed: ${existingProfile.error.message}`);
  process.exit(1);
}

if (!existingProfile.data) {
  console.log(`No usuarios profile found for ${email}. Create the profile before inviting.`);
  process.exit(1);
}

if (!existingProfile.data.ativo) {
  console.log(`Profile exists but is inactive for ${email}.`);
  process.exit(1);
}

const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
  redirectTo
});

if (error) {
  console.log(`Invite failed for ${email}: ${error.message}`);
  process.exit(1);
}

console.log(`Invite sent to ${email}. Profile: ${existingProfile.data.perfil}.`);

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const parsed = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

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
