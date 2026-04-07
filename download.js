import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = __dirname;

// 3 niezależne mirrory Invidious
const MIRRORS = [
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://invidious.snopyta.org"
];

// YouTube RSS fallback
const YT_RSS = "https://www.youtube.com/feeds/videos.xml?channel_id=UCp0sJtYwcmBHQYaWV7k_gHA";

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}

function fetch(url) {
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

async function tryParseRSS(url) {
  const xml = await fetch(url);

  if (!xml || xml.trim().startsWith("<!DOCTYPE html") || xml.trim().startsWith("<html")) {
    return null;
  }

  try {
    const parsed = await xml2js.parseStringPromise(xml);
    const entries = parsed.feed?.entry;
    if (!entries || entries.length === 0) return null;

    return entries[0].link[0].$.href;
  } catch {
    return null;
  }
}

async function tryYouTubeOEmbed() {
  const url = "https://www.youtube.com/oembed?url=https://www.youtube.com/channel/UCp0sJtYwcmBHQYaWV7k_gHA&format=json";

  try {
    const json = await fetch(url);
    const data = JSON.parse(json);

    if (data?.thumbnail_url) {
      const videoId = data.thumbnail_url.split("/vi/")[1]?.split("/")[0];
      if (videoId) return "https://www.youtube.com/watch?v=" + videoId;
    }
  } catch {}

  return null;
}

export default async function downloadLatest() {
  console.log("🎧 Checking multi‑mirror RSS...");

  // 1. Invidious mirrors
  for (const mirror of MIRRORS) {
    const url = `${mirror}/feed/channel/UCp0sJtYwcmBHQYaWV7k_gHA`;
    console.log("🔎 Trying mirror:", url);

    const video = await tryParseRSS(url);
    if (video) {
      console.log("🎬 Latest video:", video);
      return await download(video);
    }
  }

  // 2. YouTube RSS fallback
  console.log("🔎 Trying YouTube RSS...");
  const ytVideo = await tryParseRSS(YT_RSS);
  if (ytVideo) {
    console.log("🎬 Latest video:", ytVideo);
    return await download(ytVideo);
  }

  // 3. YouTube oEmbed fallback
  console.log("🔎 Trying YouTube oEmbed...");
  const oembedVideo = await tryYouTubeOEmbed();
  if (oembedVideo) {
    console.log("🎬 Latest video:", oembedVideo);
    return await download(oembedVideo);
  }

  console.log("❌ No video found on any source.");
}

async function download(videoUrl) {
  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  console.log("⬇️ Downloading audio...");
  await run(`yt-dlp -x --audio-format mp3 -o "${output}" "${videoUrl}"`);
  console.log("✅ Audio downloaded.");
}
