import { readdir, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { useMdParseFileToHtml } from "./parser.js";

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
      const { html } = useMdParseFileToHtml(filePath);
      const htmlFilePath = path.join(
        pathToDist,
        dirent.name.replace(".md", ".html")
      );
      if (typeof html === "string") {
        await writeFile(htmlFilePath, html);
        return;
      }
      throw new Error("html is not a string");
    });
  } catch (err) {
    console.log(err);
  }
}
