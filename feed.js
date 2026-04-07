import fs from "fs";
import { create } from "xmlbuilder2";

export function generateFeed(videoIds) {
  const items = videoIds.map(id => ({
    title: `Odcinek ${id}`,
    enclosure: {
      "@url": `https://YOUR-APP.up.railway.app/audio/${id}.mp3`,
      "@type": "audio/mpeg"
    },
    guid: id
  }));

  const feed = create({
    rss: {
      "@version": "2.0",
      channel: {
        title: "Spiżarnia Wiary",
        link: "https://YOUR-APP.up.railway.app/feed.xml",
        description:
          "Rozważania, komentarze i inspiracje duchowe z kanału Spiżarnia Wiary.",
        image: {
          url: "https://YOUR-APP.up.railway.app/public/cover.jpg"
        },
        item: items
      }
    }
  });

  fs.writeFileSync("feed.xml", feed.end({ prettyPrint: true }));
}
