import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

if (process.argv.length < 3) {
  console.log("Please provide a name for your project");
  process.exit(1);
}

const projectName = process.argv[2];
const projectPath = path.join(process.cwd(), projectName);
const templatePath = path.resolve(
  fileURLToPath(import.meta.url),
  "../../",
  "template-base"
);

try {
  fs.mkdirSync(projectPath);
} catch (err: any) {
  if (err.code === "EEXIST") {
    console.log("Project already exists");
    process.exit(1);
  }
}

try {
  fs.readdirSync(templatePath, {
    recursive: true,
    withFileTypes: true,
  }).forEach((file) => {
    const dest = path.join(projectPath, path.relative(templatePath, file.path));
    // console.log(dest, file);
    if (file.isDirectory()) {
      try {
        fs.mkdirSync(path.join(dest, file.name));
      } catch (err) {}
      return;
    }
    try {
      fs.writeFileSync(
        path.join(dest, file.name),
        fs.readFileSync(path.join(file.path, file.name), {
          encoding: "utf8",
          flag: "r",
        })
      );
    } catch (err) {
      console.log(err);
    }
  });
} catch (err) {
  console.log(err);
}

const packageJson = {
  name: projectName,
  version: "0.1.0",
  private: true,
  scripts: {
    dev: "npx jamun dev",
    build: "npx jamun build",
  },
  dependencies: {
    jamun: "latest",
    vite: "latest",
  },
};

fs.writeFileSync(
  path.join(projectPath, "package.json"),
  JSON.stringify(packageJson, null, 2)
);

console.log("Done. Now run:");
console.log(`cd ${projectName}`);
console.log("npm install");
console.log("npm run dev");
