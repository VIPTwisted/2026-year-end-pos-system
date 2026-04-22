import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { type, amount, notes } = body as {
      type: string
      amount: number
      notes?: string
    }

    if (!type) return NextResponse.json({ error: 'type is required' }, { status: 400 })
    if (!amount || amount <= 0) return NextResponse.json({ error: 'amount must be positive' }, { status: 400 })

    const validTypes = ['safe_drop', 'bank_drop', 'float_entry']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: `type must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    const shift = await prisma.cashShift.findUnique({ where: { id } })
    if (!shift) return NextResponse.json({ error: 'Shift not found' }, { status: 404 })
    if (shift.status !== 'open') return NextResponse.json({ error: 'Shift is not open' }, { status: 400 })

    const drop = await prisma.safeDrop.create({
      data: { shiftId: id, type, amount: parseFloat(String(amount)), notes: notes || null },
    })

    const updateData: { safeDrops?: number; bankDrops?: number } = {}
    if (type === 'safe_drop') updateData.safeDrops = shift.safeDrops + parseFloat(String(amount))
    if (type === 'bank_drop') updateData.bankDrops = shift.bankDrops + parseFloat(String(amount))

    if (Object.keys(updateData).length > 0) {
      await prisma.cashShift.update({ where: { id }, data: updateData })
    }

    return NextResponse.json(drop, { status: 201 })
  } catch (err) {
    console.error('[safe-drop POST]', err)
    return NextResponse.json({ error: 'Failed to record drop' }, { status: 500 })
  }
}
