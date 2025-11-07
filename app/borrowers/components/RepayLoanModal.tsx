// app/components/loans/RepayLoanModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { ADDRESSES } from "@/app/lib/eth/contracts/addresses";
import { getCoreContract, getUsdcContract } from "@/app/lib/eth/contracts/core";
import { getChainId } from "@/app/lib/eth/provider";
import { useWallet } from "@/app/lib/wallet/WalletProvider";

function toUSDC(n6: bigint) { return Number(n6) / 1_000_000; }
function to6(amount: number) { return BigInt(Math.round(amount * 1_000_000)); }

export default function RepayLoanModal({
  loanId,
  onClose,
}: {
  loanId: number;
  onClose: () => void;
}) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [min6, setMin6] = useState<bigint>(BigInt(0));
  const [out6, setOut6] = useState<bigint>(BigInt(0));
  const [amount, setAmount] = useState<number | "">("");

  const min = useMemo(() => toUSDC(min6), [min6]);
  const out = useMemo(() => toUSDC(out6), [out6]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const core = await getCoreContract(); // read
        const [min, out] = await Promise.all([
          core.minimumPayment(loanId),
          core.outstanding(loanId),
        ]);
        if (cancel) return;
        setMin6(min);
        setOut6(out);
        setAmount(min === BigInt(0) ? toUSDC(out) : toUSDC(min)); // default to min (or close if min=0)
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancel = true; };
  }, [loanId]);

  const withinBounds =
    typeof amount === "number" &&
    amount >= min &&
    amount <= out &&
    amount > 0;

  async function repay() {
    if (!address) return alert("Connect wallet first");
    if (!withinBounds) return;

    setLoading(true);
    try {
      const [core, usdc] = await Promise.all([getCoreContract(), getUsdcContract()]);
      const chainId = (await getChainId()) as keyof typeof ADDRESSES;
      const LENDING_CORE_ADDRESS = ADDRESSES[chainId]?.LendingCore;
      if (!LENDING_CORE_ADDRESS) throw new Error("Core address missing for this chain");

      const amt6 = to6(amount as number);

      // 1) Approve USDC to Core
      const approveTx = await usdc.approve(LENDING_CORE_ADDRESS, amt6);
      await approveTx.wait();

      // 2) Repay
      const tx = await core.repay(loanId, amt6);
      await tx.wait();

      onClose();
    } catch (e) {
      console.error(e);
      alert("Repayment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Repay Loan #{loanId}</h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">Minimum payment (today)</span>
            <span>${min.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted)]">Outstanding</span>
            <span>${min.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount to repay ($)</label>
          <input
            type="number"
            min={min}
            max={min}
            step="0.01"
            value={amount}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : Number(e.target.value);
              setAmount(v);
            }}
            className="w-full rounded-lg border px-3 py-2"
          />
          {!withinBounds && (
            <p className="text-xs text-red-600">
              Enter between ${min.toLocaleString()} and ${min.toLocaleString()}.
            </p>
          )}
          {withinBounds && (
            <p className="text-xs text-[color:var(--color-muted)]">
              You can always close the loan by paying the full outstanding.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn btn-outline" disabled={loading}>Close</button>
          <button onClick={repay} className="btn btn-primary" disabled={loading || !withinBounds}>
            {loading ? "Processing…" : "Repay"}
          </button>
        </div>
      </div>
    </div>
  );
}
