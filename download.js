import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANNEL_URL = "https://www.youtube.com/@spizarniawiary/videos";

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}

export default async function downloadLatest() {
  console.log("🎧 Checking YouTube channel with cookies (Base64)...");

  const base64 = process.env.YTDLP_COOKIES_BASE64;
  if (!base64) {
    console.log("❌ Missing YTDLP_COOKIES_BASE64 env variable.");
    return;
  }

  const decoded = Buffer.from(base64, "base64").toString("utf8");
  const cookiesPath = path.join(__dirname, "cookies.txt");

  fs.writeFileSync(cookiesPath, decoded, { encoding: "utf8" });

  const output = path.join(__dirname, "%(title)s.%(ext)s");
  const cmd = `yt-dlp --cookies "${cookiesPath}" --playlist-end 1 -x --audio-format mp3 -o "${output}" "${CHANNEL_URL}"`;

  console.log("⬇️ Downloading latest video audio...");

  try {
    await execPromise(cmd);
    console.log("✅ Audio downloaded.");
  } catch (err) {
    console.error("❌ yt-dlp error:", err);
  }
}
