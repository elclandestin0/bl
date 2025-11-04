"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type WalletContextValue = {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // restore cached address
  useEffect(() => {
    const cached = localStorage.getItem("walletAddr");
    if (cached) setAddress(cached);
  }, []);

  // subscribe to wallet events (EIP-1193)
  useEffect(() => {
    const eth = (window as any)?.ethereum;
    if (!eth?.on) return;

    const onAccounts = (accounts: string[]) => {
      const next = accounts?.[0] ?? null;
      setAddress(next);
      if (next) localStorage.setItem("walletAddr", next);
      else localStorage.removeItem("walletAddr");
    };

    eth.on("accountsChanged", onAccounts);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any)?.ethereum;
    if (!eth) {
      alert("No wallet detected. Install MetaMask or a compatible wallet.");
      return;
    }
    try {
      setConnecting(true);
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      const addr = accounts?.[0] ?? null;
      setAddress(addr);
      if (addr) localStorage.setItem("walletAddr", addr);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    localStorage.removeItem("walletAddr");
  }, []);

  const value = useMemo(() => ({ address, connecting, connect, disconnect }), [address, connecting, connect, disconnect]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

export function truncate(addr?: string | null) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}
