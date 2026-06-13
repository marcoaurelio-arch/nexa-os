import { NexaWorkspace } from "@/components/NexaWorkspace";
import { fetchDashboardAnalytics } from "@/lib/supabase/analytics";
import { createServerSupabaseClient, hasServerSupabaseEnv } from "@/lib/supabase/server";
import { isAuthRequired } from "@/lib/supabase/server-auth";
import type { AssetAnalytics } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const initial = await loadInitialDashboardAnalytics();

  return (
    <NexaWorkspace
      initialAnalytics={initial.analytics}
      initialDataSource={initial.dataSource}
      initialSyncError={initial.syncError}
    />
  );
}

async function loadInitialDashboardAnalytics(): Promise<{
  analytics: AssetAnalytics | null;
  dataSource: "mock" | "supabase";
  syncError: string | null;
}> {
  if (!isAuthRequired() || !hasServerSupabaseEnv()) {
    return { analytics: null, dataSource: "mock", syncError: null };
  }

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return { analytics: null, dataSource: "mock", syncError: null };
  }

  const analytics = await fetchDashboardAnalytics(supabase as any);

  return {
    analytics,
    dataSource: analytics.error ? "mock" : "supabase",
    syncError: analytics.error ?? null
  };
}
