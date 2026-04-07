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

  // 🔥 YouTube anti-bot bypass
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36"
  });

  await page.goto(CHANNEL_URL, { waitUntil: "networkidle" });

  // 🔥 Scrollowanie, aby wymusić załadowanie filmów
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const interval = setInterval(() => {
        window.scrollBy(0, 500);
        total += 500;
        if (total > 3000) {
          clearInterval(interval);
          resolve();
        }
      }, 200);
    });
  });

  // 🔥 stabilny selektor YouTube
  const videoUrl = await page.evaluate(() => {
    const el = document.querySelector("ytd-rich-item-renderer a#video-title");
    return el ? "https://www.youtube.com" + el.getAttribute("href") : null;
  });

  await browser.close();

  if (!videoUrl) {
    console.log("⚠️ No video found after scroll.");
    return;
  }

  console.log("🎬 Latest video:", videoUrl);

  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  console.log("⬇️ Downloading audio...");

  await run(`yt-dlp -x --audio-format mp3 -o "${output}" "${videoUrl}"`);

  console.log("✅ Audio downloaded.");
}
