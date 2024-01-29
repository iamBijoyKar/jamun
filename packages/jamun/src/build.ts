import {
  readdir,
  writeFile,
  readFile,
  copyFile,
  mkdir,
  access,
} from "node:fs/promises";
import * as path from "node:path";
import { useMainParser } from "./parser.js";
import { theme } from "./utils.js";

export async function generateDevBuild(pathToSrc: string, pathToDist: string) {
  const pathToPages = path.join(pathToSrc, "pages");
  const pathToAssets = path.join(pathToSrc, "assets");

  // build pages
  try {
    const files = await readdir(pathToPages, {
      withFileTypes: true,
      recursive: true,
    });
    files.forEach(async (dirent) => {
      if (dirent.isDirectory()) return; // TODO: handle nested directories in pages
      const filePath = path.join(pathToPages, dirent.name);
      const fileContent = await readFile(filePath, { encoding: "utf-8" });
      const html = useMainParser(fileContent);
      const htmlFilePath = path.join(
        pathToDist,
        dirent.name.replace(".md", ".html")
      );
      await writeFile(htmlFilePath, html);
    });
  } catch (err) {
    console.log(err);
  }

  // copy assets
  try {
    try {
      await access(pathToAssets); // check if assets directory exists
    } catch (err) {
      mkdir(pathToDist, "assets");
      return;
    }
    // get all files and directories in assets directory
    const assetsFiles = await readdir(pathToAssets, {
      withFileTypes: true,
      recursive: true,
    });
    // create directories in assets directory
    assetsFiles.forEach(async (dirent) => {
      if (dirent.isFile()) return;
      const assetDirPath = path.join(dirent.path, dirent.name);
      const relativePath = path.relative(pathToSrc, assetDirPath);
      const assetDistDirPath = path.join(pathToDist, relativePath);
      await mkdir(assetDistDirPath, { recursive: true });
    });
    // copy files in assets directory
    assetsFiles.forEach(async (dirent) => {
      if (dirent.isDirectory()) {
        return;
      }
      const assetFilePath = path.join(dirent.path, dirent.name);
      const relativePath = path.relative(pathToSrc, assetFilePath);
      const assetDistFilePath = path.join(pathToDist, relativePath);
      await copyFile(assetFilePath, assetDistFilePath);
    });
  } catch (err) {
    console.log(err);
    console.log(
      theme.FgGray,
      "Note: Try to restart the dev server, it may fix the issue.",
      theme.Reset
    );
  }
}
