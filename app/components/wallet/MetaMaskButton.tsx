"use client";

import { useWallet, truncate } from "../../lib/wallet/WalletProvider";

export default function MetaMaskButton() {
  const { address, connecting, connect, disconnect } = useWallet();

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="btn btn-primary h-10 px-4"
        aria-label="Connect Wallet"
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-[color:var(--color-muted)]">{truncate(address)}</span>
      <button onClick={disconnect} className="btn btn-outline h-10 px-3">
        Disconnect
      </button>
    </div>
  );
}
