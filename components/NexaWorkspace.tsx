"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { ModulePage } from "@/components/ModulePage";
import { contracts as seedContracts, enterprises as seedEnterprises, stores as seedStores, tenants as seedTenants } from "@/lib/data";
import {
  fetchAssetData,
  loadLocalAssetData,
  resetLocalAssetData,
  saveContract,
  saveEnterprise,
  saveLocalAssetData,
  saveStore,
  saveTenant
} from "@/lib/assets-repository";
import type { Contract, Enterprise, Store, Tenant } from "@/lib/types";

export function NexaWorkspace() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [enterpriseRows, setEnterpriseRows] = useState<Enterprise[]>(seedEnterprises);
  const [storeRows, setStoreRows] = useState<Store[]>(seedStores);
  const [tenantRows, setTenantRows] = useState<Tenant[]>(seedTenants);
  const [contractRows, setContractRows] = useState<Contract[]>(seedContracts);
  const [dataSource, setDataSource] = useState<"mock" | "supabase">("mock");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const localData = loadLocalAssetData();

    if (localData) {
      setEnterpriseRows(localData.enterprises);
      setStoreRows(localData.stores);
      setTenantRows(localData.tenants.length ? localData.tenants : seedTenants);
      setContractRows(localData.contracts.length ? localData.contracts : seedContracts);
    }
    setStorageReady(true);

    fetchAssetData()
      .then((data) => {
        if (!mounted || !data) return;
        setEnterpriseRows(data.enterprises);
        setStoreRows(data.stores);
        setTenantRows(data.tenants);
        setContractRows(data.contracts);
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
      saveLocalAssetData({ enterprises: enterpriseRows, stores: storeRows, tenants: tenantRows, contracts: contractRows });
    }
  }, [contractRows, dataSource, enterpriseRows, storageReady, storeRows, tenantRows]);

  return (
    <AppShell activeModule={activeModule} onModuleChange={setActiveModule}>
      {activeModule === "Dashboard" ? (
        <Dashboard enterpriseRows={enterpriseRows} storeRows={storeRows} tenantRows={tenantRows} contractRows={contractRows} />
      ) : (
        <ModulePage
          module={activeModule}
          enterprises={enterpriseRows}
          stores={storeRows}
          tenants={tenantRows}
          contracts={contractRows}
          dataSource={dataSource}
          syncError={syncError}
          onResetLocalData={() => {
            resetLocalAssetData();
            setEnterpriseRows(seedEnterprises);
            setStoreRows(seedStores);
            setTenantRows(seedTenants);
            setContractRows(seedContracts);
            setDataSource("mock");
            setSyncError(null);
          }}
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
          onSaveTenant={async (tenant) => {
            const saved = await saveTenant(tenant).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar lojista");
              return tenant;
            });

            setTenantRows((current) => {
              const exists = current.some((item) => item.id === tenant.id);
              return exists ? current.map((item) => item.id === tenant.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveContract={async (contract) => {
            const saved = await saveContract(contract).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar contrato");
              return contract;
            });

            setContractRows((current) => {
              const exists = current.some((item) => item.id === contract.id);
              return exists ? current.map((item) => item.id === contract.id ? saved : item) : [saved, ...current];
            });
          }}
        />
      )}
    </AppShell>
  );
}
