import express from "express";
import ytdlp from "yt-dlp-exec";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/download", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing id");

  const filepath = `/tmp/${id}.m4a`;

  try {
    // Pobieranie audio przez yt-dlp-exec
    await ytdlp(`https://www.youtube.com/watch?v=${id}`, {
      output: filepath,
      format: "bestaudio"
    });

    if (!fs.existsSync(filepath)) {
      return res.status(500).send("File not found after download");
    }

    res.download(filepath, `${id}.m4a`, () => {
      fs.unlinkSync(filepath);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Download failed");
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
