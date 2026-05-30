"use client";

import {
  AreaChart,
  Banknote,
  BarChart3,
  Building2,
  ClipboardList,
  FileText,
  Gavel,
  Home,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Settings,
  Store,
  Users,
  Wrench,
  Zap
} from "lucide-react";
import type { ReactNode } from "react";

export const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Empreendimentos", icon: Building2 },
  { label: "Lojas", icon: Store },
  { label: "Lojistas", icon: Users },
  { label: "Contratos", icon: FileText },
  { label: "Financeiro", icon: Banknote },
  { label: "Inadimplencia", icon: Receipt },
  { label: "Condominio", icon: Home },
  { label: "Fundo", icon: Megaphone },
  { label: "FPP", icon: AreaChart },
  { label: "Comercial", icon: BarChart3 },
  { label: "Operacoes", icon: Wrench },
  { label: "Energia e Agua", icon: Zap },
  { label: "Documentos", icon: ClipboardList },
  { label: "Juridico", icon: Gavel },
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
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeModule;
            return (
              <button
                key={item.label}
                onClick={() => onModuleChange(item.label)}
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
      <header className="border-b border-border bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <img
            src="/nexa-malls-logo.png"
            alt="Nexa Malls"
            className="h-8 w-[142px] object-contain object-left"
          />
          <div className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase text-primary">
            Nexa OS
          </div>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.label === activeModule;
            return (
              <button
                key={item.label}
                onClick={() => onModuleChange(item.label)}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </header>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
