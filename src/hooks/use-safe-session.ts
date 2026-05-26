'use client'

import { useSession as useNextAuthSession } from 'next-auth/react'

/**
 * Safe wrapper around next-auth's useSession hook.
 * During static prerendering, useSession() can return undefined,
 * which causes destructuring errors. This hook returns a safe default
 * when the session is not available.
 */
interface SafeSessionResult {
  data: any | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  update: (() => Promise<any>) | null
}

export function useSafeSession(): SafeSessionResult {
  try {
    const result = useNextAuthSession()
    if (!result) {
      return { data: null, status: 'unauthenticated', update: null }
    }
    return {
      data: result.data ?? null,
      status: result.status ?? 'unauthenticated',
      update: result.update ?? null,
    }
  } catch {
    return { data: null, status: 'unauthenticated', update: null }
  }
}
