import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const activities = await prisma.cRMActivity.findMany({
      where: { contactId: id },
      include: { account: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(activities)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const activity = await prisma.cRMActivity.create({ data: { ...body, contactId: id } })
    return NextResponse.json(activity, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
