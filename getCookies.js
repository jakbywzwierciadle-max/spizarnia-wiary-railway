import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// zakładamy, że cookies.txt zostało wygenerowane przez login.js (Playwright Stealth, zalogowane konto)
export async function fetchYoutubeCookies() {
  return path.join(__dirname, "cookies.txt");
}

// ======================= download.js =======================
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { fetchYoutubeCookies } from "./getCookies.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || stdout);
      else resolve(stdout);
    });
  });
}

const CHANNEL_URL = "https://www.youtube.com/@spizarniawiary/videos";

export default async function downloadLatest() {
  console.log("🎧 Using saved YouTube cookies...");
  const cookiesPath = await fetchYoutubeCookies();

  console.log("⬇️ Downloading latest video audio...");

  const output = path.join(__dirname, "%(title)s.%(ext)s");
  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

  const cmd = [
    `yt-dlp`,
    `--cookies "${cookiesPath}"`,
    `--force-ipv4`,
    `--user-agent "${USER_AGENT}"`,
    `--sleep-requests 1`,
    `--sleep-interval 2`,
    `--retries 10`,
    `--retry-sleep 3`,
    `--extractor-args "youtube:player_client=web;youtube:njs=1"`,
    `--no-check-certificate`,
    `--playlist-end 1`,
    `-x --audio-format mp3`,
    `-o "${output}"`,
    `"${CHANNEL_URL}"`
  ].join(" ");

  console.log("🔧 Running command:", cmd);

  try {
    const out = await execPromise(cmd);
    console.log("✅ yt-dlp output:\n", out);
  } catch (err) {
    console.error("❌ yt-dlp error:", err);
  }
}
