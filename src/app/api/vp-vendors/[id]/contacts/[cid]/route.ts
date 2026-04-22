import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> }
) {
  const { cid } = await params
  await prisma.vpVendorContact.delete({ where: { id: cid } })
  return NextResponse.json({ ok: true })
}
