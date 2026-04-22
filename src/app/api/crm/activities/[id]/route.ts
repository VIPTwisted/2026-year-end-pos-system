import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const activity = await prisma.cRMActivity.findUnique({
      where: { id },
      include: {
        account: true,
        contact: true,
      },
    })
    if (!activity) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(activity)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const activity = await prisma.cRMActivity.update({ where: { id }, data: body })
    return NextResponse.json(activity)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
