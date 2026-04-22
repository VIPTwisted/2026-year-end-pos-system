import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: 'desc' } } },
  })
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.lead.update({
    where: { id },
    data: {
      ...(body.firstName !== undefined && { firstName: body.firstName }),
      ...(body.lastName !== undefined && { lastName: body.lastName }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.company !== undefined && { company: body.company }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.score !== undefined && { score: body.score }),
      ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.lead.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
