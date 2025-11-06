"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../lib/wallet/WalletProvider";
import { useSubmitBid } from "@/app/lib/hooks/useLendingCore";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, decimals = 1) {
  const r = Math.random() * (max - min) + min;
  return Number(r.toFixed(decimals));
}
function formatCurrency(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}


export default function UnderwritePage() {
  const router = useRouter();
  const { address } = useWallet();
  const { submitBid, loading, txHash, error } = useSubmitBid();
  const [recommendedAmount, setRecommendedAmount] = useState<number | null>(null);
  const [recommendedInterest, setRecommendedInterest] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [interest, setInterest] = useState<number | "">("");

  const amountDelta = recommendedAmount && amount ? amount - recommendedAmount : 0;
  const interestDelta = recommendedInterest && interest ? interest - recommendedInterest : 0;


  useEffect(() => {
    setRecommendedAmount(randInt(1000, 20000));
    setRecommendedInterest(randFloat(5, 20, 1));
  }, []);

  useEffect(() => {
    if (recommendedAmount !== null && amount === "") setAmount(recommendedAmount);
    if (recommendedInterest !== null && interest === "") setInterest(recommendedInterest);
  }, [recommendedAmount, recommendedInterest]);

  function adviceMessage() {
    if (!amountValid || !interestValid) return null;

    const amt = amountDelta;
    const apr = interestDelta;

    // Slight wiggle room: ±3%
    const close = Math.abs(amt / recommendedAmount!) < 0.05 && Math.abs(apr / recommendedInterest!) < 0.05;

    if (close) return "Your terms closely match our suggested profile.";

    if (amt > 0 && apr < 0) return "You're asking for more money while offering lower interest — lenders may reject this.";
    if (amt > 0 && apr > 0) return "You’re requesting more than recommended but offering higher interest to offset.";
    if (amt < 0 && apr > 0) return "You're asking for less and offering more interest — this is highly favorable to lenders.";
    if (amt < 0 && apr < 0) return "You're asking for less and offering lower interest — neutral trade-off, depends on borrower strength.";

    return "Adjusting terms affects perceived repayment confidence.";
  }

  function deltaText() {
    if (!amountValid || !interestValid) return null;

    const amt = amount as number;
    const apr = interest as number;

    const amtDiff = amt - (recommendedAmount as number);
    const aprDiff = apr - (recommendedInterest as number);

    const amtWord = amtDiff > 0 ? "above" : amtDiff < 0 ? "below" : "equal to";
    const aprWord = aprDiff > 0 ? "above" : aprDiff < 0 ? "below" : "equal to";

    // absolute values for display
    const absAmtDiff = Math.abs(amtDiff);
    const absAprDiff = Math.abs(aprDiff);

    return `This amount is $${formatCurrency(absAmtDiff)} ${amtWord} the recommended amount and ${absAprDiff.toFixed(1)}% ${aprWord} the recommended interest.`;
  }


  const amountValid = typeof amount === "number" && amount >= 1000 && amount <= 20000;
  const interestValid = typeof interest === "number" && interest >= 5 && interest <= 20;

  const totalRepay = useMemo(() => {
    if (!amountValid || !interestValid) return null;
    return Math.round((amount + amount * (interest / 100)) * 100) / 100;
  }, [amount, interest, amountValid, interestValid]);

  async function handleSubmit() {
    if (!address) return alert("Connect wallet first.");
    if (!amountValid || !interestValid) return;

    try {
      await submitBid(amount as number, interest as number, recommendedAmount as number, recommendedInterest as number);
      alert("Bid submitted! " + (txHash ?? ""));
      router.push("/borrowers");
    } catch {
      // error state already set; optional toast here
    }
  }

  return (
    <div className="min-h-dvh flex items-start justify-center px-6 py-10">
      <div className="w-full max-w-2xl space-y-8">

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold">Your Underwriting</h1>
          <p className="text-[color:var(--color-muted)]">
            This is a starting suggestion. You can revise the terms before submitting.
          </p>
        </div>

        {/* Recommendation Display */}
        <div className="rounded-2xl border p-5 space-y-2">
          <div className="text-sm text-[color:var(--color-muted)]">Suggested Amount</div>
          <div className="text-2xl font-semibold">
            {recommendedAmount ? `$${formatCurrency(recommendedAmount)}` : "—"}
          </div>

          <div className="pt-4 text-sm text-[color:var(--color-muted)]">Suggested Interest</div>
          <div className="text-lg font-medium">
            {recommendedInterest ? `${recommendedInterest}%` : "—"}
          </div>
        </div>

        {/* Editable Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div className="rounded-2xl border p-5 space-y-3">
            <div className="font-semibold">Amount ($)</div>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2"
              value={amount}
              min={1000}
              max={20000}
              onChange={(e) =>
                setAmount(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            {!amountValid && (
              <div className="text-sm text-red-600">Must be between $1,000–$20,000</div>
            )}
          </div>

          <div className="rounded-2xl border p-5 space-y-3">
            <div className="font-semibold">Interest (%)</div>
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2"
              value={interest}
              min={5}
              max={20}
              step={0.1}
              onChange={(e) =>
                setInterest(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            {!interestValid && (
              <div className="text-sm text-red-600">Must be between 5%–20%</div>
            )}
          </div>

        </div>

        {/* Summary */}
        <div className="rounded-2xl border p-5 space-y-2">
          <div className="text-sm text-[color:var(--color-muted)]">Total Repayable</div>
          <div className="text-2xl font-semibold">
            {totalRepay ? `$${formatCurrency(totalRepay)}` : "—"}
          </div>
          {amountValid && interestValid && (
            <div className="text-sm text-[color:var(--color-muted)]">
              ${formatCurrency(amount)} principal • {interest}% APR
            </div>
          )}
          <p className="text-sm leading-relaxed text-[color:var(--color-muted)]">
            <span className="font-medium text-[color:var(--color-foreground)]">Repayment Window:</span>
            All borrowed amounts must be repaid within <span className="font-medium">30 days</span>.
            Late repayment may result in loss of lender confidence and reduced future borrowing limits.
          </p>
          {deltaText() && (
            <p className="text-sm text-[color:var(--color-muted)] border-t pt-3">
              {deltaText()}
            </p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !address || !amountValid || !interestValid}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Submitting…" : "Submit Bid"}
        </button>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
}
