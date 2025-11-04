// app/borrowers/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { truncate, useWallet } from "../lib/wallet/WalletProvider";


export default function BorrowerHome() {
  const router = useRouter();
  const { address, connecting, connect } = useWallet();
  const [confirmReady, setConfirmReady] = useState(false);

  const bothDone = useMemo(() => Boolean(address) && confirmReady, [address, confirmReady]);

  function handleContinue() {
    if (!bothDone) return;
    router.push("/borrowers/underwrite");
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-semibold">Borrow</h1>
        <p className="text-[color:var(--color-muted)] text-base leading-relaxed">
          Two quick steps to begin. No forms yet — just readiness checks.
        </p>

        <button
          onClick={connect}
          disabled={Boolean(address)}
          className={`
    group w-full text-left rounded-2xl border p-5 transition
    ${address ? "bg-[color:var(--color-accent)]/20 border-[color:var(--color-accent)]"
              : "hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent)]/10"}
  `}
        >

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`
          size-6 rounded-md grid place-items-center text-white
          ${address ? "bg-[color:var(--color-accent)]" : "bg-[color:var(--color-muted)]"}
        `}
              >
                {address ? "✔" : ""}
              </div>

              <div>
                <h3 className="text-lg font-semibold">Connect your wallet</h3>
                <p className="text-sm text-[color:var(--color-muted)] mt-1">
                  We’ll use your address to evaluate on-chain history and disburse funds.
                </p>
              </div>
            </div>

            {address && (
              <span className="text-sm text-[color:var(--color-muted)]">
                {truncate(address)}
              </span>
            )}
          </div>

        </button>


        {/* Step 2 */}
        <div className="rounded-2xl border p-5 text-left">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmReady}
              onChange={(e) => setConfirmReady(e.target.checked)}
              className="mt-1 size-5 accent-[color:var(--color-accent)]"
            />
            <div>
              <h3 className="text-lg font-semibold">I’m ready to proceed</h3>
              <p className="text-sm text-[color:var(--color-muted)] mt-1">
                I’ll provide any required documents on the next step and review terms carefully.
              </p>
            </div>
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!bothDone}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>

        <p className="text-sm text-[color:var(--color-muted)]">
          You’ll see your suggested amount and terms after these checks.
        </p>
      </div>
    </div>
  );
}
