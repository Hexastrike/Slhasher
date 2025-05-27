import React from "react";

import { Toaster } from "@/components/ui/sonner"

import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";

import { QueryProvider } from "@/context/QueryContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <QueryProvider>
      <div className="min-h-screen flex flex-col">
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col ml-[260px]">
            <Header />
            <main className="flex-1 overflow-auto">
              <div className="container py-6 px-2 max-w-7xl m-auto">
                {children}
              </div>
            </main>
            <Toaster />
          </div>
        </div>
      </div>
    </QueryProvider>
  );
}
