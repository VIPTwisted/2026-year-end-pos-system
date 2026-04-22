import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const po = await prisma.vpVendorPO.update({
    where: { id },
    data: { status: 'sent' },
  })
  return NextResponse.json(po)
}
