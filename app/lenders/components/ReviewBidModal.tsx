"use client";

import { getCoreContract } from "@/app/lib/eth/contracts/core";
import { useWallet } from "@/app/lib/wallet/WalletProvider";
import { useState } from "react";

export default function ReviewBidModal({
  bid,
  onClose,
}: {
  bid: {
    id: number;
    borrower: string;
    amount: number;
    aprPercent: number;
    recommendedAmount: number;
    recommendedAprPercent: number;
    open: boolean;
  };
  onClose: () => void;
}) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);

  async function acceptBid() {
    try {
      if (!address) return alert("Connect wallet first");
      setLoading(true);

      const core = await getCoreContract(); // signer mode
      const tx = await core.acceptBid(bid.id);
      await tx.wait();

      onClose();
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-6 animate-fadeIn">
        <h2 className="text-2xl font-semibold">
          Review Bid #{bid.id}
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">Borrower</span>
            <span className="font-mono">{bid.borrower}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">Requested Amount</span>
            <span>€{bid.amount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">APR</span>
            <span>{bid.aprPercent}%</span>
          </div>

          <hr className="opacity-30" />

          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">Recommended Amount</span>
            <span>€{bid.recommendedAmount.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">Recommended APR</span>
            <span>{bid.recommendedAprPercent}%</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={loading}
          >
            Close
          </button>

          <button
            onClick={acceptBid}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Processing…" : "Accept Bid"}
          </button>
        </div>

      </div>
    </div>
  );
}
