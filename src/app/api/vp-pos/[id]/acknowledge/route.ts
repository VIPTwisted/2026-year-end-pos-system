import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const po = await prisma.vpVendorPO.update({
    where: { id },
    data: {
      status: 'acknowledged',
      ackBy:  body.ackBy ?? null,
      ackAt:  new Date(),
    },
  })

  return NextResponse.json(po)
}
