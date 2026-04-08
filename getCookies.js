import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function fetchYoutubeCookies() {
  console.log("🌐 Launching Playwright to fetch fresh YouTube cookies...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-infobars",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process"
    ]
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    locale: "pl-PL",
    timezoneId: "Europe/Warsaw"
  });

  const page = await context.newPage();

  await page.goto("https://www.youtube.com", { waitUntil: "networkidle" });

  try {
    await page.click('button:has-text("Akceptuję")', { timeout: 3000 });
  } catch {}
  try {
    await page.click('button:has-text("Accept all")', { timeout: 3000 });
  } catch {}

  const cookies = await context.cookies();

  // FIX: session cookies (-1) → ustawiamy ważność na 30 dni
  const now = Math.floor(Date.now() / 1000);
  const month = 30 * 24 * 60 * 60;

  const cookiesTxt = cookies
    .map((c) => {
      const expires = c.expires > 0 ? c.expires : now + month;
      return `${c.domain}\tTRUE\t${c.path}\t${c.secure ? "TRUE" : "FALSE"}\t${expires}\t${c.name}\t${c.value}`;
    })
    .join("\n");

  const cookiesPath = path.join(__dirname, "cookies.txt");
  fs.writeFileSync(cookiesPath, cookiesTxt);

  console.log("🍪 Fresh cookies saved to cookies.txt (Netscape format)");

  await browser.close();

  return cookiesPath;
}
