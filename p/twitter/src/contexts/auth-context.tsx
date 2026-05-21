"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  requireAuth: (action?: () => void) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const requireAuth = useCallback(
    (action?: () => void) => {
      if (isLoggedIn) {
        action?.();
        return;
      }
      setAuthModalOpen(true);
    },
    [isLoggedIn]
  );

  const value = useMemo(
    () => ({
      isLoggedIn,
      setIsLoggedIn,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      requireAuth,
    }),
    [isLoggedIn, authModalOpen, openAuthModal, closeAuthModal, requireAuth]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
