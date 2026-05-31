"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { ModulePage } from "@/components/ModulePage";
import {
  contracts as seedContracts,
  enterprises as seedEnterprises,
  payables as seedPayables,
  receivables as seedReceivables,
  stores as seedStores,
  tenants as seedTenants
} from "@/lib/data";
import {
  fetchAssetData,
  loadLocalAssetData,
  resetLocalAssetData,
  saveContract,
  saveEnterprise,
  saveLocalAssetData,
  savePayable,
  saveReceivable,
  saveStore,
  saveTenant
} from "@/lib/assets-repository";
import type { Contract, Enterprise, Payable, Receivable, Store, Tenant } from "@/lib/types";

export function NexaWorkspace() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [enterpriseRows, setEnterpriseRows] = useState<Enterprise[]>(seedEnterprises);
  const [storeRows, setStoreRows] = useState<Store[]>(seedStores);
  const [tenantRows, setTenantRows] = useState<Tenant[]>(seedTenants);
  const [contractRows, setContractRows] = useState<Contract[]>(seedContracts);
  const [receivableRows, setReceivableRows] = useState<Receivable[]>(seedReceivables);
  const [payableRows, setPayableRows] = useState<Payable[]>(seedPayables);
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
      setReceivableRows(localData.receivables.length ? localData.receivables : seedReceivables);
      setPayableRows(localData.payables.length ? localData.payables : seedPayables);
    }
    setStorageReady(true);

    fetchAssetData()
      .then((data) => {
        if (!mounted || !data) return;
        setEnterpriseRows(data.enterprises);
        setStoreRows(data.stores);
        setTenantRows(data.tenants);
        setContractRows(data.contracts);
        setReceivableRows(data.receivables);
        setPayableRows(data.payables);
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
      saveLocalAssetData({
        enterprises: enterpriseRows,
        stores: storeRows,
        tenants: tenantRows,
        contracts: contractRows,
        receivables: receivableRows,
        payables: payableRows
      });
    }
  }, [contractRows, dataSource, enterpriseRows, payableRows, receivableRows, storageReady, storeRows, tenantRows]);

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
          receivables={receivableRows}
          payables={payableRows}
          dataSource={dataSource}
          syncError={syncError}
          onResetLocalData={() => {
            resetLocalAssetData();
            setEnterpriseRows(seedEnterprises);
            setStoreRows(seedStores);
            setTenantRows(seedTenants);
            setContractRows(seedContracts);
            setReceivableRows(seedReceivables);
            setPayableRows(seedPayables);
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
          onSaveReceivable={async (receivable) => {
            const saved = await saveReceivable(receivable).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar conta a receber");
              return receivable;
            });

            setReceivableRows((current) => {
              const exists = current.some((item) => item.id === receivable.id);
              return exists ? current.map((item) => item.id === receivable.id ? saved : item) : [saved, ...current];
            });
          }}
          onSavePayable={async (payable) => {
            const saved = await savePayable(payable).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar conta a pagar");
              return payable;
            });

            setPayableRows((current) => {
              const exists = current.some((item) => item.id === payable.id);
              return exists ? current.map((item) => item.id === payable.id ? saved : item) : [saved, ...current];
            });
          }}
        />
      )}
    </AppShell>
  );
}
