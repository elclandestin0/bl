import "dotenv/config";
import { getProvider, getCore } from "./lib/eth";
import { connectMongo } from "./lib/db";
import Checkpoint from "./models/Checkpoint";
import { onBidSubmitted, onBidCancelled } from "./handlers/bids";
import { onBidAccepted, onDefaulted, onRepaid } from "./handlers/loans";
import dotenv from 'dotenv';
dotenv.config({ path: "./indexer/.env" });



const RPC = process.env.RPC_URL!;
const CORE = process.env.LENDING_CORE_ADDRESS!;
const MONGO = process.env.MONGODB_URI!;
const CONF = Number(process.env.CONFIRMATIONS || 2);
const START_BLOCK = Number(process.env.START_BLOCK || 0);

async function main() {
  if (!RPC || !CORE || !MONGO) throw new Error("Missing envs");
  await connectMongo(MONGO);

  const provider = getProvider(RPC);
  const core = getCore(provider, CORE);
  const chainId = Number((await provider.getNetwork()).chainId);
  const cpKey = `LendingCore:${chainId}`;

  let cp = await Checkpoint.findOne({ key: cpKey });
  if (!cp) cp = await Checkpoint.create({ key: cpKey, lastBlock: START_BLOCK });

  const latest = await provider.getBlockNumber();
  const toBlock = Math.max(latest - CONF, cp.lastBlock);

  if (toBlock > cp.lastBlock) {
    console.log(`Backfilling ${cp.lastBlock} -> ${toBlock}`);
    await scanRange(core, cp.lastBlock + 1, toBlock);
    cp.lastBlock = toBlock;
    await cp.save();
  }

  provider.on("block", async (bn) => {
    const target = bn - CONF;
    if (target <= cp!.lastBlock) return;
    await scanRange(core, cp!.lastBlock + 1, target);
    cp!.lastBlock = target;
    await cp!.save();
  });

  console.log("Indexer running. Tail with", CONF, "confirmations.");
}

async function scanRange(core: any, from: number, to: number) {
  const filters = [
    core.filters.BidSubmitted(),
    core.filters.BidCancelled(),
    core.filters.BidAccepted(),
    core.filters.Repaid(),
    core.filters.Defaulted(),
  ];

  for (const f of filters) {
    const logs = await core.queryFilter(f, from, to);
    for (const log of logs) {
      const meta = { txHash: log.transactionHash, logIndex: log.index };
      const n = log.fragment.name;

      if (n === "BidSubmitted") {
        // Support both simple and extended event shapes
        const a: any = log.args;
        const payload = {
          bidId: a.bidId,
          borrower: a.borrower,
          amount: a.amount,
          aprBps: a.aprBps,
          recommendedAmount: a.recAmount ?? a.recommendedAmount,
          recommendedApr: a.recAprBps ?? a.recommendedApr,
        };
        await onBidSubmitted(payload, meta);
      } else if (n === "BidCancelled") {
        await onBidCancelled({ bidId: log.args.bidId });
      } else if (n === "BidAccepted") {
        const { bidId, loanId, lender } = log.args;
        await onBidAccepted(
          { bidId, loanId, lender },
          meta,
          () => core.loans(loanId),
          () => core.outstanding(loanId)
        );
      } else if (n === "Repaid") {
        const { loanId, payer, amount, newRepaid, outstanding } = log.args;
        await onRepaid({ loanId, payer, amount, newRepaid, outstanding });
      } else if (n === "Defaulted") {
        const { loanId, timestamp, outstanding } = log.args;
        await onDefaulted({ loanId, timestamp, outstanding });
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
