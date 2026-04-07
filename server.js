import express from "express";
import cron from "node-cron";
import downloadLatest from "./download.js";
import generateFeed from "./feed.js";
import cleanup from "./cleanup.js";

const app = express();

app.get("/", (req, res) => res.send("Spiżarnia Wiary działa"));

app.get("/run", async (req, res) => {
  try {
    console.log("🚀 Manual workflow trigger");
    await downloadLatest();
    await generateFeed();
    res.send("Workflow done");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

// 🔥 URUCHOMIENIE WORKFLOW OD RAZU PO STARCIU
(async () => {
  console.log("⏳ Running workflow on startup...");
  await downloadLatest();
  await generateFeed();
})();

// Cron co 30 minut
cron.schedule("*/30 * * * *", async () => {
  console.log("⏳ Running workflow...");
  await downloadLatest();
  await generateFeed();
  console.log("🚀 Workflow done.");
});

// Cleanup o 3:00
cron.schedule("0 3 * * *", async () => {
  await cleanup();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on ${PORT}`));
