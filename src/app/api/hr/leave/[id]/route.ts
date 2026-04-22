import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(request)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const request = await prisma.leaveRequest.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(request)
}
