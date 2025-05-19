import { spawn } from "node:child_process";
import * as path from "node:path";
import { watch, access, writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { generateDevBuild, devCleanUp } from "./build.js";
import { theme } from "./utils.js";

export async function developmentServer(projectDir: string, env: any) {
  const pathToDist = path.join(projectDir, "dist");
  const pathToSrc = path.join(projectDir, "src");
  const pathToPages = path.join(pathToSrc, "pages");

  // pages directory check
  access(pathToPages, (err) => {
    if (err) {
      console.log(theme.FgCyan, "\nCreating pages directory...", theme.Reset);
      spawn(`mkdir ${pathToPages}`, [], {
        env: env,
        shell: true,
      });
      writeFileSync(path.join(pathToPages, "index.md"), "# Hello World");
    }
  });

  // dist directory check
  access(pathToDist, (err) => {
    if (err) {
      console.log(theme.FgCyan, "\nCreating dist directory...", theme.Reset);
      spawn(`mkdir ${pathToDist}`, [], {
        env: env,
        shell: true,
      });
    }
  });

  console.log(theme.FgGreen, "\nDevelopment build...", theme.Reset);
  const t0 = performance.now(); // start timer for build

  // generate development build
  try {
    await generateDevBuild(pathToSrc, pathToDist);
  } catch (err) {
    console.log(err);
  }

  const t1 = performance.now(); // end timer for build
  console.log(
    theme.FgGray,
    `\nDevelopment build completed in`,
    theme.FgWhite,
    `${Math.round(t1 - t0)} milliseconds`,
    theme.Reset
  );
  console.log(theme.FgMagenta, "\nStarting development server...", theme.Reset);

  try {
    const process = spawn(`cd ${pathToDist} && npx vite`, [], {
      env: env,
      shell: true,
    });

    // process events listeners
    process.on("message", (data) => {
      console.log(`stdout: ${data}`);
    });
    process.stderr.on("data", (data) => {
      console.log(`stderr: ${data}`);
    });
    process.stdout.on("data", (data) => {
      console.log(data.toString());
    });
    process.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
    process.on("error", (err) => {
      console.log(err);
    });

    // watch for changes in the project directory recursively
    watch(
      pathToSrc,
      {
        recursive: true,
      },
      (eventType, filename) => {
        if (filename) {
          console.log(
            theme.FgYellow,
            "Changes detected in",
            theme.Reset,
            theme.FgGray,
            filename,
            theme.Reset
          );
          try {
            generateDevBuild(pathToSrc, pathToDist);
          } catch (err) {
            console.log(err);
          }
          // clean up dist directory
          const filePath = path.join(pathToSrc, filename);
          devCleanUp(filePath, filename, pathToDist);
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}
