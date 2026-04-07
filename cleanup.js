import fs from "fs";

export function cleanupOldFiles() {
  const files = fs
    .readdirSync("audio")
    .map(f => ({ f, size: fs.statSync("audio/" + f).size }))
    .sort((a, b) => b.size - a.size);

  let total = files.reduce((a, b) => a + b.size, 0);
  const limit = 500 * 1024 * 1024;

  for (const file of files) {
    if (total <= limit) break;
    fs.unlinkSync("audio/" + file.f);
    total -= file.size;
  }
}
