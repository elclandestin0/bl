"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoreContract } from "@/app/lib/eth/contracts/core";
import { Bid } from "@/app/lib/types/structs";

type UiBid = {
    id: number;
    borrower: string;
    amount: number;
    recommendedAmount: number;
    aprPercent: number;
    recommendedAprPercent: number;
    open: boolean;
};

// Output to UI
function format(id: number, b: Bid): UiBid {
    return {
        id,
        borrower: b.borrower,
        amount: Number(b.amount) / 1_000_000,
        aprPercent: Number(b.aprBps) / 100,
        recommendedAmount: Number(b.recommendedAmount) / 1_000_000,
        recommendedAprPercent: Number(b.recommendedAprBps) / 100,
        open: b.open,
    };
}

export default function OpenBidsAccordion() {
    const router = useRouter();
    const [rows, setRows] = useState<UiBid[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancel = false;
        async function load() {
            setLoading(true);
            try {
                const core = await getCoreContract();
                const next = Number(await core.nextBidId());
                if (next <= 1) { if (!cancel) setRows([]); return; }

                const ids = Array.from({ length: next - 1 }, (_, i) => i + 1);
                const all = await Promise.all(ids.map((id) => core.bids(id))); // BidOut[]
                const allFormatted = all.map((b, i) => format(ids[i], b));
                setRows(allFormatted);
            } catch (e) {
                console.error(e);
                if (!cancel) setRows([]);
            } finally {
                if (!cancel) setLoading(false);
            }
        }
        load();
        return () => { cancel = true; };
    }, []);

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">All bids</h2>
                {/* <button
                    className="btn btn-outline"
                    onClick={async () => {
                        const core = await getCoreContract();
                        const next = Number(await core.nextBidId());
                        const ids = Array.from({ length: Math.max(0, next - 1) }, (_, i) => i + 1);
                        const all = await Promise.all(ids.map((id) => core.bids(id)));
                        const allFormatted = all.map((b, i) => format(ids[i], b));
                        setRows(allFormatted);
                    }}
                >
                    Refresh
                </button> */}
            </div>

            {loading ? (
                <div className="rounded-2xl border px-4 py-6 text-center text-[color:var(--color-muted)]">
                    Loading…
                </div>
            ) : (
                <>
                    <div
                        className="px-4 py-2 grid grid-cols-12 gap-2 items-center text-xs uppercase tracking-wide text-[color:var(--color-muted)]"
                        aria-hidden
                    >
                        <div className="col-span-2">Bid</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-2">APR</div>
                        <div className="col-span-2">Rec. Amount</div>
                        <div className="col-span-2">Rec. APR</div>
                    </div>

                    <div className="space-y-3">
                        {rows.map((b) => (
                            <details key={b.id} className="rounded-2xl border">
                                <summary className="cursor-pointer px-4 py-3 grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-2 font-medium">Bid #{b.id}</div>
                                    <div className="col-span-2">
                                        ${b.amount.toLocaleString()}
                                    </div>
                                    <div className="col-span-2">{b.aprPercent}% APR</div>
                                    <div className="col-span-2">
                                        ${b.recommendedAmount.toLocaleString()}
                                    </div>
                                    <div className="col-span-2">{b.recommendedAprPercent}% Rec. APR</div>
                                    <div className="col-span-2 text-right">
                                        {b.open ? (
                                            <button
                                                className="btn-accordion"
                                                onClick={(e) => {
                                                    e.preventDefault(); // prevent <details> toggle
                                                    router.push(`/lenders/review/${b.id}`);
                                                }}
                                                aria-label={`Review terms for bid #${b.id}`}
                                            >
                                                Review
                                            </button>
                                        ) : (
                                            <span className="inline-block text-xs px-2 py-0.5 rounded-md border border-blue-600 text-blue-700">
                                                Closed
                                            </span>
                                        )}
                                    </div>
                                </summary>
                                <div className="px-4 pb-4">
                                    <div className="rounded-xl border p-3 text-sm">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <div className="text-[color:var(--color-muted)]">Borrower</div>
                                                <div className="font-mono break-all">{b.borrower}</div>
                                            </div>
                                            <div>
                                                <div className="text-[color:var(--color-muted)]">Amount</div>
                                                <div>${b.amount.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-[color:var(--color-muted)]">APR</div>
                                                <div>{b.aprPercent}%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
