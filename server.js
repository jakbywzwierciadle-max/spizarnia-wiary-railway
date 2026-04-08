import express from "express";
import path from "path";
import fs from "fs";
import downloadLatest from "./download.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serwowanie statycznych plików (audio + feed.xml)
app.use(express.static(__dirname));

// Endpoint do ręcznego odświeżenia
app.get("/refresh", async (req, res) => {
  try {
    await downloadLatest();
    res.send("Feed refreshed and audio downloaded.");
  } catch (err) {
    console.error("❌ Error refreshing feed:", err);
    res.status(500).send("Error refreshing feed.");
  }
});

// Główny endpoint
app.get("/", (req, res) => {
  const feedPath = path.join(__dirname, "feed.xml");

  if (!fs.existsSync(feedPath)) {
    return res.status(404).send("feed.xml not found");
  }

  res.sendFile(feedPath);
});

// Start serwera
app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`);
  console.log("⏳ Running workflow on startup...");

  downloadLatest().catch((err) => {
    console.error("❌ Startup workflow error:", err);
  });
});

export default app;
