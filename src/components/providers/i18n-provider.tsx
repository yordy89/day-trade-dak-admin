'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    const initI18n = async () => {
      if (!i18n.isInitialized) {
        await i18n.init()
      }
      setIsI18nInitialized(true)
    }
    
    initI18n()
  }, [])

  if (!isI18nInitialized) {
    return <div>Loading translations...</div>
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}