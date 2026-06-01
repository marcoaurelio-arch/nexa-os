"use client";

import {
  AreaChart,
  Banknote,
  BarChart3,
  Building2,
  ClipboardList,
  FileBarChart,
  FileText,
  Gavel,
  Home,
  LayoutDashboard,
  Megaphone,
  Menu,
  Receipt,
  Settings,
  Store,
  X,
  Users,
  Wrench,
  Zap
} from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { accessProfiles, modulesForProfile } from "@/lib/access-control";
import type { AccessProfileId } from "@/lib/access-control";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "BI", icon: BarChart3 },
  { label: "Empreendimentos", icon: Building2 },
  { label: "Lojas", icon: Store },
  { label: "Lojistas", icon: Users },
  { label: "Contratos", icon: FileText },
  { label: "Financeiro", icon: Banknote },
  { label: "Inadimplencia", icon: Receipt },
  { label: "Condominio", icon: Home },
  { label: "Fundo", icon: Megaphone },
  { label: "FPP", icon: AreaChart },
  { label: "Auditoria", icon: Receipt },
  { label: "Comercial", icon: BarChart3 },
  { label: "Vacancia", icon: Store },
  { label: "Operacoes", icon: Wrench },
  { label: "Energia e Agua", icon: Zap },
  { label: "Documentos", icon: ClipboardList },
  { label: "Juridico", icon: Gavel },
  { label: "Relatorios", icon: FileBarChart },
  { label: "Configuracoes", icon: Settings }
];

export function AppShell({
  children,
  activeModule,
  onModuleChange
}: {
  children: ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
}) {
  const [profileId, setProfileId] = useState<AccessProfileId>("diretoria");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const allowedModules = modulesForProfile(profileId);
  const visibleNavItems = navItems.filter((item) => allowedModules.includes(item.label));
  const primaryMobileItems = visibleNavItems.filter((item) => ["Dashboard", "BI", "Financeiro", "Operacoes", "Relatorios"].includes(item.label)).slice(0, 5);

  function handleProfileChange(nextProfileId: AccessProfileId) {
    const nextAllowedModules = modulesForProfile(nextProfileId);
    setProfileId(nextProfileId);

    if (!nextAllowedModules.includes(activeModule)) {
      onModuleChange("Dashboard");
    }
  }

  function handleModuleChange(module: string) {
    onModuleChange(module);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[252px_1fr]">
      <aside className="hidden border-r border-border bg-surface lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <img
            src="/nexa-malls-logo.png"
            alt="Nexa Malls"
            className="h-9 w-[150px] object-contain object-left"
          />
          <div className="text-[11px] font-semibold uppercase leading-4 text-muted-foreground">OS</div>
        </div>
        <div className="border-b border-border p-3">
          <label className="text-[10px] font-bold uppercase text-muted-foreground">Perfil de acesso</label>
          <select
            className="control mt-2 w-full text-xs"
            value={profileId}
            onChange={(event) => handleProfileChange(event.target.value as AccessProfileId)}
          >
            {accessProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.label}</option>
            ))}
          </select>
        </div>
        <nav className="space-y-1 p-3">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeModule;
            return (
              <button
                key={item.label}
                onClick={() => handleModuleChange(item.label)}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <img
            src="/nexa-malls-logo.png"
            alt="Nexa Malls"
            className="h-8 w-[142px] object-contain object-left"
          />
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-primary"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Modulo</p>
            <p className="text-sm font-bold uppercase text-primary">{activeModule}</p>
          </div>
          <select
            className="control min-w-[138px] text-xs"
            value={profileId}
            onChange={(event) => handleProfileChange(event.target.value as AccessProfileId)}
          >
            {accessProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>{profile.label}</option>
            ))}
          </select>
        </div>
        {mobileMenuOpen ? (
          <nav className="mt-3 grid max-h-[62vh] gap-2 overflow-y-auto rounded-lg border border-border bg-background p-2 shadow-sm">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.label === activeModule;
              return (
                <button
                  key={item.label}
                  onClick={() => handleModuleChange(item.label)}
                  className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : null}
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1 backdrop-blur lg:hidden">
        {primaryMobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeModule;
            return (
              <button
                key={item.label}
                onClick={() => handleModuleChange(item.label)}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-bold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="max-w-full truncate">{shortMobileLabel(item.label)}</span>
              </button>
            );
          })}
      </nav>
      <main className="min-w-0 pb-20 lg:pb-0">{children}</main>
    </div>
  );
}

function shortMobileLabel(label: string) {
  const labels: Record<string, string> = {
    Dashboard: "Home",
    Financeiro: "Fin.",
    Operacoes: "Ops.",
    Relatorios: "Relat."
  };

  return labels[label] ?? label;
}
