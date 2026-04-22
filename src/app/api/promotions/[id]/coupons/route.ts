import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'PROMO-'
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const coupons = await prisma.coupon.findMany({
    where: { promotionId: id },
    include: { _count: { select: { redemptions: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(coupons)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const count = Math.max(1, parseInt(body.count ?? '1', 10))

  if (count === 1 && body.code) {
    // Single coupon with specific code
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase().trim(),
        promotionId: id,
        description: body.description,
        usageLimit: body.usageLimit ? parseInt(body.usageLimit, 10) : null,
        perCustomerLimit: body.perCustomerLimit ? parseInt(body.perCustomerLimit, 10) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })
    return NextResponse.json([coupon], { status: 201 })
  }

  // Bulk generate N codes
  const codes: string[] = []
  while (codes.length < count) {
    const candidate = randomCode()
    if (!codes.includes(candidate)) codes.push(candidate)
  }

  // Filter out any that already exist
  const existing = await prisma.coupon.findMany({
    where: { code: { in: codes } },
    select: { code: true },
  })
  const existingSet = new Set(existing.map(c => c.code))

  const uniqueCodes = codes.filter(c => !existingSet.has(c))
  // If collisions, pad with more
  while (uniqueCodes.length < count) {
    const candidate = randomCode()
    if (!uniqueCodes.includes(candidate) && !existingSet.has(candidate)) {
      uniqueCodes.push(candidate)
    }
  }

  const created = await prisma.$transaction(
    uniqueCodes.slice(0, count).map(code =>
      prisma.coupon.create({
        data: {
          code,
          promotionId: id,
          description: body.description,
          usageLimit: body.usageLimit ? parseInt(body.usageLimit, 10) : null,
          perCustomerLimit: body.perCustomerLimit ? parseInt(body.perCustomerLimit, 10) : null,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        },
      })
    )
  )

  return NextResponse.json(created, { status: 201 })
}
