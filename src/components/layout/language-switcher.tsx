'use client'

import { useI18n, LOCALE_FLAGS, LOCALE_LABELS } from '@/i18n'
import { Globe } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'compact' | 'icon' }) {
  const { lang, setLang, supportedLocales } = useI18n()

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center justify-center rounded-md p-2 hover:bg-accent transition-colors" aria-label="Change language">
          <Globe className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {supportedLocales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => setLang(locale)}
              className={`flex items-center gap-2 cursor-pointer ${locale === lang ? 'bg-accent font-medium' : ''}`}
            >
              <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_LABELS[locale]}</span>
              {locale === lang && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent transition-colors">
          <Globe className="h-3.5 w-3.5" />
          <span>{LOCALE_FLAGS[lang]}</span>
          <span className="hidden sm:inline">{lang.toUpperCase()}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {supportedLocales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => setLang(locale)}
              className={`flex items-center gap-2 cursor-pointer ${locale === lang ? 'bg-accent font-medium' : ''}`}
            >
              <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
              <span>{LOCALE_LABELS[locale]}</span>
              {locale === lang && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors border border-border">
        <Globe className="h-4 w-4" />
        <span>{LOCALE_FLAGS[lang]}</span>
        <span>{LOCALE_LABELS[lang]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => setLang(locale)}
            className={`flex items-center gap-2 cursor-pointer ${locale === lang ? 'bg-accent font-medium' : ''}`}
          >
            <span className="text-base leading-none">{LOCALE_FLAGS[locale]}</span>
            <span>{LOCALE_LABELS[locale]}</span>
            {locale === lang && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
