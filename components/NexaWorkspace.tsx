"use client";

import { useEffect, useState } from "react";
import { AppShell, navItems } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { Dashboard } from "@/components/Dashboard";
import { ModulePage } from "@/components/ModulePage";
import {
  commercialLeads as seedCommercialLeads,
  contracts as seedContracts,
  delinquencyRecords as seedDelinquencyRecords,
  documentRecords as seedDocumentRecords,
  enterprises as seedEnterprises,
  fppRecords as seedFppRecords,
  legalCases as seedLegalCases,
  payables as seedPayables,
  receivables as seedReceivables,
  revenueAuditRecords as seedRevenueAuditRecords,
  serviceOrders as seedServiceOrders,
  stores as seedStores,
  tenants as seedTenants,
  utilityReadings as seedUtilityReadings,
  vacancyRecords as seedVacancyRecords
} from "@/lib/data";
import {
  fetchAssetData,
  loadLocalAssetData,
  resetLocalAssetData,
  saveCommercialLead,
  saveContract,
  saveDelinquencyRecord,
  saveDocumentRecord,
  saveEnterprise,
  saveFppRecord,
  saveLegalCase,
  saveLocalAssetData,
  savePayable,
  saveReceivable,
  saveRevenueAuditRecord,
  saveServiceOrder,
  saveStore,
  saveTenant,
  saveUtilityReading,
  saveVacancyRecord
} from "@/lib/assets-repository";
import type { CommercialLead, Contract, DelinquencyRecord, DocumentRecord, Enterprise, FppRecord, LegalCase, Payable, Receivable, RevenueAuditRecord, ServiceOrder, Store, Tenant, UtilityReading, VacancyRecord } from "@/lib/types";

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
  const [commercialLeadRows, setCommercialLeadRows] = useState<CommercialLead[]>(seedCommercialLeads);
  const [vacancyRows, setVacancyRows] = useState<VacancyRecord[]>(seedVacancyRecords);
  const [utilityRows, setUtilityRows] = useState<UtilityReading[]>(seedUtilityReadings);
  const [serviceOrderRows, setServiceOrderRows] = useState<ServiceOrder[]>(seedServiceOrders);
  const [documentRows, setDocumentRows] = useState<DocumentRecord[]>(seedDocumentRecords);
  const [legalRows, setLegalRows] = useState<LegalCase[]>(seedLegalCases);
  const [dataSource, setDataSource] = useState<"mock" | "supabase">("mock");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const requestedModule = new URLSearchParams(window.location.search).get("module");
    const moduleExists = navItems.some((item) => item.label === requestedModule);

    if (requestedModule && moduleExists) {
      setActiveModule(requestedModule);
    }
  }, []);

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
      setCommercialLeadRows(mergeSeedRows(seedCommercialLeads, localData.commercialLeads));
      setVacancyRows(mergeSeedRows(seedVacancyRecords, localData.vacancyRecords));
      setUtilityRows(mergeSeedRows(seedUtilityReadings, localData.utilityReadings));
      setServiceOrderRows(mergeSeedRows(seedServiceOrders, localData.serviceOrders));
      setDocumentRows(mergeSeedRows(seedDocumentRecords, localData.documentRecords));
      setLegalRows(mergeSeedRows(seedLegalCases, localData.legalCases));
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
        setCommercialLeadRows(data.commercialLeads);
        setVacancyRows(data.vacancyRecords);
        setUtilityRows(data.utilityReadings);
        setServiceOrderRows(data.serviceOrders);
        setDocumentRows(data.documentRecords);
        setLegalRows(data.legalCases);
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
        revenueAuditRecords: revenueAuditRows,
        commercialLeads: commercialLeadRows,
        vacancyRecords: vacancyRows,
        utilityReadings: utilityRows,
        serviceOrders: serviceOrderRows,
        documentRecords: documentRows,
        legalCases: legalRows
      });
    }
  }, [commercialLeadRows, contractRows, dataSource, delinquencyRows, documentRows, enterpriseRows, fppRows, legalRows, payableRows, receivableRows, revenueAuditRows, serviceOrderRows, storageReady, storeRows, tenantRows, utilityRows, vacancyRows]);

  return (
    <AuthGate>
      {(user, signOut) => (
        <AppShell
          activeModule={activeModule}
          onModuleChange={setActiveModule}
          userProfileId={user.authenticated ? user.perfil : undefined}
          userName={user.nome}
          userEmail={user.email}
          onSignOut={signOut ?? undefined}
        >
          {activeModule === "Dashboard" ? (
            <Dashboard
              enterpriseRows={enterpriseRows}
              storeRows={storeRows}
              tenantRows={tenantRows}
              contractRows={contractRows}
              receivableRows={receivableRows}
              payableRows={payableRows}
              serviceOrderRows={serviceOrderRows}
            />
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
              commercialLeads={commercialLeadRows}
              vacancyRecords={vacancyRows}
              utilityReadings={utilityRows}
              serviceOrders={serviceOrderRows}
              documentRecords={documentRows}
              legalCases={legalRows}
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
                setCommercialLeadRows(seedCommercialLeads);
                setVacancyRows(seedVacancyRecords);
                setUtilityRows(seedUtilityReadings);
                setServiceOrderRows(seedServiceOrders);
                setDocumentRows(seedDocumentRecords);
                setLegalRows(seedLegalCases);
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
          onSaveCommercialLead={async (lead) => {
            const saved = await saveCommercialLead(lead).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar oportunidade comercial");
              return lead;
            });

            setCommercialLeadRows((current) => {
              const exists = current.some((item) => item.id === lead.id);
              return exists ? current.map((item) => item.id === lead.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveVacancyRecord={async (record) => {
            const saved = await saveVacancyRecord(record).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar vacancia");
              return record;
            });

            setVacancyRows((current) => {
              const exists = current.some((item) => item.id === record.id);
              return exists ? current.map((item) => item.id === record.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveUtilityReading={async (reading) => {
            const saved = await saveUtilityReading(reading).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar consumo");
              return reading;
            });

            setUtilityRows((current) => {
              const exists = current.some((item) => item.id === reading.id);
              return exists ? current.map((item) => item.id === reading.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveServiceOrder={async (order) => {
            const saved = await saveServiceOrder(order).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar ordem de servico");
              return order;
            });

            setServiceOrderRows((current) => {
              const exists = current.some((item) => item.id === order.id);
              return exists ? current.map((item) => item.id === order.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveDocumentRecord={async (record) => {
            const saved = await saveDocumentRecord(record).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar documento");
              return record;
            });

            setDocumentRows((current) => {
              const exists = current.some((item) => item.id === record.id);
              return exists ? current.map((item) => item.id === record.id ? saved : item) : [saved, ...current];
            });
          }}
          onSaveLegalCase={async (record) => {
            const saved = await saveLegalCase(record).catch((error: unknown) => {
              setSyncError(error instanceof Error ? error.message : "Falha ao salvar caso juridico");
              return record;
            });

            setLegalRows((current) => {
              const exists = current.some((item) => item.id === record.id);
              return exists ? current.map((item) => item.id === record.id ? saved : item) : [saved, ...current];
            });
          }}
        />
      )}
    </AppShell>
      )}
    </AuthGate>
  );
}

function mergeSeedRows<T extends { id: string }>(seedRows: T[], storedRows: T[]) {
  const storedById = new Map(storedRows.map((row) => [row.id, row]));
  const merged = seedRows.map((row) => storedById.get(row.id) ?? row);
  const seedIds = new Set(seedRows.map((row) => row.id));
  return [...merged, ...storedRows.filter((row) => !seedIds.has(row.id))];
}
