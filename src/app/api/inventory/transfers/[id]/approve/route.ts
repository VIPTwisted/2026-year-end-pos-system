import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { approvedBy } = await req.json()
  const t = await prisma.outboundTransfer.update({ where: { id }, data: { status: 'approved', approvedBy } })
  return NextResponse.json(t)
}
