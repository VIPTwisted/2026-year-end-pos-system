import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const rule = await prisma.callCenterFraudRule.update({ where: { id }, data: body })
  return NextResponse.json(rule)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.callCenterFraudRule.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
