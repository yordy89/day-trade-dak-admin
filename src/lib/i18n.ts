import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import enCommon from '@/locales/en/common.json'
import esCommon from '@/locales/es/common.json'
import enDashboard from '@/locales/en/dashboard.json'
import esDashboard from '@/locales/es/dashboard.json'
import enAuth from '@/locales/en/auth.json'
import esAuth from '@/locales/es/auth.json'
import enPermissions from '@/locales/en/permissions.json'
import esPermissions from '@/locales/es/permissions.json'
import enAffiliates from '@/locales/en/affiliates.json'
import esAffiliates from '@/locales/es/affiliates.json'
import enUsers from '@/locales/en/users.json'
import esUsers from '@/locales/es/users.json'
import enFinancing from '@/locales/en/financing.json'
import esFinancing from '@/locales/es/financing.json'
import enTradingJournal from '@/locales/en/trading-journal.json'
import esTradingJournal from '@/locales/es/trading-journal.json'

const resources = {
  en: {
    common: enCommon,
    dashboard: enDashboard,
    auth: enAuth,
    permissions: enPermissions,
    affiliates: enAffiliates,
    users: enUsers,
    financing: enFinancing,
    'trading-journal': enTradingJournal,
  },
  es: {
    common: esCommon,
    dashboard: esDashboard,
    auth: esAuth,
    permissions: esPermissions,
    affiliates: esAffiliates,
    users: esUsers,
    financing: esFinancing,
    'trading-journal': esTradingJournal,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'dashboard', 'auth', 'permissions', 'affiliates', 'users', 'financing', 'trading-journal'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n