'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Coffee, UserCog, Search, Plus,
  ChevronLeft, ChevronRight, Loader2,
  Pencil, Trash2, X, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { DashboardShell } from '@/components/layout/dashboard-shell'

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
  manager: 'bg-coffee-100 text-coffee-700',
  inspector: 'bg-blue-100 text-blue-700',
  field_officer: 'bg-green-100 text-green-700',
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

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'viewer',
  phone: '',
  isActive: true,
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UserItem | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const t = (vi: string, en: string) => lang === 'vi' ? vi : en

  const [form, setForm] = useState(emptyForm)

  const resetForm = () => {
    setForm(emptyForm)
    setEditingItem(null)
  }

  const isTenantAdmin = session?.user?.role === 'tenant_admin' || session?.user?.isPlatformAdmin

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.data)
        setTotal(data.data.total)
      }
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, router, fetchUsers])

  const handleEdit = (item: UserItem) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      email: item.email,
      password: '',
      role: item.role,
      phone: item.phone || '',
      isActive: item.isActive,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isTenantAdmin) {
      toast.error(t('Không có quyền', 'No permission'))
      return
    }
    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        phone: form.phone || undefined,
        isActive: form.isActive,
      }

      if (editingItem) {
        payload.id = editingItem.id
        // Don't change own role
        if (editingItem.id === session?.user?.id) {
          delete payload.role
        }
      } else {
        // Create - password is required
        if (!form.password) {
          toast.error(t('Mật khẩu là bắt buộc', 'Password is required'))
          setSubmitting(false)
          return
        }
        payload.password = form.password
      }

      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch('/api/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingItem ? t('Cập nhật thành công!', 'Updated successfully!') : t('Tạo người dùng thành công!', 'User created!'))
        setDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        toast.error(data.error || t('Lỗi khi lưu', 'Error saving'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (id === session?.user?.id) {
      toast.error(t('Không thể xóa chính mình', 'Cannot delete yourself'))
      setDeleteConfirm(null)
      return
    }
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(t('Xóa thành công!', 'Deleted successfully!'))
        setDeleteConfirm(null)
        fetchUsers()
      } else {
        toast.error(data.error || t('Lỗi khi xóa', 'Error deleting'))
      }
    } catch {
      toast.error(t('Lỗi kết nối', 'Connection error'))
    }
  }

  const formatDate = (dateStr: string | null) => {
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

  const totalPages = Math.ceil(total / pageSize)

  if (status === 'loading' || (loading && users.length === 0)) {
    return (
      <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coffee-500 to-coffee-800 flex items-center justify-center">
              <Coffee className="w-9 h-9 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2 text-coffee-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{t('Đang tải...', 'Loading...')}</span>
            </div>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell lang={lang} onLangToggle={() => setLang(lang === 'vi' ? 'en' : 'vi')}>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-900 flex items-center gap-2">
              <UserCog className="w-5 h-5 text-coffee-600" />
              {t('Người dùng & Vai trò', 'Users & Roles')}
            </h2>
            <p className="text-sm text-coffee-500">{t(`Tổng số: ${total} người dùng`, `Total: ${total} users`)}</p>
          </div>

          {isTenantAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm() }}>
              <DialogTrigger asChild>
                <Button
                  className="bg-gradient-to-r from-coffee-600 to-coffee-800 hover:from-coffee-700 hover:to-coffee-900 text-white gap-2 rounded-xl shadow-sm"
                  onClick={() => { resetForm(); setDialogOpen(true) }}
                >
                  <Plus className="w-4 h-4" />
                  {t('Thêm người dùng', 'Add User')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-coffee-800 flex items-center gap-2">
                    <UserCog className="w-5 h-5" />
                    {editingItem ? t('Sửa người dùng', 'Edit User') : t('Thêm người dùng mới', 'Add New User')}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs text-coffee-700">{t('Họ và tên', 'Full Name')} *</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder={t('Nguyễn Văn A', 'John Doe')}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">Email *</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="user@example.com"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                        required
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">
                        {t('Mật khẩu', 'Password')} {!editingItem && '*'}
                      </Label>
                      <Input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder={editingItem ? t('Để trống nếu không đổi', 'Leave blank to keep') : t('Mật khẩu', 'Password')}
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                        required={!editingItem}
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Vai trò', 'Role')} *</Label>
                      <Select
                        value={form.role}
                        onValueChange={(v) => setForm({ ...form, role: v })}
                        disabled={editingItem?.id === session?.user?.id}
                      >
                        <SelectTrigger className="rounded-xl border-coffee-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tenant_admin">{t('Quản trị viên', 'Admin')}</SelectItem>
                          <SelectItem value="manager">{t('Quản lý', 'Manager')}</SelectItem>
                          <SelectItem value="inspector">{t('Kiểm tra viên', 'Inspector')}</SelectItem>
                          <SelectItem value="field_officer">{t('Cán bộ hiện trường', 'Field Officer')}</SelectItem>
                          <SelectItem value="farmer">{t('Nông dân', 'Farmer')}</SelectItem>
                          <SelectItem value="viewer">{t('Người xem', 'Viewer')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {editingItem?.id === session?.user?.id && (
                        <p className="text-[10px] text-coffee-400">{t('Không thể thay đổi vai trò của chính mình', 'Cannot change own role')}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label className="text-xs text-coffee-700">{t('Số điện thoại', 'Phone')}</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="0912345678"
                        className="rounded-xl border-coffee-200 focus:border-coffee-500"
                      />
                    </div>

                    {/* Active */}
                    <div className="space-y-1.5 md:col-span-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isActive"
                          checked={form.isActive}
                          onCheckedChange={(v) => setForm({ ...form, isActive: !!v })}
                        />
                        <Label htmlFor="isActive" className="text-xs text-coffee-700">{t('Đang hoạt động', 'Active')}</Label>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-coffee-100">
                    <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm() }} className="rounded-xl">
                      {t('Hủy', 'Cancel')}
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-white rounded-xl"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t('Đang lưu...', 'Saving...')}
                        </>
                      ) : (
                        editingItem ? t('Cập nhật', 'Update') : t('Tạo mới', 'Create')
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('Tìm kiếm người dùng...', 'Search users...')}
              className="pl-9 rounded-xl border-coffee-200 focus:border-coffee-500 bg-white"
            />
          </div>
          <Badge variant="outline" className="border-coffee-300 text-coffee-600 text-xs">
            {t(`${total} bản ghi`, `${total} records`)}
          </Badge>
        </div>

        {/* Table */}
        <Card className="rounded-2xl border-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-coffee-50 border-b border-coffee-100">
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Họ và tên', 'Name')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider">{t('Vai trò', 'Role')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Điện thoại', 'Phone')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden md:table-cell">{t('Hoạt động', 'Active')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Đăng nhập cuối', 'Last Login')}</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider hidden lg:table-cell">{t('Tạo lúc', 'Created')}</th>
                  {isTenantAdmin && (
                    <th className="px-4 py-3 text-[10px] font-bold text-coffee-600 uppercase tracking-wider text-right">{t('Thao tác', 'Actions')}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                    <tr>
                      <td colSpan={isTenantAdmin ? 8 : 7} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-coffee-400">
                          <UserCog className="w-10 h-10" />
                          <p className="text-sm">{t('Chưa có người dùng nào', 'No users found')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((item, i) => (
                      <tr key={item.id}
 className="border-b border-coffee-50 hover:bg-coffee-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-coffee-400 to-coffee-700 flex items-center justify-center text-white text-[10px] font-bold">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-coffee-800">{item.name}</p>
                              <p className="text-[10px] text-coffee-400 md:hidden">{item.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden md:table-cell">{item.email}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${roleColors[item.role] || 'bg-gray-100 text-gray-600'} text-[10px] border-0`}>
                            <Shield className="w-2.5 h-2.5 mr-1" />
                            {roleLabels[item.role] ? (lang === 'vi' ? roleLabels[item.role].vi : roleLabels[item.role].en) : item.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-coffee-600 hidden lg:table-cell">{item.phone || '-'}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <Badge className={`${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} text-[10px] border-0`}>
                            {item.isActive ? t('Hoạt động', 'Active') : t('Không HĐ', 'Inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-[10px] text-coffee-500 hidden lg:table-cell">{formatDate(item.lastLoginAt)}</td>
                        <td className="px-4 py-3 text-[10px] text-coffee-400 hidden lg:table-cell">{formatDate(item.createdAt)}</td>
                        {isTenantAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-coffee-100" onClick={() => handleEdit(item)}>
                                <Pencil className="w-3 h-3 text-coffee-600" />
                              </Button>
                              {item.id === session?.user?.id ? (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg" disabled title={t('Không thể xóa chính mình', 'Cannot delete yourself')}>
                                  <Trash2 className="w-3 h-3 text-coffee-200" />
                                </Button>
                              ) : deleteConfirm === item.id ? (
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-red-100" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="w-3 h-3 text-red-600" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-coffee-100" onClick={() => setDeleteConfirm(null)}>
                                    <X className="w-3 h-3 text-coffee-400" />
                                  </Button>
                                </div>
                              ) : (
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-red-50" onClick={() => setDeleteConfirm(item.id)}>
                                  <Trash2 className="w-3 h-3 text-coffee-300" />
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
</tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-coffee-100">
              <p className="text-[10px] text-coffee-500">
                {t(`Trang ${page}/${totalPages}`, `Page ${page}/${totalPages}`)}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="h-7 w-7 p-0 rounded-lg border-coffee-200"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                  if (p > totalPages) return null
                  return (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(p)}
                      className={`h-7 w-7 p-0 rounded-lg text-[10px] ${p === page ? 'bg-coffee-700 text-white' : 'border-coffee-200 text-coffee-600'}`}
                    >
                      {p}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="h-7 w-7 p-0 rounded-lg border-coffee-200"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardShell>
  )
}
