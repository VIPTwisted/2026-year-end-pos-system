import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const components = await prisma.taxComponent.findMany({
    where: { taxGroupId: id },
    orderBy: { componentName: 'asc' },
  })
  return NextResponse.json(components)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const component = await prisma.taxComponent.create({
    data: {
      taxGroupId: id,
      componentName: body.componentName,
      taxType: body.taxType ?? 'sales',
      rate: body.rate,
      jurisdiction: body.jurisdiction ?? null,
      stateCode: body.stateCode ?? null,
      isInclusive: body.isInclusive ?? false,
    },
  })
  return NextResponse.json(component, { status: 201 })
}
