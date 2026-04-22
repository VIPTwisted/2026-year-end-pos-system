import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await prisma.hardwareProfile.findUnique({
    where: { id },
    include: { registers: { include: { shifts: { take: 5, orderBy: { createdAt: 'desc' } } } } },
  })
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(profile)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const profile = await prisma.hardwareProfile.update({ where: { id }, data: body })
  return NextResponse.json(profile)
}
