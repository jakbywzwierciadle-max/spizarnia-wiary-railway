import { chromium } from "playwright";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = __dirname;
const CHANNEL_URL = "https://www.youtube.com/@spizarniawiary/videos";

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}

export default async function downloadLatest() {
  console.log("🎧 Checking YouTube channel...");

  const browser = await chromium.launch({
    args: ["--no-sandbox"]
  });

  const page = await browser.newPage();

  await page.goto(CHANNEL_URL, { waitUntil: "networkidle" });

  // 🔥 stabilny selektor YouTube
  const videoUrl = await page.evaluate(() => {
    const el = document.querySelector("ytd-rich-item-renderer a#video-title");
    return el ? "https://www.youtube.com" + el.getAttribute("href") : null;
  });

  await browser.close();

  if (!videoUrl) {
    console.log("⚠️ No video found.");
    return;
  }

  console.log("🎬 Latest video:", videoUrl);

  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  console.log("⬇️ Downloading audio...");

  await run(`yt-dlp -x --audio-format mp3 -o "${output}" "${videoUrl}"`);

  console.log("✅ Audio downloaded.");
}
