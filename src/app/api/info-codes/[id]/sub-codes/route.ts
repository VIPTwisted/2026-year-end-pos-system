import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const subCodes = await prisma.infoSubCode.findMany({
    where: { infoCodeId: id },
    orderBy: { sortOrder: 'asc' },
  })
  return NextResponse.json(subCodes)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const subCode = await prisma.infoSubCode.create({
    data: {
      infoCodeId: id,
      subCodeId: body.subCodeId,
      description: body.description,
      sortOrder: body.sortOrder ?? 0,
    },
  })
  return NextResponse.json(subCode, { status: 201 })
}
