import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updated = await prisma.cIExport.update({
    where: { id },
    data: { lastExportAt: new Date(), status: 'active' },
  })
  return NextResponse.json(updated)
}
