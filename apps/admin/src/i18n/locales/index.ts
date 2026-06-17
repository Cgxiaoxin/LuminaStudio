import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import type { LocaleCode, LocaleDefinition } from '../types';
import zhMessages from './zh-CN';
import enMessages from './en-US';

/** Register new locales here for future expansion. */
export const localeRegistry: Record<LocaleCode, LocaleDefinition> = {
  'zh-CN': {
    code: 'zh-CN',
    label: '简体中文',
    antdLocale: zhCN,
    messages: zhMessages,
  },
  'en-US': {
    code: 'en-US',
    label: 'English',
    antdLocale: enUS,
    messages: enMessages,
  },
};

export const DEFAULT_LOCALE: LocaleCode = 'zh-CN';
export const LOCALE_STORAGE_KEY = 'locale';

export const supportedLocales = Object.values(localeRegistry);

export function isLocaleCode(value: string): value is LocaleCode {
  return value in localeRegistry;
}

export function resolveLocale(stored?: string | null): LocaleCode {
  if (stored && isLocaleCode(stored)) return stored;
  return DEFAULT_LOCALE;
}
