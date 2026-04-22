import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateCardNumber(): string {
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('')
  return digits.replace(/(\d{4})(?=\d)/g, '$1-')
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { customerId, programId } = body

  if (!customerId || !programId) {
    return NextResponse.json({ error: 'customerId and programId are required' }, { status: 400 })
  }

  // Check if customer already has a card for this program
  const existing = await prisma.loyaltyCard.findFirst({
    where: { customerId, programId },
  })
  if (existing) {
    return NextResponse.json({ error: 'Customer already enrolled in this program' }, { status: 409 })
  }

  // Get lowest tier (Bronze equivalent)
  const lowestTier = await prisma.loyaltyTier.findFirst({
    where: { programId },
    orderBy: { minimumPoints: 'asc' },
  })

  // Generate unique card number
  let cardNumber = generateCardNumber()
  let attempts = 0
  while (attempts < 10) {
    const exists = await prisma.loyaltyCard.findUnique({ where: { cardNumber } })
    if (!exists) break
    cardNumber = generateCardNumber()
    attempts++
  }

  const card = await prisma.$transaction(async (tx) => {
    const newCard = await tx.loyaltyCard.create({
      data: {
        cardNumber,
        programId,
        customerId,
        tierId: lowestTier?.id ?? null,
        status: 'active',
        enrolledAt: new Date(),
      },
      include: { customer: true, tier: true, program: true },
    })

    await tx.loyaltyTransaction.create({
      data: {
        cardId: newCard.id,
        type: 'enroll',
        points: 0,
        description: `Enrolled in ${newCard.program.name}`,
      },
    })

    return newCard
  })

  return NextResponse.json(card, { status: 201 })
}
