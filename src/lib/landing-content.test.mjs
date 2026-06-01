import test from "node:test";
import assert from "node:assert/strict";

import {
  caseStudyPage,
  docsHomeCards,
  docsPages,
  landingNavLinks,
} from "./landing-content.ts";

test("landing navigation links point to standalone pages", () => {
  assert.deepEqual(
    landingNavLinks.map((link) => link.href),
    ["/docs/features", "/docs/model-safety", "/docs"]
  );

  for (const link of landingNavLinks) {
    assert.equal(link.href.startsWith("#"), false);
  }
});

test("docs and cases have standalone page content", () => {
  assert.equal(docsHomeCards.length >= 3, true);
  assert.equal(caseStudyPage.steps.length >= 4, true);

  for (const slug of ["features", "model-safety"]) {
    const page = docsPages[slug];

    assert.ok(page.title.length >= 2);
    assert.ok(page.description.length >= 12);
    assert.equal(page.sections.length >= 2, true);
  }
});
