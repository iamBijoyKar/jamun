import fm from "front-matter";
import * as fs from "fs";
import * as path from "path";
import * as marked from "marked";
// custom hooks for front-matter
export const useFrontMatter = {
  preprocess: (markdown:string) => {
    const { attributes, body, frontmatter, bodyBegin } = fm(markdown);
    return body;
  },
};

export function useMdParser(content:string) {
  const { attributes, body, frontmatter, bodyBegin } = fm(content);
  return { attributes, body, frontmatter, bodyBegin };
}

export function useConvertToHtml(body:string) {
  marked.use({ hooks:useFrontMatter });
  const html = marked.parse(body);
  return html;
}

export function useMdParseFile(filePath:string) {
  const content = fs.readFileSync(filePath).toString();
  const { attributes, body, frontmatter, bodyBegin } = fm(content);
  return { attributes, body, frontmatter, bodyBegin };
}

export function useMdParseFileToHtml(filePath:string) {
  const content = fs.readFileSync(filePath).toString();
  const { attributes, body, frontmatter, bodyBegin } = fm(content);
  marked.use({ hooks:useFrontMatter });
  const html = marked.parse(body);
  return { attributes, body, frontmatter, bodyBegin, html };
}
