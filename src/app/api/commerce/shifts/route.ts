import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateShiftNumber(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `SHF-${date}-${rand}`
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const registerId = searchParams.get('registerId')

    const where: { status?: string; registerId?: string } = {}
    if (status) where.status = status
    if (registerId) where.registerId = registerId

    const shifts = await prisma.cashShift.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      include: {
        register: { include: { channel: true } },
        tenders: true,
        safeDropEntries: { orderBy: { createdAt: 'desc' } },
      },
    })

    return NextResponse.json(shifts)
  } catch (err) {
    console.error('[shifts GET]', err)
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      registerId,
      employeeId,
      openingFloat = 0,
    } = body as {
      registerId: string
      employeeId?: string
      openingFloat?: number
    }

    if (!registerId?.trim()) return NextResponse.json({ error: 'registerId is required' }, { status: 400 })

    const register = await prisma.register.findUnique({ where: { id: registerId } })
    if (!register) return NextResponse.json({ error: 'Register not found' }, { status: 404 })

    const existing = await prisma.cashShift.findFirst({
      where: { registerId, status: 'open' },
    })
    if (existing) {
      return NextResponse.json({ error: 'Register already has an open shift', existing }, { status: 409 })
    }

    const shift = await prisma.cashShift.create({
      data: {
        shiftNumber: generateShiftNumber(),
        registerId,
        employeeId: employeeId || null,
        openingFloat: parseFloat(String(openingFloat)),
        expectedCash: parseFloat(String(openingFloat)),
        status: 'open',
      },
      include: {
        register: { include: { channel: true } },
        tenders: true,
        safeDropEntries: true,
      },
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (err) {
    console.error('[shifts POST]', err)
    return NextResponse.json({ error: 'Failed to open shift' }, { status: 500 })
  }
}
