import { exec } from "child_process";
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
  console.log("🎧 Checking YouTube channel using yt‑dlp only...");

  const output = path.join(TARGET_DIR, "%(title)s.%(ext)s");

  console.log("⬇️ Downloading latest video audio...");

  // 🔥 Najważniejsza linia — yt‑dlp sam wybiera najnowszy film
  await run(
    `yt-dlp --playlist-end 1 -x --audio-format mp3 -o "${output}" "${CHANNEL_URL}"`
  );

  console.log("✅ Audio downloaded.");
}
