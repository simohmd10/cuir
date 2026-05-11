import type { Language } from '../i18n';

export function resolveStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';

  const saved = localStorage.getItem('cuir-lang') || localStorage.getItem('language');
  if (saved === 'ar' || saved === 'fr') return saved;

  const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || '';
  return browserLang.toLowerCase().startsWith('ar') ? 'ar' : 'fr';
}
