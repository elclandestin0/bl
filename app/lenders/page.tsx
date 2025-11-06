// app/borrowers/page.tsx (your BorrowerHome)
"use client";
import { useWallet } from "../lib/wallet/WalletProvider";
import OpenBidsAccordion from "./components/OpenBidsAccordion";

export default function BorrowerHome() {
  const { address } = useWallet();

  return (
    <div className="min-h-dvh flex items-start justify-center px-6 py-10">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold">Lend</h1>
          <p className="text-[color:var(--color-muted)] text-base leading-relaxed">
            Make some stuff on people's things.
          </p>
        </div>
        <OpenBidsAccordion />
      </div>
    </div>
  );
}
