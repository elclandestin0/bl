"use client";

import { useCallback, useState } from "react";
import { getCoreContract } from "@/app/lib/eth/contracts/core";

export function useSubmitBid() {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitBid = useCallback(async (amount: number, apr: number, recommendedAmount: number, recommendedApr: number) => {
    setLoading(true); setError(null); setTxHash(null);
    try {
      const amountFormated = BigInt(Math.round(amount * 1_000_000));
      const recommendedAmountFormatted = BigInt(Math.round(recommendedAmount * 1_000_000));
      const core = await getCoreContract();
      const tx = await core.submitBid(amountFormated, apr * 100, recommendedAmountFormatted, recommendedApr * 100);
      const receipt = await tx.wait();
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
