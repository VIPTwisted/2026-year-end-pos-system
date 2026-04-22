import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const mode = await prisma.deliveryMode.update({ where: { id }, data: body })
  return NextResponse.json(mode)
}
