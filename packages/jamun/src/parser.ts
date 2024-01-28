import fm from "front-matter";
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

export function useMainParser(content: string) {
  const html = useConvertToHtml(content);
  if (isString(html)) {
    const finalHtml = htmlTemplate(html);
    return finalHtml;
  }
  throw new Error("html is not a string");
}
