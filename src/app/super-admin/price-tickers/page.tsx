'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PriceTickersRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/super-admin/dashboard/price-tickers')
  }, [router])
  return null
}
