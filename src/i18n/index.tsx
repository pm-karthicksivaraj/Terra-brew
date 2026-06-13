'use client'

import { useState, useCallback, useEffect, createContext, useContext, type ReactNode } from 'react'
import type { Locale } from './config'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getByPath } from './config'

// ─── Translation dictionaries ────────────────────────────────────
// We import the JSON files directly. Next.js handles JSON imports natively.

import viMessages from './vi.json'
import enMessages from './en.json'
import ptMessages from './pt.json'
import amMessages from './am.json'
import swMessages from './sw.json'

const MESSAGES: Record<Locale, Record<string, unknown>> = {
  vi: viMessages,
  en: enMessages,
  pt: ptMessages,
  am: amMessages,
  sw: swMessages,
}

// ─── Context ─────────────────────────────────────────────────────

interface I18nContextValue {
  lang: Locale
  setLang: (lang: Locale) => void
  t: (key: string, fallback?: string) => string
  /** Inline translation: t2('Xin chào', 'Hello') — pick by current lang */
  t2: (vi: string, en: string) => string
  supportedLocales: Locale[]
}

const I18nContext = createContext<I18nContextValue>({
  lang: DEFAULT_LOCALE,
  setLang: () => {},
  t: (key: string) => key,
  t2: (vi: string, en: string) => vi,
  supportedLocales: SUPPORTED_LOCALES as Locale[],
})

// ─── Provider ────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>(DEFAULT_LOCALE)

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('terra-brew-lang') as Locale | null
      if (saved && (saved === 'vi' || saved === 'en' || saved === 'pt' || saved === 'am' || saved === 'sw')) {
        setLangState(saved)
      }
    } catch {
      // ignore
    }
  }, [])

  const setLang = useCallback((newLang: Locale) => {
    setLangState(newLang)
    try {
      localStorage.setItem('terra-brew-lang', newLang)
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback((key: string, fallback?: string): string => {
    const result = getByPath(MESSAGES[lang], key)
    if (result !== key) return result
    // Fallback: try other languages in order
    const otherLangs: Locale[] = (SUPPORTED_LOCALES as readonly Locale[]).filter(l => l !== lang)
    for (const otherLang of otherLangs) {
      const otherResult = getByPath(MESSAGES[otherLang], key)
      if (otherResult !== key) return otherResult
    }
    // Final fallback: use provided fallback or the key
    return fallback || key
  }, [lang])

  const t2 = useCallback((vi: string, en: string): string => {
    return lang === 'vi' ? vi : en
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t, t2, supportedLocales: SUPPORTED_LOCALES as Locale[] }}>
      {children}
    </I18nContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────

export function useI18n() {
  return useContext(I18nContext)
}

/**
 * Convenience: use just the t() function and lang toggle.
 * Drop-in replacement for the old inline t = (vi, en) => ... pattern.
 *
 * Migration example:
 *   // Before:
 *   const [lang, setLang] = useState<'vi'|'en'>('vi')
 *   const t = (vi: string, en: string) => lang === 'vi' ? vi : en
 *
 *   // After:
 *   const { t: t2, lang, setLang } = useI18n()
 *   // t2('Xin chào', 'Hello') — same behavior
 *   // t('auth.signIn') — new: lookup from JSON files
 */
export { I18nProvider as default }

// ─── Locale metadata ─────────────────────────────────────────────

export const LOCALE_FLAGS: Record<string, string> = {
  vi: '🇻🇳',
  en: '🇬🇧',
  pt: '🇧🇷',
  am: '🇪🇹',
  sw: '🇰🇪',
}

export const LOCALE_LABELS: Record<string, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  pt: 'Português',
  am: 'አማርኛ',
  sw: 'Kiswahili',
}
