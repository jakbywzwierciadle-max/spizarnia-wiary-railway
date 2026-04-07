import express from "express";
import fs from "fs";
import path from "path";
import cron from "node-cron";
import { fileURLToPath } from "url";
import generateFeed from "./feed.js";
import cleanup from "./cleanup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- STATIC FILES (feed.xml, audio, etc.) ---
app.use(express.static(path.join(__dirname)));

// --- HOME PAGE ---
app.get("/", (req, res) => {
  res.send("Spiżarnia Wiary działa");
});

// --- FEED ENDPOINT ---
app.get("/feed", (req, res) => {
  const feedPath = path.join(__dirname, "feed.xml");

  if (!fs.existsSync(feedPath)) {
    return res.status(404).send("Feed not generated yet");
  }

  res.sendFile(feedPath);
});

// --- CRON: GENERATE FEED EVERY 30 MINUTES ---
cron.schedule("*/30 * * * *", async () => {
  console.log("⏳ Generating feed...");
  try {
    await generateFeed();
    console.log("✅ Feed generated");
  } catch (err) {
    console.error("❌ Feed generation error:", err);
  }
});

// --- CRON: CLEANUP OLD FILES EVERY NIGHT ---
cron.schedule("0 3 * * *", async () => {
  console.log("🧹 Running cleanup...");
  try {
    await cleanup();
    console.log("🧼 Cleanup done");
  } catch (err) {
    console.error("❌ Cleanup error:", err);
  }
});

// --- START SERVER (Railway-compatible) ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
