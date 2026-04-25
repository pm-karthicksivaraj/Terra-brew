import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { moduleId } = await req.json()
    if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })

    const mod = await db.module.findUnique({ where: { id: moduleId } })
    if (!mod) return NextResponse.json({ message: 'Module not found' }, { status: 404 })

    const adminEmail = `admin@${mod.slug}.test`
    const existing = await db.user.findUnique({ where: { email_moduleId: { email: adminEmail, moduleId } } })

    if (!existing) {
      await db.user.create({
        data: { email: adminEmail, password: 'admin123', name: 'Admin User', role: 'admin', moduleId },
      })
    }

    return NextResponse.json({ email: adminEmail, password: 'admin123' })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
