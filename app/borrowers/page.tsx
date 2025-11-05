"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import StepCard from "../components/wallet/StepCard";
import { WalletProvider, useWallet } from "../lib/wallet/WalletProvider";

export default function BorrowerHome() {
  const router = useRouter();
  const { address, connecting, connect } = useWallet();
  const [creditReady, setCreditReady] = useState(false);

  const canProceed = Boolean(address) && creditReady;

  return (
    <div className="min-h-dvh flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center space-y-6">
        <h1 className="text-4xl font-semibold">Borrow</h1>
        <p className="text-[color:var(--color-muted)] text-base leading-relaxed">
          Two quick steps to begin.
        </p>
        <StepCard
          title="Connect your wallet"
          subtitle="We’ll use your address to evaluate on-chain history and disburse funds."
          checked={Boolean(address)}
          onActivate={async () => {
            if (!address && !connecting) await connect();
          }}
          disabled={connecting}
        />
        <StepCard
          title="Upload credit report (PDF)"
          subtitle="Helps improve your offer and terms. Click to continue."
          checked={creditReady}
          onActivate={() => setCreditReady(v => !v)} // later: open file picker here
        />

        <button
          onClick={() => canProceed && router.push("/borrowers/underwrite")}
          disabled={!canProceed}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
