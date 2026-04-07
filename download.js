import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = __dirname;

// 🔥 RSS kanału YouTube
const RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UCp0sJtYwcmBHQYaWV7k_gHA";

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}

function fetchRSS(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

export default async function downloadLatest() {
  console.log("🎧 Checking YouTube RSS feed...");

  const xml = await fetchRSS(RSS_URL);

  const parsed = await xml2js.parseStringPromise(xml);

  const entries = parsed.feed.entry;
  if (!entries || entries.length === 0) {
    console.log("⚠️ No entries in RSS.");
    return;
  }

  const latest = entries[0];
  const videoUrl = latest.link[0].$.href;

  console.log("🎬 Latest video:", videoUrl);

  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  console.log("⬇️ Downloading audio...");

  await run(`yt-dlp -x --audio-format mp3 -o "${output}" "${videoUrl}"`);

  console.log("✅ Audio downloaded.");
}
