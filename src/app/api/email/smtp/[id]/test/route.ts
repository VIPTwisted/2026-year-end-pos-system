import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await prisma.sMTPProfile.update({
    where: { id },
    data: { testStatus: 'success', lastTestedAt: new Date() },
  })
  return NextResponse.json({ success: true, profile })
}
