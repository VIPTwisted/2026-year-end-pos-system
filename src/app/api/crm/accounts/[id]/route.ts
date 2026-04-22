import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const account = await prisma.cRMAccount.findUnique({
      where: { id },
      include: {
        contacts: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!account) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(account)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const account = await prisma.cRMAccount.update({ where: { id }, data: body })
    return NextResponse.json(account)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
