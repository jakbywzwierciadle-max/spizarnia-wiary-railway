import express from "express";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/download", async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing id");

  const filename = `${id}.m4a`;
  const filepath = path.join("/tmp", filename);

  // Komenda yt-dlp z pełnym solverem
  const cmd = `yt-dlp -f bestaudio --no-playlist -o "${filepath}" "https://www.youtube.com/watch?v=${id}"`;

  exec(cmd, (error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Download failed");
    }

    if (!fs.existsSync(filepath)) {
      return res.status(500).send("File not found after download");
    }

    res.download(filepath, filename, () => {
      fs.unlinkSync(filepath);
    });
  });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
