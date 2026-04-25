import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, requirePlatformAdmin, apiResponse } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  const permError = requirePlatformAdmin(user)
  if (permError) return permError

  const modules = await db.module.findMany({ orderBy: { category: 'asc' } })
  return apiResponse(modules)
}
