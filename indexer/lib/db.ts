import mongoose from "mongoose";

let cached: typeof mongoose | null = null;

export async function connectMongo(uri: string) {
  if (cached) return cached;
  mongoose.set("strictQuery", true);
  console.log('uri ', uri);
  await mongoose.connect(uri, { dbName: "bl" });
  cached = mongoose;
  return mongoose;
}
