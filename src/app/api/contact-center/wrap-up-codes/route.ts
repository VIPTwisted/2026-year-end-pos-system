import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const codes = await prisma.wrapUpCode.findMany({ orderBy: { category: 'asc' } })
  return NextResponse.json(codes)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const code = await prisma.wrapUpCode.create({
    data: {
      code: body.code,
      name: body.name,
      category: body.category ?? null,
      requiresNote: body.requiresNote ?? false,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(code, { status: 201 })
}
