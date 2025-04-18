"use client";

import { ReactNode } from "react";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      {children}
    </AuthProvider>
  );
}
