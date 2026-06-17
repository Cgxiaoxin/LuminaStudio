import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LocaleCode, TranslationMessages } from './types';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, localeRegistry, resolveLocale } from './locales';

type I18nContextValue = {
  locale: LocaleCode;
  messages: TranslationMessages;
  antdLocale: (typeof localeRegistry)[LocaleCode]['antdLocale'];
  setLocale: (locale: LocaleCode) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const value = path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    const resolved = resolveLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
    document.documentElement.lang = resolved;
    return resolved;
  });

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const definition = localeRegistry[locale] ?? localeRegistry[DEFAULT_LOCALE];
    return {
      locale,
      messages: definition.messages,
      antdLocale: definition.antdLocale,
      setLocale,
      t: (key: string) => getNestedValue(definition.messages as unknown as Record<string, unknown>, key) ?? key,
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
