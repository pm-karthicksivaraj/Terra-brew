/**
 * i18n configuration for Terra Brew Coffee Traceability Platform.
 *
 * Strategy: Client-side language toggle (no URL-based locale routing).
 * This keeps existing page URLs intact while providing centralized translations.
 *
 * Usage:
 *   import { useI18n } from '@/i18n'
 *   const { t, lang, setLang } = useI18n()
 *   <p>{t('auth.signIn')}</p>  → "Đăng nhập" or "Sign In"
 */

export type Locale = 'vi' | 'en'

export const DEFAULT_LOCALE: Locale = 'vi'
export const SUPPORTED_LOCALES: Locale[] = ['vi', 'en']

/**
 * Get a nested value from an object using dot notation.
 * e.g., getByPath({ auth: { signIn: 'Sign In' } }, 'auth.signIn') → 'Sign In'
 */
export function getByPath(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path // fallback: return the key itself
    }
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : path
}
