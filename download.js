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
      if (err) reject(stderr || stdout);
      else resolve(stdout);
    });
  });
}

export default async function downloadLatest() {
  console.log("🎧 Checking YouTube channel with cookies (Base64)...");

  import { fetchYoutubeCookies } from "./getCookies.js";

const cookiesPath = await fetchYoutubeCookies();


  // Decode cookies
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  const cookiesPath = path.join(__dirname, "cookies.txt");
  fs.writeFileSync(cookiesPath, decoded, { encoding: "utf8" });

  // Output pattern
  const output = path.join(__dirname, "%(title)s.%(ext)s");

  // REAL browser UA (ważne!)
  const USER_AGENT =
    process.env.YTDLP_UA ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

  // Hardened yt-dlp command
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


  console.log("⬇️ Downloading latest video audio...");
  console.log("🔧 Running command:", cmd);

  try {
    await execPromise(cmd);
    console.log("✅ Audio downloaded.");
  } catch (err) {
    console.error("❌ yt-dlp error:", err);

    if (String(err).includes("cookies are no longer valid")) {
      console.error("⚠️ Twoje cookies.txt są nieważne — musisz wyeksportować nowe.");
    }

    if (String(err).includes("Sign in to confirm you're not a bot")) {
      console.error("⚠️ YouTube wymusza logowanie — cookies są niepełne lub przeterminowane.");
    }
  }
}
