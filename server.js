import express from "express";
import { chromium } from "playwright";
import { generateFeed } from "./feed.js";
import { cleanupOldFiles } from "./cleanup.js";
import fs from "fs";
import { execSync } from "child_process";

const app = express();
app.use("/audio", express.static("audio"));
app.use("/public", express.static("public"));

const CHANNEL_ID = "UCO6_hwMtQZ0SLElfDMaqJGQ";

async function fetchLatestVideos() {
  console.log("Launching Chrome…");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(`https://www.youtube.com/channel/${CHANNEL_ID}/videos`);
  await page.waitForTimeout(3000);

  const videoIds = await page.$$eval("a#thumbnail", els =>
    els
      .map(e => e.href)
      .filter(h => h.includes("watch"))
      .map(h => new URL(h).searchParams.get("v"))
      .filter(Boolean)
      .slice(0, 2)
  );

  await browser.close();

  if (!fs.existsSync("audio")) fs.mkdirSync("audio");

  for (const id of videoIds) {
    const out = `audio/${id}.mp3`;
    if (fs.existsSync(out)) continue;

    console.log("Downloading:", id);
    execSync(
      `yt-dlp --extract-audio --audio-format mp3 --audio-quality 0 -o "${out}" "https://www.youtube.com/watch?v=${id}"`,
      { stdio: "inherit" }
    );
  }

  // --- FIX FOR RAILWAY DEPLOYMENT ---

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});


  generateFeed(videoIds);
  cleanupOldFiles();
}

app.get("/feed.xml", (req, res) => {
  res.sendFile(process.cwd() + "/feed.xml");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));

if (process.argv.includes("--cron")) {
  fetchLatestVideos();
}
