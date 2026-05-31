"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Dashboard } from "@/components/Dashboard";
import { ModulePage } from "@/components/ModulePage";
import {
  contracts as seedContracts,
  delinquencyRecords as seedDelinquencyRecords,
  enterprises as seedEnterprises,
  fppRecords as seedFppRecords,
  payables as seedPayables,
  receivables as seedReceivables,
  revenueAuditRecords as seedRevenueAuditRecords,
  stores as seedStores,
  tenants as seedTenants
} from "@/lib/data";
import {
  fetchAssetData,
  loadLocalAssetData,
  resetLocalAssetData,
  saveContract,
  saveDelinquencyRecord,
  saveEnterprise,
  saveFppRecord,
  saveLocalAssetData,
  savePayable,
  saveReceivable,
  saveRevenueAuditRecord,
  saveStore,
  saveTenant
} from "@/lib/assets-repository";
import type { Contract, DelinquencyRecord, Enterprise, FppRecord, Payable, Receivable, RevenueAuditRecord, Store, Tenant } from "@/lib/types";

export function NexaWorkspace() {
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [enterpriseRows, setEnterpriseRows] = useState<Enterprise[]>(seedEnterprises);
  const [storeRows, setStoreRows] = useState<Store[]>(seedStores);
  const [tenantRows, setTenantRows] = useState<Tenant[]>(seedTenants);
  const [contractRows, setContractRows] = useState<Contract[]>(seedContracts);
  const [receivableRows, setReceivableRows] = useState<Receivable[]>(seedReceivables);
  const [payableRows, setPayableRows] = useState<Payable[]>(seedPayables);
  const [delinquencyRows, setDelinquencyRows] = useState<DelinquencyRecord[]>(seedDelinquencyRecords);
  const [fppRows, setFppRows] = useState<FppRecord[]>(seedFppRecords);
  const [revenueAuditRows, setRevenueAuditRows] = useState<RevenueAuditRecord[]>(seedRevenueAuditRecords);
  const [dataSource, setDataSource] = useState<"mock" | "supabase">("mock");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const localData = loadLocalAssetData();

    if (localData) {
      setEnterpriseRows(mergeSeedRows(seedEnterprises, localData.enterprises));
      setStoreRows(mergeSeedRows(seedStores, localData.stores));
      setTenantRows(mergeSeedRows(seedTenants, localData.tenants));
      setContractRows(mergeSeedRows(seedContracts, localData.contracts));
      setReceivableRows(mergeSeedRows(seedReceivables, localData.receivables));
      setPayableRows(mergeSeedRows(seedPayables, localData.payables));
      setDelinquencyRows(mergeSeedRows(seedDelinquencyRecords, localData.delinquencyRecords));
      setFppRows(mergeSeedRows(seedFppRecords, localData.fppRecords));
      setRevenueAuditRows(mergeSeedRows(seedRevenueAuditRecords, localData.revenueAuditRecords));
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
        setDelinquencyRows(data.delinquencyRecords);
        setFppRows(data.fppRecords);
        setRevenueAuditRows(data.revenueAuditRecords);
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
        payables: payableRows,
        delinquencyRecords: delinquencyRows,
        fppRecords: fppRows,
        revenueAuditRecords: revenueAuditRows
      });
    }
  }, [contractRows, dataSource, delinquencyRows, enterpriseRows, fppRows, payableRows, receivableRows, revenueAuditRows, storageReady, storeRows, tenantRows]);

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
          delinquencyRecords={delinquencyRows}
          fppRecords={fppRows}
          revenueAuditRecords={revenueAuditRows}
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
            setDelinquencyRows(seedDelinquencyRecords);
            setFppRows(seedFppRecords);
            setRevenueAuditRows(seedRevenueAuditRecords);
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
          onSaveDelinquencyRecord={async (record) => {
            const saved = await saveDelinquencyRecord(record).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar inadimplencia");
              return record;
            });

            setDelinquencyRows((current) => {
              const exists = current.some((item) => item.id === record.id);
              return exists ? current.map((item) => item.id === record.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveFppRecord={async (record) => {
            const saved = await saveFppRecord(record).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar FPP");
              return record;
            });

            setFppRows((current) => {
              const exists = current.some((item) => item.id === record.id);
              return exists ? current.map((item) => item.id === record.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveRevenueAuditRecord={async (record) => {
            const saved = await saveRevenueAuditRecord(record).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar auditoria");
              return record;
            });

            setRevenueAuditRows((current) => {
              const exists = current.some((item) => item.id === record.id);
              return exists ? current.map((item) => item.id === record.id ? saved : item) : [saved, ...current];
            });
          }}
        />
      )}
    </AppShell>
  );
}

function mergeSeedRows<T extends { id: string }>(seedRows: T[], storedRows: T[]) {
  const storedById = new Map(storedRows.map((row) => [row.id, row]));
  const merged = seedRows.map((row) => storedById.get(row.id) ?? row);
  const seedIds = new Set(seedRows.map((row) => row.id));
  return [...merged, ...storedRows.filter((row) => !seedIds.has(row.id))];
}
