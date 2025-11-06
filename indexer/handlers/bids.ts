import Bid from "../models/Bid";

type LogMeta = { txHash: string; logIndex: number };

export async function onBidSubmitted(
  args: { bidId: bigint; borrower: string; amount: bigint; aprBps: bigint, recommendedAmount: bigint, recommendedApr: bigint },
  meta: LogMeta
) {
  const { bidId, borrower, amount, aprBps, recommendedAmount, recommendedApr } = args;
  console.log('About to create one... ' + args);
  await Bid.create(
    { bidId: Number(bidId) },
    {
      $setOnInsert: {
        bidId: Number(bidId),
        borrower: borrower.toLowerCase(),
        amount: amount.toString(),
        aprBps: Number(aprBps),
        recommendedAmount: recommendedAmount.toString(),
        recommendedApr: recommendedApr.toString(),
        open: true,
        createdTx: meta.txHash,
        createdLogIndex: meta.logIndex,
      },
    },
    { upsert: true }
  );
}

export async function onBidCancelled(args: { bidId: bigint }) {
  await Bid.updateOne({ bidId: Number(args.bidId) }, { $set: { open: false } });
}
