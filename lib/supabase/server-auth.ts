import { createClient } from "@supabase/supabase-js";
import type { AccessProfileId } from "@/lib/access-control";
import type { Database } from "@/lib/supabase/types";

export type AppUserProfile = {
  id: string;
  authUid: string;
  nome: string;
  email: string;
  perfil: AccessProfileId;
  enterpriseIds: string[];
};

type AuthResult =
  | { ok: true; required: boolean; profile: AppUserProfile | null; accessToken?: string }
  | { ok: false; status: number; error: string };

export function isAuthRequired() {
  return process.env.NEXT_PUBLIC_AUTH_REQUIRED === "true" || process.env.AUTH_REQUIRED === "true";
}

export async function validateAppUser(request: Request): Promise<AuthResult> {
  const required = isAuthRequired();

  if (!required) {
    return { ok: true, required, profile: null };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const token = getBearerToken(request);

  if (!url || !anonKey || !serviceKey) {
    return { ok: false, status: 503, error: "Supabase auth env not configured." };
  }

  if (!token) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  const authClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);

  if (userError || !userData.user?.email) {
    return { ok: false, status: 401, error: "Invalid session." };
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;
  const authUid = userData.user.id;
  const email = userData.user.email.toLowerCase();
  const profile = await findOrBindUserProfile(admin, authUid, email);

  if (!profile) {
    return { ok: false, status: 403, error: "User is not authorized for Nexa OS." };
  }

  if (!profile.ativo) {
    return { ok: false, status: 403, error: "User is inactive." };
  }

  const { data: enterpriseRows, error: enterpriseError } = await admin
    .from("user_empreendimentos")
    .select("empreendimento_id")
    .eq("user_id", profile.id);

  if (enterpriseError) {
    return { ok: false, status: 500, error: enterpriseError.message };
  }

  return {
    ok: true,
    required,
    accessToken: token,
    profile: {
      id: profile.id,
      authUid,
      nome: profile.nome,
      email: profile.email,
      perfil: profile.perfil,
      enterpriseIds: (enterpriseRows ?? []).map((row: { empreendimento_id: string }) => row.empreendimento_id)
    }
  };
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  const prefix = "Bearer ";

  return authorization?.startsWith(prefix) ? authorization.slice(prefix.length).trim() : null;
}

async function findOrBindUserProfile(admin: any, authUid: string, email: string) {
  const current = await admin
    .from("usuarios")
    .select("id,auth_uid,nome,email,perfil,ativo")
    .eq("auth_uid", authUid)
    .maybeSingle();

  if (current.error) throw current.error;
  if (current.data) return current.data;

  const byEmail = await admin
    .from("usuarios")
    .select("id,auth_uid,nome,email,perfil,ativo")
    .eq("email", email)
    .maybeSingle();

  if (byEmail.error) throw byEmail.error;
  if (!byEmail.data || byEmail.data.auth_uid) return null;

  const updated = await admin
    .from("usuarios")
    .update({ auth_uid: authUid })
    .eq("id", byEmail.data.id)
    .select("id,auth_uid,nome,email,perfil,ativo")
    .single();

  if (updated.error) throw updated.error;
  return updated.data;
}
