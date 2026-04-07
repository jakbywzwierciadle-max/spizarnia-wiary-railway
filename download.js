import { chromium } from "playwright";
import ytdlp from "yt-dlp-exec";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = __dirname;

// 🔥 Twój kanał YouTube
const CHANNEL_URL = "https://www.youtube.com/@spizarniawiary/videos";

export default async function downloadLatest() {
  console.log("🎧 Checking YouTube channel...");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(CHANNEL_URL, { waitUntil: "networkidle" });

  // Pobierz link do najnowszego filmu
  const videoUrl = await page.evaluate(() => {
    const el = document.querySelector("a#video-title");
    return el ? "https://www.youtube.com" + el.getAttribute("href") : null;
  });

  await browser.close();

  if (!videoUrl) {
    console.log("⚠️ No video found.");
    return;
  }

  console.log("🎬 Latest video:", videoUrl);

  // Pobierz audio
  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  console.log("⬇️ Downloading audio...");

  await ytdlp(videoUrl, {
    extractAudio: true,
    audioFormat: "mp3",
    output
  });

  console.log("✅ Audio downloaded.");
}
