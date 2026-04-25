/**
 * Custom hook for NFC scanning and writing.
 */
import { useState, useEffect, useCallback } from 'react'
import { initNFC, isNFCSupported, isNFSEnabled, scanNFCTag, writeNFCTag, verifyNFC, cleanupNFC } from '@/lib/nfc'
import type { NFCScanResult, QRVerificationResult } from '@/types'

interface NFCState {
  isSupported: boolean
  isEnabled: boolean
  isScanning: boolean
  lastScan: NFCScanResult | null
  verificationResult: QRVerificationResult | null
  error: string | null
}

export function useNFC() {
  const [state, setState] = useState<NFCState>({
    isSupported: false,
    isEnabled: false,
    isScanning: false,
    lastScan: null,
    verificationResult: null,
    error: null,
  })

  // Initialize NFC on mount
  useEffect(() => {
    async function setup() {
      const supported = await isNFCSupported()
      if (supported) {
        await initNFC()
        const enabled = await isNFSEnabled()
        setState(prev => ({ ...prev, isSupported: true, isEnabled: enabled }))
      }
    }
    setup()
    return () => cleanupNFC()
  }, [])

  const scan = useCallback(async (): Promise<NFCScanResult | null> => {
    setState(prev => ({ ...prev, isScanning: true, error: null, verificationResult: null }))
    try {
      const result = await scanNFCTag()
      setState(prev => ({ ...prev, isScanning: false, lastScan: result }))
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'NFC scan failed'
      setState(prev => ({ ...prev, isScanning: false, error: message }))
      return null
    }
  }, [])

  const scanAndVerify = useCallback(async (): Promise<QRVerificationResult | null> => {
    const scanResult = await scan()
    if (!scanResult) return null

    const verification = await verifyNFC(scanResult.code, scanResult.tagId)
    setState(prev => ({ ...prev, verificationResult: verification }))
    return verification
  }, [scan])

  const write = useCallback(async (qrCode: string, entityType: string, entityId: string, hmacSignature: string): Promise<boolean> => {
    return writeNFCTag(qrCode, entityType, entityId, hmacSignature)
  }, [])

  return {
    ...state,
    scan,
    scanAndVerify,
    write,
  }
}
