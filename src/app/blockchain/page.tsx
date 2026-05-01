'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, Link2, Search, Loader2,
  ShieldCheck, ShieldX, ArrowDown, CheckCircle2, XCircle,
  Anchor, ExternalLink, Link as LinkIcon, Box, Calendar, Network,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface HashChainBlock {
  id: string
  batchId: string
  blockIndex: number
  stage: string
  data: string
  dataHash: string
  previousHash: string
  blockHash: string
  timestamp: string
  recordedBy: string | null
}

interface VerificationResult {
  valid: boolean
  totalBlocks: number
  brokenAt?: number
  message: string
}

interface AnchorData {
  id?: string
  batchId?: string
  blockIndex?: number
  merkleRoot?: string
  blockCount?: number
  firstBlockHash?: string
  lastBlockHash?: string
  txHash?: string
  network?: string
  blockNumber?: number
  anchorBlockHash?: string
  anchoredAt?: string
  createdAt?: string
}

function truncateHash(hash: string, len = 8): string {
  if (!hash) return '-'
  return `${hash.slice(0, len)}...${hash.slice(-len)}`
}

export default function BlockchainPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const [batchId, setBatchId] = useState('')
  const [blocks, setBlocks] = useState<HashChainBlock[]>([])
  const [verification, setVerification] = useState<VerificationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [searched, setSearched] = useState(false)

  // On-chain anchor states
  const [anchoring, setAnchoring] = useState(false)
  const [anchorStatus, setAnchorStatus] = useState<{ anchored: boolean; anchor: AnchorData | null } | null>(null)
  const [showAnchorDialog, setShowAnchorDialog] = useState(false)


  const checkAnchorStatus = useCallback(async (batch: string) => {
    try {
      const res = await fetch(`/api/on-chain/anchor?batchId=${encodeURIComponent(batch)}`)
      const data = await res.json()
      if (data.success) {
        setAnchorStatus(data.data ?? null)
      }
    } catch {
      // ignore
    }
  }, [])

  const fetchChain = useCallback(async () => {
    if (!batchId.trim()) {
      toast.error(t2('Nhập mã lô', 'Enter a Batch ID'))
      return
    }
    try {
      setLoading(true)
      setSearched(true)
      setAnchorStatus(null)
      const res = await fetch(`/api/hash-chain?batchId=${encodeURIComponent(batchId.trim())}`)
      const data = await res.json()
      if (data.success) {
        setBlocks(Array.isArray(data.data?.blocks) ? data.data.blocks : [])
        setVerification(data.data?.verification ?? null)
        // Check anchor status after blocks are loaded
        checkAnchorStatus(batchId.trim())
      } else {
        toast.error(data.error || t2('Lỗi khi tải', 'Error loading'))
        setBlocks([])
        setVerification(null)
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
      setBlocks([])
      setVerification(null)
    } finally {
      setLoading(false)
    }
  }, [batchId, t, checkAnchorStatus])

  const verifyChain = useCallback(async () => {
    if (!batchId.trim()) return
    try {
      setVerifying(true)
      const res = await fetch(`/api/hash-chain?batchId=${encodeURIComponent(batchId.trim())}`)
      const data = await res.json()
      if (data.success) {
        const v: VerificationResult = data.data.verification
        setVerification(v)
        if (v.valid) {
          toast.success(t2('Chuỗi hợp lệ! ✓', 'Chain verified! ✓'))
        } else {
          toast.error(t(`Chuỗi bị đứt tại block ${v.brokenAt}`, `Chain broken at block ${v.brokenAt}`))
        }
      }
    } catch {
      toast.error(t2('Lỗi xác minh', 'Verification error'))
    } finally {
      setVerifying(false)
    }
  }, [batchId, t])

  const handleAnchor = useCallback(async () => {
    if (!batchId.trim()) return
    try {
      setAnchoring(true)
      const res = await fetch('/api/on-chain/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchId.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(t2('Đã neo trên chuỗi thành công!', 'Anchored on-chain successfully!'))
        // Refresh anchor status
        checkAnchorStatus(batchId.trim())
      } else {
        toast.error(data.error || t2('Lỗi khi neo trên chuỗi', 'Anchoring error'))
      }
    } catch {
      toast.error(t2('Lỗi kết nối khi neo', 'Connection error during anchoring'))
    } finally {
      setAnchoring(false)
      setShowAnchorDialog(false)
    }
  }, [batchId, t, checkAnchorStatus])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchChain()
    }
  }

  // Determine if "Anchor On-Chain" button should be shown
  const hasOnChainAnchorStage = blocks.some(b => b.stage === 'on_chain_anchor')
  const showAnchorButton = blocks.length > 0 && !hasOnChainAnchorStage

  if (status === 'loading') {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primaryflex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  return (
    <DashboardShell>
      <div>
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Link2 className="w-5 h-5 text-foreground" />
            {t2('Xem Chuỗi Blockchain', 'Blockchain Hash Chain Viewer')}
          </h2>
          <p className="text-sm text-foreground">{t2('Truy xuất nguồn gốc bằng chuỗi băm', 'Trace origin with hash chain verification')}</p>
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-lg min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
            <Input
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t2('Nhập mã lô (Batch ID)...', 'Enter Batch ID...')}
              className="pl-9 rounded-xl border-border focus:border-border bg-background"
            />
          </div>
          <Button
            onClick={fetchChain}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t2('Tìm kiếm', 'Search')}
          </Button>
          {blocks.length > 0 && (
            <Button
              onClick={verifyChain}
              disabled={verifying}
              variant="outline"
              className="gap-2 rounded-xl border-border text-foreground hover:bg-muted"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {t2('Xác minh chuỗi', 'Verify Chain')}
            </Button>
          )}
          {showAnchorButton && (
            <Button
              onClick={() => setShowAnchorDialog(true)}
              disabled={anchoring}
              variant="outline"
              className="gap-2 rounded-xl border-amber-400 text-amber-700 hover:bg-amber-50 bg-amber-50/50"
            >
              {anchoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Anchor className="w-4 h-4" />}
              {t2('Neo trên chuỗi', 'Anchor On-Chain')}
            </Button>
          )}
        </div>

        {/* Verification Result Banner */}
        {verification && (
            <div className={`mb-4 p-4 rounded-2xl flex items-center gap-3 ${
 verification.valid
 ? 'bg-green-50 border border-green-200'
 : 'bg-red-50 border border-red-200'
 }`}>
              {verification.valid ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${verification.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {verification.valid
                    ? t2('Chuỗi hợp lệ!', 'Chain Verified!')
                    : t2('Chuỗi bị đứt!', 'Chain Broken!')}
                </p>
                <p className={`text-xs ${verification.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {verification.message}
                  {' '}&bull; {t(`${verification.totalBlocks} khối`, `${verification.totalBlocks} blocks`)}
                </p>
              </div>
            </div>
          )}
{/* Anchor Status Banner */}
        {anchorStatus && (
            <div className="mb-6">
              {anchorStatus.anchored && anchorStatus.anchor ? (
                <div className="p-4 rounded-2xl bg-green-50 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Anchor className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        {t2('Đã neo trên chuỗi', 'Anchored On-Chain')}
                      </p>
                      <p className="text-xs text-green-600">
                        {t2('Dữ liệu đã được xác nhận trên blockchain', 'Data has been confirmed on the blockchain')}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-[10px] border-0 ml-auto">
                      {anchorStatus.anchor.network || 'sepolia'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Tx Hash */}
                    {anchorStatus.anchor.txHash && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          {t2('Tx Hash', 'Tx Hash')}
                        </p>
                        <p className="text-[10px] text-green-800 font-mono bg-green-100/60 rounded-lg px-2 py-1 truncate">
                          {truncateHash(anchorStatus.anchor.txHash, 14)}
                        </p>
                      </div>
                    )}
                    {/* Merkle Root */}
                    {anchorStatus.anchor.merkleRoot && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {t2('Merkle Root', 'Merkle Root')}
                        </p>
                        <p className="text-[10px] text-green-800 font-mono bg-green-100/60 rounded-lg px-2 py-1 truncate">
                          {truncateHash(anchorStatus.anchor.merkleRoot, 14)}
                        </p>
                      </div>
                    )}
                    {/* Block Number */}
                    {anchorStatus.anchor.blockNumber != null && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <Box className="w-3 h-3" />
                          {t2('Số khối', 'Block Number')}
                        </p>
                        <p className="text-[10px] text-green-800 font-mono bg-green-100/60 rounded-lg px-2 py-1">
                          {anchorStatus.anchor.blockNumber.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {/* Network */}
                    {anchorStatus.anchor.network && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <Network className="w-3 h-3" />
                          {t2('Mạng', 'Network')}
                        </p>
                        <p className="text-[10px] text-green-800 bg-green-100/60 rounded-lg px-2 py-1 capitalize">
                          {anchorStatus.anchor.network}
                        </p>
                      </div>
                    )}
                    {/* Anchored At */}
                    {anchorStatus.anchor.anchoredAt && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t2('Thời gian neo', 'Anchored At')}
                        </p>
                        <p className="text-[10px] text-green-800 bg-green-100/60 rounded-lg px-2 py-1">
                          {new Date(anchorStatus.anchor.anchoredAt).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                    {/* Anchor Block Hash */}
                    {anchorStatus.anchor.anchorBlockHash && (
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-green-600 uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          {t2('Băm khối neo', 'Anchor Block Hash')}
                        </p>
                        <p className="text-[10px] text-green-800 font-mono bg-green-100/60 rounded-lg px-2 py-1 truncate">
                          {truncateHash(anchorStatus.anchor.anchorBlockHash, 14)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Anchor className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      {t2('Chưa được neo trên chuỗi', 'Not yet anchored on-chain')}
                    </p>
                    <p className="text-xs text-amber-600">
                      {t('Dữ liệu chuỗi băm chưa được xác nhận trên blockchain. Nhấn "Neo trên chuỗi" để xác nhận.', 'Hash chain data has not been confirmed on the blockchain. Click "Anchor On-Chain" to confirm.')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
{/* Anchor Confirmation Dialog */}
        <AlertDialog open={showAnchorDialog} onOpenChange={setShowAnchorDialog}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-foreground">
                <Anchor className="w-5 h-5 text-amber-600" />
                {t2('Xác nhận neo trên chuỗi', 'Confirm On-Chain Anchoring')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-foreground">
                {t(
                  `Bạn có chắc chắn muốn neo dữ liệu của lô "${batchId}" lên blockchain? Hành động này không thể hoàn tác và sẽ ghi dữ liệu Merkle root lên mạng blockchain.`,
                  `Are you sure you want to anchor the data for batch "${batchId}" on the blockchain? This action cannot be undone and will record the Merkle root on the blockchain network.`
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-2 p-3 rounded-xl bg-muted border border-border">
              <p className="text-[10px] font-bold text-foreground uppercase mb-1">{t2('Mã lô', 'Batch ID')}</p>
              <p className="text-sm text-foreground font-mono font-bold">{batchId}</p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl border-border text-foreground hover:bg-muted">
                {t2('Hủy', 'Cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAnchor}
                disabled={anchoring}
                className="rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white gap-2"
              >
                {anchoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t2('Đang neo...', 'Anchoring...')}
                  </>
                ) : (
                  <>
                    <Anchor className="w-4 h-4" />
                    {t2('Xác nhận neo', 'Confirm Anchor')}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Empty State */}
        {!searched && blocks.length === 0 && (
          <Card className="rounded-2xl border-0 shadow-sm p-12">
            <div className="flex flex-col items-center gap-4 text-foreground">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
                <Link2 className="w-10 h-10" />
              </div>
              <p className="text-sm text-center max-w-md">
                {t2('Nhập mã lô (Batch ID) để xem chuỗi blockchain', 'Enter a Batch ID to view its blockchain record')}
              </p>
            </div>
          </Card>
        )}

        {/* No results */}
        {searched && blocks.length === 0 && !loading && (
          <Card className="rounded-2xl border-0 shadow-sm p-12">
            <div className="flex flex-col items-center gap-4 text-foreground">
              <Link2 className="w-10 h-10" />
              <p className="text-sm text-center">
                {t(`Không tìm thấy khối nào cho mã lô "${batchId}"`, `No blocks found for batch "${batchId}"`)}
              </p>
            </div>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">{t2('Đang tải chuỗi...', 'Loading chain...')}</span>
            </div>
          </div>
        )}

        {/* Chain Visualization */}
        {blocks.length > 0 && !loading && (
          <div className="space-y-0">
            {blocks.map((block, i) => {
                const isBroken = verification && !verification.valid && verification.brokenAt !== undefined && block.blockIndex >= verification.brokenAt
                const isVerified = verification ? verification.valid || (verification.brokenAt !== undefined && block.blockIndex < verification.brokenAt) : true

                return (
                  <div key={block.id}>
                    {/* Connector Arrow */}
                    {i > 0 && (
                      <div className="flex justify-center py-1">
                        <div className="flex flex-col items-center">
                          <div className="w-0.5 h-4 bg-muted" />
                          <ArrowDown className="w-3 h-3 text-foreground -mt-1" />
                        </div>
                      </div>
                    )}

                    {/* Block Card */}
                    <Card className={`rounded-2xl border-0 shadow-sm overflow-hidden transition-all ${
                      isBroken ? 'ring-2 ring-red-300 bg-red-50/30' : 'bg-background'
                    }`}>
                      {/* Block Header */}
                      <div className={`px-4 py-2.5 flex items-center justify-between ${
                        isBroken
                          ? 'bg-red-100 border-b border-red-200'
                          : 'border-b border-border border-b border-border'
                      }`}>
                        <div className="flex items-center gap-2">
                          {isVerified ? (
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <ShieldX className="w-4 h-4 text-red-500" />
                          )}
                          <span className="text-xs font-bold text-foreground">
                            {t(`Khối #${block.blockIndex}`, `Block #${block.blockIndex}`)}
                          </span>
                          <Badge variant="outline" className="text-[10px] border-border text-foreground">
                            {block.stage}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-foreground">
                            {new Date(block.timestamp).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isVerified ? (
                            <Badge className="bg-green-100 text-green-700 text-[10px] border-0">{t2('Đã xác minh', 'Verified')}</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 text-[10px] border-0">{t2('Lỗi', 'Broken')}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Block Content */}
                      <div className="px-4 py-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          {/* Data Hash */}
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-foreground uppercase">{t2('Băm dữ liệu', 'Data Hash')}</p>
                            <p className="text-[10px] text-foreground font-mono bg-muted rounded-lg px-2 py-1 truncate">
                              {truncateHash(block.dataHash, 12)}
                            </p>
                          </div>

                          {/* Previous Hash */}
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-foreground uppercase">{t2('Băm trước', 'Previous Hash')}</p>
                            <p className={`text-[10px] font-mono rounded-lg px-2 py-1 truncate ${
                              block.blockIndex === 0 ? 'text-foreground bg-muted' : 'text-foreground bg-muted'
                            }`}>
                              {block.blockIndex === 0 ? '0'.repeat(16) + '...' : truncateHash(block.previousHash, 12)}
                            </p>
                          </div>

                          {/* Block Hash */}
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-foreground uppercase">{t2('Băm khối', 'Block Hash')}</p>
                            <p className="text-[10px] text-foreground font-mono bg-muted rounded-lg px-2 py-1 truncate font-bold">
                              {truncateHash(block.blockHash, 12)}
                            </p>
                          </div>

                          {/* Recorded By */}
                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-foreground uppercase">{t2('Ghi bởi', 'Recorded By')}</p>
                            <p className="text-[10px] text-foreground font-mono bg-muted rounded-lg px-2 py-1 truncate">
                              {block.recordedBy ? truncateHash(block.recordedBy, 6) : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Data content (collapsible) */}
                        {block.data && (
                          <div className="mt-3 pt-2 border-t border-border">
                            <p className="text-[10px] font-bold text-foreground uppercase mb-1">{t2('Dữ liệu', 'Data')}</p>
                            <p className="text-[10px] text-foreground font-mono bg-muted/50 rounded-lg px-2 py-1.5 break-all max-h-20 overflow-y-auto">
                              {block.data.length > 500 ? block.data.slice(0, 500) + '...' : block.data}
                            </p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )
              })}
{/* Chain Summary */}
            {verification && (
              <div className="mt-6">
                <Card className="rounded-2xl border-0 shadow-sm p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {verification.valid ? (
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                          <ShieldX className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className={`text-sm font-bold ${verification.valid ? 'text-green-800' : 'text-red-800'}`}>
                          {verification.valid
                            ? t2('Toàn bộ chuỗi đã được xác minh', 'Entire chain verified successfully')
                            : t('Chuỗi có lỗi tại block #' + verification.brokenAt, 'Chain broken at block #' + verification.brokenAt)}
                        </p>
                        <p className="text-xs text-foreground">
                          {t(`Tổng ${verification.totalBlocks} khối trong chuỗi`, `Total ${verification.totalBlocks} blocks in chain`)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-foreground">{t2('Mã lô', 'Batch ID')}</p>
                      <p className="text-xs text-foreground font-mono font-bold">{batchId}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
