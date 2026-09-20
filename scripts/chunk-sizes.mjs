import { createGzip } from "node:zlib";
import { promisify } from "node:util";
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const gzip = promisify(createGzip);

async function main() {
  const assetsDir = join(process.cwd(), ".output/public/assets");
  const entries = [];
  for (const name of await readdir(assetsDir)) {
    const path = join(assetsDir, name);
    const file = await stat(path);
    if (!file.isFile()) continue;
    const content = await readFile(path);
    const compressed = await gzip(content);
    entries.push({ name, raw: file.size, gzip: compressed.length });
  }
  console.table(entries.sort((a, b) => b.raw - a.raw).slice(0, 15));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
