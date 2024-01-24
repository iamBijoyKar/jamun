import { spawn } from "node:child_process";
import * as path from "node:path";

export function developmentServer(projectDir: string, env: any) {
  const pathToPages = path.join(projectDir, "src", "pages");
  console.log("Starting development server...");
  try {
    const process = spawn(`cd ${pathToPages} && npx vite`, [], {
      env: env,
      shell: true,
    });
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
  } catch (err) {
    console.log(err);
  }
}
