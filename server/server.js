import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { connectDB } from "./configs/db.js";
import { connectCloudinary } from "./configs/cloudinary.js";
import { checkEnv } from "./configs/checkEnv.js";

import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const port = process.env.PORT || 4000;

checkEnv();

const dbState = { ready: false, error: null };
connectDB().then(
  () => { dbState.ready = true; },
  (err) => { dbState.error = err?.message || String(err); }
);
connectCloudinary();

const allowedOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (origin.endsWith(".vercel.app")) return cb(null, true);
    return cb(new Error("CORS: origin not allowed: " + origin), false);
  },
  credentials: true,
};

app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({
    name: "rawrenks-api",
    version: "0.1.0",
    status: "ok",
    docs: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
    db: dbState.ready ? "connected" : (dbState.error ? "error" : "connecting"),
    dbError: dbState.error,
  });
});

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found: " + req.method + " " + req.url });
});

app.use((err, req, res, _next) => {
  console.error("[error]", err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Internal server error" });
});

const server = createServer(app);

const io = new SocketIOServer(server, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true },
});
app.set("io", io);
io.on("connection", (socket) => {
  console.log("[socket] connected:", socket.id);
  socket.on("disconnect", () => console.log("[socket] disconnected:", socket.id));
});

if (process.env.NODE_ENV !== "production" || process.env.RENDER) {
  server.listen(port, () => {
    console.log(`[boot] rawrenks-api listening on http://localhost:${port}`);
  });
}

export default app;
