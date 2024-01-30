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
import { theme, injectInLayout, layoutTemplate } from "./utils.js";

export async function generateDevBuild(pathToSrc: string, pathToDist: string) {
  const pathToPages = path.join(pathToSrc, "pages");
  const pathToAssets = path.join(pathToSrc, "assets");
  let pathToPageLayout = "";
  let layoutContent = "";
  try {
    await access(path.join(pathToPages, "_layout.md"));
    pathToPageLayout = path.join(pathToPages, "_layout.md");
    layoutContent = await readFile(pathToPageLayout, { encoding: "utf-8" });
  } catch {}
  try {
    if (pathToPageLayout !== "") throw new Error("Layout file already exists");
    await access(path.join(pathToPages, "_layout.html"));
    pathToPageLayout = path.join(pathToPages, "_layout.html");
    layoutContent = await readFile(pathToPageLayout, { encoding: "utf-8" });
  } catch {
    await writeFile(path.join(pathToPages, "_layout.html"), layoutTemplate);
    pathToPageLayout = path.join(pathToPages, "_layout.html");
    layoutContent = layoutTemplate;
    console.log(theme.FgGreen, "\nCreated _layout.html", theme.Reset);
  }
  // build pages
  try {
    const pagesFiles = await readdir(pathToPages, {
      withFileTypes: true,
      recursive: true,
    });
    // create directories for pages
    pagesFiles.forEach(async (dirent) => {
      if (dirent.isFile()) return;
      if (dirent.name.startsWith("_")) return;
      const pagePath = path.join(dirent.path, dirent.name);
      const relativePath = path.relative(pathToPages, pagePath);
      const assetDistDirPath = path.join(pathToDist, relativePath);
      await mkdir(assetDistDirPath, { recursive: true });
    });
    // build page files
    pagesFiles.forEach(async (dirent) => {
      if (dirent.isDirectory()) return;
      if (dirent.name.startsWith("_")) return;
      const filePath = path.join(dirent.path, dirent.name);
      const fileRelativePath = path.relative(pathToPages, filePath);
      const fileContent = await readFile(filePath, { encoding: "utf-8" });
      const html = useMainParser(fileContent);
      const finalHtml = injectInLayout(html, layoutContent);
      if (dirent.name.endsWith(".md")) {
        const htmlFilePath = path.join(
          pathToDist,
          fileRelativePath.replace(".md", ".html")
        );
        await writeFile(htmlFilePath, finalHtml);
      } else if (dirent.name.endsWith(".html")) {
        const htmlFilePath = path.join(pathToDist, fileRelativePath);
        await writeFile(htmlFilePath, finalHtml);
      } else {
        console.log(
          theme.FgRed,
          `Error: File type not supported ${dirent.name}`,
          theme.Reset
        );
      }
    });
  } catch (err) {
    console.log(err);
  }

  // copy assets
  try {
    try {
      await access(path.join(pathToDist, "assets"));
    } catch {
      await mkdir(path.join(pathToDist, "assets"), { recursive: true });
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
      try {
        await copyFile(assetFilePath, assetDistFilePath);
      } catch (err) {
        console.log(theme.FgYellow, "A busy file detected", theme.Reset);
      }
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
