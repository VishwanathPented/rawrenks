import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.startsWith("FILL_ME")) {
    console.warn("[db] MONGODB_URI not set — DB connection skipped. Fill server/.env and restart.");
    throw new Error("MONGODB_URI missing");
  }

  mongoose.connection.on("connected", () => console.log("[db] connected"));
  mongoose.connection.on("error", (e) => console.error("[db] error:", e.message));
  mongoose.connection.on("disconnected", () => console.warn("[db] disconnected"));

  await mongoose.connect(`${uri}/Rawrenks`, {
    serverSelectionTimeoutMS: 8000,
  });
}
