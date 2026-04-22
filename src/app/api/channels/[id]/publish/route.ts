import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const channel = await prisma.retailChannel.update({
    where: { id },
    data: { publishingStatus: 'published' },
  })
  return NextResponse.json(channel)
}
