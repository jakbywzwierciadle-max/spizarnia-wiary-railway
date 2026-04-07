import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "xmlbuilder2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUDIO_DIR = __dirname;
const BASE_URL = "https://spizarnia-wiary-railway-production.up.railway.app";

export default async function generateFeed() {
  console.log("🧾 Generating feed.xml...");

  const files = fs.readdirSync(AUDIO_DIR)
    .filter(f => f.endsWith(".mp3") || f.endsWith(".m4a"));

  const items = files.map(file => {
    const stats = fs.statSync(path.join(AUDIO_DIR, file));
    const url = `${BASE_URL}/${encodeURIComponent(file)}`;

    return {
      title: path.parse(file).name,
      description: path.parse(file).name,
      enclosure: { "@url": url, "@type": "audio/mpeg" },
      guid: url,
      pubDate: stats.mtime.toUTCString()
    };
  });

  const feed = {
    rss: {
      "@version": "2.0",
      channel: {
        title: "Spiżarnia Wiary",
        link: `${BASE_URL}/feed`,
        description: "Podcast Spiżarnia Wiary",
        language: "pl-PL",
        item: items
      }
    }
  };

  const xml = create(feed).end({ prettyPrint: true });
  fs.writeFileSync(path.join(__dirname, "feed.xml"), xml);

  console.log("✅ feed.xml generated");
}
