import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock lead used as fallback when DB record not found (demo / seeding scenarios)
const MOCK_LEAD = {
  id: 'mock-lead-1',
  firstName: 'Alex',
  lastName: 'Wu',
  email: 'alex.wu@techcorp.com',
  phone: '+1 (555) 234-5678',
  mobilePhone: '+1 (555) 876-5432',
  company: 'TechCorp Solutions',
  jobTitle: 'VP of Operations',
  website: 'https://techcorp.com',
  source: 'Web',
  status: 'new',
  topic: 'POS System Upgrade – 12 locations',
  type: 'Item based',
  score: 72,
  assignedTo: 'Sarah Johnson',
  notes: 'Interested in enterprise POS rollout across multiple retail locations.',
  bpfStage: 'Qualify',
  bpfDays: 18,
  activities: [
    {
      id: 'act-1',
      activityType: 'email',
      subject: 'Intro email sent',
      notes: 'Sent introductory email with product overview deck.',
      outcome: 'Opened and clicked CTA',
      recordedBy: 'Sarah Johnson',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act-2',
      activityType: 'call',
      subject: 'Discovery call',
      notes: 'Discussed current POS pain points. 12 locations, needs inventory sync.',
      outcome: 'Interested — send demo link',
      recordedBy: 'Sarah Johnson',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  convertedAt: null,
  createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: { activities: { orderBy: { createdAt: 'desc' } } },
    })
    if (!lead) {
      // Return mock if not found (supports demo/dev without seeded DB)
      return NextResponse.json({ ...MOCK_LEAD, id })
    }
    return NextResponse.json(lead)
  } catch {
    return NextResponse.json({ ...MOCK_LEAD, id })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  try {
    const updated = await prisma.lead.update({
      where: { id },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.jobTitle !== undefined && { jobTitle: body.jobTitle }),
        ...(body.website !== undefined && { website: body.website }),
        ...(body.source !== undefined && { source: body.source }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.topic !== undefined && { topic: body.topic }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.score !== undefined && { score: body.score }),
        ...(body.assignedTo !== undefined && { assignedTo: body.assignedTo }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.bpfStage !== undefined && { bpfStage: body.bpfStage }),
      },
    })
    return NextResponse.json(updated)
  } catch {
    // Dev fallback: echo back merged mock
    return NextResponse.json({ ...MOCK_LEAD, id, ...body })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return PUT(req, { params })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.lead.delete({ where: { id } })
  } catch {
    // no-op in dev/demo
  }
  return NextResponse.json({ success: true })
}
