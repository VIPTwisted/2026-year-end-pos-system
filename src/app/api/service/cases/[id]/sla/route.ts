import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const slaItem = await prisma.sLAItem.findUnique({
    where: { caseId },
    include: { policy: true },
  })
  if (!slaItem) return NextResponse.json(null)
  return NextResponse.json(slaItem)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params

  // Find the default SLA policy
  const { policyId } = await req.json().catch(() => ({ policyId: null }))

  let policy
  if (policyId) {
    policy = await prisma.sLAPolicy.findUnique({ where: { id: policyId } })
  } else {
    policy = await prisma.sLAPolicy.findFirst({ where: { isDefault: true, isActive: true } })
  }
  if (!policy) return NextResponse.json({ error: 'No SLA policy found' }, { status: 404 })

  const existing = await prisma.sLAItem.findUnique({ where: { caseId } })
  if (existing) return NextResponse.json(existing)

  const now = new Date()
  const firstResponseDeadline = new Date(now.getTime() + policy.firstResponseHours * 60 * 60 * 1000)
  const resolutionDeadline = new Date(now.getTime() + policy.resolutionHours * 60 * 60 * 1000)

  const slaItem = await prisma.sLAItem.create({
    data: {
      policyId: policy.id,
      caseId,
      firstResponseDeadline,
      resolutionDeadline,
      status: 'in_progress',
    },
    include: { policy: true },
  })
  return NextResponse.json(slaItem, { status: 201 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const body = await req.json()
  const { action, firstResponseAt, status } = body

  const existing = await prisma.sLAItem.findUnique({ where: { caseId } })
  if (!existing) return NextResponse.json({ error: 'SLA item not found' }, { status: 404 })

  const now = new Date()
  let updateData: Record<string, unknown> = {}

  if (action === 'pause' && !existing.pausedAt) {
    updateData = { pausedAt: now, status: 'paused' }
  } else if (action === 'resume' && existing.pausedAt) {
    const pausedMs = now.getTime() - existing.pausedAt.getTime()
    const addedMinutes = Math.floor(pausedMs / 60000)
    updateData = {
      pausedAt: null,
      totalPausedMinutes: existing.totalPausedMinutes + addedMinutes,
      status: 'in_progress',
    }
  } else if (action === 'first_response') {
    updateData = {
      firstResponseAt: now,
      firstResponseMet: existing.firstResponseDeadline ? now <= existing.firstResponseDeadline : null,
    }
  } else {
    if (firstResponseAt !== undefined) updateData.firstResponseAt = firstResponseAt ? new Date(firstResponseAt) : null
    if (status !== undefined) updateData.status = status
  }

  const slaItem = await prisma.sLAItem.update({
    where: { caseId },
    data: updateData,
    include: { policy: true },
  })
  return NextResponse.json(slaItem)
}
