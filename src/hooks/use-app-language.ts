"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  APP_LANGUAGE_CHANGED_EVENT,
  APP_LANGUAGE_STORAGE_KEY,
  type AppLanguage,
  parseStoredAppLanguage,
} from "@/lib/app-language";

function subscribeAppLanguage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(APP_LANGUAGE_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(APP_LANGUAGE_CHANGED_EVENT, onStoreChange);
  };
}

function getAppLanguageSnapshot() {
  return parseStoredAppLanguage(
    window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY)
  );
}

function getServerAppLanguageSnapshot(): AppLanguage {
  return "zh";
}

export function useAppLanguage() {
  const language = useSyncExternalStore(
    subscribeAppLanguage,
    getAppLanguageSnapshot,
    getServerAppLanguageSnapshot
  );

  const setLanguage = useCallback((nextLanguage: AppLanguage) => {
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event(APP_LANGUAGE_CHANGED_EVENT));
  }, []);

  return { language, setLanguage };
}
