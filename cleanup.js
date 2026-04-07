import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Maksymalny rozmiar katalogu (500 MB)
const MAX_SIZE_BYTES = 500 * 1024 * 1024;

// Katalog, w którym trzymasz audio i feed.xml
const TARGET_DIR = __dirname;

export default async function cleanup() {
  try {
    console.log("🧹 Cleanup started...");

    // Pobierz listę plików
    const files = await fs.promises.readdir(TARGET_DIR);

    // Pobierz statystyki plików
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const fullPath = path.join(TARGET_DIR, file);
        const stats = await fs.promises.stat(fullPath);

        return {
          name: file,
          path: fullPath,
          size: stats.size,
          mtime: stats.mtimeMs
        };
      })
    );

    // Oblicz całkowity rozmiar
    let
