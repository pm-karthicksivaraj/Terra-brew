'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Shield, AlertTriangle, CheckCircle2, Clock, Plus, Search, Loader2, Eye,
  FileCheck, MapPin, Satellite, TreePine, TrendingUp, TrendingDown,
  ChevronRight, ChevronLeft, Download, RefreshCw, FileText, Globe2,
  Activity, BarChart3, CalendarDays, Timer, Upload, ExternalLink,
  ArrowUpRight, ArrowDownRight, Minus, Filter, X, Copy, Send,
  CircleDot, Layers, Zap, Target
} from 'lucide-react'
import { FadeIn, StaggerContainer, StaggerItem, MotionCard, hoverScale } from '@/components/ui/motion'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line,
  RadialBarChart, RadialBar, Legend, ComposedChart
} from 'recharts'

// ─── Constants ───────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_review: 'bg-blue-100 text-blue-800 border-blue-200',
  compliant: 'bg-green-100 text-green-800 border-green-200',
  non_compliant: 'bg-red-100 text-red-800 border-red-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200',
}

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
}

const RISK_CHART_COLORS: Record<string, string> = {
  low: '#22c55e', medium: '#eab308', high: '#f97316', critical: '#ef4444',
}

const STATUS_CHART_COLORS: Record<string, string> = {
  pending: '#eab308', in_review: '#3b82f6', compliant: '#22c55e',
  non_compliant: '#ef4444', expired: '#9ca3af',
}

const DDS_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  pending_review: 'bg-yellow-100 text-yellow-800',
}

// ─── Mock Data ───────────────────────────────────────────────────

const MOCK_COMPLIANCE_RECORDS = [
  {
    id: '1', complianceId: 'EUDR-2024-001', batchId: 'BATCH-LN-001', farmerId: 'F-001', farmLandId: 'FL-001',
    status: 'compliant', riskLevel: 'low', deforestationRiskScore: 12,
    satelliteImageryRef: 'SAT-GFW-2024-0401', geolocationLat: 11.9404, geolocationLng: 108.4584,
    landUseType: 'agroforestry', landCoverChangeDate: '2020-12-31',
    verificationDate: '2024-03-15', verifiedBy: 'Dr. Nguyen Van A',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-001.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00123',
    validFrom: '2024-03-15', validUntil: '2025-03-15',
    notes: 'Farm verified via satellite imagery. No deforestation detected since cutoff date.',
    metadata: { region: 'Lam Dong', elevation: 1200, farmSize: 2.5 },
    createdAt: '2024-02-01T10:00:00Z', farmer: { name: 'Nguyen Van Minh' }, farmLand: { farmName: 'Highland Plot A' },
  },
  {
    id: '2', complianceId: 'EUDR-2024-002', batchId: 'BATCH-LN-002', farmerId: 'F-002', farmLandId: 'FL-002',
    status: 'in_review', riskLevel: 'medium', deforestationRiskScore: 45,
    satelliteImageryRef: 'SAT-PLNT-2024-0412', geolocationLat: 11.9500, geolocationLng: 108.4700,
    landUseType: 'monoculture', landCoverChangeDate: '2021-03-15',
    verificationDate: '2024-04-01', verifiedBy: 'Dr. Le Thi B',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-002.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00124',
    validFrom: '2024-04-01', validUntil: '2025-04-01',
    notes: 'Minor land cover change detected near boundary. Under review for clarification.',
    metadata: { region: 'Dak Lak', elevation: 800, farmSize: 5.0 },
    createdAt: '2024-02-15T10:00:00Z', farmer: { name: 'Le Thi Hoa' }, farmLand: { farmName: 'Central Valley Plot' },
  },
  {
    id: '3', complianceId: 'EUDR-2024-003', batchId: 'BATCH-DK-001', farmerId: 'F-003', farmLandId: 'FL-003',
    status: 'non_compliant', riskLevel: 'critical', deforestationRiskScore: 88,
    satelliteImageryRef: 'SAT-SNTL-2024-0420', geolocationLat: 12.1000, geolocationLng: 108.5000,
    landUseType: 'cleared_land', landCoverChangeDate: '2022-06-10',
    verificationDate: '2024-04-10', verifiedBy: 'Dr. Tran Van C',
    dueDiligenceStatement: '',
    tracesCertificateRef: '',
    validFrom: '', validUntil: '',
    notes: 'Significant deforestation detected post cutoff. Non-compliant. Remediation plan required.',
    metadata: { region: 'Gia Lai', elevation: 600, farmSize: 8.0 },
    createdAt: '2024-03-01T10:00:00Z', farmer: { name: 'Tran Van Duc' }, farmLand: { farmName: 'Lowland Expansion' },
  },
  {
    id: '4', complianceId: 'EUDR-2024-004', batchId: 'BATCH-LN-003', farmerId: 'F-004', farmLandId: 'FL-004',
    status: 'compliant', riskLevel: 'low', deforestationRiskScore: 8,
    satelliteImageryRef: 'SAT-GFW-2024-0425', geolocationLat: 11.9300, geolocationLng: 108.4400,
    landUseType: 'shade_grown', landCoverChangeDate: '2019-01-01',
    verificationDate: '2024-04-20', verifiedBy: 'Dr. Pham Thi D',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-004.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00125',
    validFrom: '2024-04-20', validUntil: '2025-04-20',
    notes: 'Shade-grown coffee farm. Excellent forest cover. Fully compliant.',
    metadata: { region: 'Lam Dong', elevation: 1400, farmSize: 1.8 },
    createdAt: '2024-03-15T10:00:00Z', farmer: { name: 'Pham Thi Lan' }, farmLand: { farmName: 'Shade Garden B' },
  },
  {
    id: '5', complianceId: 'EUDR-2024-005', batchId: 'BATCH-DK-002', farmerId: 'F-005', farmLandId: 'FL-005',
    status: 'pending', riskLevel: 'high', deforestationRiskScore: 65,
    satelliteImageryRef: 'SAT-PLNT-2024-0430', geolocationLat: 12.0500, geolocationLng: 108.5200,
    landUseType: 'mixed_use', landCoverChangeDate: '2021-09-20',
    verificationDate: '', verifiedBy: '',
    dueDiligenceStatement: '',
    tracesCertificateRef: '',
    validFrom: '', validUntil: '',
    notes: 'Awaiting ground survey verification. Satellite data inconclusive.',
    metadata: { region: 'Dak Nong', elevation: 700, farmSize: 3.2 },
    createdAt: '2024-04-01T10:00:00Z', farmer: { name: 'Hoang Van Em' }, farmLand: { farmName: 'Mixed Plot C' },
  },
  {
    id: '6', complianceId: 'EUDR-2024-006', batchId: 'BATCH-LN-004', farmerId: 'F-006', farmLandId: 'FL-006',
    status: 'expired', riskLevel: 'medium', deforestationRiskScore: 35,
    satelliteImageryRef: 'SAT-GFW-2023-1201', geolocationLat: 11.9600, geolocationLng: 108.4600,
    landUseType: 'agroforestry', landCoverChangeDate: '2020-08-15',
    verificationDate: '2023-12-01', verifiedBy: 'Dr. Nguyen Van A',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-006.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2023/00098',
    validFrom: '2023-12-01', validUntil: '2024-12-01',
    notes: 'Compliance expired. Re-assessment scheduled for Q1 2025.',
    metadata: { region: 'Lam Dong', elevation: 1100, farmSize: 4.0 },
    createdAt: '2023-11-01T10:00:00Z', farmer: { name: 'Vo Thi Phuong' }, farmLand: { farmName: 'Hillside Plot D' },
  },
  {
    id: '7', complianceId: 'EUDR-2024-007', batchId: 'BATCH-GL-001', farmerId: 'F-007', farmLandId: 'FL-007',
    status: 'compliant', riskLevel: 'low', deforestationRiskScore: 5,
    satelliteImageryRef: 'SAT-SNTL-2024-0501', geolocationLat: 13.5000, geolocationLng: 109.0000,
    landUseType: 'shade_grown', landCoverChangeDate: '2018-06-01',
    verificationDate: '2024-05-01', verifiedBy: 'Dr. Pham Thi D',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-007.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00130',
    validFrom: '2024-05-01', validUntil: '2025-05-01',
    notes: 'Organic shade-grown farm. Zero deforestation risk.',
    metadata: { region: 'Gia Lai', elevation: 900, farmSize: 2.0 },
    createdAt: '2024-04-15T10:00:00Z', farmer: { name: 'Dinh Van Hao' }, farmLand: { farmName: 'Organic Plot E' },
  },
  {
    id: '8', complianceId: 'EUDR-2024-008', batchId: 'BATCH-DN-001', farmerId: 'F-008', farmLandId: 'FL-008',
    status: 'in_review', riskLevel: 'medium', deforestationRiskScore: 40,
    satelliteImageryRef: 'SAT-PLNT-2024-0510', geolocationLat: 12.2000, geolocationLng: 107.8000,
    landUseType: 'agroforestry', landCoverChangeDate: '2020-11-30',
    verificationDate: '2024-05-10', verifiedBy: 'Dr. Le Thi B',
    dueDiligenceStatement: '/docs/dds/EUDR-2024-008.pdf',
    tracesCertificateRef: 'TRACES-NT/VN/2024/00131',
    validFrom: '2024-05-10', validUntil: '2025-05-10',
    notes: 'Borderline risk score. Additional ground truth data being collected.',
    metadata: { region: 'Dak Nong', elevation: 750, farmSize: 3.5 },
    createdAt: '2024-04-20T10:00:00Z', farmer: { name: 'Bui Thi Mai' }, farmLand: { farmName: 'Borderline Plot F' },
  },
]

