import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "xmlbuilder2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Katalog z plikami audio
const AUDIO_DIR = __dirname;

// Publiczny URL Twojej aplikacji Railway (podmień, jeśli masz custom domenę)
const BASE_URL = "https://spizarnia-wiary-railway-production.up.railway.app";

// Dane podcastu
const PODCAST_TITLE = "Spiżarnia Wiary";
const PODCAST_DESCRIPTION = "Podcast Spiżarnia Wiary";
const PODCAST_LANGUAGE = "pl-PL";
const PODCAST_AUTHOR = "Spiżarnia Wiary";
const PODCAST_LINK = `${BASE_URL}/feed`;

function getAudioFiles() {
  const files = fs.readdirSync(AUDIO_DIR);
  return files.filter((f) => f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".mp4"));
}

function buildRss(items) {
  const feed = {
    rss: {
      "@version": "2.0",
      "@xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
      channel: {
        title: PODCAST_TITLE,
        link: PODCAST_LINK,
        description: PODCAST_DESCRIPTION,
        language: PODCAST_LANGUAGE,
        "itunes:author": PODCAST_AUTHOR,
        "itunes:explicit": "no",
        item: items
      }
    }
  };

  return create(feed).end({ prettyPrint: true });
}

function buildItemsFromFiles(files) {
  return files.map((file) => {
    const filePath = `${BASE_URL}/${encodeURIComponent(file)}`;
    const stats = fs.statSync(path.join(AUDIO_DIR, file));

    return {
      title: path.parse(file).name,
      description: path.parse(file).name,
      enclosure: {
        "@url": filePath,
        "@type": "audio/mpeg"
      },
      guid: filePath,
      pubDate: stats.mtime.toUTCString()
    };
  });
}

export default async function generateFeed() {
  try {
    console.log("🧾 Generating feed.xml...");

    const audioFiles = getAudioFiles();

    if (audioFiles.length === 0) {
      console.log("⚠️ No audio files found. Feed will be empty.");
    }

    const items = buildItemsFromFiles(audioFiles);
    const xml = buildRss(items);

    const feedPath = path.join(__dirname, "feed.xml");
    fs.writeFileSync(feedPath, xml, "utf8");

    console.log("✅ feed.xml generated");
  } catch (err) {
    console.error("❌ Feed generation error:", err);
    throw err;
  }
}
