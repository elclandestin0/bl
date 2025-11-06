import Loan from "../models/Loan";

type LogMeta = { txHash: string; logIndex: number };

export async function onBidAccepted(
  args: { bidId: bigint; loanId: bigint; lender: string },
  meta: LogMeta,
  loanRead: () => Promise<{
    borrower: string; lender: string; principal: bigint; aprBps: bigint;
    start: bigint; due: bigint; defaultDate: bigint; repaid: bigint;
    settled: boolean; defaulted: boolean;
  }>,
  outstandingRead: () => Promise<bigint>
) {
  const l = await loanRead();
  const out = await outstandingRead();
  await Loan.updateOne(
    { loanId: Number(args.loanId) },
    {
      $setOnInsert: {
        loanId: Number(args.loanId),
        openedByBidId: Number(args.bidId),
        borrower: l.borrower.toLowerCase(),
        lender: l.lender.toLowerCase(),
        principal: l.principal.toString(),
        aprBps: Number(l.aprBps),
        start: Number(l.start),
        due: Number(l.due),
        defaultDate: Number(l.defaultDate),
        createdTx: meta.txHash,
        createdLogIndex: meta.logIndex,
      },
      $set: {
        repaid: l.repaid.toString(),
        settled: l.settled,
        defaulted: l.defaulted,
        outstanding: out.toString(),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function onRepaid(
  args: { loanId: bigint; payer: string; amount: bigint; newRepaid: bigint; outstanding: bigint }
) {
  await Loan.updateOne(
    { loanId: Number(args.loanId) },
    {
      $set: {
        repaid: args.newRepaid.toString(),
        outstanding: args.outstanding.toString(),
        updatedAt: new Date(),
      },
    }
  );
}

export async function onDefaulted(
  args: { loanId: bigint; timestamp: bigint; outstanding: bigint }
) {
  await Loan.updateOne(
    { loanId: Number(args.loanId) },
    { $set: { defaulted: true, updatedAt: new Date() } }
  );
}
