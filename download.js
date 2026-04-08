const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { fetchYoutubeCookies } = require("./getCookies.js");

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) reject(stderr || stdout);
      else resolve(stdout);
    });
  });
}

const CHANNEL_URL = "https://www.youtube.com/@spizarniawiary/videos";

module.exports = async function downloadLatest() {
  console.log("🎧 Fetching fresh YouTube cookies via Playwright...");
  const cookiesPath = await fetchYoutubeCookies();

  console.log("⬇️ Downloading latest video audio...");

  const output = path.join(__dirname, "%(title)s.%(ext)s");

  const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123
