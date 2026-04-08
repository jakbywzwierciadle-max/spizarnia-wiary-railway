const express = require("express");
const path = require("path");
const fs = require("fs");
const downloadLatest = require("./download.js");

const app = express();
const PORT = process.env.PORT || 8080;

// Serwowanie statycznych plików (audio + feed.xml)
app.use(express.static(path.join(__dirname)));

// Endpoint do ręcznego wywołania pobierania
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

module.exports = app;
