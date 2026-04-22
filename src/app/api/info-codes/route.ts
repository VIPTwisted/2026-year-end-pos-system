import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const codes = await prisma.infoCode.findMany({
    include: { subCodes: true },
    orderBy: { infoCodeId: 'asc' },
  })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const code = await prisma.infoCode.create({
    data: {
      infoCodeId: body.infoCodeId,
      description: body.description,
      prompt: body.prompt,
      inputType: body.inputType ?? 'list',
      triggerType: body.triggerType ?? 'manual',
      isRequired: body.isRequired ?? false,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(code, { status: 201 })
}
