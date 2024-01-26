import fm from "front-matter";
import * as fs from "fs";
import * as marked from "marked";
import { htmlTemplate } from "./utils.js";

//* type guards
const isString = (value: any): value is string => {
  return typeof value === "string";
};

//* parsers and converters

//? useFrontMatter is a custom hook for parsing frontmatter
export const useFrontMatter = {
  preprocess: (markdown: string) => {
    const { attributes, body, frontmatter, bodyBegin } = fm(markdown);
    return body;
  },
};

export function useMdParser(content: string) {
  const { attributes, body, frontmatter, bodyBegin } = fm(content);
  return { attributes, body, frontmatter, bodyBegin };
}

export function useConvertToHtml(body: string) {
  marked.use({ hooks: useFrontMatter });
  const html = marked.parse(body);
  return html;
}

export function useMdParseFile(filePath: string) {
  const content = fs.readFileSync(filePath).toString();
  const { attributes, body, frontmatter, bodyBegin } = fm(content);
  return { attributes, body, frontmatter, bodyBegin };
}

export function useMdParseFileToHtml(filePath: string) {
  const content = fs.readFileSync(filePath).toString();
  const { attributes, body, frontmatter, bodyBegin } = fm(content);
  marked.use({ hooks: useFrontMatter });
  const html = marked.parse(body);
  return { attributes, body, frontmatter, bodyBegin, html };
}

export function useMainParser(filePath: string) {
  const { html } = useMdParseFileToHtml(filePath);
  if (isString(html)) {
    const finalHtml = htmlTemplate(html);
    return finalHtml;
  }
  throw new Error("html is not a string");
}
