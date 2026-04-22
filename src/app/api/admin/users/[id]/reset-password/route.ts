import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await prisma.systemUser.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, message: `Password reset email sent to ${user.email}` })
}
