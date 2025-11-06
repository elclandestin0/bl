import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectMongo } from "./lib/db";
import Bid from "./models/Bid";
import Loan from "./models/Loan";
import dotenv from 'dotenv';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));
app.use(express.json());
dotenv.config({ path: "./indexer/.env" });

app.get("/me", async (req, res) => {
  try {
    const address = String(req.query.address || "").toLowerCase();
    if (!address) return res.status(400).json({ error: "address required" });

    const limit = Math.min(Number(req.query.limit || "25"), 100);
    const bidsAfter = Number(req.query.bidsAfter || "0");
    const loansAfter = Number(req.query.loansAfter || "0");

    const [bidsRaw, loansRaw] = await Promise.all([
      Bid.find({ borrower: address, ...(bidsAfter ? { bidId: { $lt: bidsAfter } } : {}) })
        .sort({ bidId: -1 }).limit(limit + 1).lean(),
      Loan.find({ borrower: address, ...(loansAfter ? { loanId: { $lt: loansAfter } } : {}) })
        .sort({ loanId: -1 }).limit(limit + 1).lean(),
    ]);

    const cut = (rows: any[]) => {
      const hasNext = rows.length > limit;
      const data = hasNext ? rows.slice(0, limit) : rows;
      const last = data[data.length - 1];
      return { data, nextCursor: hasNext ? (last?.bidId ?? last?.loanId ?? null) : null };
    };

    res.json({ address, bids: cut(bidsRaw), loans: cut(loansRaw) });
  } catch (e: any) {
    res.status(500).json({ error: e.message || "internal error" });
  }
});

(async () => {
console.log('mongo uri from watcher ' + process.env.MONGODB_URI)
  await connectMongo(process.env.MONGODB_URI!);
  const port = Number(process.env.API_PORT || 4000);
  app.listen(port, () => console.log(`Indexer API running on :${port}`));
})();
