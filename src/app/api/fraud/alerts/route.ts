import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const alerts = await prisma.fraudAlert.findMany({
      where: status ? { status } : undefined,
      include: { rule: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    return NextResponse.json(alerts)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch fraud alerts' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const alert = await prisma.fraudAlert.update({
      where: { id },
      data: { status },
      include: { rule: true },
    })

    return NextResponse.json(alert)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update fraud alert' }, { status: 500 })
  }
}
