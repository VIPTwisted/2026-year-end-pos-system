import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; did: string }> }
) {
  const { did } = await params
  await prisma.vpVendorDocument.delete({ where: { id: did } })
  return NextResponse.json({ ok: true })
}
