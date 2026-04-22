import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const contact = await prisma.cRMContact.findUnique({
      where: { id },
      include: {
        account: true,
        activities: { orderBy: { createdAt: 'desc' } },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!contact) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(contact)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const contact = await prisma.cRMContact.update({ where: { id }, data: body })
    return NextResponse.json(contact)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
