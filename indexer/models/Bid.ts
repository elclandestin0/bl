import { Schema, model, models } from "mongoose";

const BidSchema = new Schema({
  bidId: { type: Number, index: true, unique: true },
  borrower: { type: String, index: true },
  amount: { type: String, required: true },
  aprBps: { type: Number, required: true },
  open: { type: Boolean, default: true },
  recAmount: { type: String },
  recAprBps: { type: Number },
  createdTx: { type: String, index: true },
  createdLogIndex: { type: Number, index: true },
  createdAt: { type: Date, default: Date.now },
});

BidSchema.index({ createdTx: 1, createdLogIndex: 1 }, { unique: true });

export default models.Bid || model("Bid", BidSchema);
