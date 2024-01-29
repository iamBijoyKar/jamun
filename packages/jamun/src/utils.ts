import { unlinkSync, readdirSync } from "fs";

export function cleanupDir(dir: string) {
  const files = readdirSync(dir);
  files.forEach((file) => {
    unlinkSync(file);
  });
}

export const theme = {
  Reset: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",

  FgBlack: "\x1b[30m",
  FgRed: "\x1b[31m",
  FgGreen: "\x1b[32m",
  FgYellow: "\x1b[33m",
  FgBlue: "\x1b[34m",
  FgMagenta: "\x1b[35m",
  FgCyan: "\x1b[36m",
  FgWhite: "\x1b[37m",
  FgGray: "\x1b[90m",

  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
  BgGray: "\x1b[100m",
};

export const layoutTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
  <link rel="stylesheet" href="/style.css" />
  </head>
  <body>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: sans-serif;
        font-size: 16px;
        line-height: 1.5;
      }
      .container {
        width: 100%;
        max-width: 900px;
        padding: 0 1rem;
        margin: 0 auto;
      }
    </style>
    <main class="container">
    <slot />
    </main>
  </body>
</html>
`;

export const injectInLayout = (content: string, layout: string) => {
  const layoutRegex = /<slot\s*\/>/;
  const slots = layout.match(layoutRegex);
  if (slots === null) {
    throw new Error("Layout does not have a <slot />");
  }
  if (slots.length > 1) {
    throw new Error("Layout has more than one <slot />");
  }
  const updatedLayout = layout.replace(slots[0], content);
  return updatedLayout;
};
