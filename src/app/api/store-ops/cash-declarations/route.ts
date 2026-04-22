import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DENOM_VALUES: Record<string, number> = {
  pennies: 0.01, nickels: 0.05, dimes: 0.10, quarters: 0.25, halfDollars: 0.50,
  ones: 1, fives: 5, tens: 10, twenties: 20, fifties: 50, hundreds: 100,
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const where: Record<string, unknown> = {}
  const storeId = searchParams.get('storeId'); if (storeId) where.storeId = storeId
  const type = searchParams.get('type'); if (type) where.type = type
  const registerId = searchParams.get('registerId'); if (registerId) where.registerId = registerId
  const declarations = await prisma.cashDeclaration.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(declarations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const totalDeclared = Object.entries(DENOM_VALUES).reduce((sum, [key, value]) => sum + (body[key] ?? 0) * value, 0)
  const declaration = await prisma.cashDeclaration.create({
    data: {
      storeId: body.storeId, storeName: body.storeName, registerId: body.registerId,
      shiftId: body.shiftId, declaredBy: body.declaredBy, type: body.type ?? 'open',
      pennies: body.pennies ?? 0, nickels: body.nickels ?? 0, dimes: body.dimes ?? 0,
      quarters: body.quarters ?? 0, halfDollars: body.halfDollars ?? 0, ones: body.ones ?? 0,
      fives: body.fives ?? 0, tens: body.tens ?? 0, twenties: body.twenties ?? 0,
      fifties: body.fifties ?? 0, hundreds: body.hundreds ?? 0,
      totalDeclared: Math.round(totalDeclared * 100) / 100,
      expectedTotal: body.expectedTotal ?? 0,
      variance: Math.round((totalDeclared - (body.expectedTotal ?? 0)) * 100) / 100,
      notes: body.notes,
    },
  })
  return NextResponse.json(declaration, { status: 201 })
}
