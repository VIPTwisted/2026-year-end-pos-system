import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const partner = await prisma.integrationPartner.update({
    where: { id },
    data: { status: body.status, notes: body.notes },
  })
  return NextResponse.json(partner)
}
