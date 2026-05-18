import { createContext, useContext, type ReactNode } from 'react';
import { translations, type TranslationKey } from '../i18n';

interface LanguageContextType {
  lang: 'ar' | 'fr';
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = 'fr' as const;
  const dir = 'ltr' as const;

  const t = (key: TranslationKey): string => {
    return (translations.fr[key] as string) ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
