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
  const { attributes, body, frontmatter, bodyBegin } = useMdParser(content);
  const updatedContent = useAssetsParser(body);
  // console.log(assetsStrList);
  const html = useConvertToHtml(updatedContent);
  if (isString(html)) {
    const finalHtml = htmlTemplate(html);
    return finalHtml;
  }
  throw new Error("html is not a string");
}

export function useAssetsParser(content: string) {
  let updatedContent = content;
  const imgRegex = /!\[(.*?)\]\((.*?)\)|<\s*img\s+.*\/\s*>/gm;
  const assetsList = content.match(imgRegex);
  assetsList?.forEach((asset) => {
    const assetSrcPath = asset.match(/src="(.*?)"/);
    if (assetSrcPath !== null) {
      const assetSrcStr = assetSrcPath?.[1] || "";
      if (assetSrcStr === "") return;
      const newAssetPath = assetSrcStr.replace("../", "");
      updatedContent = updatedContent.replace(assetSrcStr, newAssetPath);
      // console.log(newAssetPath);
      return;
    }
    const assetSrcPath2 = asset.match(/!\[(.*?)\]\((.*?)\)/);
    if (assetSrcPath2 !== null) {
      const assetSrcStr = assetSrcPath2?.[2] || "";
      if (assetSrcStr === "") return;
      const newAssetPath = assetSrcStr.replace("../", "");
      updatedContent = updatedContent.replace(assetSrcStr, newAssetPath || "");
      return;
    }
  });
  return updatedContent;
}
