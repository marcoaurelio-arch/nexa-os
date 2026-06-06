import { NextResponse } from "next/server";
import { validateAppUser } from "@/lib/supabase/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const result = await validateAppUser(request);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    required: result.required,
    profile: result.profile
  });
}
