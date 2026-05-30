"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { ModulePage } from "@/components/ModulePage";
import { enterprises as seedEnterprises, stores as seedStores } from "@/lib/data";
import { fetchAssetData, loadLocalAssetData, saveEnterprise, saveLocalAssetData, saveStore } from "@/lib/assets-repository";
import type { Enterprise, Store } from "@/lib/types";

export function NexaWorkspace() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [enterpriseRows, setEnterpriseRows] = useState<Enterprise[]>(seedEnterprises);
  const [storeRows, setStoreRows] = useState<Store[]>(seedStores);
  const [dataSource, setDataSource] = useState<"mock" | "supabase">("mock");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const localData = loadLocalAssetData();

    if (localData) {
      setEnterpriseRows(localData.enterprises);
      setStoreRows(localData.stores);
    }
    setStorageReady(true);

    fetchAssetData()
      .then((data) => {
        if (!mounted || !data) return;
        setEnterpriseRows(data.enterprises);
        setStoreRows(data.stores);
        setDataSource("supabase");
      })
      .catch((error: unknown) => {
        setSyncError(error instanceof Error ? error.message : "Falha ao carregar Supabase");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (storageReady && dataSource === "mock") {
      saveLocalAssetData({ enterprises: enterpriseRows, stores: storeRows });
    }
  }, [dataSource, enterpriseRows, storageReady, storeRows]);

  return (
    <AppShell activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === "Dashboard" ? (
        <Dashboard enterpriseRows={enterpriseRows} storeRows={storeRows} />
      ) : (
        <ModulePage
          module={activeModule}
          enterprises={enterpriseRows}
          stores={storeRows}
          dataSource={dataSource}
          syncError={syncError}
          onSaveEnterprise={async (enterprise) => {
            const saved = await saveEnterprise(enterprise).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar empreendimento");
              return enterprise;
            });

            setEnterpriseRows((current) => {
              const exists = current.some((item) => item.id === enterprise.id);
              return exists ? current.map((item) => item.id === enterprise.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveStore={async (store) => {
            const saved = await saveStore(store).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar loja");
              return store;
            });

            setStoreRows((current) => {
              const exists = current.some((item) => item.id === store.id);
              return exists ? current.map((item) => item.id === store.id ? saved : item) : [saved, ...current];
            });
          }}
        />
      )}
    </AppShell>
  );
}
