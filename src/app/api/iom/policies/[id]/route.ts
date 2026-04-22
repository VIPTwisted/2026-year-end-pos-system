import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const policy = await prisma.fulfillmentPolicy.findUnique({ where: { id } })
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(policy)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const policy = await prisma.fulfillmentPolicy.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description,
      isActive: body.isActive,
      priority: body.priority,
      optimizeFor: body.optimizeFor,
      conditions: body.conditions,
      providerPreferences: body.providerPreferences,
      maxSplitLines: body.maxSplitLines,
    },
  })
  return NextResponse.json(policy)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.fulfillmentPolicy.delete({ where: { id } })
  return NextResponse.json({ message: 'Deleted' })
}
