import { exec } from "child_process";
import fs from "fs";
import express from "express";

const app = express();
const PORT = process.env.PORT || 8080;

app.get("/download", (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).send("Missing id");

  const filepath = `/tmp/${id}.m4a`;
  const cmd = `chmod +x ./bin/yt-dlp && ./bin/yt-dlp -f bestaudio -o "${filepath}" "https://www.youtube.com/watch?v=${id}"`;

  exec(cmd, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Download failed");
    }

    if (!fs.existsSync(filepath)) {
      return res.status(500).send("File not found");
    }

    res.download(filepath, `${id}.m4a`, () => {
      fs.unlinkSync(filepath);
    });
  });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
