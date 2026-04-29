'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, Users, Loader2, Pencil, Phone, Mail, MapPin,
  CreditCard, Award, GraduationCap, Smartphone, CheckCircle,
  XCircle, Shield, Heart, Banknote, Calendar, Hash, TreePine,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

interface FarmLandSummary {
  id: string
  farmName: string
  plotBlockId: string | null
  totalLandHolding: number | null
}

interface FarmerDetail {
  id: string
  farmerCode: string | null
  fullName: string
  firstName: string | null
  lastName: string | null
  middleName: string | null
  contactNumber: string
  email: string | null
  gender: string | null
  age: number | null
  dob: string | null
  nationalIdType: string | null
  nationalIdNo: string | null
  ekycConsent: boolean
  education: string | null
  maritalStatus: string | null
  spouseName: string | null
  noOfFamilyMembers: number | null
  housingOwnership: string | null
  houseType: string | null
  yearsOfFarmingExperience: number | null
  country: string | null
  province: string | null
  district: string | null
  commune: string | null
  village: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  isCertified: boolean
  certificationType: string | null
  yearOfICS: string | null
  cooperative: string | null
  creditScore: number | null
  loanTaken: boolean
  loanTakenFrom: string | null
  loanAmount: number | null
  loanPurpose: string | null
  loanInterest: number | null
  loanSecurity: boolean
  cropInsurance: boolean
  lifeInsurance: boolean
  healthInsurance: boolean
  smartphoneOwnership: boolean
  gapTrainingAttended: boolean
  enrollmentDate: string
  enrollmentPlace: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    farmLands: number
    cultivations: number
    harvestTraceabilities: number
  }
  farmLands?: FarmLandSummary[]
}