const MOCK_DEFORESTATION_ASSESSMENTS = [
  {
    id: 'da1', farmLandId: 'FL-001', eudrComplianceId: '1',
    assessmentDate: '2024-03-10', dataSource: 'combined', provider: 'gfw',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-03-10',
    forestCoverBaselinePct: 78.5, currentForestCoverPct: 79.2, forestLossPct: -0.7,
    deforestationDetected: false, riskScore: 12, riskCategory: 'low',
    imageryUrl: 'https://sat.example.com/FL-001/2024', analysisReportUrl: '/reports/FL-001-2024.pdf',
    methodology: 'Hansen GFC + Planet NICFI', confidenceLevel: 0.95, validUntil: '2025-03-10',
  },
  {
    id: 'da2', farmLandId: 'FL-002', eudrComplianceId: '2',
    assessmentDate: '2024-03-25', dataSource: 'satellite', provider: 'planet',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-03-25',
    forestCoverBaselinePct: 65.0, currentForestCoverPct: 58.3, forestLossPct: 6.7,
    deforestationDetected: false, riskScore: 45, riskCategory: 'medium',
    imageryUrl: 'https://sat.example.com/FL-002/2024', analysisReportUrl: '/reports/FL-002-2024.pdf',
    methodology: 'Planet NICFI Basemap + Sentinel-2', confidenceLevel: 0.82, validUntil: '2025-03-25',
  },
  {
    id: 'da3', farmLandId: 'FL-003', eudrComplianceId: '3',
    assessmentDate: '2024-04-05', dataSource: 'combined', provider: 'sentinel',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-04-05',
    forestCoverBaselinePct: 72.0, currentForestCoverPct: 34.5, forestLossPct: 37.5,
    deforestationDetected: true, riskScore: 88, riskCategory: 'critical',
    imageryUrl: 'https://sat.example.com/FL-003/2024', analysisReportUrl: '/reports/FL-003-2024.pdf',
    methodology: 'Sentinel-2 + Ground Survey Verification', confidenceLevel: 0.98, validUntil: '2025-04-05',
  },
  {
    id: 'da4', farmLandId: 'FL-005', eudrComplianceId: '5',
    assessmentDate: '2024-04-15', dataSource: 'ground_survey', provider: 'gfw',
    referencePeriodStart: '2020-12-31', referencePeriodEnd: '2024-04-15',
    forestCoverBaselinePct: 60.0, currentForestCoverPct: 48.2, forestLossPct: 11.8,
    deforestationDetected: true, riskScore: 65, riskCategory: 'high',
    imageryUrl: 'https://sat.example.com/FL-005/2024', analysisReportUrl: '/reports/FL-005-2024.pdf',
    methodology: 'GFW Alert + Field Verification', confidenceLevel: 0.88, validUntil: '2025-04-15',
  },
]

const MOCK_DDS_RECORDS = [
  { id: 'dds1', complianceId: 'EUDR-2024-001', status: 'accepted', submittedDate: '2024-03-16', acceptedDate: '2024-03-18', tracesRef: 'TRACES-NT/VN/2024/00123', documentUrl: '/docs/dds/EUDR-2024-001.pdf', notes: 'Auto-accepted via TRACES-NT. All checks passed.' },
  { id: 'dds2', complianceId: 'EUDR-2024-002', status: 'pending_review', submittedDate: '2024-04-02', acceptedDate: '', tracesRef: 'TRACES-NT/VN/2024/00124', documentUrl: '/docs/dds/EUDR-2024-002.pdf', notes: 'Under review by EU competent authority.' },
  { id: 'dds3', complianceId: 'EUDR-2024-003', status: 'rejected', submittedDate: '2024-04-11', acceptedDate: '', tracesRef: '', documentUrl: '', notes: 'Rejected: Non-compliant deforestation risk. Remediation required.' },
  { id: 'dds4', complianceId: 'EUDR-2024-004', status: 'accepted', submittedDate: '2024-04-21', acceptedDate: '2024-04-23', tracesRef: 'TRACES-NT/VN/2024/00125', documentUrl: '/docs/dds/EUDR-2024-004.pdf', notes: 'Accepted. Shade-grown farm with excellent compliance profile.' },
  { id: 'dds5', complianceId: 'EUDR-2024-005', status: 'draft', submittedDate: '', acceptedDate: '', tracesRef: '', documentUrl: '', notes: 'DDS in preparation. Awaiting assessment completion.' },
  { id: 'dds6', complianceId: 'EUDR-2024-007', status: 'accepted', submittedDate: '2024-05-02', acceptedDate: '2024-05-04', tracesRef: 'TRACES-NT/VN/2024/00130', documentUrl: '/docs/dds/EUDR-2024-007.pdf', notes: 'Organic farm. Fast-track acceptance.' },
  { id: 'dds7', complianceId: 'EUDR-2024-008', status: 'submitted', submittedDate: '2024-05-11', acceptedDate: '', tracesRef: 'TRACES-NT/VN/2024/00131', documentUrl: '/docs/dds/EUDR-2024-008.pdf', notes: 'Submitted to TRACES-NT. Awaiting review.' },
]

const RISK_TREND_DATA = [
  { month: 'Sep 23', avgScore: 42, compliant: 55, total: 40 },
  { month: 'Oct 23', avgScore: 38, compliant: 60, total: 45 },
  { month: 'Nov 23', avgScore: 35, compliant: 65, total: 50 },
  { month: 'Dec 23', avgScore: 40, compliant: 58, total: 55 },
  { month: 'Jan 24', avgScore: 32, compliant: 68, total: 60 },
  { month: 'Feb 24', avgScore: 28, compliant: 72, total: 65 },
  { month: 'Mar 24', avgScore: 30, compliant: 70, total: 70 },
  { month: 'Apr 24', avgScore: 25, compliant: 75, total: 75 },
  { month: 'May 24', avgScore: 22, compliant: 78, total: 80 },
]

