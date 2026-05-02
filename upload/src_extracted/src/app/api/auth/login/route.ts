import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, password, moduleId } = await req.json()
    if (!email || !password || !moduleId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    const user = await db.user.findUnique({ where: { email_moduleId: { email, moduleId } } })
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }
    if (user.password !== password) {
      return NextResponse.json({ message: 'Invalid password' }, { status: 401 })
    }
    if (!user.isActive) {
      return NextResponse.json({ message: 'Account deactivated' }, { status: 403 })
    }
    return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, moduleId: user.moduleId })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
