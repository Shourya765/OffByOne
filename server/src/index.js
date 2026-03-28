import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import eventsRoutes from "./routes/events.js";
import userRoutes from "./routes/user.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/events", eventsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

async function main() {
  try {
    await connectDb();
  } catch (e) {
    console.warn("MongoDB connection failed — running with limited features:", e.message);
  }
  app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
}

main();
