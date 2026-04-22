import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reg = await prisma.absenceRegistration.findUnique({
    where: { id },
    include: { code: true },
  })
  if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(reg)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, approvedBy, ...rest } = body as {
    action?: string
    approvedBy?: string
    [key: string]: unknown
  }

  let updateData: Record<string, unknown> = { ...rest }
  if (action === 'approve') {
    updateData = { status: 'approved', approvedBy: approvedBy ?? 'System' }
  } else if (action === 'reject') {
    updateData = { status: 'rejected' }
  }

  const reg = await prisma.absenceRegistration.update({
    where: { id },
    data: updateData,
    include: { code: true },
  })
  return NextResponse.json(reg)
}
