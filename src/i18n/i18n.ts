import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import knTranslation from './locales/kn/translation.json';

// Get saved language preference safely
let savedLanguage;
try {
  savedLanguage = localStorage.getItem('preferredLanguage');
} catch (error) {
  console.warn('Could not access localStorage:', error);
  savedLanguage = null;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      kn: {
        translation: knTranslation
      }
    },
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
