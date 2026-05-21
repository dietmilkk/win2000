"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { AuthModal } from "./AuthModal";
import { MobileNav } from "./MobileNav";

type XShellProps = {
  children: ReactNode;
};

export function XShell({ children }: XShellProps) {
  return (
    <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1265px] justify-center overflow-x-hidden px-0 sm:px-2 lg:px-4">
      <Sidebar />
      <main className="flex min-h-[100dvh] min-w-0 flex-1 justify-center pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:justify-start lg:pb-0">
        {children}
      </main>
      <RightSidebar />
      <MobileNav />
      <AuthModal />
    </div>
  );
}
