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
  const data: Record<string, unknown> = {}

  if (body.action === 'approve') {
    data.status = 'approved'
    data.approvedBy = body.approvedBy ?? 'Manager'
    data.approvedAt = new Date()
    data.managerNotes = body.managerNotes ?? null
  } else if (body.action === 'deny') {
    data.status = 'denied'
    data.rejectionReason = body.rejectionReason ?? body.denialReason ?? null
    data.managerNotes = body.managerNotes ?? null
  } else if (body.action === 'cancel') {
    data.status = 'cancelled'
  } else {
    if (body.status) data.status = body.status
    if (body.reason !== undefined) data.reason = body.reason
    if (body.managerNotes !== undefined) data.managerNotes = body.managerNotes
  }

  const updated = await prisma.leaveRequest.update({ where: { id }, data })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.leaveRequest.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