const REGION_RISK_DATA = [
  { region: 'Lam Dong', avgRisk: 15, farms: 45, compliant: 42, color: '#22c55e' },
  { region: 'Dak Lak', avgRisk: 38, farms: 32, compliant: 22, color: '#eab308' },
  { region: 'Gia Lai', avgRisk: 52, farms: 28, compliant: 15, color: '#f97316' },
  { region: 'Dak Nong', avgRisk: 45, farms: 20, compliant: 12, color: '#f97316' },
  { region: 'Kon Tum', avgRisk: 22, farms: 15, compliant: 13, color: '#22c55e' },
]

// ─── Types ───────────────────────────────────────────────────────

interface EudrRecord {
  id: string; complianceId: string; batchId?: string; farmerId?: string; farmLandId?: string;
  status: string; riskLevel: string; deforestationRiskScore?: number;
  satelliteImageryRef?: string; geolocationLat?: number; geolocationLng?: number;
  landUseType?: string; landCoverChangeDate?: string;
  verificationDate?: string; verifiedBy?: string;
  dueDiligenceStatement?: string; tracesCertificateRef?: string;
  validFrom?: string; validUntil?: string;
  notes?: string; metadata?: any; createdAt: string;
  farmer?: { name: string }; farmLand?: { farmName: string };
}

interface DeforestationAssessment {
  id: string; farmLandId: string; eudrComplianceId: string;
  assessmentDate: string; dataSource: string; provider: string;
  referencePeriodStart: string; referencePeriodEnd: string;
  forestCoverBaselinePct: number; currentForestCoverPct: number; forestLossPct: number;
  deforestationDetected: boolean; riskScore: number; riskCategory: string;
  imageryUrl: string; analysisReportUrl: string; methodology: string;
  confidenceLevel: number; validUntil: string;
}

interface DDSRecord {
  id: string; complianceId: string; status: string;
  submittedDate: string; acceptedDate: string;
  tracesRef: string; documentUrl: string; notes: string;
}

// ─── Helper Functions ────────────────────────────────────────────

function getRiskScoreColor(score?: number): string {
  if (!score) return 'text-gray-500'
  if (score > 70) return 'text-red-600'
  if (score > 40) return 'text-yellow-600'
  return 'text-green-600'
}

function getRiskBarColor(score?: number): string {
  if (!score) return 'bg-gray-300'
  if (score > 70) return 'bg-red-500'
  if (score > 40) return 'bg-yellow-500'
  return 'bg-green-500'
}

// ─── Overview Dashboard Tab ──────────────────────────────────────

