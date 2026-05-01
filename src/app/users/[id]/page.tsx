'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeft, UserCog, Loader2, Pencil, Phone, Mail,
  CheckCircle, XCircle, Shield, Calendar, Clock, UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { SensitiveField } from '@/components/ui/sensitive-field'

interface UserItem {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const roleColors: Record<string, string> = {
  tenant_admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-muted text-foreground',
  inspector: 'bg-blue-100 text-blue-700',
  field_officer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  farmer: 'bg-amber-100 text-amber-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const roleLabels: Record<string, { vi: string; en: string }> = {
  tenant_admin: { vi: 'Quản trị viên', en: 'Admin' },
  manager: { vi: 'Quản lý', en: 'Manager' },
  inspector: { vi: 'Kiểm tra viên', en: 'Inspector' },
  field_officer: { vi: 'Cán bộ hiện trường', en: 'Field Officer' },
  farmer: { vi: 'Nông dân', en: 'Farmer' },
  viewer: { vi: 'Người xem', en: 'Viewer' },
}

export default function UserDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t, t2, lang } = useI18n()
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<UserItem | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/users?id=${id}`)
      const data = await res.json()
      if (data.success && data.data?.data) {
        setUser(data.data?.data ?? null)
      } else {
        toast.error(data.error || t2('Không tìm thấy người dùng', 'User not found'))
        router.push('/users')
      }
    } catch {
      toast.error(t2('Lỗi kết nối', 'Connection error'))
    } finally {
      setLoading(false)
    }
  }, [id, router, t2])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchUser()
    }
  }, [status, router, fetchUser])

  if (status === 'loading' || loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <UserCog className="w-9 h-9 text-primary-foreground animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t2('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!user) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-32">
          <p className="text-muted-foreground">{t2('Không tìm thấy dữ liệu', 'Data not found')}</p>
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

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const roleLabel = roleLabels[user.role]
    ? (lang === 'vi' ? roleLabels[user.role].vi : roleLabels[user.role].en)
    : user.role

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/users')}
              className="text-muted-foreground hover:text-foreground gap-1 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{t2('Quay lại', 'Back')}</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-muted" />
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground">{user.name}</h1>
              <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${roleColors[user.role] || 'bg-gray-100 text-gray-600'} text-[10px] border-0 gap-1`}>
              <Shield className="w-2.5 h-2.5" />
              {roleLabel}
            </Badge>
            <Badge className={`${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'} text-[10px] border-0`}>
              {user.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive')}
            </Badge>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl shadow-sm text-xs"
              onClick={() => router.push('/users')}
            >
              <Pencil className="w-3.5 h-3.5" />
              {t2('Chỉnh sửa', 'Edit')}
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: t2('Vai trò', 'Role'), value: roleLabel, icon: Shield, color: 'from-purple-500 to-purple-700' },
            { label: t2('Trạng thái', 'Status'), value: user.isActive ? t2('Hoạt động', 'Active') : t2('Không HĐ', 'Inactive'), icon: UserCheck, color: user.isActive ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700' },
            { label: t2('Đăng nhập cuối', 'Last Login'), value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '-', icon: Clock, color: 'from-amber-500 to-amber-700' },
            { label: t2('Ngày tạo', 'Created'), value: new Date(user.createdAt).toLocaleDateString(), icon: Calendar, color: 'from-teal-500 to-teal-700' },
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
                <UserCog className="w-4 h-4 text-muted-foreground" />
                {t2('Thông tin cá nhân', 'Personal Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <InfoRow label={t2('Họ và tên', 'Full Name')} value={user.name} icon={<UserCog className="w-3.5 h-3.5" />} />
              <div className="flex items-start gap-2 py-2">
                <span className="text-muted-foreground mt-0.5 shrink-0"><Mail className="w-3.5 h-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Email', 'Email')}</p>
                  <SensitiveField value={user.email} />
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <span className="text-muted-foreground mt-0.5 shrink-0"><Phone className="w-3.5 h-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Số điện thoại', 'Phone')}</p>
                  <SensitiveField value={user.phone} />
                </div>
              </div>
              <div className="flex items-start gap-2 py-2">
                <span className="text-muted-foreground mt-0.5 shrink-0"><Shield className="w-3.5 h-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Vai trò', 'Role')}</p>
                  <Badge className={`${roleColors[user.role] || 'bg-gray-100 text-gray-600'} text-[10px] border-0 gap-1`}>
                    <Shield className="w-2.5 h-2.5" />
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="rounded-xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                {t2('Trạng thái tài khoản', 'Account Status')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 py-2">
                <span className="text-muted-foreground mt-0.5 shrink-0"><CheckCircle className="w-3.5 h-3.5" /></span>
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t2('Đang hoạt động', 'Active')}</p>
                  <BoolBadge value={user.isActive} trueLabel={t2('Hoạt động', 'Active')} falseLabel={t2('Không HĐ', 'Inactive')} />
                </div>
              </div>
              <Separator className="my-2 bg-muted" />
              <InfoRow label={t2('Đăng nhập cuối', 'Last Login')} value={formatDateTime(user.lastLoginAt)} icon={<Clock className="w-3.5 h-3.5" />} />
              <InfoRow label={t2('Ngày tạo', 'Created At')} value={formatDateTime(user.createdAt)} icon={<Calendar className="w-3.5 h-3.5" />} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}
