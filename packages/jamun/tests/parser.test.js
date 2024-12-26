import {
  mdParser,
  useMdParser,
  useHtmlParser,
  useConvertToHtml,
} from "../dist/parser";

const MDTEXT = `---
title: Hello World
---

# Hello World
This is a test markdown file`;

test("mdParser", () => {
  expect(mdParser(MDTEXT)).toStrictEqual({
    attributes: { title: "Hello World" },
    body: "# Hello World\nThis is a test markdown file",
    bodyBegin: 5,
    frontmatter: "title: Hello World",
  });
});

test("useMdParser", () => {
  expect(useMdParser(MDTEXT)).toBe(
    "<h1>Hello World</h1>\n<p>This is a test markdown file</p>\n"
  );
});

test("useConvertToHtml", () => {
  expect(useConvertToHtml(MDTEXT)).toBe(
    `<h1>Hello World</h1>\n<p>This is a test markdown file</p>\n`
  );
});
