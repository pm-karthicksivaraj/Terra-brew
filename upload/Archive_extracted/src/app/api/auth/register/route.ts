import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, password, name, role, phone, moduleId } = await req.json()
    if (!email || !password || !name || !moduleId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    const existing = await db.user.findUnique({ where: { email_moduleId: { email, moduleId } } })
    if (existing) {
      return NextResponse.json({ message: 'User already exists in this module' }, { status: 409 })
    }
    const user = await db.user.create({
      data: { email, password, name, role: role || 'farmer', phone, moduleId },
    })
    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, moduleId: user.moduleId })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
