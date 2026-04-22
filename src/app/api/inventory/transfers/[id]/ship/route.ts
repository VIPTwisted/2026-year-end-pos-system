import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const t = await prisma.outboundTransfer.update({ where: { id }, data: { status: 'shipped' } })
  return NextResponse.json(t)
}
