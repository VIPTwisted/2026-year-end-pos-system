import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_TYPES = ['safe_drop', 'bank_drop', 'petty_cash_in', 'petty_cash_out', 'tender_declaration', 'float_entry'] as const
type EntryType = typeof VALID_TYPES[number]

export async function GET(req: NextRequest) {
  try {
    const shiftId = req.nextUrl.searchParams.get('shiftId')
    if (!shiftId) return NextResponse.json({ error: 'shiftId required' }, { status: 400 })
    const entries = await prisma.cashManagementEntry.findMany({
      where: { posShiftId: shiftId },
      orderBy: { performedAt: 'desc' },
    })
    return NextResponse.json(entries)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>
    const { posShiftId, type, amount, description, denominations, performedBy } = body
    if (!posShiftId || !type || amount === undefined) {
      return NextResponse.json({ error: 'posShiftId, type, amount required' }, { status: 400 })
    }
    if (!VALID_TYPES.includes(type as EntryType)) {
      return NextResponse.json({ error: `Invalid type. Must be: ${VALID_TYPES.join(', ')}` }, { status: 400 })
    }
    const entry = await prisma.cashManagementEntry.create({
      data: {
        posShiftId: posShiftId as string,
        type: type as string,
        amount: parseFloat(String(amount)),
        description: typeof description === 'string' ? description.trim() || null : null,
        denominations: denominations ? JSON.stringify(denominations) : null,
        performedBy: typeof performedBy === 'string' && performedBy ? performedBy : 'Unknown',
      },
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
