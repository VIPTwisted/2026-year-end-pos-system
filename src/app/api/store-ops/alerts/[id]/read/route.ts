import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return NextResponse.json(await prisma.storeAlert.update({ where: { id }, data: { isRead: true } }))
}
