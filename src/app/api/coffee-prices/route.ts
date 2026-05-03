import { NextResponse } from 'next/server'

// ════════════════════════════════════════════════════════════════
// Global Coffee Commodity Price API
// Returns simulated real-time coffee prices based on ICE Futures
// In production, replace with actual commodity API (e.g. ICE, Intercontinental Exchange)
// ════════════════════════════════════════════════════════════════

// Base prices (USD/lb or USD/mt depending on contract)
const BASE_PRICES: Record<string, { name: string; exchange: string; unit: string; basePrice: number; currency: string; volatility: number }> = {
  'KC': { name: 'ICE Coffee C (Arabica)', exchange: 'ICE Futures US', unit: 'USd/lb', basePrice: 192.45, currency: 'USd', volatility: 2.5 },
  'RC': { name: 'London Robusta', exchange: 'ICE Futures Europe', unit: 'USD/mt', basePrice: 3245.00, currency: 'USD', volatility: 35 },
  'VN-ROB': { name: 'Vietnam Robusta Grade 2', exchange: 'Dak Lak Spot', unit: 'USD/mt', basePrice: 3180.00, currency: 'USD', volatility: 28 },
  'BR-SANTOS': { name: 'Brazil Santos NY2', exchange: 'São Paulo Spot', unit: 'USD/mt', basePrice: 4850.00, currency: 'USD', volatility: 45 },
  'ET-YIRGA': { name: 'Ethiopia Yirgacheffe Washed', exchange: 'Addis Ababa ECX', unit: 'USD/mt', basePrice: 6200.00, currency: 'USD', volatility: 55 },
  'KE-AA': { name: 'Kenya AA Top', exchange: 'Nairobi Auction', unit: 'USD/mt', basePrice: 5800.00, currency: 'USD', volatility: 50 },
  'CO-COL': { name: 'Colombia Excelso EP', exchange: 'Bogota Spot', unit: 'USD/mt', basePrice: 5100.00, currency: 'USD', volatility: 40 },
  'ICCO': { name: 'ICCO Composite', exchange: 'International', unit: 'USd/lb', basePrice: 185.20, currency: 'USd', volatility: 1.8 },
}

// Seeded pseudo-random for consistent prices within a short time window
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

export async function GET() {
  // Use minute-level time seed so prices are stable within a minute
  const now = new Date()
  const minuteSeed = Math.floor(now.getTime() / 60000)

  const prices = Object.entries(BASE_PRICES).map(([code, config]) => {
    // Generate a small random change per minute
    const changeSeed = seededRandom(minuteSeed + code.charCodeAt(0) * 137)
    const changePercent = (changeSeed - 0.5) * config.volatility / config.basePrice * 2
    const currentPrice = +(config.basePrice * (1 + changePercent)).toFixed(2)
    const change = +(config.basePrice * changePercent).toFixed(2)
    const changePercentStr = +(changePercent * 100).toFixed(2)
    const isUp = change >= 0

    // Generate day high/low with slightly more range
    const highSeed = seededRandom(minuteSeed + code.charCodeAt(1) * 251 + 1)
    const lowSeed = seededRandom(minuteSeed + code.charCodeAt(2) * 379 + 2)
    const dayHigh = +(currentPrice * (1 + Math.abs(highSeed) * config.volatility / config.basePrice * 0.5)).toFixed(2)
    const dayLow = +(currentPrice * (1 - Math.abs(lowSeed) * config.volatility / config.basePrice * 0.5)).toFixed(2)

    return {
      code,
      name: config.name,
      exchange: config.exchange,
      unit: config.unit,
      currency: config.currency,
      price: currentPrice,
      change,
      changePercent: changePercentStr,
      isUp,
      dayHigh,
      dayLow,
      timestamp: now.toISOString(),
    }
  })

  return NextResponse.json({
    success: true,
    data: prices,
    lastUpdated: now.toISOString(),
    nextUpdate: new Date(now.getTime() + 60000).toISOString(),
    source: 'Terra Brew Commodity Feed (Simulated)',
    disclaimer: 'Prices are simulated for demonstration. In production, connect to ICE Futures, ECX, and regional exchange APIs for live data.',
  })
}
