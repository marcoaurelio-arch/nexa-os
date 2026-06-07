import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validateAppUser } from "@/lib/supabase/server-auth";
import type { AccessProfileId } from "@/lib/access-control";
import type { Database } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const allowedProfiles: AccessProfileId[] = [
  "diretoria",
  "administrativo",
  "financeiro",
  "comercial",
  "operacoes",
  "marketing",
  "juridico"
];

type CreateUserPayload = {
  nome?: string;
  email?: string;
  perfil?: AccessProfileId;
  enterpriseIds?: string[];
};

export async function GET(request: Request) {
  const auth = await validateAppUser(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!canManageUsers(auth.profile?.perfil)) {
    return NextResponse.json({ error: "User management is restricted." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const [users, links, enterprises] = await Promise.all([
    admin
      .from("usuarios")
      .select("id,auth_uid,nome,email,perfil,ativo,created_at")
      .order("created_at", { ascending: false }),
    admin
      .from("user_empreendimentos")
      .select("user_id,empreendimento_id"),
    admin
      .from("empreendimentos")
      .select("id,nome")
      .is("deleted_at", null)
      .order("nome", { ascending: true })
  ]);

  if (users.error) return NextResponse.json({ error: users.error.message }, { status: 500 });
  if (links.error) return NextResponse.json({ error: links.error.message }, { status: 500 });
  if (enterprises.error) return NextResponse.json({ error: enterprises.error.message }, { status: 500 });

  return NextResponse.json({
    users: (users.data ?? []).map((user: any) => ({
      ...user,
      enterpriseIds: (links.data ?? [])
        .filter((link: any) => link.user_id === user.id)
        .map((link: any) => link.empreendimento_id)
    })),
    enterprises: enterprises.data ?? []
  });
}

export async function POST(request: Request) {
  const auth = await validateAppUser(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!canManageUsers(auth.profile?.perfil)) {
    return NextResponse.json({ error: "User management is restricted." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase server env not configured." }, { status: 503 });
  }

  const payload = await request.json().catch(() => ({})) as CreateUserPayload;
  const nome = payload.nome?.trim();
  const email = payload.email?.trim().toLowerCase();
  const perfil = payload.perfil;

  if (!nome || nome.length < 2) {
    return NextResponse.json({ error: "Nome obrigatorio." }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "E-mail invalido." }, { status: 400 });
  }

  if (!perfil || !allowedProfiles.includes(perfil)) {
    return NextResponse.json({ error: "Perfil invalido." }, { status: 400 });
  }

  const enterpriseIds = await resolveEnterpriseIds(admin, payload.enterpriseIds);
  const temporaryPassword = generateTemporaryPassword();
  const authUser = await findAuthUserByEmail(admin, email);
  let authUid = authUser?.id ?? null;

  if (authUid) {
    const update = await admin.auth.admin.updateUserById(authUid, {
      password: temporaryPassword,
      user_metadata: { nome }
    });

    if (update.error) {
      return NextResponse.json({ error: update.error.message }, { status: 500 });
    }
  } else {
    const created = await admin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { nome }
    });

    if (created.error || !created.data.user) {
      return NextResponse.json({ error: created.error?.message ?? "Falha ao criar usuario Auth." }, { status: 500 });
    }

    authUid = created.data.user.id;
  }

  const profile = await admin
    .from("usuarios")
    .upsert({
      auth_uid: authUid,
      nome,
      email,
      perfil,
      ativo: true
    }, { onConflict: "email" })
    .select("id,email,perfil,ativo")
    .single();

  if (profile.error || !profile.data) {
    return NextResponse.json({ error: profile.error?.message ?? "Falha ao gravar perfil." }, { status: 500 });
  }

  await admin
    .from("user_empreendimentos")
    .delete()
    .eq("user_id", profile.data.id);

  if (enterpriseIds.length > 0) {
    const links = await admin
      .from("user_empreendimentos")
      .upsert(enterpriseIds.map((enterpriseId: string) => ({
        user_id: profile.data.id,
        empreendimento_id: enterpriseId
      })), { onConflict: "user_id,empreendimento_id" });

    if (links.error) {
      return NextResponse.json({ error: links.error.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: profile.data.id,
      email: profile.data.email,
      perfil: profile.data.perfil,
      ativo: profile.data.ativo,
      enterpriseIds
    },
    temporaryPassword
  });
}

function canManageUsers(profile?: AccessProfileId) {
  return profile === "diretoria" || profile === "administrativo";
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceKey) return null;

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as any;
}

async function resolveEnterpriseIds(admin: any, selectedIds?: string[]) {
  if (selectedIds && selectedIds.length > 0) {
    return Array.from(new Set(selectedIds));
  }

  const { data, error } = await admin
    .from("empreendimentos")
    .select("id")
    .is("deleted_at", null);

  if (error) throw error;
  return (data ?? []).map((enterprise: { id: string }) => enterprise.id);
}

async function findAuthUserByEmail(admin: any, email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const result = await admin.auth.admin.listUsers({ page, perPage: 100 });
    if (result.error) throw result.error;

    const found = result.data.users.find((user: { email?: string }) => user.email?.toLowerCase() === email);
    if (found) return found;
    if (result.data.users.length < 100) return null;
  }

  return null;
}

function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = randomBytes(18);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}
