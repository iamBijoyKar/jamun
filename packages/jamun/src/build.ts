import { readdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { useMainParser } from "./parser.js";

export async function generateDevBuild(pathToSrc: string, pathToDist: string) {
  const pathToPages = path.join(pathToSrc, "pages");
  try {
    const files = await readdir(pathToPages, {
      withFileTypes: true,
      recursive: true,
    });
    files.forEach(async (dirent) => {
      if (dirent.isDirectory()) return;
      const filePath = path.join(pathToPages, dirent.name);
      const html = useMainParser(filePath);
      const htmlFilePath = path.join(
        pathToDist,
        dirent.name.replace(".md", ".html")
      );
      await writeFile(htmlFilePath, html);
    });
  } catch (err) {
    console.log(err);
  }
}
