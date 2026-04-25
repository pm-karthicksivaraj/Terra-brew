import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { createPlatformUserSchema, updatePlatformUserSchema } from '@/lib/validators'
import { getAuthUser, requirePlatformAdmin, validateBody, apiResponse, apiError, getPaginationParams } from '@/lib/api-middleware'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const { page, pageSize, search } = getPaginationParams(req)

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    } : {}

    const [users, total] = await Promise.all([
      db.platformUser.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.platformUser.count({ where }),
    ])

    // Mask password hash — not included in select
    return apiResponse({ users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) })
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function POST(req: Request) {
  const user = await getAuthUser(req)
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const body = await req.json()
    const result = validateBody(createPlatformUserSchema, body)
    if ('error' in result) return result.error

    const { email, password, name, role } = result.data

    // Only super_admin can create other super_admins
    if (role === 'super_admin' && user!.role !== 'super_admin') {
      return apiError('Only super admins can create super admin accounts', 403)
    }

    // Check email uniqueness
    const existing = await db.platformUser.findUnique({ where: { email } })
    if (existing) return apiError('Email already registered', 409)

    const passwordHash = await hashPassword(password)
    const newUser = await db.platformUser.create({
      data: { email, passwordHash, name, role },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    })

    return apiResponse(newUser, 201)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser(req)
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const body = await req.json()
    const result = validateBody(updatePlatformUserSchema, body)
    if ('error' in result) return result.error

    const { userId, password, ...updateData } = result.data

    // Check target user exists
    const target = await db.platformUser.findUnique({ where: { id: userId } })
    if (!target) return apiError('User not found', 404)

    // Only super_admin can manage other super_admins
    if (target.role === 'super_admin' && user!.role !== 'super_admin') {
      return apiError('Only super admins can manage super admin accounts', 403)
    }

    // Prevent self-deactivation
    if (userId === user!.id && updateData.isActive === false) {
      return apiError('Cannot deactivate your own account', 400)
    }

    // If email is changing, check uniqueness
    if (updateData.email && updateData.email !== target.email) {
      const emailExists = await db.platformUser.findUnique({ where: { email: updateData.email } })
      if (emailExists) return apiError('Email already registered', 409)
    }

    // Hash password if provided
    const dataToUpdate: any = { ...updateData }
    if (password) {
      dataToUpdate.passwordHash = await hashPassword(password)
    }

    const updatedUser = await db.platformUser.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    })

    return apiResponse(updatedUser)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req)
  const authError = requirePlatformAdmin(user)
  if (authError) return authError

  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('id')
    if (!userId) return apiError('User ID required', 400)

    const target = await db.platformUser.findUnique({ where: { id: userId } })
    if (!target) return apiError('User not found', 404)

    // Prevent self-deactivation
    if (userId === user!.id) {
      return apiError('Cannot deactivate your own account', 400)
    }

    // Only super_admin can deactivate super_admins
    if (target.role === 'super_admin' && user!.role !== 'super_admin') {
      return apiError('Only super admins can deactivate super admin accounts', 403)
    }

    const updatedUser = await db.platformUser.update({
      where: { id: userId },
      data: { isActive: !target.isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true },
    })

    return apiResponse(updatedUser)
  } catch (e: any) {
    return apiError(e.message, 500)
  }
}
