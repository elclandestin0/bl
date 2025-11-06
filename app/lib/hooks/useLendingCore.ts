"use client";

import { useCallback, useState } from "react";
import { getCoreContract } from "../eth/contracts/core";

export function useSubmitBid() {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitBid = useCallback(async (amountUSDC: number, aprPercent: number) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      // to-do: store decimal places in a better location for readability
      const usdc = BigInt(Math.round(amountUSDC * 1_000_000));
      const core = await getCoreContract();
      console.log('wanna submit amount ' + amountUSDC + ' and percentage ' + aprPercent);
      const tx = await core.submitBid(usdc, aprPercent * 100);
      const receipt = await tx.wait();
      console.log('tx submitted. tx: ' + tx);
      setTxHash(receipt?.hash ?? tx.hash);
      return receipt;
    } catch (e: any) {
    console.log(e);
      setError(e?.shortMessage || e?.message || "Submit failed");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submitBid, loading, txHash, error };
}