function OverviewTab({ records, ddsRecords }: { records: EudrRecord[]; ddsRecords: DDSRecord[] }) {
  const stats = useMemo(() => {
    const total = records.length
    const compliant = records.filter(i => i.status === 'compliant').length
    const pending = records.filter(i => i.status === 'pending' || i.status === 'in_review').length
    const nonCompliant = records.filter(i => i.status === 'non_compliant').length
    const expired = records.filter(i => i.status === 'expired').length
    const highRisk = records.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0
    const avgRiskScore = total > 0 ? Math.round(records.reduce((s, i) => s + (i.deforestationRiskScore || 0), 0) / total) : 0
    const upcomingExpirations = records.filter(i => {
      if (!i.validUntil) return false
      const d = new Date(i.validUntil)
      const now = new Date()
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      return diff > 0 && diff <= 90
    }).length
    return { total, compliant, pending, nonCompliant, expired, highRisk, complianceRate, avgRiskScore, upcomingExpirations }
  }, [records])

  const statusChartData = useMemo(() => {
    return Object.entries(STATUS_CHART_COLORS).map(([key, color]) => ({
      name: key.replace('_', ' '), value: records.filter(i => i.status === key).length, color,
    })).filter(d => d.value > 0)
  }, [records])

  const riskChartData = useMemo(() => {
    return Object.entries(RISK_CHART_COLORS).map(([key, fill]) => ({
      name: key, value: records.filter(i => i.riskLevel === key).length, fill,
    }))
  }, [records])

  const complianceGaugeData = useMemo(() => {
    return [
      { name: 'Compliant', value: stats.compliant, fill: '#22c55e' },
      { name: 'Non-Compliant', value: stats.nonCompliant, fill: '#ef4444' },
      { name: 'Pending/Other', value: stats.total - stats.compliant - stats.nonCompliant, fill: '#eab308' },
    ].filter(d => d.value > 0)
  }, [stats])

  const ddsStatusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    ddsRecords.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1 })
    return counts
  }, [ddsRecords])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Records', value: stats.total, icon: Shield, bg: 'bg-primary/10', color: 'text-primary' },
          { label: 'Compliance Rate', value: `${stats.complianceRate}%`, icon: CheckCircle2, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Avg Risk Score', value: stats.avgRiskScore, icon: Target, bg: 'bg-amber-100', color: 'text-amber-600' },
          { label: 'High/Critical Risk', value: stats.highRisk, icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
          { label: 'Pending/Review', value: stats.pending, icon: Clock, bg: 'bg-yellow-100', color: 'text-yellow-600' },
          { label: 'Expiring Soon', value: stats.upcomingExpirations, icon: Timer, bg: 'bg-orange-100', color: 'text-orange-600' },
        ].map((card) => (
          <StaggerItem key={card.label}>
            <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-4 h-4 ${card.color}`} /></div>
                  <div>
                    <p className="text-xl font-bold font-mono">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground leading-tight">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Charts Row */}
      <div className="grid md:grid-cols-3 gap-6">
        <FadeIn>
          <Card className="rounded-xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Compliance Rate</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={complianceGaugeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={2}>
                      {complianceGaugeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center -mt-4">
                <p className="text-3xl font-bold font-mono">{stats.complianceRate}%</p>
                <p className="text-xs text-muted-foreground">Overall Compliance</p>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="rounded-xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={(props: any) => `${props.name ?? ''} (${(props.percent ?? 0) * 100 | 0}%)`}>
                    {statusChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="rounded-xl">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Risk Level Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={riskChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {riskChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* DDS Tracker & Upcoming Expirations */}
      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn delay={0.1}>
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" /> DDS Submission Tracker
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">{ddsRecords.length} Total</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(DDS_STATUS_COLORS).map(([status, cls]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={`${cls} border capitalize text-[10px]`}>{status.replace('_', ' ')}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-medium">{ddsStatusCounts[status] || 0}</span>
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${status === 'accepted' ? 'bg-green-500' : status === 'rejected' ? 'bg-red-500' : status === 'submitted' ? 'bg-blue-500' : status === 'pending_review' ? 'bg-yellow-500' : 'bg-gray-400'}`}
                        style={{ width: `${ddsRecords.length > 0 ? ((ddsStatusCounts[status] || 0) / ddsRecords.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Upcoming Expirations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {records.filter(r => r.validUntil && r.status === 'compliant').sort((a, b) => new Date(a.validUntil!).getTime() - new Date(b.validUntil!).getTime()).slice(0, 5).map(r => {
                const daysLeft = Math.ceil((new Date(r.validUntil!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="text-xs font-medium font-mono">{r.complianceId}</p>
                      <p className="text-[10px] text-muted-foreground">{r.farmer?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-mono font-medium ${daysLeft <= 30 ? 'text-red-600' : daysLeft <= 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {daysLeft > 0 ? `${daysLeft}d` : 'Expired'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(r.validUntil!).toLocaleDateString()}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}

// ─── Multi-Step Wizard Form ──────────────────────────────────────

const WIZARD_STEPS = ['Basic Info', 'Geolocation & Land', 'Risk Assessment', 'Verification & DDS', 'Validity & Notes']

function ComplianceWizardForm({ form, setForm, onSubmit, onCancel, isEdit }: {
  form: any; setForm: (f: any) => void; onSubmit: () => void; onCancel: () => void; isEdit: boolean;
}) {
  const [step, setStep] = useState(0)

  const updateForm = (field: string, value: any) => setForm({ ...form, [field]: value })

  const canAdvance = () => {
    if (step === 0 && !form.complianceId) return false
    return true
  }

  return (
    <div className="space-y-4">
      {/* Step Indicator */}
      <div className="flex items-center gap-1 mb-4">
        {WIZARD_STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors
              ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-[10px] hidden sm:inline ${i === step ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{label}</span>
            {i < WIZARD_STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      <Separator />

      {/* Step Content */}
      {step === 0 && (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Compliance ID *</Label>
              <Input placeholder="EUDR-2024-XXX" value={form.complianceId || ''} onChange={e => updateForm('complianceId', e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Batch ID</Label>
              <Input placeholder="BATCH-XXX" value={form.batchId || ''} onChange={e => updateForm('batchId', e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Farmer ID</Label>
              <Input placeholder="F-XXX" value={form.farmerId || ''} onChange={e => updateForm('farmerId', e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Farm Land ID</Label>
              <Input placeholder="FL-XXX" value={form.farmLandId || ''} onChange={e => updateForm('farmLandId', e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select value={form.status || 'pending'} onValueChange={v => updateForm('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Risk Level</Label>
              <Select value={form.riskLevel || 'low'} onValueChange={v => updateForm('riskLevel', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Latitude</Label>
              <Input type="number" step="0.0001" placeholder="11.9404" value={form.geolocationLat || ''} onChange={e => updateForm('geolocationLat', parseFloat(e.target.value) || undefined)} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Longitude</Label>
              <Input type="number" step="0.0001" placeholder="108.4584" value={form.geolocationLng || ''} onChange={e => updateForm('geolocationLng', parseFloat(e.target.value) || undefined)} className="font-mono text-sm" />
            </div>
          </div>
          {(form.geolocationLat || form.geolocationLng) ? (
            <div className="h-32 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
              <div className="text-center">
                <MapPin className="w-5 h-5 mx-auto text-muted-foreground/50 mb-1" />
                <p className="text-xs text-muted-foreground font-mono">{form.geolocationLat}, {form.geolocationLng}</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">Geolocation Map Placeholder</p>
              </div>
            </div>
          ) : (
            <div className="h-32 bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
              <p className="text-xs text-muted-foreground">Enter coordinates to preview location</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Land Use Type</Label>
              <Select value={form.landUseType || ''} onValueChange={v => updateForm('landUseType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agroforestry">Agroforestry</SelectItem>
                  <SelectItem value="monoculture">Monoculture</SelectItem>
                  <SelectItem value="shade_grown">Shade Grown</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                  <SelectItem value="cleared_land">Cleared Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Land Cover Change Date</Label>
              <Input type="date" value={form.landCoverChangeDate || ''} onChange={e => updateForm('landCoverChangeDate', e.target.value)} className="text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Satellite Imagery Reference</Label>
            <Input placeholder="SAT-GFW-2024-XXX" value={form.satelliteImageryRef || ''} onChange={e => updateForm('satelliteImageryRef', e.target.value)} className="font-mono text-sm" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">Deforestation Risk Score (0-100)</Label>
            <Input type="number" min="0" max="100" placeholder="0-100" value={form.deforestationRiskScore ?? ''} onChange={e => updateForm('deforestationRiskScore', parseInt(e.target.value) || undefined)} className="font-mono text-sm" />
          </div>
          {form.deforestationRiskScore != null && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Risk Visualization</span>
                <span className={`font-bold font-mono ${getRiskScoreColor(form.deforestationRiskScore)}`}>{form.deforestationRiskScore}/100</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${getRiskBarColor(form.deforestationRiskScore)}`} style={{ width: `${Math.min(form.deforestationRiskScore, 100)}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Low (0-40)</span><span>Medium (41-70)</span><span>High (71-100)</span>
              </div>
            </div>
          )}
          <div className="p-3 bg-muted/50 rounded-lg border">
            <p className="text-xs text-muted-foreground">
              <strong>EUDR Cutoff Date:</strong> December 31, 2020. Any deforestation after this date renders the commodity non-compliant.
              Risk scores are calculated based on satellite imagery analysis, ground survey data, and Global Forest Watch alerts.
            </p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Verification Date</Label>
              <Input type="date" value={form.verificationDate || ''} onChange={e => updateForm('verificationDate', e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Verified By</Label>
              <Input placeholder="Dr. Name" value={form.verifiedBy || ''} onChange={e => updateForm('verifiedBy', e.target.value)} className="text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Due Diligence Statement (DDS) Document URL</Label>
            <Input placeholder="/docs/dds/EUDR-2024-XXX.pdf" value={form.dueDiligenceStatement || ''} onChange={e => updateForm('dueDiligenceStatement', e.target.value)} className="font-mono text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">TRACES-NT Certificate Reference</Label>
            <Input placeholder="TRACES-NT/VN/2024/XXXXX" value={form.tracesCertificateRef || ''} onChange={e => updateForm('tracesCertificateRef', e.target.value)} className="font-mono text-sm" />
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              <strong>TRACES-NT:</strong> The EU Trade Control and Expert System. All DDS documents must be submitted through TRACES-NT before placing commodities on the EU market.
            </p>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Valid From</Label>
              <Input type="date" value={form.validFrom || ''} onChange={e => updateForm('validFrom', e.target.value)} className="text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Valid Until</Label>
              <Input type="date" value={form.validUntil || ''} onChange={e => updateForm('validUntil', e.target.value)} className="text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Notes</Label>
            <Textarea placeholder="Additional compliance notes, observations, remediation plans..." value={form.notes || ''} onChange={e => updateForm('notes', e.target.value)} rows={4} className="text-sm" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Metadata (JSON)</Label>
            <Textarea placeholder='{"region": "Lam Dong", "elevation": 1200}' value={form.metadata || ''} onChange={e => updateForm('metadata', e.target.value)} rows={3} className="font-mono text-xs" />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">Cancel</Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} className="text-xs gap-1">
              <ChevronLeft className="w-3 h-3" /> Back
            </Button>
          )}
          {step < WIZARD_STEPS.length - 1 ? (
            <Button size="sm" onClick={() => canAdvance() && setStep(step + 1)} disabled={!canAdvance()} className="text-xs gap-1">
              Next <ChevronRight className="w-3 h-3" />
            </Button>
          ) : (
            <Button size="sm" onClick={onSubmit} className="text-xs gap-1">
              {isEdit ? 'Update' : 'Create'} Record <CheckCircle2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Compliance Records Tab ──────────────────────────────────────

function ComplianceRecordsTab({ records }: { records: EudrRecord[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [validityFilter, setValidityFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<EudrRecord | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [form, setForm] = useState<any>({ status: 'pending', riskLevel: 'low' })
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return records.filter(r => {
      if (search && !r.complianceId.toLowerCase().includes(search.toLowerCase()) && !(r.farmer?.name || '').toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (riskFilter !== 'all' && r.riskLevel !== riskFilter) return false
      if (validityFilter === 'valid' && r.status !== 'compliant') return false
      if (validityFilter === 'expiring' && r.validUntil) {
        const d = new Date(r.validUntil)
        const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        if (!(diff > 0 && diff <= 90)) return false
      }
      if (validityFilter === 'expired' && r.status !== 'expired') return false
      return true
    })
  }, [records, search, statusFilter, riskFilter, validityFilter])

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelectedIds(next)
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(filtered.map(r => r.id)))
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ status: 'pending', riskLevel: 'low' })
    setDialogOpen(true)
  }

  const openEdit = (record: EudrRecord) => {
    setEditingId(record.id)
    setForm({
      complianceId: record.complianceId, batchId: record.batchId || '',
      farmerId: record.farmerId || '', farmLandId: record.farmLandId || '',
      status: record.status, riskLevel: record.riskLevel,
      deforestationRiskScore: record.deforestationRiskScore,
      geolocationLat: record.geolocationLat, geolocationLng: record.geolocationLng,
      landUseType: record.landUseType || '', landCoverChangeDate: record.landCoverChangeDate || '',
      satelliteImageryRef: record.satelliteImageryRef || '',
      verificationDate: record.verificationDate || '', verifiedBy: record.verifiedBy || '',
      dueDiligenceStatement: record.dueDiligenceStatement || '',
      tracesCertificateRef: record.tracesCertificateRef || '',
      validFrom: record.validFrom || '', validUntil: record.validUntil || '',
      notes: record.notes || '', metadata: record.metadata ? JSON.stringify(record.metadata) : '',
    })
    setDialogOpen(true)
  }

  const handleSubmit = () => {
    setDialogOpen(false)
    setForm({ status: 'pending', riskLevel: 'low' })
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <FadeIn>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by ID or farmer..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Risk" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              {Object.keys(RISK_COLORS).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={validityFilter} onValueChange={setValidityFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Validity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="valid">Valid</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openCreate} className="gap-1 text-xs whitespace-nowrap">
            <Plus className="w-3.5 h-3.5" /> New Record
          </Button>
        </div>
      </FadeIn>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <FadeIn>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
            <span className="text-xs font-medium">{selectedIds.size} selected</span>
            <Button variant="outline" size="sm" className="text-xs gap-1"><Download className="w-3 h-3" /> Export</Button>
            <Button variant="outline" size="sm" className="text-xs gap-1"><RefreshCw className="w-3 h-3" /> Re-Assess</Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </div>
        </FadeIn>
      )}

      {/* Data Table */}
      <FadeIn delay={0.1}>
        <Card className="rounded-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                    </TableHead>
                    <TableHead className="font-mono text-xs">Compliance ID</TableHead>
                    <TableHead className="text-xs">Farmer</TableHead>
                    <TableHead className="text-xs">Farm Land</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Risk</TableHead>
                    <TableHead className="text-xs">Risk Score</TableHead>
                    <TableHead className="text-xs">Land Use</TableHead>
                    <TableHead className="text-xs">Valid Until</TableHead>
                    <TableHead className="text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        <Shield className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No compliance records found</p>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                      </TableCell>
                      <TableCell className="font-mono text-xs font-medium">{item.complianceId}</TableCell>
                      <TableCell className="text-xs">{item.farmer?.name || item.farmerId || '—'}</TableCell>
                      <TableCell className="text-xs">{item.farmLand?.farmName || item.farmLandId || '—'}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[item.status] || ''} border capitalize text-[10px]`}>{item.status?.replace('_', ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${RISK_COLORS[item.riskLevel] || ''} border capitalize text-[10px]`}>{item.riskLevel}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.deforestationRiskScore != null ? (
                          <span className={`font-mono font-medium text-xs ${getRiskScoreColor(item.deforestationRiskScore)}`}>
                            {item.deforestationRiskScore}/100
                          </span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="text-xs capitalize">{item.landUseType?.replace('_', ' ') || '—'}</TableCell>
                      <TableCell className="text-xs font-mono">{item.validUntil ? new Date(item.validUntil).toLocaleDateString() : '—'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setDetailItem(item)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}><FileCheck className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Create/Edit Wizard Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono">{editingId ? 'Edit' : 'Create'} EUDR Compliance Record</DialogTitle>
          </DialogHeader>
          <ComplianceWizardForm form={form} setForm={setForm} onSubmit={handleSubmit} onCancel={() => setDialogOpen(false)} isEdit={!!editingId} />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono flex items-center gap-2">
              <Shield className="w-4 h-4" /> {detailItem?.complianceId}
            </DialogTitle>
          </DialogHeader>
          {detailItem && (
            <div className="space-y-4 py-2">
              {/* Status & Risk */}
              <div className="flex items-center gap-3">
                <Badge className={`${STATUS_COLORS[detailItem.status]} border capitalize`}>{detailItem.status?.replace('_', ' ')}</Badge>
                <Badge className={`${RISK_COLORS[detailItem.riskLevel]} border capitalize`}>{detailItem.riskLevel} Risk</Badge>
                {detailItem.deforestationRiskScore != null && (
                  <span className={`font-mono font-bold text-sm ${getRiskScoreColor(detailItem.deforestationRiskScore)}`}>
                    Score: {detailItem.deforestationRiskScore}/100
                  </span>
                )}
              </div>

              {/* Risk Score Bar */}
              {detailItem.deforestationRiskScore != null && (
                <div className="space-y-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getRiskBarColor(detailItem.deforestationRiskScore)}`} style={{ width: `${Math.min(detailItem.deforestationRiskScore, 100)}%` }} />
                  </div>
                </div>
              )}

              <Separator />

              {/* Core Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs">Batch ID</span><p className="font-mono text-xs">{detailItem.batchId || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Farmer</span><p className="text-xs">{detailItem.farmer?.name || detailItem.farmerId || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Farm Land</span><p className="text-xs">{detailItem.farmLand?.farmName || detailItem.farmLandId || '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Land Use Type</span><p className="text-xs capitalize">{detailItem.landUseType?.replace('_', ' ') || '—'}</p></div>
              </div>

              <Separator />

              {/* Geolocation */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Geolocation</h4>
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div><span className="text-muted-foreground text-xs">Latitude</span><p className="font-mono text-xs">{detailItem.geolocationLat ?? '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Longitude</span><p className="font-mono text-xs">{detailItem.geolocationLng ?? '—'}</p></div>
                </div>
                {detailItem.geolocationLat && (
                  <div className="h-24 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <MapPin className="w-4 h-4 mx-auto text-muted-foreground/50 mb-1" />
                      <span className="text-[10px] text-muted-foreground font-mono">{detailItem.geolocationLat}, {detailItem.geolocationLng}</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Verification & DDS */}
              <div>
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><FileCheck className="w-3 h-3" /> Verification & DDS</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Verification Date</span><p className="text-xs">{detailItem.verificationDate ? new Date(detailItem.verificationDate).toLocaleDateString() : '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Verified By</span><p className="text-xs">{detailItem.verifiedBy || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">DDS Document</span><p className="font-mono text-xs">{detailItem.dueDiligenceStatement || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">TRACES Certificate</span><p className="font-mono text-xs">{detailItem.tracesCertificateRef || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Satellite Imagery</span><p className="font-mono text-xs">{detailItem.satelliteImageryRef || '—'}</p></div>
                  <div><span className="text-muted-foreground text-xs">Land Cover Change</span><p className="text-xs">{detailItem.landCoverChangeDate ? new Date(detailItem.landCoverChangeDate).toLocaleDateString() : '—'}</p></div>
                </div>
              </div>

              <Separator />

              {/* Validity */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground text-xs">Valid From</span><p className="text-xs">{detailItem.validFrom ? new Date(detailItem.validFrom).toLocaleDateString() : '—'}</p></div>
                <div><span className="text-muted-foreground text-xs">Valid Until</span><p className="text-xs">{detailItem.validUntil ? new Date(detailItem.validUntil).toLocaleDateString() : '—'}</p></div>
              </div>

              {detailItem.notes && (
                <>
                  <Separator />
                  <div><span className="text-muted-foreground text-xs">Notes</span><p className="mt-1 p-3 bg-muted rounded-lg text-xs">{detailItem.notes}</p></div>
                </>
              )}

              {detailItem.metadata && (
                <div><span className="text-muted-foreground text-xs">Metadata</span><pre className="mt-1 p-3 bg-muted rounded-lg text-[10px] font-mono overflow-auto">{JSON.stringify(detailItem.metadata, null, 2)}</pre></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Deforestation Assessment Tab ────────────────────────────────

function DeforestationTab({ assessments }: { assessments: DeforestationAssessment[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<DeforestationAssessment | null>(null)
  const [form, setForm] = useState<any>({ riskCategory: 'low', dataSource: 'satellite', provider: 'gfw', deforestationDetected: false })

  const updateForm = (field: string, value: any) => setForm({ ...form, [field]: value })

  return (
    <div className="space-y-6">
      {/* Summary */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assessments', value: assessments.length, icon: Satellite, bg: 'bg-primary/10', color: 'text-primary' },
          { label: 'Deforested', value: assessments.filter(a => a.deforestationDetected).length, icon: AlertTriangle, bg: 'bg-red-100', color: 'text-red-600' },
          { label: 'Avg Confidence', value: `${Math.round(assessments.reduce((s, a) => s + a.confidenceLevel, 0) / assessments.length * 100)}%`, icon: Target, bg: 'bg-blue-100', color: 'text-blue-600' },
          { label: 'Avg Forest Loss', value: `${(assessments.reduce((s, a) => s + a.forestLossPct, 0) / assessments.length).toFixed(1)}%`, icon: TreePine, bg: 'bg-green-100', color: 'text-green-600' },
        ].map((card) => (
          <StaggerItem key={card.label}>
            <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-4 h-4 ${card.color}`} /></div>
                  <div>
                    <p className="text-lg font-bold font-mono">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground">{card.label}</p>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Forest Cover Comparison Chart */}
      <FadeIn>
        <Card className="rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TreePine className="w-4 h-4" /> Forest Cover: Baseline vs Current
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={assessments.map(a => ({ name: a.farmLandId, baseline: a.forestCoverBaselinePct, current: a.currentForestCoverPct, loss: Math.max(a.forestLossPct, 0) }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="baseline" fill="#22c55e" name="Baseline %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="current" fill="#3b82f6" name="Current %" radius={[4, 4, 0, 0]} />
                <Line dataKey="loss" stroke="#ef4444" name="Loss %" type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Assessment Cards */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Assessment Records</h3>
        <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1 text-xs">
          <Plus className="w-3.5 h-3.5" /> New Assessment
        </Button>
      </div>

      <StaggerContainer className="grid md:grid-cols-2 gap-4">
        {assessments.map((item) => (
          <StaggerItem key={item.id}>
            <MotionCard {...hoverScale} className="rounded-xl border shadow-sm cursor-pointer" onClick={() => setDetailItem(item)}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${RISK_COLORS[item.riskCategory] || ''} border capitalize text-xs`}>{item.riskCategory}</Badge>
                  {item.deforestationDetected ? (
                    <Badge className="bg-red-100 text-red-800 border border-red-200 text-[10px]">⚠ Deforested</Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border border-green-200 text-[10px]">✓ Clear</Badge>
                  )}
                </div>
                {/* Risk Score Gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className={`font-bold font-mono ${getRiskScoreColor(item.riskScore)}`}>{item.riskScore}/100</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${getRiskBarColor(item.riskScore)}`} style={{ width: `${Math.min(item.riskScore, 100)}%` }} />
                  </div>
                </div>
                {/* Forest Cover Comparison */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                    <p className="text-green-600 font-medium">Baseline</p>
                    <p className="font-mono font-bold text-green-700">{item.forestCoverBaselinePct}%</p>
                  </div>
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                    <p className="text-blue-600 font-medium">Current</p>
                    <p className="font-mono font-bold text-blue-700">{item.currentForestCoverPct}%</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p className="flex items-center gap-1"><Layers className="w-3 h-3" /> {item.provider.toUpperCase()} • {item.dataSource.replace('_', ' ')}</p>
                  <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {new Date(item.assessmentDate).toLocaleDateString()}</p>
                  <p className="flex items-center gap-1"><Target className="w-3 h-3" /> Confidence: {(item.confidenceLevel * 100).toFixed(0)}%</p>
                </div>
                {/* Map Placeholder */}
                <div className="h-20 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
                  <div className="text-center">
                    <MapPin className="w-4 h-4 mx-auto text-muted-foreground/50 mb-1" />
                    <span className="text-[10px] text-muted-foreground">Satellite Imagery Reference</span>
                  </div>
                </div>
              </CardContent>
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-mono">Create Deforestation Assessment</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Farm Land ID</Label>
                <Input placeholder="FL-XXX" value={form.farmLandId || ''} onChange={e => updateForm('farmLandId', e.target.value)} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">EUDR Compliance ID</Label>
                <Input placeholder="Link to compliance record" value={form.eudrComplianceId || ''} onChange={e => updateForm('eudrComplianceId', e.target.value)} className="font-mono text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Assessment Date</Label>
                <Input type="date" value={form.assessmentDate || ''} onChange={e => updateForm('assessmentDate', e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Data Source</Label>
                <Select value={form.dataSource} onValueChange={v => updateForm('dataSource', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="ground_survey">Ground Survey</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Provider</Label>
                <Select value={form.provider} onValueChange={v => updateForm('provider', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gfw">Global Forest Watch</SelectItem>
                    <SelectItem value="planet">Planet Labs</SelectItem>
                    <SelectItem value="sentinel">Sentinel Hub</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Methodology</Label>
                <Input placeholder="Hansen GFC + Planet NICFI" value={form.methodology || ''} onChange={e => updateForm('methodology', e.target.value)} className="text-sm" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Reference Period Start</Label>
                <Input type="date" value={form.referencePeriodStart || ''} onChange={e => updateForm('referencePeriodStart', e.target.value)} className="text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Reference Period End</Label>
                <Input type="date" value={form.referencePeriodEnd || ''} onChange={e => updateForm('referencePeriodEnd', e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Baseline Forest %</Label>
                <Input type="number" step="0.1" placeholder="78.5" value={form.forestCoverBaselinePct || ''} onChange={e => updateForm('forestCoverBaselinePct', parseFloat(e.target.value) || undefined)} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Current Forest %</Label>
                <Input type="number" step="0.1" placeholder="79.2" value={form.currentForestCoverPct || ''} onChange={e => updateForm('currentForestCoverPct', parseFloat(e.target.value) || undefined)} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Forest Loss %</Label>
                <Input type="number" step="0.1" placeholder="0.7" value={form.forestLossPct || ''} onChange={e => updateForm('forestLossPct', parseFloat(e.target.value) || undefined)} className="font-mono text-sm" />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Risk Score (0-100)</Label>
                <Input type="number" min="0" max="100" placeholder="0-100" value={form.riskScore || ''} onChange={e => updateForm('riskScore', parseInt(e.target.value) || undefined)} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Risk Category</Label>
                <Select value={form.riskCategory} onValueChange={v => updateForm('riskCategory', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.deforestationDetected || false} onCheckedChange={v => updateForm('deforestationDetected', v)} />
              <Label className="text-xs">Deforestation Detected</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Confidence Level (0-1)</Label>
                <Input type="number" step="0.01" min="0" max="1" placeholder="0.95" value={form.confidenceLevel || ''} onChange={e => updateForm('confidenceLevel', parseFloat(e.target.value) || undefined)} className="font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Valid Until</Label>
                <Input type="date" value={form.validUntil || ''} onChange={e => updateForm('validUntil', e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Imagery URL</Label>
              <Input placeholder="https://..." value={form.imageryUrl || ''} onChange={e => updateForm('imageryUrl', e.target.value)} className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Analysis Report URL</Label>
              <Input placeholder="/reports/..." value={form.analysisReportUrl || ''} onChange={e => updateForm('analysisReportUrl', e.target.value)} className="font-mono text-xs" />
            </div>
            <Button onClick={() => setDialogOpen(false)} className="w-full text-xs">Create Assessment</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-mono">Assessment Details — {detailItem?.farmLandId}</DialogTitle></DialogHeader>
          {detailItem && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <Badge className={`${RISK_COLORS[detailItem.riskCategory]} border capitalize`}>{detailItem.riskCategory}</Badge>
                {detailItem.deforestationDetected ? <Badge className="bg-red-100 text-red-800">Deforested</Badge> : <Badge className="bg-green-100 text-green-800">Clear</Badge>}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs"><span>Risk Score</span><span className={`font-bold font-mono ${getRiskScoreColor(detailItem.riskScore)}`}>{detailItem.riskScore}/100</span></div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getRiskBarColor(detailItem.riskScore)}`} style={{ width: `${Math.min(detailItem.riskScore, 100)}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                  <p className="text-[10px] text-green-600 font-medium">Baseline Cover</p>
                  <p className="text-lg font-bold font-mono text-green-700">{detailItem.forestCoverBaselinePct}%</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                  <p className="text-[10px] text-blue-600 font-medium">Current Cover</p>
                  <p className="text-lg font-bold font-mono text-blue-700">{detailItem.currentForestCoverPct}%</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Date:</span><p>{new Date(detailItem.assessmentDate).toLocaleDateString()}</p></div>
                <div><span className="text-muted-foreground">Provider:</span><p>{detailItem.provider.toUpperCase()}</p></div>
                <div><span className="text-muted-foreground">Data Source:</span><p className="capitalize">{detailItem.dataSource.replace('_', ' ')}</p></div>
                <div><span className="text-muted-foreground">Confidence:</span><p className="font-mono">{(detailItem.confidenceLevel * 100).toFixed(0)}%</p></div>
                <div><span className="text-muted-foreground">Forest Loss:</span><p className={`font-mono font-medium ${detailItem.forestLossPct > 5 ? 'text-red-600' : ''}`}>{detailItem.forestLossPct.toFixed(1)}%</p></div>
                <div><span className="text-muted-foreground">Methodology:</span><p>{detailItem.methodology}</p></div>
                <div><span className="text-muted-foreground">Valid Until:</span><p>{new Date(detailItem.validUntil).toLocaleDateString()}</p></div>
                <div><span className="text-muted-foreground">Ref Period:</span><p>{new Date(detailItem.referencePeriodStart).toLocaleDateString()} — {new Date(detailItem.referencePeriodEnd).toLocaleDateString()}</p></div>
              </div>
              <div className="h-28 bg-muted/50 rounded-lg flex items-center justify-center border border-dashed border-muted-foreground/20">
                <div className="text-center">
                  <Satellite className="w-5 h-5 mx-auto text-muted-foreground/50 mb-1" />
                  <p className="text-[10px] text-muted-foreground">Satellite Imagery Placeholder</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Due Diligence Statement Tab ─────────────────────────────────

function DDSTab({ ddsRecords, complianceRecords }: { ddsRecords: DDSRecord[]; complianceRecords: EudrRecord[] }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<any>({ status: 'draft' })

  const updateForm = (field: string, value: any) => setForm({ ...form, [field]: value })

  const statusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'pending_review': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'submitted': return <Send className="w-4 h-4 text-blue-600" />
      default: return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total DDS', value: ddsRecords.length, bg: 'bg-primary/10', color: 'text-primary' },
          { label: 'Accepted', value: ddsRecords.filter(d => d.status === 'accepted').length, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Pending', value: ddsRecords.filter(d => d.status === 'pending_review').length, bg: 'bg-yellow-100', color: 'text-yellow-600' },
          { label: 'Rejected', value: ddsRecords.filter(d => d.status === 'rejected').length, bg: 'bg-red-100', color: 'text-red-600' },
          { label: 'Draft', value: ddsRecords.filter(d => d.status === 'draft').length, bg: 'bg-gray-100', color: 'text-gray-600' },
        ].map((card) => (
          <StaggerItem key={card.label}>
            <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
              <CardContent className="p-4">
                <p className="text-xl font-bold font-mono">{card.value}</p>
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
              </CardContent>
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* DDS Pipeline */}
      <FadeIn>
        <Card className="rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" /> DDS Submission Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['draft', 'submitted', 'pending_review', 'accepted', 'rejected'].map((status, i) => {
                const count = ddsRecords.filter(d => d.status === status).length
                return (
                  <div key={status} className="flex items-center gap-2">
                    <div className="flex flex-col items-center p-3 rounded-lg border min-w-[100px] bg-muted/30">
                      {statusIcon(status)}
                      <p className="text-xs font-medium capitalize mt-1">{status.replace('_', ' ')}</p>
                      <p className="text-lg font-bold font-mono">{count}</p>
                    </div>
                    {i < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* DDS Records Table */}
      <FadeIn delay={0.1}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Due Diligence Statements</h3>
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1 text-xs"><Plus className="w-3.5 h-3.5" /> New DDS</Button>
        </div>
        <Card className="rounded-xl mt-3">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Compliance ID</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Submitted</TableHead>
                  <TableHead className="text-xs">Accepted</TableHead>
                  <TableHead className="text-xs">TRACES Reference</TableHead>
                  <TableHead className="text-xs">Document</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ddsRecords.map((dds) => (
                  <TableRow key={dds.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-mono text-xs font-medium">{dds.complianceId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {statusIcon(dds.status)}
                        <Badge className={`${DDS_STATUS_COLORS[dds.status] || ''} border capitalize text-[10px]`}>{dds.status.replace('_', ' ')}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{dds.submittedDate ? new Date(dds.submittedDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-xs font-mono">{dds.acceptedDate ? new Date(dds.acceptedDate).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="font-mono text-[10px]">{dds.tracesRef || '—'}</TableCell>
                    <TableCell>
                      {dds.documentUrl ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"><FileText className="w-3 h-3" /> View</Button>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{dds.notes || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </FadeIn>

      {/* TRACES-NT Info Card */}
      <FadeIn delay={0.2}>
        <Card className="rounded-xl border-blue-200 dark:border-blue-800">
          <CardContent className="p-5">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/50 rounded-lg">
                <Globe2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-medium">TRACES-NT Integration</h4>
                <p className="text-xs text-muted-foreground">
                  The EU Trade Control and Expert System (TRACES-NT) is the official platform for submitting Due Diligence Statements.
                  All operators placing coffee on the EU market must submit DDS through TRACES-NT before the product enters the EU.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1"><ExternalLink className="w-3 h-3" /> TRACES-NT Portal</Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1"><FileText className="w-3 h-3" /> EUDR Guidance</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Create DDS Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-mono">Create Due Diligence Statement</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs">Compliance ID</Label>
              <Select value={form.complianceId || ''} onValueChange={v => updateForm('complianceId', v)}>
                <SelectTrigger><SelectValue placeholder="Select compliance record" /></SelectTrigger>
                <SelectContent>
                  {complianceRecords.map(r => <SelectItem key={r.id} value={r.complianceId}>{r.complianceId} — {r.farmer?.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => updateForm('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">TRACES-NT Reference</Label>
              <Input placeholder="TRACES-NT/VN/2024/XXXXX" value={form.tracesRef || ''} onChange={e => updateForm('tracesRef', e.target.value)} className="font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Document Upload</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">Click or drag to upload DDS document</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">PDF, DOCX up to 10MB</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Notes</Label>
              <Textarea placeholder="Submission notes..." value={form.notes || ''} onChange={e => updateForm('notes', e.target.value)} rows={2} className="text-sm" />
            </div>
            <Button onClick={() => setDialogOpen(false)} className="w-full text-xs">Create DDS Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ─── Risk Analytics Tab ──────────────────────────────────────────

function RiskAnalyticsTab({ records }: { records: EudrRecord[] }) {
  const riskTrendChart = useMemo(() => RISK_TREND_DATA, [])

  const regionRiskChart = useMemo(() => REGION_RISK_DATA, [])

  const riskDistribution = useMemo(() => {
    const bins = [
      { range: '0-20', count: 0, color: '#22c55e' },
      { range: '21-40', count: 0, color: '#84cc16' },
      { range: '41-60', count: 0, color: '#eab308' },
      { range: '61-80', count: 0, color: '#f97316' },
      { range: '81-100', count: 0, color: '#ef4444' },
    ]
    records.forEach(r => {
      const s = r.deforestationRiskScore || 0
      if (s <= 20) bins[0].count++
      else if (s <= 40) bins[1].count++
      else if (s <= 60) bins[2].count++
      else if (s <= 80) bins[3].count++
      else bins[4].count++
    })
    return bins
  }, [records])

  const deforestationRate = useMemo(() => {
    const total = records.length
    const detected = records.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length
    return total > 0 ? Math.round((detected / total) * 100) : 0
  }, [records])

  const compliancePrediction = useMemo(() => {
    const compliant = records.filter(r => r.status === 'compliant').length
    const trend = compliant / records.length
    return {
      currentRate: Math.round(trend * 100),
      predictedRate: Math.min(100, Math.round((trend + 0.05) * 100)),
      confidence: 87,
    }
  }, [records])

  return (
    <div className="space-y-6">
      {/* Top KPIs */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Risk Score', value: Math.round(records.reduce((s, r) => s + (r.deforestationRiskScore || 0), 0) / records.length), change: -8, icon: TrendingDown, color: 'text-green-600' },
          { label: 'Deforestation Rate', value: `${deforestationRate}%`, change: -3, icon: TreePine, color: 'text-green-600' },
          { label: 'Compliance Rate', value: `${compliancePrediction.currentRate}%`, change: 5, icon: CheckCircle2, color: 'text-green-600' },
          { label: 'Predicted Rate', value: `${compliancePrediction.predictedRate}%`, change: 5, icon: Zap, color: 'text-blue-600' },
        ].map((card) => (
          <StaggerItem key={card.label}>
            <MotionCard {...hoverScale} className="rounded-xl border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                  <span className={`text-[10px] font-mono font-medium flex items-center gap-0.5 ${(card.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(card.change || 0) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(card.change || 0)}%
                  </span>
                </div>
                <p className="text-2xl font-bold font-mono">{card.value}</p>
                <p className="text-[10px] text-muted-foreground">{card.label}</p>
              </CardContent>
            </MotionCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Risk Score Trend + Risk Distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Risk Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={riskTrendChart}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgScore" stroke="#f97316" fill="url(#riskGrad)" name="Avg Risk Score" />
                  <Area type="monotone" dataKey="compliant" stroke="#22c55e" fill="url(#complianceGrad)" name="Compliance %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.1}>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Risk Score Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Region Risk + Compliance Prediction */}
      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn delay={0.1}>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe2 className="w-4 h-4" /> Risk by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={regionRiskChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="region" type="category" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgRisk" name="Avg Risk" radius={[0, 6, 6, 0]}>
                    {regionRiskChart.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                  <Bar dataKey="compliant" fill="#22c55e" name="Compliant" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card className="rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" /> Compliance Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Current Compliance Rate</span>
                  <span className="font-mono font-bold">{compliancePrediction.currentRate}%</span>
                </div>
                <Progress value={compliancePrediction.currentRate} className="h-3" />
              </div>
              {/* Predicted Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Predicted Rate (Next Quarter)</span>
                  <span className="font-mono font-bold text-blue-600">{compliancePrediction.predictedRate}%</span>
                </div>
                <Progress value={compliancePrediction.predictedRate} className="h-3" />
              </div>
              {/* Model Confidence */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Model Confidence</span>
                  <span className="font-mono font-bold">{compliancePrediction.confidence}%</span>
                </div>
                <Progress value={compliancePrediction.confidence} className="h-2" />
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-800 dark:text-green-300">
                  <strong>Prediction:</strong> Based on current trends, compliance rates are expected to improve by ~5% in the next quarter.
                  Key drivers: improved satellite monitoring coverage and farmer education programs.
                </p>
              </div>
              {/* Deforestation Detection Rate Over Time */}
              <div>
                <p className="text-xs font-medium mb-2">Deforestation Detection Trend</p>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={riskTrendChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgScore" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Avg Risk" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────

export default function EudrCompliancePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')

  const complianceRecords = MOCK_COMPLIANCE_RECORDS
  const deforestationAssessments = MOCK_DEFORESTATION_ASSESSMENTS
  const ddsRecords = MOCK_DDS_RECORDS

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Page Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span>EUDR Compliance Hub</span>
              </h1>
              <p className="text-sm text-muted-foreground font-mono">
                EU Deforestation Regulation — Due Diligence & Traceability Management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono gap-1">
                <CircleDot className="w-2.5 h-2.5 text-green-500" /> {complianceRecords.filter(r => r.status === 'compliant').length} Compliant
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-red-500" /> {complianceRecords.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length} High Risk
              </Badge>
            </div>
          </div>
        </FadeIn>

        {/* EUDR Reference Notice */}
        <FadeIn delay={0.05}>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 flex gap-3">
            <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">EUDR Compliance Notice</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">
                Under the EU Deforestation Regulation (Regulation (EU) 2023/1115), operators must submit a Due Diligence Statement (DDS) before placing coffee on the EU market.
                The cutoff date for deforestation is <strong>December 31, 2020</strong>. Non-compliance can result in fines up to 4% of EU annual turnover.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs gap-1"><Activity className="w-3.5 h-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="records" className="text-xs gap-1"><Shield className="w-3.5 h-3.5" /> Compliance Records</TabsTrigger>
            <TabsTrigger value="deforestation" className="text-xs gap-1"><TreePine className="w-3.5 h-3.5" /> Deforestation Assessment</TabsTrigger>
            <TabsTrigger value="dds" className="text-xs gap-1"><FileText className="w-3.5 h-3.5" /> Due Diligence</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs gap-1"><BarChart3 className="w-3.5 h-3.5" /> Risk Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab records={complianceRecords} ddsRecords={ddsRecords} />
          </TabsContent>

          <TabsContent value="records">
            <ComplianceRecordsTab records={complianceRecords} />
          </TabsContent>

          <TabsContent value="deforestation">
            <DeforestationTab assessments={deforestationAssessments} />
          </TabsContent>

          <TabsContent value="dds">
            <DDSTab ddsRecords={ddsRecords} complianceRecords={complianceRecords} />
          </TabsContent>

          <TabsContent value="analytics">
            <RiskAnalyticsTab records={complianceRecords} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
