// jamun server tests for the jamun package

import { developmentServer } from "../dist/server";

test("jamun server tests", () => {
  expect(developmentServer).toBeDefined();
});
