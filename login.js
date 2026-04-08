import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

chromium.use(stealth());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loginAndSaveCookies() {
  console.log("🔐 Launching browser for YouTube login...");

  const browser = await chromium.launch({
    headless: false, // MUSI być widoczne do logowania
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🌐 Opening YouTube login page...");
  await page.goto("https://accounts.google.com/signin/v2/identifier");

  console.log("👉 Zaloguj się ręcznie. Po zalogowaniu zamknij okno.");
  await page.waitForEvent("close");

  const cookies = await context.cookies();

  const netscapeHeader = [
    "# Netscape HTTP Cookie File",
    "# Cookies exported after manual login",
    ""
  ].join("\n");

  const cookiesTxt = cookies
    .map(
      (c) =>
        `${c.domain}\tTRUE\t${c.path}\t${c.secure ? "TRUE" : "FALSE"}\t${c.expires}\t${c.name}\t${c.value}`
    )
    .join("\n");

  const cookiesPath = path.join(__dirname, "cookies.txt");
  fs.writeFileSync(cookiesPath, netscapeHeader + cookiesTxt);

  console.log("🍪 Saved logged-in cookies to cookies.txt");

  await browser.close();
}
