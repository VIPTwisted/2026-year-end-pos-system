import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const VALID_TYPES = ['receipt', 'sale', 'transfer', 'adjustment', 'return'] as const
type MovementType = typeof VALID_TYPES[number]

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      type: string
      quantity: number
      reference?: string
      notes?: string
    }

    const { type, quantity, reference, notes } = body

    if (!VALID_TYPES.includes(type as MovementType)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 },
      )
    }
    if (typeof quantity !== 'number' || quantity === 0) {
      return NextResponse.json({ error: 'quantity must be a non-zero number' }, { status: 400 })
    }

    const lot = await prisma.lotNumber.findUnique({ where: { id } })
    if (!lot) {
      return NextResponse.json({ error: 'Lot not found' }, { status: 404 })
    }

    // Compute new quantityOnHand
    // Outbound types reduce on-hand; inbound increase it
    const outbound = ['sale', 'transfer', 'adjustment'].includes(type) && quantity > 0
    const delta = outbound ? -quantity : quantity
    const newQtyOnHand = lot.quantityOnHand + delta

    if (newQtyOnHand < 0) {
      return NextResponse.json(
        { error: `Movement would result in negative on-hand quantity (${newQtyOnHand})` },
        { status: 400 },
      )
    }

    // Create movement and update lot in a transaction
    const [movement] = await prisma.$transaction([
      prisma.lotMovement.create({
        data: {
          lotId: id,
          type,
          quantity,
          reference: reference ?? null,
          notes: notes ?? null,
        },
      }),
      prisma.lotNumber.update({
        where: { id },
        data: { quantityOnHand: newQtyOnHand },
      }),
    ])

    return NextResponse.json(movement, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
