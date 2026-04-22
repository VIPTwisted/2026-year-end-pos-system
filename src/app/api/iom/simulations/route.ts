import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sims = await prisma.iOMSimulation.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(sims)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const sim = await prisma.iOMSimulation.create({
    data: {
      name: body.name,
      description: body.description || null,
      policyId: body.policyId || null,
      testOrders: body.testOrders ?? [],
      status: 'draft',
    },
  })
  return NextResponse.json(sim, { status: 201 })
}
