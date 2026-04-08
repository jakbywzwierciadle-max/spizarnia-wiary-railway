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

  //
