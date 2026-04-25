/**
 * NFC Module for Terra Brew Mobile.
 * Handles reading and writing NFC tags for product authentication.
 * 
 * On Android: Uses nfc-manager for full NFC read/write capabilities
 * On iOS: Uses NFCNDEFReaderSession (read-only via CoreNFC)
 * 
 * NFC Tag Data Format:
 * - NDEF record with URI: terrabrew://verify/{qrCode}
 * - External record type: urn:nfc:ext:terrabrew.app:trace
 * - Payload: JSON { qrCode, entityType, entityId, hmacSig }
 */
import { Platform, Alert } from 'react-native'
import NfcManager, { NfcTech, Ndef } from 'nfc-manager'
import { verifyNFCTap, verifyQROnline } from './api'
import type { NFCScanResult, QRVerificationResult } from '@/types'
import { NFC_CONFIG } from '@/constants'

// ════════════════════════════════════════════════════════════════
// NFC INITIALIZATION
// ════════════════════════════════════════════════════════════════

let nfcInitialized = false

export async function initNFC(): Promise<boolean> {
  if (Platform.OS === 'web') return false

  try {
    await NfcManager.start()
    nfcInitialized = true
    return true
  } catch {
    // NFC not available on this device
    nfcInitialized = false
    return false
  }
}

export async function isNFCSupported(): Promise<boolean> {
  if (Platform.OS === 'web') return false
  try {
    const supported = await NfcManager.isSupported()
    return supported
  } catch {
    return false
  }
}

export async function isNFSEnabled(): Promise<boolean> {
  try {
    const enabled = await NfcManager.isEnabled()
    return enabled
  } catch {
    return false
  }
}

export function cleanupNFC(): void {
  if (nfcInitialized) {
    NfcManager.cancelTechnologyRequest().catch(() => {})
  }
}

// ════════════════════════════════════════════════════════════════
// NFC READ (verify tag)
// ════════════════════════════════════════════════════════════════

export async function scanNFCTag(): Promise<NFCScanResult | null> {
  if (!nfcInitialized) {
    await initNFC()
  }

  try {
    if (Platform.OS === 'android') {
      return await scanNFCAndroid()
    } else if (Platform.OS === 'ios') {
      return await scanNFCIOS()
    }
    return null
  } catch (error) {
    if (error instanceof Error && error.message.includes('cancelled')) {
      return null // User cancelled
    }
    throw error
  }
}

async function scanNFCAndroid(): Promise<NFCScanResult | null> {
  await NfcManager.requestTechnology(NfcTech.Ndef, {
    alertMessage: 'Chạm điện thoại vào thẻ NFC trên sản phẩm cà phê',
  })

  try {
    const tag = await NfcManager.getTag()
    if (!tag) return null

    // Parse NDEF records
    const ndefRecords = tag.ndefMessage || []
    for (const record of ndefRecords) {
      // Look for URI record
      if (record.tnf === 1) { // Well-known type
        const payload = Ndef.text.decodePayload(record)
        if (payload.includes('terrabrew://')) {
          const qrCode = payload.replace('terrabrew://verify/', '')
          return {
            type: 'nfc',
            code: qrCode,
            tagId: tag.id,
          }
        }
      }
    }

    // Fallback: use tag ID as identifier
    if (tag.id) {
      return {
        type: 'nfc',
        code: `NFC-${tag.id}`,
        tagId: tag.id,
      }
    }

    return null
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {})
  }
}

async function scanNFCIOS(): Promise<NFCScanResult | null> {
  // iOS uses a session-based approach
  return new Promise((resolve, reject) => {
    // iOS NFC scanning is triggered via NfcManager.requestTechnology
    // with an alert message shown to the user
    NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Giữ iPhone gần thẻ NFC trên sản phẩm cà phê để xác minh',
    })
      .then(async () => {
        const tag = await NfcManager.getTag()
        if (!tag) {
          resolve(null)
          return
        }

        const ndefRecords = tag.ndefMessage || []
        for (const record of ndefRecords) {
          try {
            const payload = Ndef.text.decodePayload(record)
            if (payload.includes('terrabrew://')) {
              const qrCode = payload.replace('terrabrew://verify/', '')
              resolve({
                type: 'nfc',
                code: qrCode,
                tagId: tag.id,
              })
              return
            }
          } catch {
            // Skip non-text records
          }
        }

        if (tag.id) {
          resolve({
            type: 'nfc',
            code: `NFC-${tag.id}`,
            tagId: tag.id,
          })
          return
        }

        resolve(null)
      })
      .catch((error) => {
        if (error.message?.includes('cancelled') || error.message?.includes('Invalid')) {
          resolve(null) // User cancelled or session invalid
        } else {
          reject(error)
        }
      })
      .finally(() => {
        NfcManager.cancelTechnologyRequest().catch(() => {})
        NfcManager.setAlertMessageIOS('Hoàn thành').catch(() => {})
      })
  })
}

// ════════════════════════════════════════════════════════════════
// NFC WRITE (bind tag to entity)
// ════════════════════════════════════════════════════════════════

export async function writeNFCTag(qrCode: string, entityType: string, entityId: string, hmacSignature: string): Promise<boolean> {
  if (Platform.OS === 'ios') {
    Alert.alert('Không hỗ trợ', 'Ghi thẻ NFC chỉ khả dụng trên thiết bị Android')
    return false
  }

  try {
    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'Chạm thẻ NFC để ghi dữ liệu truy xuất nguồn gốc',
    })

    const uri = `terrabrew://verify/${qrCode}`
    const jsonData = JSON.stringify({ qrCode, entityType, entityId, hmacSig: hmacSignature.substring(0, 16) })

    // Write URI record + external data record
    const ndefMessage = [
      Ndef.uriRecord(uri),
      Ndef.record(Ndef.TNF_EXTERNAL_TYPE, NFC_CONFIG.NDEF_RECORD_TYPE, null, Buffer.from(jsonData, 'utf8')),
    ]

    await NfcManager.writeNdefMessage(ndefMessage)
    
    Alert.alert('Thành công', 'Đã ghi dữ liệu lên thẻ NFC thành công!')
    return true
  } catch (error) {
    Alert.alert('Lỗi', `Không thể ghi thẻ NFC: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return false
  } finally {
    NfcManager.cancelTechnologyRequest().catch(() => {})
  }
}

// ════════════════════════════════════════════════════════════════
// VERIFY NFC TAG (online verification)
// ════════════════════════════════════════════════════════════════

export async function verifyNFC(code: string, tagId?: string): Promise<QRVerificationResult | null> {
  try {
    // Try NFC-specific verification first if we have a tagId
    if (tagId) {
      const response = await verifyNFCTap(tagId)
      if (response.success && response.data) {
        return response.data
      }
    }

    // Fallback to QR verification
    const response = await verifyQROnline(code)
    if (response.success && response.data) {
      return response.data
    }

    return null
  } catch {
    return null
  }
}
