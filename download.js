import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_DIR = __dirname;
const CHANNEL_URL = "https://www.youtube.com/@spizarniawiary/videos";

export default async function downloadLatest() {
  console.log("🎧 Checking YouTube channel with cookies...");

  // zapisujemy cookies do pliku
  const cookiesPath = path.join(__dirname, "cookies.txt");
  fs.writeFileSync(cookiesPath, process.env.YTDLP_COOKIES);

  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  const cmd = `yt-dlp --cookies "${cookiesPath}" --playlist-end 1 -x --audio-format mp3 -o "${output}" "${CHANNEL_URL}"`;

  console.log("⬇️ Downloading latest video audio...");
  try {
    await execPromise(cmd);
    console.log("✅ Audio downloaded.");
  } catch (err) {
    console.error("❌ yt-dlp error:", err);
  }
}

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr);
      else resolve(stdout);
    });
  });
}
