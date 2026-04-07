import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = __dirname;

// 🔥 Invidious RSS (działa zawsze)
const RSS_URL = "https://yewtu.be/feed/channel/UCp0sJtYwcmBHQYaWV7k_gHA";

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
    https.get(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
          "Accept": "application/xml,text/xml"
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    ).on("error", reject);
  });
}

export default async function downloadLatest() {
  console.log("🎧 Checking Invidious RSS feed...");

  const xml = await fetchRSS(RSS_URL);

  if (!xml || xml.trim().startsWith("<!DOCTYPE html")) {
    console.log("⚠️ Invidious returned HTML (mirror down).");
    return;
  }

  let parsed;
  try {
    parsed = await xml2js.parseStringPromise(xml);
  } catch (err) {
    console.log("⚠️ Failed to parse RSS XML:", err.message);
    return;
  }

  const entries = parsed.feed?.entry;
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
