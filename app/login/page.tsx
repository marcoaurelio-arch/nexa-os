"use client";

import { AuthGate } from "@/components/AuthGate";
import { LoginRedirect } from "@/components/LoginRedirect";

export default function LoginPage() {
  return (
    <AuthGate>
      {() => <LoginRedirect />}
    </AuthGate>
  );
}
