import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reg = await prisma.pOSRegister.findUnique({
    where: { id },
    include: { hardwareProfile: true, shifts: { orderBy: { createdAt: 'desc' } } },
  })
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(reg)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const reg = await prisma.pOSRegister.update({ where: { id }, data: body })
  return NextResponse.json(reg)
}
