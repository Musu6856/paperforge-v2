import test from "node:test";
import assert from "node:assert/strict";

import {
  APP_LANGUAGE_CHANGED_EVENT,
  APP_LANGUAGE_STORAGE_KEY,
  parseStoredAppLanguage,
} from "./app-language.ts";
import { getAppCopy } from "./app-language-copy.ts";

test("app language uses stable local storage keys", () => {
  assert.equal(APP_LANGUAGE_STORAGE_KEY, "paperforge:app-language:v1");
  assert.equal(APP_LANGUAGE_CHANGED_EVENT, "paperforge:app-language-change");
});

test("app language parser accepts only supported UI languages", () => {
  assert.equal(parseStoredAppLanguage("en"), "en");
  assert.equal(parseStoredAppLanguage("zh"), "zh");
  assert.equal(parseStoredAppLanguage("中文"), "zh");
  assert.equal(parseStoredAppLanguage(null), "zh");
  assert.equal(parseStoredAppLanguage("fr"), "zh");
});

test("English copy covers workspace shell and model source controls", () => {
  const copy = getAppCopy("en");

  assert.equal(copy.shell.expandLeftPane, "Expand left sidebar");
  assert.equal(copy.assets.phaseAriaLabel, "Research phase");
  assert.equal(copy.modelSource.paperforgeTitle, "Use PaperForge model");
  assert.equal(copy.modelSource.providerFormat, "Provider format");
});
