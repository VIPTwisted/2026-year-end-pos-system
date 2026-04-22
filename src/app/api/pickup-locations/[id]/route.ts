import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const loc = await prisma.pickupLocation.findUnique({
    where: { id },
    include: { timeSlots: true },
  })
  if (!loc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(loc)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const loc = await prisma.pickupLocation.update({ where: { id }, data: body })
  return NextResponse.json(loc)
}
