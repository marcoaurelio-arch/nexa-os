"use client";

import { useEffect } from "react";

export function LoginRedirect() {
  useEffect(() => {
    window.location.replace("/");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="panel max-w-sm p-6 text-center">
        <p className="text-sm font-bold uppercase text-primary">Redirecionando</p>
        <p className="mt-2 text-sm text-muted-foreground">Sessao autenticada. Abrindo o Nexa OS.</p>
      </div>
    </div>
  );
}
