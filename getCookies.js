const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

module.exports.fetchYoutubeCookies = async function () {
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

  // 1. Wejście na YouTube
  await page.goto("https://www.youtube.com", { waitUntil: "networkidle" });

  // 2. Akceptacja cookies (jeśli popup)
  try {
    await page.click('button:has-text("Akceptuję")', { timeout: 3000 });
  } catch {}
  try {
    await page.click('button:has-text("Accept all")', { timeout: 3000 });
  } catch {}

  // 3. Pobranie cookies
  const cookies = await context.cookies();

  const cookiesTxt = cookies
    .map(
      (c) =>
        `${c.domain}\tTRUE\t${c.path}\t${c.secure ? "TRUE" : "FALSE"}\t${
          c.expires
        }\t${c.name}\t${c.value}`
    )
    .join("\n");

  const cookiesPath = path.join(__dirname, "cookies.txt");
  fs.writeFileSync(cookiesPath, cookiesTxt);

  console.log("🍪 Fresh cookies saved to cookies.txt");

  await browser.close();

  return cookiesPath;
};
