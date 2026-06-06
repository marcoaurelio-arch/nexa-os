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
  LogOut,
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
import { useEffect, useState } from "react";
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
  onModuleChange,
  userProfileId,
  userName,
  userEmail,
  onSignOut
}: {
  children: ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
  userProfileId?: AccessProfileId;
  userName?: string;
  userEmail?: string;
  onSignOut?: () => Promise<void>;
}) {
  const [profileId, setProfileId] = useState<AccessProfileId>(userProfileId ?? "diretoria");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileLocked = Boolean(userProfileId);
  const allowedModules = modulesForProfile(profileId);
  const visibleNavItems = navItems.filter((item) => allowedModules.includes(item.label));
  const primaryMobileItems = visibleNavItems.filter((item) => ["Dashboard", "BI", "Financeiro", "Operacoes", "Relatorios"].includes(item.label)).slice(0, 5);
  const currentProfile = accessProfiles.find((profile) => profile.id === profileId);

  useEffect(() => {
    if (userProfileId) {
      setProfileId(userProfileId);

      if (!modulesForProfile(userProfileId).includes(activeModule)) {
        onModuleChange("Dashboard");
      }
    }
  }, [activeModule, onModuleChange, userProfileId]);

  function handleProfileChange(nextProfileId: AccessProfileId) {
    if (profileLocked) return;

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
          {profileLocked ? (
            <div className="rounded-lg border border-border bg-background px-3 py-2">
              <div className="text-[10px] font-bold uppercase text-muted-foreground">Usuario</div>
              <div className="mt-1 truncate text-sm font-bold text-primary">{userName ?? "Nexa OS"}</div>
              <div className="truncate text-[11px] text-muted-foreground">{userEmail}</div>
              <div className="mt-2 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                {currentProfile?.label ?? "Perfil"}
              </div>
              {onSignOut ? (
                <button className="mt-2 inline-flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground" onClick={() => void onSignOut()}>
                  <LogOut className="h-3.5 w-3.5" />
                  Sair
                </button>
              ) : null}
            </div>
          ) : (
            <>
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
            </>
          )}
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
          {profileLocked ? (
            <div className="flex items-center gap-2">
              <div className="max-w-[150px] text-right">
                <div className="truncate text-xs font-bold text-primary">{currentProfile?.label}</div>
                <div className="truncate text-[10px] text-muted-foreground">{userEmail}</div>
              </div>
              {onSignOut ? (
                <button
                  type="button"
                  aria-label="Sair"
                  onClick={() => void onSignOut()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-primary"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : (
            <select
              className="control min-w-[138px] text-xs"
              value={profileId}
              onChange={(event) => handleProfileChange(event.target.value as AccessProfileId)}
            >
              {accessProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.label}</option>
              ))}
            </select>
          )}
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
