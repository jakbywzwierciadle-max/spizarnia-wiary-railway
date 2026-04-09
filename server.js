import express from "express";
import { downloadLatest } from "./download.js";
import generateFeed from "./feed.js";   // ← TU JEST POPRAWKA

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  res.send("Spizarnia Wiary RSS is running");
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on ${PORT}`);
  console.log("⏳ Running workflow on startup...");

  try {
    await downloadLatest();
    await generateFeed();
    console.log("✅ Workflow completed");
  } catch (err) {
    console.error("❌ Workflow error:", err);
  }
});
