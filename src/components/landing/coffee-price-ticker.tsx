'use client'

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, Coffee, BarChart3 } from 'lucide-react'

interface PriceItem {
  code: string
  name: string
  exchange: string
  unit: string
  currency: string
  price: number
  change: number
  changePercent: number
  isUp: boolean
  dayHigh: number
  dayLow: number
  timestamp: string
}

export default function CoffeePriceTicker() {
  const [prices, setPrices] = useState<PriceItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isLive, setIsLive] = useState(true)

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/coffee-prices')
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setPrices(json.data)
          setLastUpdated(json.lastUpdated)
          setIsLive(true)
        }
      } else {
        setIsLive(false)
      }
    } catch {
      setIsLive(false)
    }
  }, [])

  useEffect(() => {
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [fetchPrices])

  // Format price based on unit
  const formatPrice = (price: number, unit: string) => {
    if (unit === 'USd/lb') {
      return `${price.toFixed(2)}¢/lb`
    }
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mt`
  }

  const formatChange = (change: number, isUp: boolean) => {
    const sign = isUp ? '+' : ''
    if (Math.abs(change) >= 100) {
      return `${sign}${change.toFixed(0)}`
    }
    return `${sign}${change.toFixed(2)}`
  }

  if (prices.length === 0) return null

  return (
    <div className="ticker-container relative bg-[#561C24] border-b border-[#C7B7A3]/20 overflow-hidden">
      <div className="flex items-center">
        {/* Fixed label on the left */}
        <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#6D2932] border-r border-[#C7B7A3]/15 z-10">
          <BarChart3 className="w-3.5 h-3.5 text-[#ffc627]" />
          <span className="text-[10px] font-bold text-[#E8D8C4] uppercase tracking-wider whitespace-nowrap hidden sm:inline">
            Live Prices
          </span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
        </div>

        {/* Scrolling ticker */}
        <div className="overflow-hidden flex-1 relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#561C24] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#561C24] to-transparent z-10 pointer-events-none" />

          {/* Double content for seamless loop */}
          <div
            className="ticker-scroll flex whitespace-nowrap"
            style={{
              animation: 'tickerScroll 50s linear infinite',
            }}
          >
            {[...prices, ...prices].map((item, i) => (
              <div
                key={`${item.code}-${i}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 border-r border-[#C7B7A3]/10 hover:bg-[#6D2932]/30 transition-colors cursor-default"
              >
                <Coffee className="w-3 h-3 text-[#C7B7A3]/40 shrink-0" />
                <span className="text-[10px] font-bold text-[#E8D8C4]">{item.code}</span>
                <span className="text-[10px] text-[#C7B7A3]/50 hidden xl:inline max-w-[100px] truncate">{item.name}</span>
                <span className="text-xs font-bold text-[#E8D8C4]">
                  {formatPrice(item.price, item.unit)}
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${item.isUp ? 'text-green-400' : 'text-red-400'}`}>
                  {item.isUp ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {formatChange(item.change, item.isUp)}
                  <span className="text-[8px] opacity-70">
                    ({item.isUp ? '+' : ''}{item.changePercent}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timestamp */}
      {lastUpdated && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none hidden md:block">
          <span className="text-[7px] text-[#C7B7A3]/30 whitespace-nowrap">
            {new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · Simulated
          </span>
        </div>
      )}
    </div>
  )
}
