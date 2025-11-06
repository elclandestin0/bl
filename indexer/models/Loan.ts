import { Schema, model, models } from "mongoose";

const LoanSchema = new Schema({
  loanId: { type: Number, index: true, unique: true },
  borrower: { type: String, index: true },
  lender: { type: String, index: true },
  principal: { type: String, required: true },     // raw USDC 6dp
  aprBps: { type: Number, required: true },
  start: { type: Number, required: true },
  due: { type: Number, required: true },
  defaultDate: { type: Number, required: true },
  repaid: { type: String, default: "0" },          // raw USDC 6dp
  settled: { type: Boolean, default: false },
  defaulted: { type: Boolean, default: false },
  outstanding: { type: String, default: "0" },     // cached at last event
  // provenance
  openedByBidId: { type: Number, index: true },
  createdTx: { type: String, index: true },
  createdLogIndex: { type: Number, index: true },
  updatedAt: { type: Date, default: Date.now },
});

LoanSchema.index({ createdTx: 1, createdLogIndex: 1 }, { unique: true });

export default models.Loan || model("Loan", LoanSchema);
