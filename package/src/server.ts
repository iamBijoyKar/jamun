import { spawn } from "node:child_process";
import * as path from "node:path";
import { watch } from "node:fs";
import { performance } from "node:perf_hooks";
import { generateDevBuild } from "./build.js";
import { cleanupDir, theme } from "./utils.js";

export async function developmentServer(projectDir: string, env: any) {
  const pathToDist = path.join(projectDir, "dist");
  const pathToSrc = path.join(projectDir, "src");

  console.log("Development build...");
  const t0 = performance.now();

  try {
    await generateDevBuild(pathToSrc, pathToDist);
  } catch (err) {
    console.log(err);
  }

  const t1 = performance.now();
  console.log(
    `Development build completed in ${Math.round(t1 - t0)} milliseconds`
  );
  console.log("Starting development server...");

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
          const filePath = path.join(projectDir, filename);
          console.log(
            theme.FgYellow,
            "Changes detected in",
            theme.Reset,
            theme.FgGray,
            filePath,
            theme.Reset
          );
          try {
            generateDevBuild(pathToSrc, pathToDist);
          } catch (err) {
            console.log(err);
          }
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
}
