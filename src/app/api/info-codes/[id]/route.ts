import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const code = await prisma.infoCode.findUnique({
    where: { id },
    include: { subCodes: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!code) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(code)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const code = await prisma.infoCode.update({
    where: { id },
    data: {
      description: body.description,
      prompt: body.prompt,
      inputType: body.inputType,
      triggerType: body.triggerType,
      isRequired: body.isRequired,
      isActive: body.isActive,
    },
  })
  return NextResponse.json(code)
}
