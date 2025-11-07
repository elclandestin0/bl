"use client";

import { useEffect, useMemo, useState } from "react";
import { getCoreContract } from "@/app/lib/eth/contracts/core";
import { Loan } from "@/app/lib/types/structs";
import { truncate } from "@/app/lib/wallet/WalletProvider";

type UiLoan = {
  id: number;
  borrower: string;
  lender: string;
  principalEuro: number;
  aprPercent: number;
  start: number;
  due: number;
  defaultDate: number;
  repaidEuro: number;
  settled: boolean;
  defaulted: boolean;
  status: "ACTIVE" | "LATE" | "SETTLED" | "DEFAULTED";
  outstanding: number;
};

function fmt0(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function chip(status: UiLoan["status"]) {
  const m: Record<UiLoan["status"], string> = {
    ACTIVE: "border-blue-600 text-blue-700",
    LATE: "border-orange-600 text-orange-700",
    SETTLED: "border-green-600 text-green-700",
    DEFAULTED: "border-red-600 text-red-700",
  };
  return `inline-block text-xs px-2 py-0.5 rounded-md border ${m[status]}`;
}

function statusFromCode(code: number): UiLoan["status"] {
  // 0 ACTIVE, 1 LATE, 2 SETTLED, 3 DEFAULTED
  if (code === 1) return "LATE";
  if (code === 2) return "SETTLED";
  if (code === 3) return "DEFAULTED";
  return "ACTIVE";
}

function toUi(id: number, l: Loan, statusCode: bigint, outstanding: bigint): UiLoan {
  return {
    id,
    borrower: l.borrower,
    lender: l.lender,
    principalEuro: Number(l.principal) / 1_000_000,
    aprPercent: Number(l.aprBps) / 100,
    start: Number(l.start),
    due: Number(l.due),
    defaultDate: Number(l.defaultDate),
    repaidEuro: Number(l.repaid) / 1_000_000,
    settled: l.settled,
    defaulted: l.defaulted,
    status: statusFromCode(Number(statusCode)),
    outstanding: Number(outstanding) / 1_000_000,
  };
}

export default function ActiveLoansAccordion({ lender }: { lender?: string | null }) {
  const [rows, setRows] = useState<UiLoan[]>([]);
  const [loading, setLoading] = useState(false);
  const normalized = useMemo(() => (lender ?? "").toLowerCase(), [lender]);

  async function load() {
    if (!normalized) { setRows([]); return; }
    setLoading(true);
    try {
      const core = await getCoreContract();
      const next = Number(await core.nextLoanId());
      if (next <= 1) { setRows([]); return; }

      const ids = Array.from({ length: next - 1 }, (_, i) => i + 1);
      // Read all loans, then per-loan status + outstanding
      const loanStructs = await Promise.all(ids.map((id) => core.loans(id)));
      const statuses = await Promise.all(ids.map((id) => core.status(id)));
      const outs = await Promise.all(ids.map((id) => core.outstanding(id)));

      const mine = loanStructs
        .map((l, i) => toUi(ids[i], l, statuses[i], outs[i]))
        .filter((u) => u.lender.toLowerCase() === normalized)
        .sort((a, b) => b.start - a.start);

      setRows(mine);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancel = false;
    (async () => { if (!cancel) await load(); })();
    return () => { cancel = true; };
  }, [normalized]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your loans</h2>
      </div>

      {loading ? (
        <div className="rounded-2xl border px-4 py-6 text-center text-[color:var(--color-muted)]">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border px-4 py-6 text-center text-[color:var(--color-muted)]">
          {'Accept a bid to see it here!'}
        </div>
      ) : (
        <>
          <div
            className="px-4 py-2 grid grid-cols-12 gap-2 items-center text-xs uppercase tracking-wide text-[color:var(--color-muted)]"
            aria-hidden
          >
            <div className="col-span-3">Bid</div>
            <div className="col-span-3">Amount</div>
            <div className="col-span-3">APR</div>
          </div>
          <div className="space-y-3">
            {rows.map((l) => (
              <details key={l.id} className="rounded-2xl border">
                <summary className="cursor-pointer px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 font-medium">Loan #{l.id}</div>
                  <div className="col-span-3">${fmt0(l.principalEuro)}</div>
                  <div className="col-span-3">{l.aprPercent}% APR</div>
                  <div className="col-span-3 text-right">
                    <span className={chip(l.status)}>{l.status}</span>
                  </div>
                </summary>
                <div className="px-4 pb-4">
                  <div className="rounded-xl border p-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-[color:var(--color-muted)]">Borrower</div>
                        <div className="font-mono break-all">{truncate(l.borrower)}</div>
                      </div>
                      <div>
                        <div className="text-[color:var(--color-muted)]">Lender</div>
                        <div className="font-mono break-all">{truncate(l.lender)}</div>
                      </div>
                      <div>
                        <div className="text-[color:var(--color-muted)]">Outstanding</div>
                        <div>${fmt0(l.outstanding)}</div>
                      </div>
                      <div>
                        <div className="text-[color:var(--color-muted)]">Repaid</div>
                        <div>${fmt0(l.repaidEuro)}</div>
                      </div>
                      <div>
                        <div className="text-[color:var(--color-muted)]">Due date</div>
                        <div>{new Date(l.due * 1000).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[color:var(--color-muted)]">Default date</div>
                        <div>{new Date(l.defaultDate * 1000).toLocaleString()}</div>
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
