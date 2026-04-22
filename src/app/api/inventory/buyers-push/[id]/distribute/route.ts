import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.buyersPushLine.updateMany({ where: { pushId: id }, data: { status: 'distributed' } })
  const p = await prisma.buyersPush.update({ where: { id }, data: { status: 'distributed' } })
  return NextResponse.json(p)
}
