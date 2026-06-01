export type AppLanguage = "zh" | "en";

export const APP_LANGUAGE_STORAGE_KEY = "paperforge:app-language:v1";
export const APP_LANGUAGE_CHANGED_EVENT = "paperforge:app-language-change";

export function parseStoredAppLanguage(value: string | null): AppLanguage {
  return value === "en" ? "en" : "zh";
}

export function getAppLanguageLabel(language: AppLanguage) {
  return language === "en" ? "English" : "中文";
}