export default function FarmerDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [farmer, setFarmer] = useState<FarmerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const fetchFarmer = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/farmers?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setFarmer(data.data?.data ?? null)
      } else {
        toast.error(data.error || t('Không tìm thấy nông dân', 'Farmer not found'))
        router.push('/farmers')
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router, t])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFarmer()
    }
  }, [status, router, fetchFarmer])

  if (status === 'loading' || loading) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Users className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!farmer) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t('Không tìm thấy dữ liệu', 'Data not found')}</p>
        </div>
      </DashboardShell>
    )
  }

  const InfoRow = ({ label, value, icon }: { label: string; value: string | number | null | undefined; icon?: React.ReactNode }) => (
    <div className="flex items-start gap-2 py-2">
      {icon && <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value ?? '-'}</p>
      </div>
    </div>
  )

  const BoolBadge = ({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) => (
    <Badge className={`${value ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'} text-[10px] border-0 gap-1`}>
      {value ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {value ? trueLabel : falseLabel}
    </Badge>
  )

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/farmers')}
              className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{farmer.fullName}</h1>
              <p className="text-xs text-muted-foreground font-mono">{farmer.farmerCode || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${farmer.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
              {farmer.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
            </Badge>
            {farmer.isCertified && (
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px] border-0 gap-1">
                <Award className="w-3 h-3" />
                {farmer.certificationType || t('Đã CC', 'Certified')}
              </Badge>
            )}
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs"
              onClick={() => router.push('/farmers')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t('Đất nông trại', 'Farm Lands'), value: farmer._count?.farmLands ?? 0, icon: TreePine, color: 'from-emerald-500 to-emerald-700' },
            { label: t('Canh tác', 'Cultivations'), value: farmer._count?.cultivations ?? 0, icon: GraduationCap, color: 'from-teal-500 to-teal-700' },
            { label: t('Thu hoạch', 'Harvests'), value: farmer._count?.harvestTraceabilities ?? 0, icon: Calendar, color: 'from-amber-500 to-amber-700' },
            { label: t('Điểm TD', 'Credit'), value: farmer.creditScore ?? '-', icon: CreditCard, color: ' ' },
          ].map((stat, i) => (
            <Card key={i} className="rounded-xl border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase">{stat.label}</p>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detail Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Info */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                {t('Thông tin cá nhân', 'Personal Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Họ và tên', 'Full Name')} value={farmer.fullName} icon={<Users className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Giới tính', 'Gender')} value={farmer.gender ? t(farmer.gender, farmer.gender) : null} />
              <InfoRow label={t('Tuổi', 'Age')} value={farmer.age ? `${farmer.age} ${t('tuổi', 'yrs')}` : null} />
              <InfoRow label={t('Ngày sinh', 'Date of Birth')} value={farmer.dob ? new Date(farmer.dob).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Trình độ học vấn', 'Education')} value={farmer.education} />
              <InfoRow label={t('Tình trạng hôn nhân', 'Marital Status')} value={farmer.maritalStatus} />
              <InfoRow label={t('Tên vợ/chồng', 'Spouse Name')} value={farmer.spouseName} />
              <InfoRow label={t('Số thành viên gia đình', 'Family Members')} value={farmer.noOfFamilyMembers} />
              <InfoRow label={t('Loại nhà', 'House Type')} value={farmer.houseType} />
              <InfoRow label={t('Sở hữu nhà', 'Housing')} value={farmer.housingOwnership} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Loại CCCD', 'ID Type')} value={farmer.nationalIdType} icon={<Shield className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Số CMND/CCCD', 'National ID')} value={farmer.nationalIdNo} />
              <InfoRow label={t('Đồng ý eKYC', 'eKYC Consent')} value={farmer.ekycConsent ? t('Có', 'Yes') : t('Không', 'No')} />
            </CardContent>
          </Card>

          {/* Contact & Location */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {t('Liên hệ & Địa chỉ', 'Contact & Location')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t('Số điện thoại', 'Contact Number')} value={farmer.contactNumber} icon={<Phone className="w-3.5 h-3.5" />} />
              <InfoRow label="Email" value={farmer.email} icon={<Mail className="w-3.5 h-3.5" />} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Quốc gia', 'Country')} value={farmer.country} icon={<MapPin className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Tỉnh/Thành phố', 'Province')} value={farmer.province} />
              <InfoRow label={t('Quận/Huyện', 'District')} value={farmer.district} />
              <InfoRow label={t('Xã/Phường', 'Commune')} value={farmer.commune} />
              <InfoRow label={t('Thôn/Bản', 'Village')} value={farmer.village} />
              <InfoRow label={t('Mã bưu điện', 'Zip Code')} value={farmer.zipCode} />
              {(farmer.latitude || farmer.longitude) && (
                <InfoRow label={t('Tọa độ', 'Coordinates')} value={`${farmer.latitude ?? '-'}, ${farmer.longitude ?? '-'}`} />
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Ngày đăng ký', 'Enrollment Date')} value={farmer.enrollmentDate ? new Date(farmer.enrollmentDate).toLocaleDateString() : null} icon={<Calendar className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Nơi đăng ký', 'Enrollment Place')} value={farmer.enrollmentPlace} />
            </CardContent>
          </Card>

          {/* Certification & Credit */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                {t('Chứng nhận & Tín dụng', 'Certification & Credit')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2 mb-2">
                <BoolBadge value={farmer.isCertified} trueLabel={t('Đã chứng nhận', 'Certified')} falseLabel={t('Chưa CC', 'Not Certified')} />
                <BoolBadge value={farmer.gapTrainingAttended} trueLabel={t('Đào tạo GAP', 'GAP Trained')} falseLabel={t('Chưa GAP', 'No GAP')} />
              </div>
              <InfoRow label={t('Loại chứng nhận', 'Certification Type')} value={farmer.certificationType} icon={<Award className="w-3.5 h-3.5" />} />
              <InfoRow label={t('Năm ICS', 'Year of ICS')} value={farmer.yearOfICS} />
              <InfoRow label={t('Hợp tác xã', 'Cooperative')} value={farmer.cooperative} />
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Điểm tín dụng', 'Credit Score')} value={farmer.creditScore} icon={<CreditCard className="w-3.5 h-3.5" />} />
              {farmer.creditScore !== null && farmer.creditScore !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${farmer.creditScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground">{farmer.creditScore}/100</span>
                </div>
              )}
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t('Có vay vốn', 'Has Loan')} value={farmer.loanTaken ? t('Có', 'Yes') : t('Không', 'No')} icon={<Banknote className="w-3.5 h-3.5" />} />
              {farmer.loanTaken && (
                <>
                  <InfoRow label={t('Nguồn vay', 'Loan Source')} value={farmer.loanTakenFrom} />
                  <InfoRow label={t('Số tiền vay', 'Loan Amount')} value={farmer.loanAmount ? `${farmer.loanAmount.toLocaleString()} VND` : null} />
                  <InfoRow label={t('Mục đích', 'Purpose')} value={farmer.loanPurpose} />
                  <InfoRow label={t('Lãi suất', 'Interest')} value={farmer.loanInterest ? `${farmer.loanInterest}%` : null} />
                  <BoolBadge value={farmer.loanSecurity} trueLabel={t('Có bảo đảm', 'Secured')} falseLabel={t('Không bảo đảm', 'Unsecured')} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Agriculture Details */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <TreePine className="w-4 h-4 text-muted-foreground" />
                {t('Nông nghiệp & Bảo hiểm', 'Agriculture & Insurance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label={t('Kinh nghiệm (năm)', 'Experience (years)')} value={farmer.yearsOfFarmingExperience} icon={<GraduationCap className="w-3.5 h-3.5" />} />
              <BoolBadge value={farmer.smartphoneOwnership} trueLabel={t('Có điện thoại', 'Has Smartphone')} falseLabel={t('Không có ĐT', 'No Smartphone')} />
              <Separator className="my-2 bg-muted" />
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('Bảo hiểm', 'Insurance')}</p>
              <div className="flex flex-wrap gap-2">
                <BoolBadge value={farmer.cropInsurance} trueLabel={t('BH mùa vụ', 'Crop Ins.')} falseLabel={t('Không BH mùa vụ', 'No Crop Ins.')} />
                <BoolBadge value={farmer.lifeInsurance} trueLabel={t('BH sinh mạng', 'Life Ins.')} falseLabel={t('Không BH sinh mạng', 'No Life Ins.')} />
                <BoolBadge value={farmer.healthInsurance} trueLabel={t('BH y tế', 'Health Ins.')} falseLabel={t('Không BH y tế', 'No Health Ins.')} />
              </div>

              {/* Farm Lands */}
              {farmer.farmLands && farmer.farmLands.length > 0 && (
                <>
                  <Separator className="my-2 bg-muted" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t('Đất nông trại', 'Farm Lands')} ({farmer.farmLands.length})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {farmer.farmLands.map((fl) => (
                      <div
                        key={fl.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => router.push(`/farmlands/${fl.id}`)}
                      >
                        <div>
                          <p className="text-xs font-medium text-foreground">{fl.farmName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{fl.plotBlockId || '-'}</p>
                        </div>
                        {fl.totalLandHolding && (
                          <Badge variant="outline" className="text-[10px] text-border text-muted-foreground">
                            {fl.totalLandHolding} ha
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Separator className="my-2 bg-muted" />
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                <div>
                  <span className="uppercase">{t('Ngày tạo', 'Created')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(farmer.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="uppercase">{t('Cập nhật', 'Updated')}</span>
                  <p className="text-muted-foreground font-medium text-xs">{new Date(farmer.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
