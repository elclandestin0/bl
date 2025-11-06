import { Schema, model, models } from "mongoose";

const CheckpointSchema = new Schema({
  key: { type: String, unique: true },   // e.g., "LendingCore:main"
  lastBlock: { type: Number, default: 0 },
});

export default models.Checkpoint || model("Checkpoint", CheckpointSchema);