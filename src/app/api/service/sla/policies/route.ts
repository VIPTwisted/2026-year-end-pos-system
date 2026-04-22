import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const policies = await prisma.sLAPolicy.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(policies)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    name, description, applicableTo, firstResponseHours, resolutionHours,
    businessHoursOnly, isDefault,
  } = body
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  // If making this the default, clear other defaults
  if (isDefault) {
    await prisma.sLAPolicy.updateMany({ data: { isDefault: false } })
  }

  const policy = await prisma.sLAPolicy.create({
    data: {
      name,
      description,
      applicableTo: applicableTo ?? 'all',
      firstResponseHours: firstResponseHours ?? 8,
      resolutionHours: resolutionHours ?? 48,
      businessHoursOnly: businessHoursOnly ?? true,
      isDefault: isDefault ?? false,
    },
  })
  return NextResponse.json(policy, { status: 201 })
}
