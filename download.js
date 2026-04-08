import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export async function downloadLatest() {
  console.log("🎧 Using cookies.txt");

  const cookiesPath = path.join(process.cwd(), "cookies.txt");

  if (!fs.existsSync(cookiesPath)) {
    throw new Error("cookies.txt not found");
  }

  console.log("⬇️ Downloading latest video...");

  execSync(
    `yt-dlp --cookies cookies.txt -o "latest.%(ext)s" https://www.youtube.com/@spizarniawiary/videos`,
    { stdio: "inherit" }
  );

  console.log("✅ Download complete");
}
