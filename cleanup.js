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
    let totalSize = fileStats.reduce((sum, f) => sum + f.size, 0);

    console.log(`📦 Current size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // Jeśli nie przekracza limitu — nic nie rób
    if (totalSize <= MAX_SIZE_BYTES) {
      console.log("👌 No cleanup needed.");
      return;
    }

    // Sortuj od najstarszych do najnowszych
    fileStats.sort((a, b) => a.mtime - b.mtime);

    // Usuwaj najstarsze pliki aż do zejścia poniżej limitu
    for (const file of fileStats) {
      if (totalSize <= MAX_SIZE_BYTES) break;

      console.log(`🗑️ Removing: ${file.name}`);
      await fs.promises.unlink(file.path);

      totalSize -= file.size;
    }

    console.log("✅ Cleanup finished.");
  } catch (err) {
    console.error("❌ Cleanup error:", err);
  }
}
