"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoreContract } from "@/app/lib/eth/contracts/core";
import { Bid } from "@/app/lib/types/structs";


type UiBid = {
    id: number;
    borrower: string;
    amount: number;
    aprPercent: number;
    open: boolean;
};

// Output to UI
function format(id: number, b: Bid): UiBid {
    return {
        id,
        borrower: b.borrower,
        amount: Number(b.amount) / 1_000_000, // USDC 6dp -> $
        aprPercent: Number(b.aprBps) / 100,       // bps -> %
        open: b.open,
    };
}

export default function BidsAccordion({ borrower }: { borrower?: string | null }) {
    const router = useRouter();
    const [rows, setRows] = useState<UiBid[]>([]);
    const [loading, setLoading] = useState(false);

    const normalized = useMemo(() => (borrower ?? "").toLowerCase(), [borrower]);

    useEffect(() => {
        let cancel = false;
        async function load() {
            if (!normalized) { setRows([]); return; }
            setLoading(true);
            try {
                const core = await getCoreContract();
                const next = Number(await core.nextBidId());
                if (next <= 1) { if (!cancel) setRows([]); return; }

                const ids = Array.from({ length: next - 1 }, (_, i) => i + 1);
                const all = await Promise.all(ids.map((id) => core.bids(id))); // BidOut[]
                const mine = all
                    .map((b, i) => format(ids[i], b))
                    .filter((b) => b.borrower.toLowerCase() === normalized)
                    .reverse(); // newest first
                if (!cancel) setRows(mine);
            } catch (e) {
                console.error(e);
                if (!cancel) setRows([]);
            } finally {
                if (!cancel) setLoading(false);
            }
        }
        load();
        return () => { cancel = true; };
    }, [normalized]);

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Your bids</h2>
                <button
                    className="btn btn-outline"
                    onClick={async () => {
                        // manual refresh
                        const core = await getCoreContract();
                        const next = Number(await core.nextBidId());
                        const ids = Array.from({ length: Math.max(0, next - 1) }, (_, i) => i + 1);
                        const all = await Promise.all(ids.map((id) => core.bids(id)));
                        const mine = all
                            .map((b, i) => format(ids[i], b))
                            .filter((b) => b.borrower.toLowerCase() === normalized)
                            .reverse();
                        setRows(mine);
                    }}
                >
                    Refresh
                </button>
            </div>

            {/* Special top item: Create new bid */}
            <div className="rounded-2xl border-2 border-dotted">
                <button
                    onClick={() => router.push("/borrowers/new")}
                    className="w-full text-left px-4 py-3 flex items-center justify-between"
                >
                    <div>
                        <div className="font-semibold">Create new bid</div>
                        <div className="text-sm text-[color:var(--color-muted)]">
                            Start a new borrowing request
                        </div>
                    </div>
                    <span className="text-sm">→</span>
                </button>
            </div>

            {/* Bids accordion */}
            {loading ? (
                <div className="rounded-2xl border px-4 py-6 text-center text-[color:var(--color-muted)]">
                    Loading…
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-2xl border px-4 py-6 text-center text-[color:var(--color-muted)]">
                    No bids yet. Use “Create new bid” to begin.
                </div>
            ) : (
                <div className="space-y-3">
                    {rows.map((b) => (
                        <details key={b.id} className="rounded-2xl border">
                            <summary className="cursor-pointer px-4 py-3 grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-3 font-medium">Bid #{b.id}</div>
                                <div className="col-span-3">${b.amount.toLocaleString()}</div>
                                <div className="col-span-3">{b.aprPercent}% APR</div>
                                <div className="col-span-3 text-right">
                                    <span
                                        className={`inline-block text-xs px-2 py-0.5 rounded-md border ${b.open ? "border-yellow-500 text-yellow-700" : "border-blue-600 text-blue-700"
                                            }`}
                                    >
                                        {b.open ? "PENDING" : "CLOSED"}
                                    </span>
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
            )}
        </section>
    );
}
