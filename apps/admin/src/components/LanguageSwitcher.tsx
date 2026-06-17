import { Select } from 'antd';
import { useI18n } from '../i18n';
import { supportedLocales } from '../i18n/locales';

type LanguageSwitcherProps = {
  size?: 'small' | 'middle';
  className?: string;
};

export function LanguageSwitcher({ size = 'middle', className }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <Select
      className={className}
      size={size}
      value={locale}
      onChange={setLocale}
      aria-label={t('locale.switch')}
      options={supportedLocales.map((item) => ({
        value: item.code,
        label: item.label,
      }))}
    />
  );
}
